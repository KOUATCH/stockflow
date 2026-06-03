import React from 'react'
import { screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModernCreateItemForm } from '@/components/inventory/ModernCreateItemForm'
import { render } from '../../utils/test-utils'
import {
  createMockModernCreateItemFormProps,
  createMockItemFormData,
  createSuccessfulActionResponse,
  createFailedActionResponse,
} from '../../utils/mock-factories'
import { typeIntoInput, waitForFormValidation, submitForm } from '../../utils/test-helpers'

// Mock the generateSimpleSKU function
jest.mock('@/lib/generateSKU', () => ({
  generateSimpleSKU: jest.fn(() => 'TEST-SKU-123'),
}))

describe('ModernCreateItemForm', () => {
  let defaultProps: ReturnType<typeof createMockModernCreateItemFormProps>
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    defaultProps = createMockModernCreateItemFormProps()
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('renders the form with all required steps', () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Check if all steps are rendered
      expect(screen.getByText('Basic Info')).toBeInTheDocument()
      expect(screen.getByText('Details')).toBeInTheDocument()
      expect(screen.getByText('Pricing')).toBeInTheDocument()
      expect(screen.getByText('Inventory')).toBeInTheDocument()
      expect(screen.getByText('Media')).toBeInTheDocument()
    })

    it('renders the correct header for create mode', () => {
      render(<ModernCreateItemForm {...defaultProps} />)
      expect(screen.getByText('Create New Product')).toBeInTheDocument()
    })

    it('renders the correct header for edit mode', () => {
      const mockData = createMockItemFormData()
      render(
        <ModernCreateItemForm
          {...defaultProps}
          isEditMode={true}
          initialData={mockData}
        />
      )
      expect(screen.getByText('Edit Product')).toBeInTheDocument()
    })

    it('renders progress indicator', () => {
      render(<ModernCreateItemForm {...defaultProps} />)
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
      expect(screen.getByText('20% Complete')).toBeInTheDocument()
    })

    it('renders live preview panel', () => {
      render(<ModernCreateItemForm {...defaultProps} />)
      expect(screen.getByText('Live Preview')).toBeInTheDocument()
      expect(screen.getByText('New Product')).toBeInTheDocument()
    })
  })

  describe('Basic Information Step', () => {
    it('displays basic information fields', () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Product Description/i)).toBeInTheDocument()
    })

    it('validates required product name', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument()
      })
    })

    it('auto-generates SKU when product name is entered', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      await waitFor(() => {
        // Check that the auto-generated SKU notification appears
        expect(screen.getByText(/SKU automatically created/i)).toBeInTheDocument()
      })
    })

    it('allows proceeding to next step with valid name', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument()
      })
    })

    it('updates live preview with product name', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Amazing Product')

      await waitFor(() => {
        expect(screen.getByText('Amazing Product')).toBeInTheDocument()
      })
    })
  })

  describe('Details Step', () => {
    beforeEach(async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Navigate to details step
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument()
      })
    })

    it('displays detail fields', () => {
      expect(screen.getByLabelText(/SKU/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Barcode/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Category/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Brand/i)).toBeInTheDocument()
    })

    it('allows manual SKU entry', async () => {
      const skuInput = screen.getByLabelText(/SKU/i)
      await user.clear(skuInput)
      await typeIntoInput(skuInput, 'CUSTOM-SKU-001')

      expect(skuInput).toHaveValue('CUSTOM-SKU-001')
    })

    it('generates new SKU when generate button is clicked', async () => {
      const generateButton = screen.getByText(/Generate New SKU/i)
      await user.click(generateButton)

      await waitFor(() => {
        expect(screen.getByText(/SKU created/i)).toBeInTheDocument()
      })
    })

    it('allows category selection', async () => {
      const categorySelect = screen.getByRole('combobox', { name: /category/i })
      await user.click(categorySelect)

      const option = await screen.findByRole('option', { name: defaultProps.categories[0].titleEn })
      await user.click(option)

      expect(categorySelect).toHaveValue(defaultProps.categories[0].id)
    })

    it('allows brand selection', async () => {
      const brandSelect = screen.getByRole('combobox', { name: /brand/i })
      await user.click(brandSelect)

      const option = await screen.findByRole('option', { name: defaultProps.brands[0].brandName })
      await user.click(option)

      expect(brandSelect).toHaveValue(defaultProps.brands[0].id)
    })
  })

  describe('Pricing Step', () => {
    beforeEach(async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Navigate to pricing step
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      let nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument()
      })

      nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Pricing & Units')).toBeInTheDocument()
      })
    })

    it('displays pricing fields', () => {
      expect(screen.getByLabelText(/Cost Price/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Selling Price/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Unit of Measure/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Tax Rate/i)).toBeInTheDocument()
    })

    it('calculates profit margin correctly', async () => {
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      await typeIntoInput(costPriceInput, '100')
      await typeIntoInput(sellingPriceInput, '150')

      await waitFor(() => {
        expect(screen.getByText('33.3%')).toBeInTheDocument() // Profit margin
        expect(screen.getByText('$50.00 profit per unit')).toBeInTheDocument()
      })
    })

    it('shows warning for low profit margin', async () => {
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      await typeIntoInput(costPriceInput, '100')
      await typeIntoInput(sellingPriceInput, '105')

      await waitFor(() => {
        expect(screen.getByText(/Low Profit Margin/i)).toBeInTheDocument()
      })
    })

    it('shows warning when selling below cost', async () => {
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      await typeIntoInput(costPriceInput, '100')
      await typeIntoInput(sellingPriceInput, '90')

      await waitFor(() => {
        expect(screen.getByText(/Selling Below Cost/i)).toBeInTheDocument()
      })
    })

    it('allows unit selection', async () => {
      const unitSelect = screen.getByRole('combobox', { name: /unit of measure/i })
      await user.click(unitSelect)

      const option = await screen.findByRole('option', { name: new RegExp(defaultProps.units[0].nameEn) })
      await user.click(option)

      expect(unitSelect).toHaveValue(defaultProps.units[0].id)
    })

    it('allows tax rate selection', async () => {
      const taxRateSelect = screen.getByRole('combobox', { name: /tax rate/i })
      await user.click(taxRateSelect)

      const option = await screen.findByRole('option', { name: new RegExp(defaultProps.taxRate[0].nameEn) })
      await user.click(option)

      expect(taxRateSelect).toHaveValue(defaultProps.taxRate[0].id)
    })
  })

  describe('Inventory Step', () => {
    beforeEach(async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Navigate to inventory step
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      // Navigate through steps
      for (let i = 0; i < 3; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      await waitFor(() => {
        expect(screen.getByText('Inventory Settings')).toBeInTheDocument()
      })
    })

    it('displays inventory fields', () => {
      expect(screen.getByLabelText(/Minimum Stock Level/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Maximum Stock Level/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Weight/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Dimensions/i)).toBeInTheDocument()
    })

    it('displays tracking switches', () => {
      expect(screen.getByLabelText(/Active Product/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/Serial Number Tracking/i)).toBeInTheDocument()
    })

    it('allows setting stock levels', async () => {
      const minStockInput = screen.getByLabelText(/Minimum Stock Level/i)
      const maxStockInput = screen.getByLabelText(/Maximum Stock Level/i)

      await typeIntoInput(minStockInput, '10')
      await typeIntoInput(maxStockInput, '100')

      expect(minStockInput).toHaveValue('10')
      expect(maxStockInput).toHaveValue('100')
    })

    it('allows setting weight and dimensions', async () => {
      const weightInput = screen.getByLabelText(/Weight/i)
      const dimensionsInput = screen.getByLabelText(/Dimensions/i)

      await typeIntoInput(weightInput, '2.5')
      await typeIntoInput(dimensionsInput, '10 x 5 x 3 cm')

      expect(weightInput).toHaveValue('2.5')
      expect(dimensionsInput).toHaveValue('10 x 5 x 3 cm')
    })

    it('allows toggling active status', async () => {
      const activeSwitch = screen.getByRole('switch', { name: /Active Product/i })

      expect(activeSwitch).toBeChecked()

      await user.click(activeSwitch)
      expect(activeSwitch).not.toBeChecked()
    })

    it('allows toggling serial tracking', async () => {
      const serialSwitch = screen.getByRole('switch', { name: /Serial Number Tracking/i })

      expect(serialSwitch).not.toBeChecked()

      await user.click(serialSwitch)
      expect(serialSwitch).toBeChecked()
    })
  })

  describe('Media Step', () => {
    beforeEach(async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Navigate to media step
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      // Navigate through all steps
      for (let i = 0; i < 4; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      await waitFor(() => {
        expect(screen.getByText('Product Media')).toBeInTheDocument()
      })
    })

    it('displays media upload section', () => {
      expect(screen.getByText('Upload Product Image')).toBeInTheDocument()
      expect(screen.getByText('Image Tips for Better Sales')).toBeInTheDocument()
    })

    it('shows create product button on final step', () => {
      expect(screen.getByText('Create Product')).toBeInTheDocument()
    })

    it('shows update product button on final step in edit mode', () => {
      const mockData = createMockItemFormData()
      render(
        <ModernCreateItemForm
          {...defaultProps}
          isEditMode={true}
          initialData={mockData}
        />
      )

      expect(screen.getByText('Update Product')).toBeInTheDocument()
    })
  })

  describe('Form Navigation', () => {
    beforeEach(() => {
      render(<ModernCreateItemForm {...defaultProps} />)
    })

    it('allows clicking on completed steps to navigate', async () => {
      // Complete first step
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      // Should be on details step now
      await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument()
      })

      // Click back to basic step
      const basicStepButton = screen.getByText('Basic Info')
      await user.click(basicStepButton)

      await waitFor(() => {
        expect(screen.getByText('Basic Information')).toBeInTheDocument()
      })
    })

    it('shows previous button when not on first step', async () => {
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Previous')).toBeInTheDocument()
      })
    })

    it('allows going back to previous step', async () => {
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      let nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument()
      })

      const previousButton = screen.getByText('Previous')
      await user.click(previousButton)

      await waitFor(() => {
        expect(screen.getByText('Basic Information')).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('calls onSubmit with form data when using callback approach', async () => {
      const mockOnSubmit = jest.fn().mockResolvedValue(undefined)

      render(
        <ModernCreateItemForm
          {...defaultProps}
          onSubmit={mockOnSubmit}
          action={undefined}
        />
      )

      // Fill form
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      // Navigate to final step and submit
      for (let i = 0; i < 4; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      const submitButton = screen.getByText('Create Product')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            nameEn: 'Test Product',
          })
        )
      })
    })

    it('calls server action when using server action approach', async () => {
      const mockAction = jest.fn().mockResolvedValue(createSuccessfulActionResponse())

      render(
        <ModernCreateItemForm
          {...defaultProps}
          action={mockAction}
          onSubmit={undefined}
        />
      )

      // Fill form
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      // Navigate to final step and submit
      for (let i = 0; i < 4; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      const submitButton = screen.getByText('Create Product')
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockAction).toHaveBeenCalledWith(expect.any(FormData))
      })
    })

    it('shows loading state during submission', async () => {
      const mockAction = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(createSuccessfulActionResponse()), 1000))
      )

      render(
        <ModernCreateItemForm
          {...defaultProps}
          action={mockAction}
        />
      )

      // Fill and submit form
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      // Navigate to final step
      for (let i = 0; i < 4; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      const submitButton = screen.getByText('Create Product')
      await user.click(submitButton)

      expect(screen.getByText('Creating Product...')).toBeInTheDocument()
    })

    it('handles submission errors gracefully', async () => {
      const mockAction = jest.fn().mockResolvedValue(createFailedActionResponse('SKU already exists'))

      render(
        <ModernCreateItemForm
          {...defaultProps}
          action={mockAction}
        />
      )

      // Fill and submit form
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      // Navigate to final step
      for (let i = 0; i < 4; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      const submitButton = screen.getByText('Create Product')
      await user.click(submitButton)

      await waitFor(() => {
        expect(screen.getByText(/Creation Failed/i)).toBeInTheDocument()
      })
    })
  })

  describe('Edit Mode', () => {
    it('pre-fills form with initial data in edit mode', () => {
      const mockData = createMockItemFormData({
        nameEn: 'Existing Product',
        sku: 'EXISTING-SKU',
        costPrice: 100,
        sellingPrice: 150,
      })

      render(
        <ModernCreateItemForm
          {...defaultProps}
          isEditMode={true}
          initialData={mockData}
        />
      )

      expect(screen.getByDisplayValue('Existing Product')).toBeInTheDocument()
      expect(screen.getByDisplayValue('EXISTING-SKU')).toBeInTheDocument()
    })

    it('allows free navigation between steps in edit mode', async () => {
      const mockData = createMockItemFormData()

      render(
        <ModernCreateItemForm
          {...defaultProps}
          isEditMode={true}
          initialData={mockData}
        />
      )

      // Should be able to jump to any step
      const pricingStepButton = screen.getByText('Pricing')
      await user.click(pricingStepButton)

      await waitFor(() => {
        expect(screen.getByText('Pricing & Units')).toBeInTheDocument()
      })
    })
  })

  describe('Validation', () => {
    it('validates selling price is not less than cost price', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Navigate to pricing step
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      for (let i = 0; i < 2; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      // Set cost price higher than selling price
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      await typeIntoInput(costPriceInput, '100')
      await typeIntoInput(sellingPriceInput, '50')

      // Try to proceed to next step
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/Selling price should be greater than or equal to cost price/i)).toBeInTheDocument()
      })
    })

    it('validates max stock level is greater than min stock level', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Navigate to inventory step
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      for (let i = 0; i < 3; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      // Set min stock higher than max stock
      const minStockInput = screen.getByLabelText(/Minimum Stock Level/i)
      const maxStockInput = screen.getByLabelText(/Maximum Stock Level/i)

      await typeIntoInput(minStockInput, '100')
      await typeIntoInput(maxStockInput, '50')

      // Try to proceed to next step
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/Maximum stock level should be greater than minimum stock level/i)).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility', () => {
    it('has proper form labels and descriptions', () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument()
      expect(screen.getByText(/This will be the main name customers see/i)).toBeInTheDocument()
    })

    it('has proper ARIA attributes for form validation', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        const nameInput = screen.getByLabelText(/Product Name/i)
        expect(nameInput).toHaveAttribute('aria-invalid', 'true')
      })
    })

    it('has keyboard navigation support', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      const nameInput = screen.getByLabelText(/Product Name/i)
      nameInput.focus()

      expect(nameInput).toHaveFocus()

      // Tab to description field
      await user.tab()
      const descriptionInput = screen.getByLabelText(/Product Description/i)
      expect(descriptionInput).toHaveFocus()
    })
  })
})
