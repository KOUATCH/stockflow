import React from 'react'
import { screen, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModernCreateItemForm } from '@/components/inventory/ModernCreateItemForm'
import { render } from '../../utils/test-utils'
import {
  createMockModernCreateItemFormProps,
  createMockItemFormData,
} from '../../utils/mock-factories'
import { typeIntoInput, waitForFormValidation } from '../../utils/test-helpers'

// Mock the generateSimpleSKU function
jest.mock('@/lib/generateSKU', () => ({
  generateSimpleSKU: jest.fn(() => 'TEST-SKU-123'),
}))

describe('ModernCreateItemForm - Form Data Persistence', () => {
  let defaultProps: ReturnType<typeof createMockModernCreateItemFormProps>
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    defaultProps = createMockModernCreateItemFormProps()
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Step Navigation Persistence', () => {
    it('preserves form data when navigating between steps', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Step 1: Fill basic info
      const nameInput = screen.getByLabelText(/Product Name/i)
      const descriptionInput = screen.getByLabelText(/Product Description/i)

      await typeIntoInput(nameInput, 'Test Product Name')
      await typeIntoInput(descriptionInput, 'Test product description')

      // Navigate to next step
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument()
      })

      // Step 2: Fill details
      const skuInput = screen.getByLabelText(/SKU/i)
      const barcodeInput = screen.getByLabelText(/Barcode/i)

      await user.clear(skuInput)
      await typeIntoInput(skuInput, 'CUSTOM-SKU-001')
      await typeIntoInput(barcodeInput, '1234567890123')

      // Navigate to next step
      const nextButton2 = screen.getByText('Next Step')
      await user.click(nextButton2)

      await waitFor(() => {
        expect(screen.getByText('Pricing & Units')).toBeInTheDocument()
      })

      // Step 3: Fill pricing
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      await typeIntoInput(costPriceInput, '100')
      await typeIntoInput(sellingPriceInput, '150')

      // Navigate back to first step
      const basicStepButton = screen.getByText('Basic Info')
      await user.click(basicStepButton)

      await waitFor(() => {
        expect(screen.getByText('Basic Information')).toBeInTheDocument()
      })

      // Verify data is preserved
      expect(screen.getByDisplayValue('Test Product Name')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Test product description')).toBeInTheDocument()

      // Navigate to details step and verify
      const detailsStepButton = screen.getByText('Details')
      await user.click(detailsStepButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue('CUSTOM-SKU-001')).toBeInTheDocument()
        expect(screen.getByDisplayValue('1234567890123')).toBeInTheDocument()
      })

      // Navigate to pricing step and verify
      const pricingStepButton = screen.getByText('Pricing')
      await user.click(pricingStepButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue('100')).toBeInTheDocument()
        expect(screen.getByDisplayValue('150')).toBeInTheDocument()
      })
    })

    it('preserves dropdown selections when navigating between steps', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Navigate to details step
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument()
      })

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

      // Navigate to pricing step
      const nextButton2 = screen.getByText('Next Step')
      await user.click(nextButton2)

      await waitFor(() => {
        expect(screen.getByText('Pricing & Units')).toBeInTheDocument()
      })

      // Select unit and tax rate
      const unitSelect = screen.getByRole('combobox', { name: /unit of measure/i })
      await user.click(unitSelect)

      const unitOption = await screen.findByRole('option', { name: new RegExp(defaultProps.units[0].nameEn) })
      await user.click(unitOption)

      const taxRateSelect = screen.getByRole('combobox', { name: /tax rate/i })
      await user.click(taxRateSelect)

      const taxRateOption = await screen.findByRole('option', { name: new RegExp(defaultProps.taxRate[0].nameEn) })
      await user.click(taxRateOption)

      // Navigate back to details step and verify selections
      const detailsStepButton = screen.getByText('Details')
      await user.click(detailsStepButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue(defaultProps.categories[0].id)).toBeInTheDocument()
        expect(screen.getByDisplayValue(defaultProps.brands[0].id)).toBeInTheDocument()
      })

      // Navigate back to pricing and verify selections
      const pricingStepButton = screen.getByText('Pricing')
      await user.click(pricingStepButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue(defaultProps.units[0].id)).toBeInTheDocument()
        expect(screen.getByDisplayValue(defaultProps.taxRate[0].id)).toBeInTheDocument()
      })
    })

    it('preserves switch states when navigating between steps', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Navigate to inventory step
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      // Navigate through steps to inventory
      for (let i = 0; i < 3; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      await waitFor(() => {
        expect(screen.getByText('Inventory Settings')).toBeInTheDocument()
      })

      // Toggle switches
      const activeSwitch = screen.getByRole('switch', { name: /Active Product/i })
      const serialSwitch = screen.getByRole('switch', { name: /Serial Number Tracking/i })

      await user.click(activeSwitch) // Turn off (default is on)
      await user.click(serialSwitch) // Turn on (default is off)

      // Navigate back to basic step
      const basicStepButton = screen.getByText('Basic Info')
      await user.click(basicStepButton)

      await waitFor(() => {
        expect(screen.getByText('Basic Information')).toBeInTheDocument()
      })

      // Navigate back to inventory step and verify switch states
      const inventoryStepButton = screen.getByText('Inventory')
      await user.click(inventoryStepButton)

      await waitFor(() => {
        const activeSwitch = screen.getByRole('switch', { name: /Active Product/i })
        const serialSwitch = screen.getByRole('switch', { name: /Serial Number Tracking/i })

        expect(activeSwitch).not.toBeChecked()
        expect(serialSwitch).toBeChecked()
      })
    })
  })

  describe('Hidden Field Preservation', () => {
    it('maintains hidden field values during step changes', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      render(<ModernCreateItemForm {...defaultProps} />)

      // Navigate to pricing step and set values
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      // Navigate to pricing step
      for (let i = 0; i < 2; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      await waitFor(() => {
        expect(screen.getByText('Pricing & Units')).toBeInTheDocument()
      })

      // Set pricing values
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      await typeIntoInput(costPriceInput, '100')
      await typeIntoInput(sellingPriceInput, '150')

      // Select unit and tax rate
      const unitSelect = screen.getByRole('combobox', { name: /unit of measure/i })
      await user.click(unitSelect)

      const unitOption = await screen.findByRole('option', { name: new RegExp(defaultProps.units[0].nameEn) })
      await user.click(unitOption)

      const taxRateSelect = screen.getByRole('combobox', { name: /tax rate/i })
      await user.click(taxRateSelect)

      const taxRateOption = await screen.findByRole('option', { name: new RegExp(defaultProps.taxRate[0].nameEn) })
      await user.click(taxRateOption)

      // Navigate to next step
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      // Wait for the surgical fix to apply
      await waitFor(() => {}, { timeout: 100 })

      // Check console logs to see if values were restored
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringMatching(/Values right before changing to/),
        expect.objectContaining({
          unitId: defaultProps.units[0].id,
          taxRateId: defaultProps.taxRate[0].id,
          costPrice: 100,
          sellingPrice: 150
        })
      )

      consoleSpy.mockRestore()
    })

    it('handles form field restoration after step navigation', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      render(<ModernCreateItemForm {...defaultProps} />)

      // Fill form across multiple steps
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton1 = screen.getByText('Next Step')
      await user.click(nextButton1)

      await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument()
      })

      // Fill barcode
      const barcodeInput = screen.getByLabelText(/Barcode/i)
      await typeIntoInput(barcodeInput, '1234567890123')

      const nextButton2 = screen.getByText('Next Step')
      await user.click(nextButton2)

      // Wait for restoration process
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 100))
      })

      // Check that restoration logic was triggered
      const logCalls = consoleSpy.mock.calls
      const hasRestorationLogs = logCalls.some(call =>
        call[0] && typeof call[0] === 'string' && call[0].includes('Values right after changing to')
      )

      expect(hasRestorationLogs).toBe(true)

      consoleSpy.mockRestore()
    })
  })

  describe('Edit Mode Data Persistence', () => {
    it('preserves initial data when navigating in edit mode', async () => {
      const mockData = createMockItemFormData({
        nameEn: 'Existing Product',
        sku: 'EXISTING-SKU',
        descriptionEn: 'Existing description',
        costPrice: 50,
        sellingPrice: 75,
        barcode: '9876543210987',
        minStockLevel: 5,
        maxStockLevel: 50,
        isActive: false,
        isSerialTracked: true,
      })

      render(
        <ModernCreateItemForm
          {...defaultProps}
          isEditMode={true}
          initialData={mockData}
        />
      )

      // Verify basic info is pre-filled
      expect(screen.getByDisplayValue('Existing Product')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Existing description')).toBeInTheDocument()

      // Navigate to details step
      const detailsStepButton = screen.getByText('Details')
      await user.click(detailsStepButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue('EXISTING-SKU')).toBeInTheDocument()
        expect(screen.getByDisplayValue('9876543210987')).toBeInTheDocument()
      })

      // Navigate to pricing step
      const pricingStepButton = screen.getByText('Pricing')
      await user.click(pricingStepButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue('50')).toBeInTheDocument()
        expect(screen.getByDisplayValue('75')).toBeInTheDocument()
      })

      // Navigate to inventory step
      const inventoryStepButton = screen.getByText('Inventory')
      await user.click(inventoryStepButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue('5')).toBeInTheDocument()
        expect(screen.getByDisplayValue('50')).toBeInTheDocument()

        const activeSwitch = screen.getByRole('switch', { name: /Active Product/i })
        const serialSwitch = screen.getByRole('switch', { name: /Serial Number Tracking/i })

        expect(activeSwitch).not.toBeChecked()
        expect(serialSwitch).toBeChecked()
      })
    })

    it('allows modifying data in edit mode and preserves changes', async () => {
      const mockData = createMockItemFormData({
        nameEn: 'Original Product',
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

      // Modify basic info
      const nameInput = screen.getByDisplayValue('Original Product')
      await user.clear(nameInput)
      await typeIntoInput(nameInput, 'Modified Product')

      // Navigate to pricing and modify
      const pricingStepButton = screen.getByText('Pricing')
      await user.click(pricingStepButton)

      const costPriceInput = screen.getByDisplayValue('100')
      await user.clear(costPriceInput)
      await typeIntoInput(costPriceInput, '120')

      // Navigate back to basic and verify changes
      const basicStepButton = screen.getByText('Basic Info')
      await user.click(basicStepButton)

      await waitFor(() => {
        expect(screen.getByDisplayValue('Modified Product')).toBeInTheDocument()
      })

      // Navigate back to pricing and verify changes
      const pricingStepButton2 = screen.getByText('Pricing')
      await user.click(pricingStepButton2)

      await waitFor(() => {
        expect(screen.getByDisplayValue('120')).toBeInTheDocument()
      })
    })
  })

  describe('Form Validation State Persistence', () => {
    it('preserves validation errors when navigating between steps', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Try to navigate without filling required fields
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument()
      })

      // Navigate to another step and come back
      const detailsStepButton = screen.getByText('Details')
      await user.click(detailsStepButton)

      const basicStepButton = screen.getByText('Basic Info')
      await user.click(basicStepButton)

      // Validation error should still be visible
      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument()
      })
    })

    it('clears validation errors when fields are corrected', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Try to navigate without filling required fields
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/Name is required/i)).toBeInTheDocument()
      })

      // Fill the required field
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Valid Product Name')

      // Error should be cleared
      await waitFor(() => {
        expect(screen.queryByText(/Name is required/i)).not.toBeInTheDocument()
      })
    })
  })

  describe('Live Preview Data Persistence', () => {
    it('maintains live preview data across step navigation', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Fill name to update preview
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Preview Test Product')

      // Verify preview is updated
      await waitFor(() => {
        expect(screen.getByText('Preview Test Product')).toBeInTheDocument()
      })

      // Navigate to pricing step
      for (let i = 0; i < 2; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      // Set pricing values
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      await typeIntoInput(costPriceInput, '100')
      await typeIntoInput(sellingPriceInput, '150')

      // Verify live preview shows pricing data
      await waitFor(() => {
        expect(screen.getByText('$100.00')).toBeInTheDocument()
        expect(screen.getByText('$150.00')).toBeInTheDocument()
        expect(screen.getByText('33.3%')).toBeInTheDocument() // Profit margin
      })

      // Navigate back to basic step
      const basicStepButton = screen.getByText('Basic Info')
      await user.click(basicStepButton)

      // Preview should still show all data
      await waitFor(() => {
        expect(screen.getByText('Preview Test Product')).toBeInTheDocument()
        expect(screen.getByText('$100.00')).toBeInTheDocument()
        expect(screen.getByText('$150.00')).toBeInTheDocument()
      })
    })
  })
})
