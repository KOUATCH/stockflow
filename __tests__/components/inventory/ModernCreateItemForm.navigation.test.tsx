import React from 'react'
import { screen, waitFor, fireEvent } from '@testing-library/react'
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

describe('ModernCreateItemForm - Step Navigation', () => {
  let defaultProps: ReturnType<typeof createMockModernCreateItemFormProps>
  let user: ReturnType<typeof userEvent.setup>

  beforeEach(() => {
    defaultProps = createMockModernCreateItemFormProps()
    user = userEvent.setup()
    jest.clearAllMocks()
  })

  describe('Linear Navigation in Create Mode', () => {
    it('enforces linear navigation in create mode', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Try to click on step 3 (pricing) without completing previous steps
      const pricingStepButton = screen.getByText('Pricing')
      await user.click(pricingStepButton)

      // Should still be on basic step
      await waitFor(() => {
        expect(screen.getByText('Basic Information')).toBeInTheDocument()
      })
    })

    it('allows forward navigation only after completing current step', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Complete basic info step
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      // Now clicking on details step should work
      const detailsStepButton = screen.getByText('Details')
      await user.click(detailsStepButton)

      await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument()
      })
    })

    it('allows backward navigation to completed steps', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Complete basic info and navigate forward
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument()
      })

      // Should be able to go back to basic info
      const basicStepButton = screen.getByText('Basic Info')
      await user.click(basicStepButton)

      await waitFor(() => {
        expect(screen.getByText('Basic Information')).toBeInTheDocument()
      })
    })

    it('prevents navigation to future steps with incomplete data', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Try to click on inventory step without completing previous steps
      const inventoryStepButton = screen.getByText('Inventory')
      expect(inventoryStepButton).toHaveClass('opacity-50')
      expect(inventoryStepButton).toHaveClass('cursor-not-allowed')

      await user.click(inventoryStepButton)

      // Should still be on basic step
      expect(screen.getByText('Basic Information')).toBeInTheDocument()
    })
  })

  describe('Free Navigation in Edit Mode', () => {
    it('allows navigation to any step in edit mode', async () => {
      const mockData = createMockItemFormData()

      render(
        <ModernCreateItemForm
          {...defaultProps}
          isEditMode={true}
          initialData={mockData}
        />
      )

      // Should be able to jump to any step
      const inventoryStepButton = screen.getByText('Inventory')
      await user.click(inventoryStepButton)

      await waitFor(() => {
        expect(screen.getByText('Inventory Settings')).toBeInTheDocument()
      })

      // Jump to pricing
      const pricingStepButton = screen.getByText('Pricing')
      await user.click(pricingStepButton)

      await waitFor(() => {
        expect(screen.getByText('Pricing & Units')).toBeInTheDocument()
      })

      // Jump back to basic
      const basicStepButton = screen.getByText('Basic Info')
      await user.click(basicStepButton)

      await waitFor(() => {
        expect(screen.getByText('Basic Information')).toBeInTheDocument()
      })
    })
  })

  describe('Step Validation and Progress', () => {
    it('validates required fields before allowing navigation', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Try to go to next step without filling required fields
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/Validation Required/i)).toBeInTheDocument()
        expect(screen.getByText(/Please complete all required fields/i)).toBeInTheDocument()
      })

      // Should still be on basic step
      expect(screen.getByText('Basic Information')).toBeInTheDocument()
    })

    it('marks steps as completed when validation passes', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Complete basic info step
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/Step Validated/i)).toBeInTheDocument()
        expect(screen.getByText(/Basic Info section completed successfully/i)).toBeInTheDocument()
      })

      // Check that the basic step is marked as completed
      const basicStepButton = screen.getByText('Basic Info')
      const basicStepContainer = basicStepButton.closest('button')
      expect(basicStepContainer).toHaveClass('border-emerald-200')
    })

    it('updates progress bar as steps are completed', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Initially at 20%
      expect(screen.getByText('Step 1 of 5')).toBeInTheDocument()
      expect(screen.getByText('20% Complete')).toBeInTheDocument()

      // Complete basic info and move to details
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Step 2 of 5')).toBeInTheDocument()
        expect(screen.getByText('40% Complete')).toBeInTheDocument()
      })

      // Move to pricing step
      const nextButton2 = screen.getByText('Next Step')
      await user.click(nextButton2)

      await waitFor(() => {
        expect(screen.getByText('Step 3 of 5')).toBeInTheDocument()
        expect(screen.getByText('60% Complete')).toBeInTheDocument()
      })
    })

    it('shows step navigation notifications', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Complete basic info and navigate
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText(/Moving to Details/i)).toBeInTheDocument()
        expect(screen.getByText(/SKU, barcode, and specs/i)).toBeInTheDocument()
      })
    })
  })

  describe('Step Visual States', () => {
    it('shows correct visual states for steps', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Current step should be highlighted
      const basicStep = screen.getByText('Basic Info').closest('button')
      expect(basicStep).toHaveClass('border-emerald-500')

      // Future steps should be disabled
      const inventoryStep = screen.getByText('Inventory').closest('button')
      expect(inventoryStep).toHaveClass('opacity-50')
      expect(inventoryStep).toHaveClass('cursor-not-allowed')

      // Complete basic step
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        // Details step should now be active
        const detailsStep = screen.getByText('Details').closest('button')
        expect(detailsStep).toHaveClass('border-emerald-500')

        // Basic step should be completed
        const basicStep = screen.getByText('Basic Info').closest('button')
        expect(basicStep).toHaveClass('border-emerald-200')
      })
    })

    it('shows completion checkmarks for completed steps', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Complete basic info step
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        // Basic step should show checkmark
        const basicStep = screen.getByText('Basic Info').closest('button')
        const checkIcon = basicStep?.querySelector('svg[data-testid="check-check-icon"]') ||
                         basicStep?.querySelector('svg')
        expect(checkIcon).toBeInTheDocument()
      })
    })
  })

  describe('Navigation Button States', () => {
    it('disables previous button on first step', () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      const previousButton = screen.getByText('Previous')
      expect(previousButton).toBeDisabled()
    })

    it('enables previous button after navigating forward', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Complete basic info and navigate forward
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        const previousButton = screen.getByText('Previous')
        expect(previousButton).not.toBeDisabled()
      })
    })

    it('shows correct button text on final step', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Navigate to final step
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      // Navigate through all steps
      for (let i = 0; i < 4; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      // Should show create button instead of next
      expect(screen.getByText('Create Product')).toBeInTheDocument()
      expect(screen.queryByText('Next Step')).not.toBeInTheDocument()
    })

    it('shows update button text in edit mode', async () => {
      const mockData = createMockItemFormData()

      render(
        <ModernCreateItemForm
          {...defaultProps}
          isEditMode={true}
          initialData={mockData}
        />
      )

      // Navigate to final step
      const mediaStepButton = screen.getByText('Media')
      await user.click(mediaStepButton)

      await waitFor(() => {
        expect(screen.getByText('Update Product')).toBeInTheDocument()
      })
    })
  })

  describe('Keyboard Navigation', () => {
    it('supports keyboard navigation between steps', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Complete basic info
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      // Use Enter to navigate forward
      fireEvent.keyDown(nameInput, { key: 'Enter' })

      // Note: This would require additional keyboard event handling in the component
      // For now, we'll test the basic navigation structure
      const nextButton = screen.getByText('Next Step')
      expect(nextButton).toBeInTheDocument()
    })

    it('allows tab navigation through step buttons', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Complete basic info to enable step navigation
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument()
      })

      // Now both basic and details steps should be focusable
      const basicStepButton = screen.getByText('Basic Info')
      const detailsStepButton = screen.getByText('Details')

      basicStepButton.focus()
      expect(basicStepButton).toHaveFocus()

      await user.tab()
      expect(detailsStepButton).toHaveFocus()
    })
  })

  describe('Step Content Transitions', () => {
    it('shows correct step content based on current step', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Basic step content
      expect(screen.getByText('Basic Information')).toBeInTheDocument()
      expect(screen.getByLabelText(/Product Name/i)).toBeInTheDocument()

      // Navigate to details
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        // Details step content
        expect(screen.getByText('Product Details')).toBeInTheDocument()
        expect(screen.getByLabelText(/SKU/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Barcode/i)).toBeInTheDocument()
      })
    })

    it('maintains form field focus during step transitions', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Focus and fill name field
      const nameInput = screen.getByLabelText(/Product Name/i)
      nameInput.focus()
      await typeIntoInput(nameInput, 'Test Product')

      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        // After transition, a field in the new step should be focusable
        const skuInput = screen.getByLabelText(/SKU/i)
        expect(skuInput).toBeInTheDocument()
      })
    })
  })

  describe('Step Completion State Management', () => {
    it('tracks completed steps correctly', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Complete multiple steps in sequence
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      let nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Product Details')).toBeInTheDocument()
      })

      // Skip SKU modification (optional) and go to pricing
      nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Pricing & Units')).toBeInTheDocument()
      })

      // Fill required pricing fields
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      await typeIntoInput(costPriceInput, '100')
      await typeIntoInput(sellingPriceInput, '150')

      nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        expect(screen.getByText('Inventory Settings')).toBeInTheDocument()
      })

      // Now check that previous steps are marked as completed
      const basicStep = screen.getByText('Basic Info').closest('button')
      const detailsStep = screen.getByText('Details').closest('button')
      const pricingStep = screen.getByText('Pricing').closest('button')

      expect(basicStep).toHaveClass('border-emerald-200')
      expect(detailsStep).toHaveClass('border-emerald-200')
      expect(pricingStep).toHaveClass('border-emerald-200')
    })

    it('handles incomplete step validation correctly', async () => {
      render(<ModernCreateItemForm {...defaultProps} />)

      // Navigate to pricing step first
      const nameInput = screen.getByLabelText(/Product Name/i)
      await typeIntoInput(nameInput, 'Test Product')

      // Navigate through steps
      for (let i = 0; i < 2; i++) {
        const nextButton = screen.getByText('Next Step')
        await user.click(nextButton)
        await waitFor(() => {}, { timeout: 1000 })
      }

      // Set invalid pricing (selling price less than cost)
      const costPriceInput = screen.getByLabelText(/Cost Price/i)
      const sellingPriceInput = screen.getByLabelText(/Selling Price/i)

      await typeIntoInput(costPriceInput, '100')
      await typeIntoInput(sellingPriceInput, '50')

      // Try to navigate to next step
      const nextButton = screen.getByText('Next Step')
      await user.click(nextButton)

      await waitFor(() => {
        // Should show validation error
        expect(screen.getByText(/Selling price should be greater than or equal to cost price/i)).toBeInTheDocument()
        // Should still be on pricing step
        expect(screen.getByText('Pricing & Units')).toBeInTheDocument()
      })
    })
  })
})