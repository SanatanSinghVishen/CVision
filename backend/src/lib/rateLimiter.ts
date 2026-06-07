import { Ratelimit } from '@upstash/ratelimit'
import { upstashRest } from './redis'
import { Request, Response, NextFunction } from 'express'
import { AuthRequest } from '../middleware/auth'

// 10 analyses per user per hour — sliding window
const hourlyLimiter = new Ratelimit({
  redis: upstashRest,
  limiter: Ratelimit.slidingWindow(10, '1 h'),
  prefix: 'cvision:ratelimit:hourly',
  analytics: true,
})

// 25 analyses per user per day — sliding window
const dailyLimiter = new Ratelimit({
  redis: upstashRest,
  limiter: Ratelimit.slidingWindow(25, '24 h'),
  prefix: 'cvision:ratelimit:daily',
  analytics: true,
})

export const analysisRateLimiter = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const identifier = req.user?.id ?? req.ip ?? 'anonymous'

    const [hourly, daily] = await Promise.all([
      hourlyLimiter.limit(identifier),
      dailyLimiter.limit(identifier),
    ])

    // Always set headers so frontend knows current usage
    res.setHeader('X-RateLimit-Hourly-Limit', '10')
    res.setHeader('X-RateLimit-Hourly-Remaining', hourly.remaining)
    res.setHeader('X-RateLimit-Hourly-Reset', new Date(hourly.reset).toISOString())
    res.setHeader('X-RateLimit-Daily-Limit', '25')
    res.setHeader('X-RateLimit-Daily-Remaining', daily.remaining)
    res.setHeader('X-RateLimit-Daily-Reset', new Date(daily.reset).toISOString())

    if (!daily.success) {
      const hoursUntilReset = Math.ceil(
        (daily.reset - Date.now()) / 1000 / 60 / 60
      )
      return res.status(429).json({
        error: 'Daily limit reached',
        message: `You have used all 25 analyses for today.`,
        resetsIn: `${hoursUntilReset} hours`,
        resetAt: new Date(daily.reset).toISOString(),
      })
    }

    if (!hourly.success) {
      const minutesUntilReset = Math.ceil(
        (hourly.reset - Date.now()) / 1000 / 60
      )
      return res.status(429).json({
        error: 'Hourly limit reached',
        message: `You have used all 10 analyses for this hour.`,
        resetsIn: `${minutesUntilReset} minutes`,
        resetAt: new Date(hourly.reset).toISOString(),
      })
    }

    next()
  } catch (err) {
    // Fail open if Redis is down
    console.error('Rate limiter error:', err)
    next()
  }
}
