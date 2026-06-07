import { Worker, Job } from 'bullmq'
import { bullRedisConnection } from '../lib/redis'
import { analyzeResume } from '../services/ai'
import { supabaseAdmin } from '../lib/supabase'
import {
  AnalysisJobData,
  AnalysisJobResult
} from '../lib/queue'

const worker = new Worker<AnalysisJobData, AnalysisJobResult, string>(
  'cvision-analysis',
  async (job: Job<AnalysisJobData>) => {

    const {
      resumeId,
      userId,
      resumeText,
      jobTitle,
      jobDescription,
      companyName,
      forceRefresh,
    } = job.data

    // Update job progress so polling endpoint can report it
    await job.updateProgress(10)

    // Mark resume row as processing
    if (supabaseAdmin) {
      await supabaseAdmin
        .from('resumes')
        .update({ status: 'processing' })
        .eq('id', resumeId)
    }

    await job.updateProgress(20)

    try {
      // Run the analysis — cache-aware, Zod-validated
      const feedback = await analyzeResume(
        resumeText,
        jobTitle,
        jobDescription,
        companyName,
        resumeId,
        userId,
        forceRefresh
      )

      await job.updateProgress(90)

      // analyzeResume already writes to DB, but
      // ensure status is marked completed here too
      if (supabaseAdmin) {
        await supabaseAdmin
          .from('resumes')
          .update({ status: 'completed' })
          .eq('id', resumeId)
      }

      await job.updateProgress(100)

      return {
        resumeId,
        overallScore: feedback.overallScore,
        cached: false,
      }

    } catch (error) {
      // Mark as failed in DB so frontend can show error state
      if (supabaseAdmin) {
        await supabaseAdmin
          .from('resumes')
          .update({
            status: 'failed',
            error_message: error instanceof Error
              ? error.message
              : 'Unknown error',
          })
          .eq('id', resumeId)
      }

      throw error  // Re-throw so BullMQ retries the job
    }
  },
  {
    connection: bullRedisConnection as any,
    concurrency: 5,                  // Process up to 5 analyses simultaneously
    limiter: {
      max: 10,
      duration: 1000,                // Max 10 jobs/second across all workers
    },
  }
)

// Worker lifecycle logging
worker.on('completed', (job) => {
  console.log(`[Worker] Job ${job.id} completed — resumeId: ${job.data.resumeId}`)
})

worker.on('failed', (job, error) => {
  console.error(`[Worker] Job ${job?.id} failed (attempt ${job?.attemptsMade}): ${error.message}`)
})

worker.on('error', (error) => {
  console.error(`[Worker] Fatal error: ${error.message}`)
})

export default worker
