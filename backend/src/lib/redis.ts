import { Redis } from '@upstash/redis'
import IORedis from 'ioredis'

// REST client — used for rate limiting and caching
// Works over HTTPS, no persistent connection, ideal for Render
export const upstashRest = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// TCP client — used exclusively for BullMQ
// BullMQ requires a proper Redis connection, not REST
export const bullRedisConnection = new IORedis(
  process.env.UPSTASH_REDIS_URL!,
  {
    maxRetriesPerRequest: null,  // Required by BullMQ
    enableReadyCheck: false,     // Required for Upstash
    tls: {},                     // Required for rediss:// protocol
  }
)

// Health check — tests REST client
export const checkRedisHealth = async (): Promise<boolean> => {
  try {
    await upstashRest.ping()
    return true
  } catch {
    return false
  }
}
