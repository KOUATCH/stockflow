# Enterprise Error Handling System Skill

## Description
A comprehensive Claude Code skill for implementing enterprise-grade error handling systems in TypeScript/Next.js applications. This skill provides structured approaches for building watertight, professional error management systems with proper classification, monitoring, and recovery mechanisms.

## Trigger
Use this skill when implementing or refactoring error handling systems, especially in enterprise applications requiring high reliability, financial transaction safety, and comprehensive error tracking.

## Core Principles

### 1. Error Classification Framework
- **Categorize errors systematically** by domain (database, validation, auth, financial)
- **Assign severity levels** (low, medium, high, critical)
- **Map errors to recovery strategies** and user notifications
- **Maintain error taxonomies** for consistent handling across the application

### 2. Defense in Depth Strategy
- **Multiple error boundaries** at different application layers
- **Graceful degradation patterns** when systems fail
- **Circuit breakers** for external service dependencies
- **Retry logic with exponential backoff** for transient failures

### 3. Financial Transaction Safety
- **Atomic operations** for all financial transactions
- **Compensating transactions** for rollback scenarios
- **Audit trails** for all financial operations
- **Reconciliation mechanisms** for detecting discrepancies

### 4. Observability and Monitoring
- **Structured logging** with correlation IDs
- **Real-time error tracking** with configurable alerting
- **Error rate monitoring** with threshold-based notifications
- **Performance error detection** for degraded user experience

## Implementation Patterns

### Error Type Definitions
```typescript
// Define comprehensive error classification
enum ErrorCategory {
  DATABASE = 'database',
  VALIDATION = 'validation',
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  BUSINESS_LOGIC = 'business_logic',
  EXTERNAL_API = 'external_api',
  FINANCIAL = 'financial',
  INVENTORY = 'inventory',
  NETWORK = 'network'
}

enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

interface ErrorContext {
  correlationId: string
  userId?: string
  sessionId?: string
  operation: string
  metadata?: Record<string, unknown>
}

class ApplicationError extends Error {
  constructor(
    message: string,
    public category: ErrorCategory,
    public severity: ErrorSeverity,
    public context: ErrorContext,
    public recoverable: boolean = false
  ) {
    super(message)
    this.name = this.constructor.name
  }
}
```

### Centralized Error Handler
```typescript
export class ErrorHandler {
  static handle(error: unknown, context: ErrorContext): ErrorResponse {
    // 1. Normalize error to ApplicationError
    const appError = this.normalizeError(error, context)

    // 2. Log error with structured data
    this.logError(appError)

    // 3. Notify monitoring systems if critical
    if (appError.severity === ErrorSeverity.CRITICAL) {
      this.notifyMonitoring(appError)
    }

    // 4. Attempt recovery if possible
    if (appError.recoverable) {
      return this.attemptRecovery(appError)
    }

    // 5. Return user-friendly error response
    return this.createUserResponse(appError)
  }

  static async withErrorHandling<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    fallback?: () => T
  ): Promise<T> {
    try {
      return await operation()
    } catch (error) {
      const response = this.handle(error, context)
      if (fallback && response.canFallback) {
        return fallback()
      }
      throw new ApplicationError(
        response.message,
        response.category,
        response.severity,
        context
      )
    }
  }
}
```

### Database Resilience Patterns
```typescript
export class ResilientDatabase {
  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error

        // Don't retry non-retryable errors
        if (!this.isRetryableError(error)) {
          throw error
        }

        // Exponential backoff with jitter
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
          await this.sleep(delay)
        }
      }
    }

    throw new ApplicationError(
      `Operation failed after ${maxRetries} attempts`,
      ErrorCategory.DATABASE,
      ErrorSeverity.HIGH,
      { correlationId: generateId(), operation: 'database_retry' }
    )
  }

  static async withTransaction<T>(
    operations: (tx: Prisma.TransactionClient) => Promise<T>,
    context: ErrorContext
  ): Promise<T> {
    return ErrorHandler.withErrorHandling(
      () => db.$transaction(operations, {
        maxWait: 10000,
        timeout: 20000,
      }),
      { ...context, operation: 'database_transaction' }
    )
  }
}
```

### Financial Transaction Safety
```typescript
export class FinancialTransactionManager {
  static async executeAtomicTransaction(
    operations: FinancialOperation[],
    context: ErrorContext
  ): Promise<TransactionResult> {
    const compensations: CompensatingAction[] = []

    try {
      return await db.$transaction(async (tx) => {
        let result: TransactionResult = { success: true, operations: [] }

        for (const operation of operations) {
          try {
            const opResult = await this.executeOperation(tx, operation)
            result.operations.push(opResult)

            // Store compensation action for rollback
            compensations.push(this.createCompensation(operation, opResult))

          } catch (error) {
            // Execute compensations in reverse order
            await this.executeCompensations(tx, compensations.reverse())
            throw new ApplicationError(
              `Financial operation failed: ${operation.type}`,
              ErrorCategory.FINANCIAL,
              ErrorSeverity.CRITICAL,
              context
            )
          }
        }

        return result
      })
    } catch (error) {
      // Log financial error with high priority
      this.logFinancialError(error, context, operations)
      throw error
    }
  }
}
```

### API Error Middleware
```typescript
export function withAPIErrorHandling(handler: NextApiHandler): NextApiHandler {
  return async (req, res) => {
    const correlationId = req.headers['x-correlation-id'] as string || generateId()
    const context: ErrorContext = {
      correlationId,
      operation: `${req.method} ${req.url}`,
      userId: req.user?.id,
      metadata: { userAgent: req.headers['user-agent'] }
    }

    try {
      await handler(req, res)
    } catch (error) {
      const errorResponse = ErrorHandler.handle(error, context)

      // Map to appropriate HTTP status
      const statusCode = this.mapToHTTPStatus(errorResponse)

      res.status(statusCode).json({
        error: {
          message: errorResponse.message,
          code: errorResponse.code,
          correlationId,
          ...(process.env.NODE_ENV === 'development' && { details: errorResponse.details })
        }
      })
    }
  }
}
```

### Error Monitoring & Alerting
```typescript
export class ErrorMonitor {
  private static errorCounts = new Map<string, number>()
  private static alertThresholds = new Map<ErrorCategory, number>()

  static trackError(error: ApplicationError): void {
    const key = `${error.category}:${error.severity}`
    const count = this.errorCounts.get(key) || 0
    this.errorCounts.set(key, count + 1)

    // Check if we need to alert
    const threshold = this.alertThresholds.get(error.category)
    if (threshold && count >= threshold) {
      this.triggerAlert(error, count)
    }
  }

  static generateErrorReport(timeframe: TimeFrame): ErrorReport {
    return {
      period: timeframe,
      totalErrors: this.calculateTotalErrors(timeframe),
      errorsByCategory: this.groupErrorsByCategory(timeframe),
      criticalErrors: this.getCriticalErrors(timeframe),
      topErrorMessages: this.getTopErrorMessages(timeframe),
      affectedUsers: this.getAffectedUsers(timeframe)
    }
  }
}
```

### React Error Boundaries
```typescript
interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
  errorInfo?: ErrorInfo
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to monitoring system
    ErrorHandler.handle(error, {
      correlationId: generateId(),
      operation: 'react_error_boundary',
      metadata: {
        componentStack: errorInfo.componentStack,
        errorBoundary: this.constructor.name
      }
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorFallback
          error={this.state.error}
          resetError={() => this.setState({ hasError: false })}
        />
      )
    }

    return this.props.children
  }
}
```

## Usage Guidelines

### When to Apply This Skill
1. **Enterprise Applications** - Systems requiring high reliability and uptime
2. **Financial Operations** - Any code handling money, payments, or transactions
3. **Multi-user Systems** - Applications where errors affect multiple users
4. **Critical Business Logic** - Core functionality that cannot fail silently
5. **External Dependencies** - Integration with third-party services or APIs

### Implementation Checklist
- [ ] Define error categories and severity levels for your domain
- [ ] Implement centralized error handler with structured logging
- [ ] Add database resilience patterns (retry, circuit breaker)
- [ ] Implement financial transaction safety mechanisms
- [ ] Create API error middleware with proper HTTP mappings
- [ ] Set up error monitoring with alerting thresholds
- [ ] Add React error boundaries for UI error containment
- [ ] Write comprehensive error handling tests
- [ ] Document error codes and recovery procedures
- [ ] Configure production error monitoring and alerting

### Integration Patterns
- **Existing Notification Systems** - Integrate with toast/notification components
- **Logging Infrastructure** - Connect to structured logging systems (Winston, Pino)
- **Monitoring Services** - Send errors to Sentry, DataDog, or similar services
- **User Feedback** - Collect user reports for unhandled errors

### Performance Considerations
- **Error Budget** - Set acceptable error rates per service
- **Retry Policies** - Implement exponential backoff to avoid cascading failures
- **Circuit Breakers** - Prevent overwhelming failing dependencies
- **Graceful Degradation** - Maintain core functionality even when subsystems fail

## Testing Error Handling

```typescript
describe('Error Handling', () => {
  test('should handle database connection failures gracefully', async () => {
    // Mock database failure
    const mockError = new Error('Connection refused')
    jest.spyOn(db, 'user').mockRejectedValue(mockError)

    const result = await ErrorHandler.withErrorHandling(
      () => userService.findById('123'),
      { correlationId: 'test-123', operation: 'find_user' }
    )

    expect(result.success).toBe(false)
    expect(result.error.category).toBe(ErrorCategory.DATABASE)
    expect(result.error.severity).toBe(ErrorSeverity.HIGH)
  })

  test('should retry transient failures', async () => {
    let attempts = 0
    const operation = jest.fn(() => {
      attempts++
      if (attempts < 3) throw new Error('Transient failure')
      return 'success'
    })

    const result = await ResilientDatabase.withRetry(operation)

    expect(result).toBe('success')
    expect(attempts).toBe(3)
  })

  test('should execute financial compensations on failure', async () => {
    const operations = [
      { type: 'debit', account: 'A', amount: 100 },
      { type: 'credit', account: 'B', amount: 100 },
      { type: 'invalid', account: 'C', amount: 50 } // This will fail
    ]

    await expect(
      FinancialTransactionManager.executeAtomicTransaction(operations, testContext)
    ).rejects.toThrow('Financial operation failed')

    // Verify compensations were executed
    expect(await getAccountBalance('A')).toBe(originalBalanceA)
    expect(await getAccountBalance('B')).toBe(originalBalanceB)
  })
})
```

## Best Practices

### Error Message Design
- **User-Friendly Messages** - Clear, actionable error messages for end users
- **Technical Details** - Comprehensive error details for developers and logs
- **Internationalization** - Support for multiple languages in error messages
- **Contextual Help** - Provide next steps or links to documentation

### Security Considerations
- **Information Disclosure** - Avoid exposing sensitive data in error messages
- **Error Enumeration** - Prevent attackers from using errors to enumerate systems
- **Audit Trails** - Log security-related errors with appropriate detail
- **Rate Limiting** - Implement rate limiting for error-prone operations

### Performance Impact
- **Error Handling Overhead** - Minimize performance impact of error handling code
- **Memory Management** - Properly clean up resources in error scenarios
- **Error Aggregation** - Batch similar errors to reduce logging overhead
- **Monitoring Costs** - Balance monitoring detail with infrastructure costs

This skill provides a comprehensive framework for implementing enterprise-grade error handling that is both robust and maintainable, ensuring your application can handle failures gracefully while providing excellent observability into system health.