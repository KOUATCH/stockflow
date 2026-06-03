import {
  buildCrudMutationNotification,
  getFailedActionResultError,
  getFriendlyErrorMessage,
} from '@/lib/error-handling/crud-notifications'

describe('CRUD mutation notifications', () => {
  it('builds friendly success messages from mutation metadata', () => {
    expect(
      buildCrudMutationNotification('success', {
        operation: 'create',
        entity: 'Brand',
      })
    ).toMatchObject({
      type: 'success',
      title: 'Brand Created',
      message: 'Brand has been created successfully.',
      category: 'operation',
      priority: 'normal',
    })
  })

  it('builds friendly error messages from structured action errors', () => {
    expect(
      buildCrudMutationNotification(
        'error',
        {
          operation: 'update',
          entity: 'Customer',
        },
        {
          userMessage: 'The customer email is already in use.',
        }
      )
    ).toMatchObject({
      type: 'error',
      title: 'Update Customer Failed',
      message: 'The customer email is already in use.',
      category: 'error',
      priority: 'high',
    })
  })

  it('does not show success notifications when a mutation already handles them', () => {
    expect(
      buildCrudMutationNotification('success', {
        operation: 'delete',
        entity: 'Purchase Order',
        suppressSuccessNotification: true,
      })
    ).toBeNull()
  })

  it('detects failed action results that resolved instead of throwing', () => {
    expect(
      getFailedActionResultError({
        success: false,
        error: {
          userMessage: 'Unable to delete this location while it has active stock.',
        },
      })
    ).toMatchObject({
      userMessage: 'Unable to delete this location while it has active stock.',
    })
  })

  it('keeps object-shaped errors user friendly', () => {
    expect(getFriendlyErrorMessage({})).toBe('The operation could not be completed. Please try again.')
  })

  it('uses a clean fallback title for untagged mutation failures', () => {
    expect(buildCrudMutationNotification('error', undefined, new Error('Network request failed'))).toMatchObject({
      type: 'error',
      title: 'Operation Failed',
      message: 'Network request failed',
    })
  })
})
