import { redis } from '@databuddy/redis'

export interface RateLimitConfig {
    namespace: string
    limit: number
    duration: string
}

export interface RateLimitResult {
    success: boolean
    limit: number
    remaining: number
    reset: number
}

export class RateLimiter {
    private config: RateLimitConfig

    constructor(config: RateLimitConfig) {
        this.config = config
    }

    async checkLimit(identifier: string): Promise<RateLimitResult> {
        const windowSeconds = parseDurationToSeconds(this.config.duration)
        const key = `${this.config.namespace}:${identifier}`
        const now = Date.now()
        const windowStart = now - (windowSeconds * 1000)

        try {
            const pipeline = redis.pipeline()

            pipeline.zremrangebyscore(key, 0, windowStart)

            pipeline.zcard(key)

            pipeline.zadd(key, now, now.toString())

            pipeline.expire(key, windowSeconds)

            pipeline.zcard(key)

            const results = await pipeline.exec()

            if (!results || results.length < 5) {
                throw new Error('Redis pipeline failed')
            }

            const currentCount = results[3]?.[1] as number

            if (typeof currentCount !== 'number') {
                throw new Error('Invalid Redis response')
            }

            // Calculate reset time (current time + window duration)
            const resetTime = now + (windowSeconds * 1000)

            if (currentCount > this.config.limit) {
                return {
                    success: false,
                    limit: this.config.limit,
                    remaining: 0,
                    reset: resetTime,
                }
            }

            return {
                success: true,
                limit: this.config.limit,
                remaining: Math.max(0, this.config.limit - currentCount),
                reset: resetTime,
            }
        } catch (error) {
            console.error('[Rate Limiter] Redis error:', error)
            // On Redis failure, allow the request but log the error
            return {
                success: true,
                limit: this.config.limit,
                remaining: this.config.limit,
                reset: now + (windowSeconds * 1000),
            }
        }
    }

    async getStatus(identifier: string): Promise<RateLimitResult> {
        const key = `${this.config.namespace}:${identifier}`
        const now = Date.now()
        const windowSeconds = parseDurationToSeconds(this.config.duration)
        const windowStart = now - (windowSeconds * 1000)

        try {
            const pipeline = redis.pipeline()

            // Remove expired entries
            pipeline.zremrangebyscore(key, 0, windowStart)

            // Count current entries in the window
            pipeline.zcard(key)

            const results = await pipeline.exec()

            if (!results || results.length < 2) {
                throw new Error('Redis pipeline failed')
            }

            const currentCount = results[1]?.[1] as number || 0

            return {
                success: currentCount < this.config.limit,
                limit: this.config.limit,
                remaining: Math.max(0, this.config.limit - currentCount),
                reset: now + (windowSeconds * 1000)
            }
        } catch (error) {
            console.error('[Rate Limiter] Redis error:', error)
            return {
                success: true,
                limit: this.config.limit,
                remaining: this.config.limit,
                reset: now + (windowSeconds * 1000)
            }
        }
    }

    async reset(identifier: string): Promise<void> {
        const key = `${this.config.namespace}:${identifier}`
        try {
            await redis.del(key)
        } catch (error) {
            console.error('[Rate Limiter] Reset error:', error)
        }
    }
}

function parseDurationToSeconds(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/)
    if (!match) throw new Error(`Invalid duration format: ${duration}`)

    const num = Number.parseInt(match[1])
    const unit = match[2]

    const multiplier = {
        s: 1,
        m: 60,
        h: 3600,
        d: 86400,
    }[unit]

    if (multiplier === undefined) {
        throw new Error(`Invalid duration format: ${duration}`)
    }

    return num * multiplier
}

export const rateLimiters = {
    api: new RateLimiter({
        namespace: 'api',
        limit: 600,
        duration: '1m',
    }),
    auth: new RateLimiter({
        namespace: 'auth',
        limit: 30,
        duration: '1m',
    }),
    expensive: new RateLimiter({
        namespace: 'expensive',
        limit: 100,
        duration: '1m',
    }),
    admin: new RateLimiter({
        namespace: 'admin',
        limit: 1200,
        duration: '1m',
    }),
    public: new RateLimiter({
        namespace: 'public',
        limit: 120,
        duration: '1m',
    }),
}

export function getRateLimitIdentifier(userId?: string, headers?: Headers): string {
    if (userId) return userId

    const cfConnectingIp = headers?.get('cf-connecting-ip')
    if (cfConnectingIp) return cfConnectingIp

    const realIp = headers?.get('x-real-ip')
    if (realIp) return realIp

    const forwardedFor = headers?.get('x-forwarded-for')
    if (forwardedFor) return forwardedFor.split(',')[0].trim()

    return 'anonymous'
}
