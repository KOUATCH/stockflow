import React from 'react'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModernCreateItemForm } from '@/components/inventory/ModernCreateItemForm'
import { render } from '../../utils/test-utils'
import {
  createMockModernCreateItemFormProps,
  createMockItemFormData,
} from '../../utils/mock-factories'
import { typeIntoInput } from '../../utils/test-helpers'

// Mock the generateSimpleSKU function
jest.mock('@/lib/generateSKU', () => ({
  generateSimpleSKU: jest.fn(() => 'TEST-SKU-123'),
}))

describe('ModernCreateItemForm - Surgical Fixes (Karpathy Skills)', () => {
  let defaultProps: ReturnType<typeof createMockModernCreateItemFormProps>
  let user: ReturnType<typeof userEvent.setup>
  let consoleSpy: jest.SpyInstance

  beforeEach(() => {
    defaultProps = createMockModernCreateItemFormProps()
    user = userEvent.setup()
    jest.clearAllMocks()
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  describe('Form Value Preservation During Step Navigation', () => {
    it('implements surgical fix for preserving critical form values', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Fill basic info
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      // Navigate to details
      const nextButton1 = screen.getByText('Next Step')
      await user.click(nextButton1)

      await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument()
      })

      // Fill barcode
      const barcodeInput = screen.getByLabelText(/Barcode/i)
      await typeIntoInput(barcodeInput, '1234567890123')

      // Navigate to pricing
      const nextButton2 = screen.getByText('Next Step')
      await user.click(nextButton2)

      await waitFor(() => {
        expect(screen.getByText('Pricing & Units')).toBeInTheDocument()
      })

      // Fill pricing and related fields
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      await typeIntoInput(costPriceInput, '100')
      await typeIntoInput(sellingPriceInput, '150')

      // Select unit
      const unitSelect = screen.getByRole('combobox', { name: /unit of measure/i })
      await user.click(unitSelect)

      const unitOption = await screen.findByRole('option', { name: new RegExp(defaultProps.units[0].nameEn) })
      await user.click(unitOption)

      // Select tax rate
      const taxRateSelect = screen.getByRole('combobox', { name: /tax rate/i })
      await user.click(taxRateSelect)

      const taxRateOption = await screen.findByRole('option', { name: new RegExp(defaultProps.taxRate[0].nameEn) })
      await user.click(taxRateOption)

      // Navigate to inventory step - this triggers the surgical fix
      const nextButton3 = screen.getByText('Next Step')
      await user.click(nextButton3)

      // Wait for the surgical fix timeout to complete
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      await waitFor(() => {
        expect(screen.getByText('Inventory Settings')).toBeInTheDocument()
      })

      // Verify surgical fix logs were triggered
      const logCalls = consoleSpy.mock.calls
      const hasPreservationLogs = logCalls.some(call =>
        call[0] && typeof call[0] === 'string' && call[0].includes('Values right before changing to')
      )
      expect(hasPreservationLogs).toBe(true)

      // Navigate back to pricing and verify values were preserved
      const pricingStepButton = screen.getByText('Pricing')
      await user.click(pricingStepButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue('100')).toBeInTheDocument()
        expect(screen.getByDisplayValue('150')).toBeInTheDocument()
        expect(screen.getByDisplayValue(defaultProps.units[0].id)).toBeInTheDocument()
        expect(screen.getByDisplayValue(defaultProps.taxRate[0].id)).toBeInTheDocument()
      })

      // Navigate back to details and verify barcode was preserved
      const detailsStepButton = screen.getByText('Details')
      await user.click(detailsStepButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue('1234567890123')).toBeInTheDocument()
      })
    })

    it('identifies and restores lost values using surgical precision', async () => {
      const restoreSpy = jest.spyOn(console, 'log')

      render(<ModernCreateItemForm {...defaultProps} />)

      // Set up form data
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      // Navigate and fill pricing step
      for (let i = 0; i < 2; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      // Fill critical fields that are prone to loss
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      await typeIntoInput(costPriceInput, '75.50')
      await typeIntoInput(sellingPriceInput, '125.75')

      const unitSelect = screen.getByRole('combobox', { name: /unit of measure/i })
      await user.click(unitSelect)

      const unitOption = await screen.findByRole('option', { name: new RegExp(defaultProps.units[0].nameEn) })
      await user.click(unitOption)

      // Trigger the surgical fix by navigating
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      // Wait for restoration logic
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Check that the restoration process detected and fixed value preservation
      const logCalls = restoreSpy.mock.calls
      const hasRestorationSuccess = logCalls.some(call =>
        call[0] && typeof call[0] === 'string' &&
        (call[0].includes('Values restored after step change') || call[0].includes('Restoring'))
      )

      // The surgical fix should either prevent loss or detect and restore
      expect(hasRestorationSuccess).toBeTruthy()

      restoreSpy.mockRestore()
    })

    it('prevents value loss with 50ms surgical timeout precision', async () => {
      const timerSpy = jest.spyOn(global, 'setTimeout')

      render(<ModernCreateItemForm {...defaultProps} />)

      // Set up data and navigate
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      // Navigate to pricing
      for (let i = 0; i < 2; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      // Fill values
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      await typeIntoInput(costPriceInput, '99.99')

      // Navigate to trigger surgical fix
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      // Verify the surgical fix uses exactly 50ms timeout
      expect(timerSpy).toHaveBeenCalledWith(expect.any(Function), 50)

      timerSpy.mockRestore()
    })
  })

  describe('Precision Data Validation and Preservation', () => {
    it('maintains form validation state during surgical restoration', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Create a scenario where surgical fix is needed
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Precision Test Product')

      // Navigate through steps with specific data patterns
      for (let i = 0; i < 2; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      // Set pricing with edge case values
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      await typeIntoInput(costPriceInput, '0.01') // Minimum valid value
      await typeIntoInput(sellingPriceInput, '999.99') // High precision value

      // Navigate to trigger restoration
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Navigate back and verify precision is maintained
      const pricingStepButton = screen.getByText('Pricing')
      await user.click(pricingStepButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue('0.01')).toBeInTheDocument()
        expect(screen.getByDisplayValue('999.99')).toBeInTheDocument()
      })

      // Verify profit calculation still works correctly
      await waitFor(() => {
        expect(screen.getByText('99.99%')).toBeInTheDocument() // Profit margin
      })
    })

    it('handles edge cases in value preservation logic', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Edge Case Test')

      // Navigate to pricing
      for (let i = 0; i < 2; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      // Test edge cases: zero values, empty strings
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      // Set to zero (valid edge case)
      await user.clear(costPriceInput)
      await typeIntoInput(costPriceInput, '0')
      await user.clear(sellingPriceInput)
      await typeIntoInput(sellingPriceInput, '0')

      // Navigate to trigger surgical fix with edge case data
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Check that surgical fix handles zero values correctly
      const logCalls = consoleSpy.mock.calls
      const hasZeroValueHandling = logCalls.some(call => {
        if (call[0] && typeof call[0] === 'string' && call[0].includes('Form values AFTER')) {
          const valueObj = call[1]
          return valueObj && (valueObj.costPrice === 0 && valueObj.sellingPrice === 0)
        }
        return false
      })

      expect(hasZeroValueHandling).toBe(true)
    })
  })

  describe('Hidden Field Registration Surgical Fix', () => {
    it('maintains hidden field registrations across step transitions', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // The component includes hidden fields to maintain registrations
      // These should be present in the DOM (but invisible)
      const hiddenContainer = document.querySelector('[style*="display: none"]')
      expect(hiddenContainer).toBeInTheDocument()

      // Navigate through steps to test hidden field persistence
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Hidden Field Test')

      for (let i = 0; i < 2; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      // Fill values that go through hidden fields
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      await typeIntoInput(costPriceInput, '42.42')

      // Navigate to trigger the hidden field preservation
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Verify hidden field console logs
      const logCalls = consoleSpy.mock.calls
      const hasHiddenFieldLogs = logCalls.some(call =>
        call[0] && typeof call[0] === 'string' && call[0].includes('Hidden') && call[0].includes('field render')
      )

      expect(hasHiddenFieldLogs).toBe(true)
    })
  })

  describe('Debugging and Monitoring Precision', () => {
    it('provides detailed debugging information for surgical fixes', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Set up a scenario that triggers all debugging paths
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Debug Test Product')

      // Navigate and set complex data
      for (let i = 0; i < 2; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      // Fill all trackable fields
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      await typeIntoInput(costPriceInput, '123.45')
      await typeIntoInput(sellingPriceInput, '678.90')

      const unitSelect = screen.getByRole('combobox', { name: /unit of measure/i })
      await user.click(unitSelect)

      const unitOption = await screen.findByRole('option', { name: new RegExp(defaultProps.units[0].nameEn) })
      await user.click(unitOption)

      // Navigate to trigger comprehensive debugging
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Verify comprehensive debugging output
      const logCalls = consoleSpy.mock.calls

      // Should have before validation logs
      const hasBeforeValidation = logCalls.some(call =>
        call[0] && typeof call[0] === 'string' && call[0].includes('Form values BEFORE') && call[0].includes('validation')
      )

      // Should have after validation logs
      const hasAfterValidation = logCalls.some(call =>
        call[0] && typeof call[0] === 'string' && call[0].includes('Form values AFTER') && call[0].includes('validation')
      )

      // Should have step change logs
      const hasStepChangeLogs = logCalls.some(call =>
        call[0] && typeof call[0] === 'string' && call[0].includes('Values right before changing to')
      )

      expect(hasBeforeValidation).toBe(true)
      expect(hasAfterValidation).toBe(true)
      expect(hasStepChangeLogs).toBe(true)
    })

    it('tracks value mutations with surgical precision', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Create a mutation tracking scenario
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Mutation Tracking Test')

      // Navigate to pricing
      for (let i = 0; i < 2; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      // Set initial values
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      await typeIntoInput(costPriceInput, '100.00')

      // Modify the value
      await user.clear(costPriceInput)
      await typeIntoInput(costPriceInput, '200.00')

      // Navigate to track mutations
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Look for mutation tracking in logs
      const logCalls = consoleSpy.mock.calls
      const valueTrackingLogs = logCalls.filter(call =>
        call[0] && typeof call[0] === 'string' &&
        (call[0].includes('costPrice') || call[0].includes('Form values'))
      )

      // Should have multiple logs tracking the value changes
      expect(valueTrackingLogs.length).toBeGreaterThan(2)
    })
  })

  describe('Surgical Fix Integration with Form Lifecycle', () => {
    it('integrates seamlessly with React Hook Form lifecycle', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Test integration with form watch functionality
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Lifecycle Integration Test')

      // Navigate to pricing where watched values are critical
      for (let i = 0; i < 2; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      // Set values that trigger watch callbacks
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      await typeIntoInput(costPriceInput, '50')
      await typeIntoInput(sellingPriceInput, '100')

      // Verify profit margin calculation (watch callback working)
      await waitFor(() => {
        expect(screen.getByText('50.0%')).toBeInTheDocument()
      })

      // Navigate and test that watch callbacks still work after surgical fix
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Navigate back and verify watch callbacks are preserved
      const pricingStepButton = screen.getByText('Pricing')
      await user.click(pricingStepButton)

      await waitFor(() => {
        expect(screen.getByText('50.0%')).toBeInTheDocument() // Profit margin still calculated
      })
    })

    it('maintains form validation state across surgical interventions', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Create validation state to preserve
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Validation State Test')

      // Navigate to pricing
      for (let i = 0; i < 2; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      // Create invalid state (selling price < cost price)
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      await typeIntoInput(costPriceInput, '100')
      await typeIntoInput(sellingPriceInput, '50')

      // Try to navigate (should fail validation)
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/Selling price should be greater than or equal to cost price/i)).toBeInTheDocument()
      })

      // Fix the validation error
      await user.clear(sellingPriceInput)
      await typeIntoInput(sellingPriceInput, '150')

      // Now navigation should work
      const nextButton2 = screen.getByText('Next Step')
      await user.click(nextButton2)

      await waitFor(() => {
        expect(screen.getByText('Inventory Settings')).toBeInTheDocument()
      })

      // Verify that validation state was preserved through the surgical fix
      const logCalls = consoleSpy.mock.calls
      const hasValidationLogs = logCalls.some(call =>
        call[0] && typeof call[0] === 'string' && call[0].includes('validation')
      )

      expect(hasValidationLogs).toBe(true)
    })
  })
})
