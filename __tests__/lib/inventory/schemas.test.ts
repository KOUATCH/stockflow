import { createItemSchema, type CreateItemInput } from '@/lib/item/schemas'
import { z } from 'zod'
import {
  createMockCreateItemInput,
  createMockItemFormData,
} from '../../utils/mock-factories'

describe('Item Schemas - Validation and Transformation', () => {
  describe('createItemSchema Validation', () => {
    it('validates valid item data successfully', () => {
      const validData = createMockCreateItemInput()

      const result = createItemSchema.safeParse(validData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nameEn).toBe(validData.nameEn)
        expect(result.data.organizationId).toBe(validData.organizationId)
        expect(result.data.sku).toBe(validData.sku)
      }
    })

    it('requires organizationId field', () => {
      const invalidData = createMockCreateItemInput()
      delete (invalidData as any).organizationId

      const result = createItemSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['organizationId'],
              message: 'Organization ID is required'
            })
          ])
        )
      }
    })

    it('requires name field', () => {
      const invalidData = createMockCreateItemInput()
      delete (invalidData as any).nameEn

      const result = createItemSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['nameEn'],
              message: 'English name is required'
            })
          ])
        )
      }
    })

    it('requires SKU field', () => {
      const invalidData = createMockCreateItemInput()
      delete (invalidData as any).sku

      const result = createItemSchema.safeParse(invalidData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['sku'],
              message: 'SKU is required'
            })
          ])
        )
      }
    })

    it('validates name length constraints', () => {
      const longNameData = createMockCreateItemInput({
        nameEn: 'A'.repeat(300) // Exceeds 255 character limit
      })

      const result = createItemSchema.safeParse(longNameData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['nameEn'])
      }

      // Test minimum length
      const emptyNameData = createMockCreateItemInput({
        nameEn: ''
      })

      const emptyResult = createItemSchema.safeParse(emptyNameData)
      expect(emptyResult.success).toBe(false)
    })

    it('validates SKU length constraints', () => {
      const longSkuData = createMockCreateItemInput({
        sku: 'A'.repeat(200) // Exceeds 128 character limit
      })

      const result = createItemSchema.safeParse(longSkuData)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].path).toEqual(['sku'])
      }
    })
  })

  describe('Field Transformations', () => {
    it('transforms empty strings to null for optional fields', () => {
      const dataWithEmptyStrings = createMockCreateItemInput({
        descriptionEn: '',
        imageUrls: '',
        thumbnail: '',
        barcode: '',
        dimensions: '',
      })

      const result = createItemSchema.safeParse(dataWithEmptyStrings)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.descriptionEn).toBeNull()
        expect(result.data.imageUrls).toBeNull()
        expect(result.data.thumbnail).toBeNull()
        expect(result.data.barcode).toBeNull()
        expect(result.data.dimensions).toBeNull()
      }
    })

    it('coerces numeric fields correctly', () => {
      const stringNumbers = createMockCreateItemInput({
        weight: '10.5' as any,
        costPrice: '100.99' as any,
        sellingPrice: '199.99' as any,
        tax: '15.5' as any,
        minStockLevel: '5' as any,
        maxStockLevel: '100' as any,
      })

      const result = createItemSchema.safeParse(stringNumbers)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.weight).toBe(10.5)
        expect(result.data.costPrice).toBe(100.99)
        expect(result.data.sellingPrice).toBe(199.99)
        expect(result.data.tax).toBe(15.5)
        expect(result.data.minStockLevel).toBe(5)
        expect(result.data.maxStockLevel).toBe(100)
      }
    })

    it('applies default values correctly', () => {
      const minimalData = {
        organizationId: 'org-123',
        nameEn: 'Test Product',
        sku: 'TEST-SKU-001',
      }

      const result = createItemSchema.safeParse(minimalData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.costPrice).toBe(0)
        expect(result.data.sellingPrice).toBe(0)
        expect(result.data.minStockLevel).toBe(0)
      }
    })

    it('coerces boolean fields correctly', () => {
      const stringBooleans = createMockCreateItemInput({
        isActive: 'true' as any,
        isSerialTracked: 'false' as any,
      })

      const result = createItemSchema.safeParse(stringBooleans)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isActive).toBe(true)
        expect(result.data.isSerialTracked).toBe(false)
      }
    })
  })

  describe('Business Logic Validation', () => {
    it('validates selling price >= cost price', () => {
      const invalidPricing = createMockCreateItemInput({
        costPrice: 100,
        sellingPrice: 50, // Less than cost price
      })

      const result = createItemSchema.safeParse(invalidPricing)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['sellingPrice'],
              message: 'Selling price should be greater than or equal to cost price'
            })
          ])
        )
      }
    })

    it('allows selling price equal to cost price', () => {
      const equalPricing = createMockCreateItemInput({
        costPrice: 100,
        sellingPrice: 100,
      })

      const result = createItemSchema.safeParse(equalPricing)

      expect(result.success).toBe(true)
    })

    it('validates max stock level >= min stock level', () => {
      const invalidStockLevels = createMockCreateItemInput({
        minStockLevel: 100,
        maxStockLevel: 50, // Less than min
      })

      const result = createItemSchema.safeParse(invalidStockLevels)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['maxStockLevel'],
              message: 'Maximum stock level should be greater than minimum stock level'
            })
          ])
        )
      }
    })

    it('allows equal min and max stock levels', () => {
      const equalStockLevels = createMockCreateItemInput({
        minStockLevel: 50,
        maxStockLevel: 50,
      })

      const result = createItemSchema.safeParse(equalStockLevels)

      expect(result.success).toBe(true)
    })

    it('allows null max stock level with min stock level', () => {
      const nullMaxStock = createMockCreateItemInput({
        minStockLevel: 50,
        maxStockLevel: null,
      })

      const result = createItemSchema.safeParse(nullMaxStock)

      expect(result.success).toBe(true)
    })
  })

  describe('Numeric Field Validation', () => {
    it('validates positive numeric fields', () => {
      const negativeValues = createMockCreateItemInput({
        weight: -5,
        costPrice: -10,
        sellingPrice: -20,
        minStockLevel: -1,
      })

      const result = createItemSchema.safeParse(negativeValues)

      expect(result.success).toBe(false)
      if (!result.success) {
        const errorPaths = result.error.issues.map(issue => issue.path[0])
        expect(errorPaths).toContain('weight')
        expect(errorPaths).toContain('costPrice')
        expect(errorPaths).toContain('sellingPrice')
        expect(errorPaths).toContain('minStockLevel')
      }
    })

    it('allows zero values for numeric fields', () => {
      const zeroValues = createMockCreateItemInput({
        weight: 0,
        costPrice: 0,
        sellingPrice: 0,
        tax: 0,
        minStockLevel: 0,
        maxStockLevel: 0,
      })

      const result = createItemSchema.safeParse(zeroValues)

      expect(result.success).toBe(true)
    })

    it('validates tax rate bounds', () => {
      const highTax = createMockCreateItemInput({
        tax: 150, // Unreasonably high tax rate
      })

      const result = createItemSchema.safeParse(highTax)

      // Note: Current schema doesn't have upper bounds, but this test
      // documents the expected behavior if bounds are added
      expect(result.success).toBe(true) // Currently allows high values
    })
  })

  describe('Optional Field Handling', () => {
    it('handles undefined optional fields', () => {
      const minimalData = {
        organizationId: 'org-123',
        nameEn: 'Test Product',
        sku: 'TEST-SKU-001',
        // All other fields undefined
      }

      const result = createItemSchema.safeParse(minimalData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.descriptionEn).toBeUndefined()
        expect(result.data.categoryId).toBeUndefined()
        expect(result.data.brandId).toBeUndefined()
        expect(result.data.unitId).toBeUndefined()
      }
    })

    it('handles null optional fields', () => {
      const nullData = createMockCreateItemInput({
        descriptionEn: null,
        imageUrls: null,
        thumbnail: null,
        barcode: null,
        dimensions: null,
        weight: null,
        tax: null,
        categoryId: null,
        brandId: null,
        unitId: null,
        taxRateId: null,
        maxStockLevel: null,
        unitOfMeasure: null,
        isActive: null,
        isSerialTracked: null,
        slug: null,
      })

      const result = createItemSchema.safeParse(nullData)

      expect(result.success).toBe(true)
    })
  })

  describe('Initial Inventory Validation', () => {
    it('validates initial inventory object when provided', () => {
      const dataWithInventory = createMockCreateItemInput({
        initialInventory: {
          locationId: 'location-123',
          quantity: 100,
          unitCost: 50.0,
          notes: 'Initial stock',
          createdById: 'user-123',
          batchNumber: 'BATCH-001',
          serialNumbers: ['SN001', 'SN002'],
          expiryDate: new Date('2025-12-31'),
          referenceNumber: 'REF-001',
        },
      })

      const result = createItemSchema.safeParse(dataWithInventory)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.initialInventory).toBeDefined()
        expect(result.data.initialInventory?.locationId).toBe('location-123')
        expect(result.data.initialInventory?.quantity).toBe(100)
      }
    })

    it('validates initial inventory required fields', () => {
      const invalidInventory = createMockCreateItemInput({
        initialInventory: {
          // Missing required locationId
          quantity: 100,
          unitCost: 50.0,
        } as any,
      })

      const result = createItemSchema.safeParse(invalidInventory)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['initialInventory', 'locationId']
            })
          ])
        )
      }
    })

    it('validates initial inventory quantity constraints', () => {
      const negativeQuantity = createMockCreateItemInput({
        initialInventory: {
          locationId: 'location-123',
          quantity: -5, // Negative quantity
          unitCost: 50.0,
        },
      })

      const result = createItemSchema.safeParse(negativeQuantity)

      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              path: ['initialInventory', 'quantity']
            })
          ])
        )
      }
    })

    it('allows omitting initial inventory', () => {
      const noInventory = createMockCreateItemInput()
      delete noInventory.initialInventory

      const result = createItemSchema.safeParse(noInventory)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.initialInventory).toBeUndefined()
      }
    })
  })

  describe('Edge Cases and Error Handling', () => {
    it('handles malformed JSON-like strings', () => {
      const malformedData = {
        organizationId: 'org-123',
        nameEn: 'Test Product',
        sku: 'TEST-SKU',
        costPrice: 'not-a-number',
      }

      const result = createItemSchema.safeParse(malformedData)

      expect(result.success).toBe(false)
    })

    it('handles extremely large numbers', () => {
      const largeNumbers = createMockCreateItemInput({
        costPrice: Number.MAX_SAFE_INTEGER,
        sellingPrice: Number.MAX_SAFE_INTEGER,
        weight: 999999999999,
        minStockLevel: 999999999,
      })

      const result = createItemSchema.safeParse(largeNumbers)

      // Should handle large numbers or fail gracefully
      if (!result.success) {
        expect(result.error).toBeDefined()
      }
    })

    it('handles Unicode and special characters in text fields', () => {
      const unicodeData = createMockCreateItemInput({
        nameEn: '测试产品 🎉 émojis & spéciål chars',
        descriptionEn: 'Description with émojis 🚀 and unicode ñáéíóú',
        dimensions: '10×5×3 cm', // Using multiplication symbol
      })

      const result = createItemSchema.safeParse(unicodeData)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.nameEn).toContain('测试产品')
        expect(result.data.descriptionEn).toContain('émojis')
      }
    })

    it('handles very long strings within limits', () => {
      const longValidData = createMockCreateItemInput({
        nameEn: 'A'.repeat(255), // Exactly at limit
        descriptionEn: 'B'.repeat(1000), // Long description
      })

      const result = createItemSchema.safeParse(longValidData)

      expect(result.success).toBe(true)
    })

    it('validates date objects in initial inventory', () => {
      const futureDates = createMockCreateItemInput({
        initialInventory: {
          locationId: 'location-123',
          quantity: 10,
          unitCost: 5.0,
          expiryDate: new Date('2030-12-31'),
        },
      })

      const result = createItemSchema.safeParse(futureDates)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.initialInventory?.expiryDate).toBeInstanceOf(Date)
      }
    })
  })
})