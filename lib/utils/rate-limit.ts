/**
 * Simple in-memory rate limiter for API routes
 * Tracks requests by IP address and enforces limits
 */

interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export interface RateLimitConfig {
  maxRequests: number // Maximum requests allowed
  windowMs: number // Time window in milliseconds
}

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  // Authentication endpoints: 5 requests per 15 minutes
  AUTH: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  // General API: 100 requests per minute
  API: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minute
  },
  // Strict limits for sensitive operations: 3 requests per hour
  STRICT: {
    maxRequests: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
  },
} as const

/**
 * Extract IP address from request
 */
function getClientIP(request: Request): string {
  // Try x-forwarded-for header first (for proxied requests)
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }

  // Try x-real-ip header
  const realIP = request.headers.get('x-real-ip')
  if (realIP) {
    return realIP
  }

  // Fallback to a default (in production, you'd get this from the connection)
  return 'unknown'
}

/**
 * Check if request is rate limited
 * Returns { limited: boolean, remaining: number, resetTime: number }
 */
export function checkRateLimit(
  request: Request,
  config: RateLimitConfig = RATE_LIMITS.AUTH
): { limited: boolean; remaining: number; resetTime: number } {
  const ip = getClientIP(request)
  const key = `${ip}:${request.url}`
  const now = Date.now()

  // Clean up expired entries periodically
  cleanupExpiredEntries(now)

  const entry = rateLimitStore.get(key)

  // No entry exists, create new one
  if (!entry) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    }
  }

  // Entry exists but window has expired, reset it
  if (now > entry.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    })
    return {
      limited: false,
      remaining: config.maxRequests - 1,
      resetTime: now + config.windowMs,
    }
  }

  // Entry exists and window is still valid
  entry.count++

  // Check if limit exceeded
  if (entry.count > config.maxRequests) {
    return {
      limited: true,
      remaining: 0,
      resetTime: entry.resetTime,
    }
  }

  return {
    limited: false,
    remaining: config.maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Clean up expired rate limit entries
 */
function cleanupExpiredEntries(now: number) {
  // Only run cleanup occasionally (every 1000 checks)
  if (Math.random() > 0.001) return

  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key)
    }
  }
}

/**
 * Middleware to add rate limit headers to response
 */
export function addRateLimitHeaders(
  response: Response,
  result: { limited: boolean; remaining: number; resetTime: number }
): Response {
  const headers = new Headers(response.headers)

  headers.set('X-RateLimit-Limit', String(RATE_LIMITS.AUTH.maxRequests))
  headers.set('X-RateLimit-Remaining', String(result.remaining))
  headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)))

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  })
}

/**
 * Create rate limit error response
 */
export function createRateLimitResponse(resetTime: number): Response {
  const retryAfterSeconds = Math.ceil((resetTime - Date.now()) / 1000)

  return new Response(
    JSON.stringify({
      error: 'Too many requests',
      message: `You have exceeded the rate limit. Please try again in ${retryAfterSeconds} seconds.`,
      retryAfter: retryAfterSeconds,
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfterSeconds),
        'X-RateLimit-Limit': String(RATE_LIMITS.AUTH.maxRequests),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
      },
    }
  )
}
