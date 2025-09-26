import { ItemAPIError } from "@/services/itemApi"

// Utility functions for working with the Item API

// Retry wrapper for failed requests
export const withRetry = async <T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
)
: Promise<T> =>
{
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error as Error

      // Don't retry on validation errors
      if (error instanceof ItemAPIError && error.code === "INVALID_PARAM") {
        throw error
      }

      if (attempt === maxRetries) {
        break
      }

      // Exponential backoff
      await new Promise((resolve) => setTimeout(resolve, delay * Math.pow(2, attempt - 1)))
    }
  }

  throw lastError!
}

// Debounce utility for API calls
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(() => {
      func(...args)
      timeout = null
    }, wait)
  }
}

// Throttle utility for API calls
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle = false
  let lastArgs: Parameters<T> | null = null
  let lastThis: any | null = null

  const throttled = (...args: Parameters<T>) => {
    if (!inThrottle) {
      func.apply(lastThis, lastArgs!)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    } else {
      lastArgs = args
      lastThis = this
    }
  }

  return throttled
}

// Request queue for managing concurrent requests
export class RequestQueue {
  private queue: Array<() => Promise<any>> = []
  private running = 0
  private maxConcurrent: number

  constructor(maxConcurrent = 5) {
    this.maxConcurrent = maxConcurrent
  }

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          this.running++
          const result = await request()
          resolve(result)
        } catch (error) {
          reject(error)
        } finally {
          this.running--
          this.processQueue()
        }
      })

      this.processQueue()
    })
  }

  private processQueue() {
    while (this.running < this.maxConcurrent && this.queue.length > 0) {
      const request = this.queue.shift()
      if (request) {
        request().catch(() => {})
      }
      this.running++
    }
  }

  getQueueSize() {
    return this.queue.length
  }

  getRunningCount() {
    return this.running
  }
}
