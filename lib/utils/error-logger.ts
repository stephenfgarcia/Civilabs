/**
 * Error Logging Utilities
 * Centralized error logging and reporting
 */

interface ErrorLog {
  timestamp: string
  error: Error | string
  context?: Record<string, any>
  userId?: string
  url?: string
  userAgent?: string
}

class ErrorLogger {
  private logs: ErrorLog[] = []
  private maxLogs = 100

  /**
   * Log an error
   */
  log(error: Error | string, context?: Record<string, any>) {
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      error,
      context,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
    }

    // Add to local logs
    this.logs.push(errorLog)
    if (this.logs.length > this.maxLogs) {
      this.logs.shift()
    }

    // Console log in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorLog)
    }

    // Send to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToService(errorLog)
    }
  }

  /**
   * Send error to external service (e.g., Sentry, LogRocket)
   */
  private sendToService(errorLog: ErrorLog) {
    // TODO: Implement error tracking service integration
    // Example: Sentry.captureException(errorLog.error)
  }

  /**
   * Get all logged errors
   */
  getLogs(): ErrorLog[] {
    return [...this.logs]
  }

  /**
   * Clear all logs
   */
  clear() {
    this.logs = []
  }

  /**
   * Log API error
   */
  logApiError(
    endpoint: string,
    status: number,
    error: Error | string,
    context?: Record<string, any>
  ) {
    this.log(error, {
      type: 'API_ERROR',
      endpoint,
      status,
      ...context,
    })
  }

  /**
   * Log validation error
   */
  logValidationError(field: string, message: string, context?: Record<string, any>) {
    this.log(`Validation error on ${field}: ${message}`, {
      type: 'VALIDATION_ERROR',
      field,
      ...context,
    })
  }

  /**
   * Log authentication error
   */
  logAuthError(message: string, context?: Record<string, any>) {
    this.log(message, {
      type: 'AUTH_ERROR',
      ...context,
    })
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger()

/**
 * Handle async errors with logging
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  context?: Record<string, any>
): Promise<{ data?: T; error?: Error }> {
  try {
    const data = await fn()
    return { data }
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error))
    errorLogger.log(err, context)
    return { error: err }
  }
}

/**
 * Retry function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}
