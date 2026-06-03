import { waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

/**
 * Helper to simulate user typing in an input field
 */
export const typeIntoInput = async (input: HTMLElement, value: string) => {
  await userEvent.clear(input)
  await userEvent.type(input, value)
}

/**
 * Helper to simulate user selecting from a dropdown
 */
export const selectFromDropdown = async (triggerElement: HTMLElement, optionText: string) => {
  await userEvent.click(triggerElement)

  await waitFor(() => {
    const option = document.getByRole('option', { name: optionText })
    if (option) {
      userEvent.click(option)
    }
  })
}

/**
 * Helper to wait for form validation to complete
 */
export const waitForFormValidation = async () => {
  await waitFor(() => {}, { timeout: 500 })
}

/**
 * Helper to simulate form submission
 */
export const submitForm = async (submitButton: HTMLElement) => {
  await userEvent.click(submitButton)
  await waitForFormValidation()
}

/**
 * Helper to check if an element has specific text content
 */
export const hasTextContent = (element: HTMLElement | null, text: string): boolean => {
  return element?.textContent?.includes(text) ?? false
}

/**
 * Helper to check if an element has a specific class
 */
export const hasClass = (element: HTMLElement | null, className: string): boolean => {
  return element?.classList.contains(className) ?? false
}

/**
 * Helper to mock successful server action response
 */
export const createSuccessfulActionResponse = (data?: any) => ({
  success: true,
  data,
  message: 'Operation completed successfully',
})

/**
 * Helper to mock failed server action response
 */
export const createFailedActionResponse = (error: string = 'Something went wrong') => ({
  success: false,
  error,
})

/**
 * Helper to mock async delay
 */
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Helper to create a mock file for file upload tests
 */
export const createMockFile = (name: string = 'test-image.jpg', type: string = 'image/jpeg') => {
  return new File(['test file content'], name, { type })
}

/**
 * Helper to simulate step navigation in multi-step forms
 */
export const navigateToStep = async (stepButton: HTMLElement) => {
  await userEvent.click(stepButton)
  await waitForFormValidation()
}

/**
 * Helper to fill form fields with test data
 */
export const fillFormField = async (field: HTMLElement, value: string | number) => {
  if (field.tagName.toLowerCase() === 'input') {
    await typeIntoInput(field, String(value))
  } else if (field.tagName.toLowerCase() === 'textarea') {
    await typeIntoInput(field, String(value))
  }
}

/**
 * Helper to check form validation state
 */
export const isFieldValid = (field: HTMLElement): boolean => {
  return !field.getAttribute('aria-invalid') || field.getAttribute('aria-invalid') === 'false'
}

/**
 * Helper to get validation error message for a field
 */
export const getFieldErrorMessage = (container: HTMLElement, fieldName: string): string | null => {
  const errorElement = container.querySelector(`[data-testid="${fieldName}-error"]`)
  return errorElement?.textContent || null
}