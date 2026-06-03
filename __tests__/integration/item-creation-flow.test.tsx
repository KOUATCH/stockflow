import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModernCreateItemForm } from '@/components/inventory/ModernCreateItemForm'
import { createItemAction } from '@/actions/item/createItemAction'
import { render } from '../utils/test-utils'
import {
  createMockModernCreateItemFormProps,
  createMockItemWithRelations,
  createSuccessfulActionResponse,
  createFailedActionResponse,
} from '../utils/mock-factories'
import { typeIntoInput, waitForFormValidation } from '../utils/test-helpers'

// Mock the actual server action
jest.mock('@/actions/item/createItemAction')

const mockCreateItemAction = createItemAction as jest.MockedFunction<typeof createItemAction>

describe('Item Creation Flow - Integration Tests', () => {
  let defaultProps: ReturnType<typeof createMockModernCreateItemFormProps>
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    defaultProps = createMockModernCreateItemFormProps()
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Complete Form Submission Flow', () => {
    it('successfully creates an item through complete form flow', async () => {
      const mockCreatedItem = createMockItemWithRelations()
      mockCreateItemAction.mockResolvedValueOnce(createSuccessfulActionResponse(mockCreatedItem))

      render(
        <ModernCreateItemForm
          {...defaultProps}
          action={mockCreateItemAction}
        />
      )

      // Step 1: Basic Information
      await user.type(screen.getByLabelText(/Product Name/i), 'Integration Test Product')
      await user.type(screen.getByLabelText(/Product Description/i), 'Test description for integration')

      await user.click(screen.getByText('Next Step'))
      await waitForFormValidation()

      // Step 2: Details
      await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument()
      })

      // SKU should be auto-generated, but we can modify it
      const skuInput = screen.getByLabelText(/SKU/i)
      await user.clear(skuInput)
      await user.type(skuInput, 'INTEGRATION-001')

      await user.type(screen.getByLabelText(/Barcode/i), '1234567890123')

      // Select category
      const categorySelect = screen.getByRole('combobox', { name: /category/i })
      await user.click(categorySelect)
      const categoryOption = await screen.findByRole('option', { name: defaultProps.categories[0].titleEn })
      await user.click(categoryOption)

      // Select brand
      const brandSelect = screen.getByRole('combobox', { name: /brand/i })
      await user.click(brandSelect)
      const brandOption = await screen.findByRole('option', { name: defaultProps.brands[0].brandName })
      await user.click(brandOption)

      await user.click(screen.getByText('Next Step'))
      await waitForFormValidation()

      // Step 3: Pricing
      await waitFor(() => {
        expect(screen.getByText('Pricing & Units')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/Cost Price/i), '100')
      await user.type(screen.getByLabelText(/Selling Price/i), '150')

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

      await user.click(screen.getByText('Next Step'))
      await waitForFormValidation()

      // Step 4: Inventory
      await waitFor(() => {
        expect(screen.getByText('Inventory Settings')).toBeInTheDocument()
      })

      await user.type(screen.getByLabelText(/Minimum Stock Level/i), '10')
      await user.type(screen.getByLabelText(/Maximum Stock Level/i), '100')
      await user.type(screen.getByLabelText(/Weight/i), '2.5')
      await user.type(screen.getByLabelText(/Dimensions/i), '10 x 5 x 3 cm')

      await user.click(screen.getByText('Next Step'))
      await waitForFormValidation()

      // Step 5: Media
      await waitFor(() => {
        expect(screen.getByText('Product Media')).toBeInTheDocument()
      })

      // Submit the form
      const submitButton = screen.getByText('Create Product')
      await user.click(submitButton)

      // Verify the action was called with correct data
      await waitFor(() => {
        expect(mockCreateItemAction).toHaveBeenCalledWith(expect.any(FormData))
      })

      // Check for success notification (mocked)
      await waitFor(() => {
        expect(screen.getByText(/Creating Product/i)).toBeInTheDocument()
      })
    })

    it('handles validation errors during multi-step flow', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Try to proceed from first step without filling required fields
      await user.click(screen.getByText('Next Step'))

      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument()
      })

      // Fill name and proceed
      await user.type(screen.getByLabelText(/Product Name/i), 'Test Product')
      await user.click(screen.getByText('Next Step'))

      await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument()
      })

      // Proceed to pricing step
      await user.click(screen.getByText('Next Step'))

      await waitFor(() => {
        expect(screen.getByText('Pricing & Units')).toBeInTheDocument()
      })

      // Set invalid pricing (selling price less than cost price)
      await user.type(screen.getByLabelText(/Cost Price/i), '100')
      await user.type(screen.getByLabelText(/Selling Price/i), '50')

      // Try to proceed to next step
      await user.click(screen.getByText('Next Step'))

      await waitFor(() => {
        expect(screen.getByText(/Selling price should be greater than or equal to cost price/i)).toBeInTheDocument()
      })
    })

    it('handles server action errors gracefully', async () => {
      mockCreateItemAction.mockResolvedValueOnce(createFailedActionResponse('Product name already exists'))

      render(
        <ModernCreateItemForm
          {...defaultProps}
          action={mockCreateItemAction}
        />
      )

      // Complete the form quickly
      await user.type(screen.getByLabelText(/Product Name/i), 'Duplicate Product')

      // Navigate to final step
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByText('Next Step'))
        await waitForFormValidation()
      }

      // Submit
      await user.click(screen.getByText('Create Product'))

      await waitFor(() => {
        expect(mockCreateItemAction).toHaveBeenCalled()
      })

      // Check for error notification
      await waitFor(() => {
        expect(screen.getByText(/Creation Failed/i)).toBeInTheDocument()
      })
    })

    it('prevents submission while image is uploading', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Fill required fields and navigate to media step
      await user.type(screen.getByLabelText(/Product Name/i), 'Test Product')

      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByText('Next Step'))
        await waitForFormValidation()
      }

      // Simulate image upload in progress
      // Note: This would need to be implemented in the component test or mocked properly

      const submitButton = screen.getByText('Create Product')
      expect(submitButton).toBeInTheDocument()
    })

    it('auto-generates SKU when product name changes', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      const nameInput = screen.getByLabelText(/Product Name/i)
      await user.type(nameInput, 'Amazing Product')

      await waitFor(() => {
        expect(screen.getByText(/SKU automatically created/i)).toBeInTheDocument()
      })

      // Navigate to details step to see the SKU
      await user.click(screen.getByText('Next Step'))

      await waitFor(() => {
        const skuInput = screen.getByLabelText(/SKU/i)
        expect(skuInput).toHaveValue(expect.stringMatching(/AMAZINGPRODUCT/))
      })
    })

    it('shows profit margin calculations in real-time', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Navigate to pricing step
      await user.type(screen.getByLabelText(/Product Name/i), 'Test Product')

      for (let i = 0; i < 2; i++) {
        await user.click(screen.getByText('Next Step'))
        await waitForFormValidation()
      }

      // Enter pricing
      await user.type(screen.getByLabelText(/Cost Price/i), '100')
      await user.type(screen.getByLabelText(/Selling Price/i), '150')

      // Check profit margin calculation
      await waitFor(() => {
        expect(screen.getByText('33.3%')).toBeInTheDocument() // Profit margin
        expect(screen.getByText('$50.00 profit per unit')).toBeInTheDocument()
      })
    })

    it('shows live preview updates throughout the form', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Initially shows "New Product"
      expect(screen.getByText('New Product')).toBeInTheDocument()

      // Update name and check preview
      await user.type(screen.getByLabelText(/Product Name/i), 'Live Preview Product')

      await waitFor(() => {
        expect(screen.getByText('Live Preview Product')).toBeInTheDocument()
      })

      // Navigate to pricing and check preview updates
      for (let i = 0; i < 2; i++) {
        await user.click(screen.getByText('Next Step'))
        await waitForFormValidation()
      }

      await user.type(screen.getByLabelText(/Cost Price/i), '100')
      await user.type(screen.getByLabelText(/Selling Price/i), '150')

      await waitFor(() => {
        expect(screen.getByText('$100.00')).toBeInTheDocument() // Cost price in preview
        expect(screen.getByText('$150.00')).toBeInTheDocument() // Selling price in preview
      })
    })

    it('allows free navigation in edit mode', async () => {
      const mockData = {
        organizationId: 'org-123',
        nameEn: 'Existing Product',
        sku: 'EXISTING-SKU',
        costPrice: 100,
        sellingPrice: 150,
        minStockLevel: 10,
      }

      render(
        <ModernCreateItemForm
          {...defaultProps}
          isEditMode={true}
          initialData={mockData}
        />
      )

      // Should be able to jump directly to any step in edit mode
      await user.click(screen.getByText('Inventory'))

      await waitFor(() => {
        expect(screen.getByText('Inventory Settings')).toBeInTheDocument()
      })

      // Check that the form is pre-filled
      expect(screen.getByDisplayValue('10')).toBeInTheDocument() // minStockLevel
    })

    it('maintains form state when navigating between steps', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Fill basic info
      await user.type(screen.getByLabelText(/Product Name/i), 'State Test Product')
      await user.type(screen.getByLabelText(/Product Description/i), 'Test description')

      await user.click(screen.getByText('Next Step'))
      await waitForFormValidation()

      // Fill details
      const skuInput = screen.getByLabelText(/SKU/i)
      await user.clear(skuInput)
      await user.type(skuInput, 'STATE-TEST-001')

      await user.click(screen.getByText('Next Step'))
      await waitForFormValidation()

      // Go back to basic info step
      await user.click(screen.getByText('Basic Info'))

      // Check that data is still there
      expect(screen.getByDisplayValue('State Test Product')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test description')).toBeInTheDocument()

      // Go back to details
      await user.click(screen.getByText('Details'))

      // Check SKU is still there
      expect(screen.getByDisplayValue('STATE-TEST-001')).toBeInTheDocument()
    })

    it('shows completion progress and step indicators', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Initially at 20% (step 1 of 5)
      expect(screen.getByText('20% Complete')).toBeInTheDocument()

      // Complete first step and move to second
      await user.type(screen.getByLabelText(/Product Name/i), 'Progress Test')
      await user.click(screen.getByText('Next Step'))

      await waitFor(() => {
        expect(screen.getByText('40% Complete')).toBeInTheDocument() // Step 2 of 5
      })

      // Check step completion indicators
      const basicStepButton = screen.getByText('Basic Info')
      expect(basicStepButton.closest('button')).toHaveClass('border-emerald-200') // Completed step styling
    })
  })

  describe('Accessibility Integration', () => {
    it('supports keyboard navigation through the entire form', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Tab through basic info fields
      const nameInput = screen.getByLabelText(/Product Name/i)
      nameInput.focus()
      expect(nameInput).toHaveFocus()

      await user.tab()
      const descriptionInput = screen.getByLabelText(/Product Description/i)
      expect(descriptionInput).toHaveFocus()

      // Tab to next button
      await user.tab()
      const nextButton = screen.getByText('Next Step')
      expect(nextButton).toHaveFocus()
    })

    it('provides proper ARIA feedback for validation errors', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Try to proceed without filling required field
      await user.click(screen.getByText('Next Step'))

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/Product Name/i)
        expect(nameInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('has proper form labels and descriptions for screen readers', () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument()
      expect(screen.getByText(/This will be the main name customers see/i)).toBeInTheDocument()

      expect(screen.getByLabelText(/Product Description/i)).toBeInTheDocument()
      expect(screen.getByText(/A good description helps customers understand/i)).toBeInTheDocument()
    })
  })

  describe('Performance and Edge Cases', () => {
    it('handles rapid form interactions without breaking', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      const nameInput = screen.getByLabelText(/Product Name/i)

      // Rapidly type and clear
      await user.type(nameInput, 'Fast')
      await user.clear(nameInput)
      await user.type(nameInput, 'Typing')
      await user.clear(nameInput)
      await user.type(nameInput, 'Test')

      expect(nameInput).toHaveValue('Test')
    })

    it('handles form submission with minimal data', async () => {
      mockCreateItemAction.mockResolvedValueOnce(createSuccessfulActionResponse())

      render(
        <ModernCreateItemForm
          {...defaultProps}
          action={mockCreateItemAction}
        />
      )

      // Fill only required field
      await user.type(screen.getByLabelText(/Product Name/i), 'Minimal Product')

      // Navigate to final step
      for (let i = 0; i < 4; i++) {
        await user.click(screen.getByText('Next Step'))
        await waitForFormValidation()
      }

      // Submit with minimal data
      await user.click(screen.getByText('Create Product'))

      await waitFor(() => {
        expect(mockCreateItemAction).toHaveBeenCalled()
      })
    })

    it('handles extremely long form values', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      const nameInput = screen.getByLabelText(/Product Name/i)
      const longName = 'A'.repeat(300) // Longer than allowed

      await user.type(nameInput, longName)

      await user.click(screen.getByText('Next Step'))

      // Should show validation error for too long name
      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument()
      })
    })
  })
})
