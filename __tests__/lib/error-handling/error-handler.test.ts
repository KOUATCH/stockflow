import { ErrorHandler, sanitizeErrorMetadata } from '@/lib/error-handling/error-handler'
import { createNotificationCallback } from '@/lib/error-handling/notification-integration'
import { withErrorHandling } from '@/lib/error-handling/server-action-wrapper'
import { withRouteErrorHandling } from '@/lib/error-handling/setup'
import {
  ErrorCategory,
  ErrorContext,
  ErrorSeverity,
  RecoveryStrategy,
  type ErrorData,
} from '@/lib/error-handling/types'

describe('enterprise error handling', () => {
  let consoleErrorSpy: jest.SpyInstance
  let consoleWarnSpy: jest.SpyInstance
  let consoleInfoSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => undefined)
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => undefined)
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation(() => undefined)
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
    consoleWarnSpy.mockRestore()
    consoleInfoSpy.mockRestore()
  })

  it('redacts sensitive metadata before logging or returning client-safe errors', () => {
    const handler = new ErrorHandler()

    const errorData = handler.createErrorFromException(
      new Error('Database failed at postgres://admin:secret@example.com/app with Bearer abc123'),
      {
        context: ErrorContext.SERVER_ACTION,
        action: 'createBrand',
        requestId: 'req-test-1',
        userMessage: 'Unable to save the brand right now.',
        metadata: {
          password: 'super-secret',
          nested: {
            token: 'abc123',
            safe: 'visible',
          },
        },
      }
    )

    expect(errorData.message).not.toContain('postgres://admin')
    expect(errorData.message).not.toContain('Bearer abc123')
    expect(errorData.metadata).toMatchObject({
      password: '[REDACTED]',
      nested: {
        token: '[REDACTED]',
        safe: 'visible',
      },
    })

    expect(handler.toServerActionError(errorData)).toMatchObject({
      message: 'Unable to save the brand right now.',
      userMessage: 'Unable to save the brand right now.',
      context: {
        action: 'createBrand',
        requestId: 'req-test-1',
      },
    })
  })

  it('normalizes thrown server action errors with action context and safe messages', async () => {
    const action = withErrorHandling(
      async () => {
        throw new Error('Database connection failed password=secret')
      },
      {
        actionName: 'loadInventory',
        component: 'InventoryDashboard',
        notifyUser: false,
        notifyAdmin: false,
      }
    )

    const result = await action({ organizationId: 'org-1', password: 'hidden' })

    expect(result.success).toBe(false)
    expect(result.error?.message).toBe(result.error?.userMessage)
    expect(result.error?.message).not.toContain('password=secret')
    expect(result.error?.context).toMatchObject({
      action: 'loadInventory',
      component: 'InventoryDashboard',
      handled: true,
    })
    expect(result.metadata?.requestId).toEqual(expect.stringMatching(/^req_/))
  })

  it('maps enterprise errors to notification provider methods', async () => {
    const notifications = {
      success: jest.fn(() => 'success-id'),
      error: jest.fn(() => 'error-id'),
      warning: jest.fn(() => 'warning-id'),
      info: jest.fn(() => 'info-id'),
      formSuccess: jest.fn(() => 'form-success-id'),
      formError: jest.fn(() => 'form-error-id'),
      operationStart: jest.fn(() => 'operation-start-id'),
      operationComplete: jest.fn(() => 'operation-complete-id'),
    }

    const callback = createNotificationCallback(notifications)
    const errorData: ErrorData = {
      id: 'err-1',
      timestamp: new Date(),
      category: ErrorCategory.INVENTORY,
      severity: ErrorSeverity.HIGH,
      context: ErrorContext.SERVER_ACTION,
      code: 'INV_STOCK_LOW',
      message: 'Internal stock mutation failed',
      userMessage: 'Inventory could not be updated. Please try again.',
      action: 'adjustStock',
      recoveryStrategy: RecoveryStrategy.RETRY,
    }

    await callback(errorData, {})

    expect(notifications.error).toHaveBeenCalledWith(
      'Inventory Error',
      'Inventory could not be updated. Please try again.',
      expect.objectContaining({
        category: 'inventory',
        priority: 'high',
        sound: true,
        action: expect.objectContaining({ label: 'Retry' }),
      })
    )
  })

  it('wraps App Router handlers with safe JSON error responses', async () => {
    const handler = withRouteErrorHandling(
      async (_request: unknown) => {
        throw new Error('Invalid field value password=secret')
      },
      {
        routeName: 'POST /api/inventory',
        notifyAdmin: false,
      }
    )

    const response = await handler(
      {}
    )
    const body = await response.json()

    expect(response.status).toBe(400)
    expect(response.headers.get('x-correlation-id')).toEqual(expect.stringMatching(/^route_/))
    expect(body.error.userMessage).toBe('Please check your input and try again.')
    expect(JSON.stringify(body)).not.toContain('password=secret')
  })

  it('exposes a reusable metadata sanitizer', () => {
    expect(
      sanitizeErrorMetadata({
        authorization: 'Bearer token',
        note: 'safe',
      })
    ).toEqual({
      authorization: '[REDACTED]',
      note: 'safe',
    })
  })
})
