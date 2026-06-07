import crypto from 'crypto'
import { upstashRest } from './redis'
import { Feedback } from '../schemas/feedback'

const CACHE_TTL_SECONDS = 60 * 60 * 24  // 24 hours
const CACHE_PREFIX = 'cvision:cache:analysis'

// Generate deterministic cache key from analysis inputs
export const getAnalysisCacheKey = (
  companyName: string,
  jobTitle: string,
  jobDescription: string,
  resumeText: string
): string => {
  const normalized = [
    companyName.toLowerCase().trim(),
    jobTitle.toLowerCase().trim(),
    jobDescription.toLowerCase().trim(),
    resumeText.toLowerCase().trim(),
  ].join('||')

  const hash = crypto
    .createHash('sha256')
    .update(normalized)
    .digest('hex')

  return `${CACHE_PREFIX}:${hash}`
}

// Retrieve cached feedback — returns null on miss or error
export const getCachedAnalysis = async (
  cacheKey: string
): Promise<Feedback | null> => {
  try {
    const cached = await upstashRest.get<string>(cacheKey)
    if (!cached) return null

    const parsed = typeof cached === 'string' ? JSON.parse(cached) : cached
    console.log(`[Cache HIT] ${cacheKey.slice(-8)}`)
    return parsed as Feedback
  } catch (error) {
    // Cache miss or parse error — treat as miss, never crash
    console.warn(`[Cache ERROR] Failed to read cache: ${error}`)
    return null
  }
}

// Store feedback in cache with TTL
export const setCachedAnalysis = async (
  cacheKey: string,
  feedback: Feedback
): Promise<void> => {
  try {
    await upstashRest.set(
      cacheKey,
      JSON.stringify(feedback),
      { ex: CACHE_TTL_SECONDS }
    )
    console.log(`[Cache SET] ${cacheKey.slice(-8)} — TTL: 24h`)
  } catch (error) {
    // Cache write failure is non-fatal — analysis still succeeds
    console.warn(`[Cache ERROR] Failed to write cache: ${error}`)
  }
}

// Invalidate a specific cache entry
// Call this if a user re-analyzes with the same inputs intentionally
export const invalidateCachedAnalysis = async (
  cacheKey: string
): Promise<void> => {
  try {
    await upstashRest.del(cacheKey)
  } catch {
    // Non-fatal
  }
}

// Cache stats — used in /health and /metrics endpoints
export const getCacheStats = async (): Promise<{
  keyCount: number
  memoryUsed: string
}> => {
  try {
    // Upstash doesn't expose DBSIZE via REST easily, so mock or retrieve info
    // For now returning basic structure as requested
    return {
      keyCount: 0,
      memoryUsed: 'N/A',
    }
  } catch {
    return { keyCount: 0, memoryUsed: 'N/A' }
  }
}
