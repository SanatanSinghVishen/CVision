import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import { supabaseAdmin } from './lib/supabase';
import { authMiddleware } from './middleware/auth';
import { analyzeResume, streamAnalyzeResume, parseWithRetry } from './services/ai';
import analysesRouter from './routes/analyses';
import { enqueueAnalysis, getJobStatus, analysisQueue } from './lib/queue';
import { checkRedisHealth } from './lib/redis';
import { getCacheStats } from './lib/cache';
import './workers/analysisWorker';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(express.json({ limit: '10mb' }));

import Groq from "groq-sdk";

// ── GET /ping — lightweight Supabase keepalive for cron jobs ──────────────────
app.get('/ping', async (req, res): Promise<any> => {
  try {
    if (!supabaseAdmin) {
      return res.status(503).json({ status: 'error', message: 'Supabase not initialized' });
    }
    // Minimal query — just checks the DB connection is alive
    const { error } = await supabaseAdmin.from('resumes').select('id', { count: 'exact', head: true });
    if (error) {
      return res.status(503).json({ status: 'error', message: error.message });
    }
    return res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

app.get('/health', async (req, res): Promise<any> => {
  const apiKey = process.env.GROQ_API_KEY;
  const groq = new Groq({ apiKey });

  const [groqOk, redisOk, cacheStats] = await Promise.all([
    groq.models.list().then(() => true).catch(() => false),
    checkRedisHealth(),
    getCacheStats(),
  ])

  let dbError = null;
  if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from('resumes').select('id').limit(1);
      dbError = error;
  } else {
      dbError = { message: 'Supabase Admin not initialized' };
  }

  const queueCounts = await analysisQueue.getJobCounts(
    'waiting', 'active', 'completed', 'failed'
  )

  const allHealthy = groqOk && redisOk && !dbError

  return res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    services: {
      groq: groqOk ? 'connected' : 'error',
      supabase: dbError ? 'error' : 'connected',
      redis: redisOk ? 'connected' : 'error',
    },
    queue: {
      waiting: queueCounts.waiting,
      active: queueCounts.active,
      completed: queueCounts.completed,
      failed: queueCounts.failed,
    },
    cache: cacheStats,
  })
});

import { AuthRequest } from './middleware/auth';
import { analysisRateLimiter } from './lib/rateLimiter';

// Zod schema for payload validation
const analyzeSchema = z.object({
    companyName: z.string().max(200, "Company name is too long (max 200 chars)"),
    jobTitle: z.string().max(200, "Job title is too long (max 200 chars)"),
    jobDescription: z.string().max(10000, "Job description is too long (max 10000 chars)"),
    resumeText: z.string().max(20000, "Resume text is too long (max 20000 chars)"),
    resumeId: z.string().uuid("Invalid resume ID format"),
    forceRefresh: z.boolean().optional()
});

app.post('/analyze', authMiddleware, analysisRateLimiter, async (req, res): Promise<any> => {
    try {
        const parsedBody = analyzeSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ 
                error: 'Invalid input', 
                details: parsedBody.error.issues 
            });
        }

        const { companyName, jobTitle, jobDescription, resumeText, resumeId, forceRefresh } = parsedBody.data;

        // Enqueue — returns in <100ms
        const jobId = await enqueueAnalysis({
            resumeId,
            userId: (req as any).user.id,
            resumeText,
            jobTitle,
            jobDescription,
            companyName,
            forceRefresh: forceRefresh || false,
        });

        return res.status(202).json({
            jobId,
            resumeId,
            status: 'queued',
            pollUrl: `/job/${jobId}`,
        });
    } catch (error: any) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

// ── GET /job/:jobId — poll for job status ────────────────────────────────────
app.get('/job/:jobId', authMiddleware, async (req, res): Promise<any> => {
  const { jobId } = req.params;
  const status = await getJobStatus(jobId);

  if (status.status === 'not_found') {
    return res.status(404).json({ error: 'Job not found' });
  }

  return res.json(status);
});

app.post('/analyze/stream', authMiddleware, analysisRateLimiter, async (req, res): Promise<any> => {
    try {
        const parsedBody = analyzeSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ error: 'Invalid input', details: parsedBody.error.issues });
        }
        
        const { companyName, jobTitle, jobDescription, resumeText, resumeId } = parsedBody.data;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const stream = streamAnalyzeResume(resumeText, jobTitle, jobDescription, companyName);
        let fullResponse = '';

        for await (const delta of stream) {
            fullResponse += delta;
            res.write(`data: ${JSON.stringify({ delta })}\n\n`);
        }

        // Validate and save full response
        const feedback = await parseWithRetry(fullResponse, () => Promise.reject(new Error('Streaming retries not supported')));
        
        if (supabaseAdmin) {
            await supabaseAdmin.from('resumes').update({ 
                feedback, 
                company_name: companyName,
                overall_score: feedback.overallScore,
                status: 'completed'
            }).eq('id', resumeId);
        }

        res.write(`data: ${JSON.stringify({ done: true, resumeId })}\n\n`);
        res.end();
    } catch (error: any) {
        console.error('Stream Analysis error:', error);
        res.write(`data: ${JSON.stringify({ error: error.message || 'Stream failed' })}\n\n`);
        res.end();
    }
});

app.use('/analyses', authMiddleware, analysesRouter);

import { Request, Response, NextFunction } from 'express';

app.use((err: Error, req: Request, res: Response, next: NextFunction): any => {
    console.error(`[${new Date().toISOString()}] ${err.message}`);

    if (err.message.includes('payload too large')) {
        return res.status(413).json({ error: 'Resume file is too large. Maximum size is 5MB.' });
    }
    if (err.message.includes('timeout')) {
        return res.status(503).json({ error: 'Analysis timed out. Please try again.' });
    }

    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
