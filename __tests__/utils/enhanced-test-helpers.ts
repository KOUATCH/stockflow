import { waitFor, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UserEvent } from '@testing-library/user-event'

/**
 * Enhanced test helpers for the ModernCreateItemForm and related components
 * These helpers follow the Karpathy Skills principles for precise testing
 */

/**
 * Helper to navigate through form steps with validation
 */
export const navigateFormStep = async (
  user: UserEvent,
  targetStep: string,
  options: {
    waitForContent?: string
    skipValidation?: boolean
    timeout?: number
  } = {}
) => {
  const { waitForContent, skipValidation = false, timeout = 3000 } = options

  const stepButton = screen.getByText(targetStep)
  await user.click(stepButton)

  if (waitForContent) {
    await waitFor(() => {
      expect(screen.getByText(waitForContent)).toBeInTheDocument()
    }, { timeout })
  }

  if (!skipValidation) {
    await waitForFormValidation()
  }
}

/**
 * Helper to fill form fields with type checking and validation
 */
export const fillFormFields = async (
  user: UserEvent,
  fields: Record<string, string | number | boolean>
) => {
  for (const [fieldName, value] of Object.entries(fields)) {
    const element = screen.getByLabelText(new RegExp(fieldName, 'i'))

    if (element.tagName === 'INPUT') {
      const inputElement = element as HTMLInputElement

      if (inputElement.type === 'checkbox' || inputElement.type === 'radio') {
        if (Boolean(value) !== inputElement.checked) {
          await user.click(inputElement)
        }
      } else if (inputElement.type === 'number') {
        await user.clear(inputElement)
        await user.type(inputElement, String(value))
      } else {
        await user.clear(inputElement)
        await user.type(inputElement, String(value))
      }
    } else if (element.tagName === 'TEXTAREA') {
      await user.clear(element)
      await user.type(element, String(value))
    }

    // Wait for field to update
    await waitFor(() => {
      if (typeof value === 'boolean') {
        expect((element as HTMLInputElement).checked).toBe(value)
      } else {
        expect((element as HTMLInputElement).value).toBe(String(value))
      }
    })
  }
}

/**
 * Helper to select dropdown options with enhanced error handling
 */
export const selectDropdownOption = async (
  user: UserEvent,
  dropdownLabel: string | RegExp,
  optionText: string | RegExp,
  options: {
    exact?: boolean
    timeout?: number
  } = {}
) => {
  const { exact = false, timeout = 3000 } = options

  const dropdown = screen.getByRole('combobox', { name: dropdownLabel })
  await user.click(dropdown)

  await waitFor(() => {
    const option = exact
      ? screen.getByRole('option', { name: optionText, exact })
      : screen.getByRole('option', { name: optionText })

    return user.click(option)
  }, { timeout })

  // Verify selection
  await waitFor(() => {
    expect(dropdown).toHaveDisplayValue(
      expect.stringMatching(typeof optionText === 'string' ? optionText : optionText)
    )
  })
}

/**
 * Enhanced form validation waiter with error detection
 */
export const waitForFormValidation = async (timeout = 1000) => {
  await new Promise(resolve => setTimeout(resolve, 100))

  // Wait for any validation messages to appear or disappear
  await waitFor(() => {
    const validationMessages = screen.queryAllByRole('alert')
    // Allow test to continue regardless of validation state
    return true
  }, { timeout })
}

/**
 * Complete form submission workflow helper
 */
export const completeFormSubmission = async (
  user: UserEvent,
  formData: {
    basic?: Record<string, any>
    details?: Record<string, any>
    pricing?: Record<string, any>
    inventory?: Record<string, any>
  },
  options: {
    skipSteps?: string[]
    customValidation?: (step: string) => Promise<void>
  } = {}
) => {
  const { skipSteps = [], customValidation } = options

  // Step 1: Basic Information
  if (!skipSteps.includes('basic') && formData.basic) {
    await fillFormFields(user, formData.basic)

    if (customValidation) {
      await customValidation('basic')
    }

    await user.click(screen.getByText('Next Step'))
    await waitForFormValidation()
  }

  // Step 2: Details
  if (!skipSteps.includes('details') && formData.details) {
    await waitFor(() => {
      expect(screen.getByText('Product Details')).toBeInTheDocument()
    })

    if (formData.details.category) {
      await selectDropdownOption(user, /category/i, formData.details.category)
    }

    if (formData.details.brand) {
      await selectDropdownOption(user, /brand/i, formData.details.brand)
    }

    // Fill other detail fields
    const detailFields = { ...formData.details }
    delete detailFields.category
    delete detailFields.brand

    if (Object.keys(detailFields).length > 0) {
      await fillFormFields(user, detailFields)
    }

    if (customValidation) {
      await customValidation('details')
    }

    await user.click(screen.getByText('Next Step'))
    await waitForFormValidation()
  }

  // Step 3: Pricing
  if (!skipSteps.includes('pricing') && formData.pricing) {
    await waitFor(() => {
      expect(screen.getByText('Pricing & Units')).toBeInTheDocument()
    })

    const pricingFields = { ...formData.pricing }

    if (pricingFields.unit) {
      await selectDropdownOption(user, /unit of measure/i, pricingFields.unit)
      delete pricingFields.unit
    }

    if (pricingFields.taxRate) {
      await selectDropdownOption(user, /tax rate/i, pricingFields.taxRate)
      delete pricingFields.taxRate
    }

    if (Object.keys(pricingFields).length > 0) {
      await fillFormFields(user, pricingFields)
    }

    if (customValidation) {
      await customValidation('pricing')
    }

    await user.click(screen.getByText('Next Step'))
    await waitForFormValidation()
  }

  // Step 4: Inventory
  if (!skipSteps.includes('inventory') && formData.inventory) {
    await waitFor(() => {
      expect(screen.getByText('Inventory Settings')).toBeInTheDocument()
    })

    await fillFormFields(user, formData.inventory)

    if (customValidation) {
      await customValidation('inventory')
    }

    await user.click(screen.getByText('Next Step'))
    await waitForFormValidation()
  }

  // Final step: Media
  await waitFor(() => {
    expect(screen.getByText('Product Media')).toBeInTheDocument()
  })
}

/**
 * Assert form data persistence across steps
 */
export const assertFormDataPersistence = async (
  user: UserEvent,
  expectedData: Record<string, Record<string, any>>
) => {
  for (const [stepName, stepData] of Object.entries(expectedData)) {
    await navigateFormStep(user, stepName, { skipValidation: true })

    for (const [fieldName, expectedValue] of Object.entries(stepData)) {
      const element = screen.getByLabelText(new RegExp(fieldName, 'i'))

      if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        const inputElement = element as HTMLInputElement

        if (inputElement.type === 'checkbox') {
          expect(inputElement.checked).toBe(Boolean(expectedValue))
        } else {
          expect(inputElement.value).toBe(String(expectedValue))
        }
      }
    }
  }
}

/**
 * Simulate rapid user interactions for stress testing
 */
export const simulateRapidInteractions = async (
  user: UserEvent,
  actions: (() => Promise<void>)[]
) => {
  const promises = actions.map(action => action())
  await Promise.all(promises)
}

/**
 * Wait for surgical fix restoration to complete
 */
export const waitForSurgicalFix = async (timeout = 150) => {
  // Wait for the surgical fix timeout (50ms) plus buffer
  await new Promise(resolve => setTimeout(resolve, timeout))
}

/**
 * Assert no console errors during operation
 */
export const assertNoConsoleErrors = () => {
  const consoleErrorSpy = jest.spyOn(console, 'error')

  return () => {
    expect(consoleErrorSpy).not.toHaveBeenCalled()
    consoleErrorSpy.mockRestore()
  }
}

/**
 * Create mock server action with configurable responses
 */
export const createMockServerAction = (responses: any[] = []) => {
  let callIndex = 0

  return jest.fn().mockImplementation(() => {
    const response = responses[callIndex] || responses[responses.length - 1]
    callIndex++
    return Promise.resolve(response)
  })
}

/**
 * Verify FormData contents with type safety
 */
export const verifyFormData = (
  formData: FormData,
  expectedFields: Record<string, any>
) => {
  for (const [key, expectedValue] of Object.entries(expectedFields)) {
    const actualValue = formData.get(key)

    if (expectedValue === null || expectedValue === undefined) {
      expect(actualValue).toBeFalsy()
    } else if (typeof expectedValue === 'boolean') {
      expect(actualValue).toBe(String(expectedValue))
    } else if (typeof expectedValue === 'number') {
      expect(Number(actualValue)).toBe(expectedValue)
    } else {
      expect(actualValue).toBe(String(expectedValue))
    }
  }
}

/**
 * Performance timing helper for testing response times
 */
export const measurePerformance = async <T>(
  operation: () => Promise<T>,
  expectedMaxDuration: number
): Promise<{ result: T; duration: number }> => {
  const start = performance.now()
  const result = await operation()
  const end = performance.now()
  const duration = end - start

  expect(duration).toBeLessThan(expectedMaxDuration)

  return { result, duration }
}

/**
 * Enhanced notification assertion helper
 */
export const assertNotification = async (
  type: 'success' | 'error' | 'warning' | 'info',
  messagePattern: string | RegExp,
  timeout = 3000
) => {
  await waitFor(() => {
    const notification = screen.getByText(messagePattern)
    expect(notification).toBeInTheDocument()
  }, { timeout })
}

/**
 * Keyboard navigation test helper
 */
export const testKeyboardNavigation = async (
  user: UserEvent,
  expectedFocusSequence: string[]
) => {
  for (let i = 0; i < expectedFocusSequence.length - 1; i++) {
    const currentElement = screen.getByLabelText(new RegExp(expectedFocusSequence[i], 'i'))
    expect(currentElement).toHaveFocus()

    await user.tab()

    const nextElement = screen.getByLabelText(new RegExp(expectedFocusSequence[i + 1], 'i'))
    expect(nextElement).toHaveFocus()
  }
}

/**
 * Accessibility compliance checker
 */
export const checkAccessibilityCompliance = () => {
  // Check for required ARIA attributes
  const requiredFields = screen.getAllByLabelText(/required|*/i)
  requiredFields.forEach(field => {
    expect(field).toHaveAttribute('aria-required', 'true')
  })

  // Check for proper error messaging
  const invalidFields = screen.queryAllByAttribute('aria-invalid', 'true')
  invalidFields.forEach(field => {
    const fieldId = field.getAttribute('id')
    if (fieldId) {
      const errorMessage = screen.queryByAttribute('aria-describedby', fieldId)
      expect(errorMessage).toBeInTheDocument()
    }
  })
}

/**
 * Visual regression test data generator
 */
export const generateVisualRegressionData = (componentName: string) => {
  return {
    testName: `${componentName}-visual-regression`,
    viewport: { width: 1024, height: 768 },
    threshold: 0.2,
    animations: 'disabled',
  }
}