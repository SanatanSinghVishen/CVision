import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { createClient } from '@supabase/supabase-js';
import { analyzeResume } from './services/ai';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase Admin client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
    ? createClient(supabaseUrl, supabaseServiceKey) 
    : null;

app.use(cors()); // Configure this more strictly for production if needed
app.use(express.json({ limit: '10mb' }));

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Rate limiting setup
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: { error: 'Too many requests, please try again later.' }
});

// Zod schema for payload validation
const analyzeSchema = z.object({
    jobTitle: z.string().max(200, "Job title is too long (max 200 chars)"),
    jobDescription: z.string().max(10000, "Job description is too long (max 10000 chars)"),
    resumeText: z.string().max(20000, "Resume text is too long (max 20000 chars)"),
    resumeId: z.string().uuid("Invalid resume ID format")
});

app.post('/analyze', apiLimiter, async (req, res) => {
    try {
        // Validate request body
        const parsedBody = analyzeSchema.safeParse(req.body);
        if (!parsedBody.success) {
            return res.status(400).json({ 
                error: 'Invalid input', 
                details: parsedBody.error.issues 
            });
        }

        const { jobTitle, jobDescription, resumeText, resumeId } = parsedBody.data;

        const feedback = await analyzeResume({
            jobTitle,
            jobDescription,
            resumeText,
        });

        // Update Database directly from Backend safely via Service Role
        if (supabaseAdmin) {
            const { error: dbError } = await supabaseAdmin
                .from('resumes')
                .update({ feedback })
                .eq('id', resumeId);
                
            if (dbError) {
                console.error("Supabase Admin Update Error:", dbError);
                // We still return the feedback so the UI can at least display it immediately
            }
        } else {
            console.warn("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. DB update skipped.");
        }

        res.json({ feedback });
    } catch (error: any) {
        console.error('Analysis error:', error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
