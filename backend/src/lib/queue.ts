import { Queue, Worker, Job, QueueEvents } from 'bullmq'
import { bullRedisConnection } from './redis'

// ── Job payload type ──────────────────────────────────────────────────────────
export interface AnalysisJobData {
  resumeId: string
  userId: string
  resumeText: string
  jobTitle: string
  jobDescription: string
  companyName: string
  forceRefresh: boolean
}

// ── Job result type ───────────────────────────────────────────────────────────
export interface AnalysisJobResult {
  resumeId: string
  overallScore: number
  cached: boolean
}

// ── Queue definition ──────────────────────────────────────────────────────────
export const analysisQueue = new Queue<AnalysisJobData, AnalysisJobResult, string>(
  'cvision-analysis',
  {
    connection: bullRedisConnection as any,
    defaultJobOptions: {
      attempts: 3,                    // Retry up to 3 times on failure
      backoff: {
        type: 'exponential',
        delay: 2000,                  // 2s, 4s, 8s between retries
      },
      removeOnComplete: {
        age: 60 * 60 * 24,            // Keep completed jobs for 24 hours
        count: 1000,                  // Keep last 1000 completed jobs
      },
      removeOnFail: {
        age: 60 * 60 * 24 * 7,        // Keep failed jobs for 7 days for debugging
      },
    },
  }
)

// ── Queue events — for job status polling ────────────────────────────────────
export const analysisQueueEvents = new QueueEvents(
  'cvision-analysis',
  { connection: bullRedisConnection as any }
)

// ── Helper: add analysis job ─────────────────────────────────────────────────
export const enqueueAnalysis = async (
  data: AnalysisJobData
): Promise<string> => {
  const job = await analysisQueue.add('analyze', data, {
    jobId: data.resumeId,   // Use resumeId as jobId for easy lookup
  })
  return job.id!
}

// ── Helper: get job status ────────────────────────────────────────────────────
export const getJobStatus = async (jobId: string) => {
  const job = await Job.fromId<AnalysisJobData, AnalysisJobResult>(
    analysisQueue,
    jobId
  )

  if (!job) return { status: 'not_found' }

  const state = await job.getState()

  return {
    status: state,                           // waiting | active | completed | failed | delayed
    progress: job.progress,
    result: state === 'completed' ? job.returnvalue : null,
    error: state === 'failed' ? job.failedReason : null,
    attemptsMade: job.attemptsMade,
  }
}
