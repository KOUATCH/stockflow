import { z } from 'zod'
import {
  createItemSchema,
  basicInfoSchema,
  detailsSchema,
  pricingSchema,
  relationsSchema,
  stockSchema,
  trackingSchema,
  listItemsSchema,
  getItemSchema,
  updateBasicInfoSchema,
  updateDetailsSchema,
  updatePricingSchema,
  updateRelationsSchema,
  updateStockSchema,
  updateTrackingSchema,
  deleteItemSchema,
  slugify,
  type CreateItemInput,
  type ActionResult,
} from '@/lib/item/schemas'
import { createMockCreateItemInput } from '../../utils/mock-factories'

describe('Item Schemas', () => {
  describe('createItemSchema', () => {
    describe('Valid Data', () => {
      it('validates a complete item object', () => {
        const validItem = createMockCreateItemInput()

        const result = createItemSchema.safeParse(validItem)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data).toMatchObject(validItem)
        }
      })

      it('validates minimal required fields', () => {
        const minimalItem = {
          organizationId: 'org-123',
          nameEn: 'Test Product',
          sku: 'TEST-SKU-001',
        }

        const result = createItemSchema.safeParse(minimalItem)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.costPrice).toBe(0) // Default value
          expect(result.data.sellingPrice).toBe(0) // Default value
          expect(result.data.minStockLevel).toBe(0) // Default value
        }
      })

      it('applies default values correctly', () => {
        const itemWithDefaults = {
          organizationId: 'org-123',
          nameEn: 'Test Product',
          sku: 'TEST-SKU-001',
        }

        const result = createItemSchema.safeParse(itemWithDefaults)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.costPrice).toBe(0)
          expect(result.data.sellingPrice).toBe(0)
          expect(result.data.minStockLevel).toBe(0)
        }
      })

      it('handles optional fields as null', () => {
        const itemWithNulls = {
          organizationId: 'org-123',
          nameEn: 'Test Product',
          sku: 'TEST-SKU-001',
          descriptionEn: null,
          imageUrls: null,
          thumbnail: null,
          barcode: null,
          dimensions: null,
          weight: null,
          categoryId: null,
          brandId: null,
          unitId: null,
          taxRateId: null,
          maxStockLevel: null,
          unitOfMeasure: null,
          isActive: null,
          isSerialTracked: null,
          slug: null,
        }

        const result = createItemSchema.safeParse(itemWithNulls)

        expect(result.success).toBe(true)
      })

      it('coerces string numbers to actual numbers', () => {
        const itemWithStringNumbers = {
          organizationId: 'org-123',
          nameEn: 'Test Product',
          sku: 'TEST-SKU-001',
          costPrice: '100.50',
          sellingPrice: '150.75',
          weight: '2.5',
          minStockLevel: '10',
          maxStockLevel: '100',
          tax: '15.0',
        }

        const result = createItemSchema.safeParse(itemWithStringNumbers)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.costPrice).toBe(100.50)
          expect(result.data.sellingPrice).toBe(150.75)
          expect(result.data.weight).toBe(2.5)
          expect(result.data.minStockLevel).toBe(10)
          expect(result.data.maxStockLevel).toBe(100)
          expect(result.data.tax).toBe(15.0)
        }
      })

      it('coerces string booleans to actual booleans', () => {
        const itemWithStringBooleans = {
          organizationId: 'org-123',
          nameEn: 'Test Product',
          sku: 'TEST-SKU-001',
          isActive: 'true',
          isSerialTracked: 'false',
        }

        const result = createItemSchema.safeParse(itemWithStringBooleans)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.isActive).toBe(true)
          expect(result.data.isSerialTracked).toBe(false)
        }
      })

      it('validates initial inventory object', () => {
        const itemWithInventory = {
          organizationId: 'org-123',
          nameEn: 'Test Product',
          sku: 'TEST-SKU-001',
          initialInventory: {
            locationId: 'location-123',
            quantity: 100,
            unitCost: 50.0,
            notes: 'Initial stock',
            createdById: 'user-123',
            batchNumber: 'BATCH-001',
            serialNumbers: ['SN001', 'SN002'],
            expiryDate: new Date('2024-12-31'),
            referenceNumber: 'REF-001',
          },
        }

        const result = createItemSchema.safeParse(itemWithInventory)

        expect(result.success).toBe(true)
        if (result.success) {
          expect(result.data.initialInventory).toBeDefined()
          expect(result.data.initialInventory!.locationId).toBe('location-123')
          expect(result.data.initialInventory!.quantity).toBe(100)
        }
      })
    })

    describe('Invalid Data', () => {
      it('rejects missing required fields', () => {
        const invalidItem = {
          descriptionEn: 'Test description',
        }

        const result = createItemSchema.safeParse(invalidItem)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                path: ['organizationId'],
                message: 'Organization ID is required',
              }),
              expect.objectContaining({
                path: ['nameEn'],
                message: 'English name is required',
              }),
              expect.objectContaining({
                path: ['sku'],
                message: 'SKU is required',
              }),
            ])
          )
        }
      })

      it('rejects empty required strings', () => {
        const invalidItem = {
          organizationId: '',
          nameEn: '',
          sku: '',
        }

        const result = createItemSchema.safeParse(invalidItem)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                path: ['organizationId'],
                message: 'Organization ID is required',
              }),
              expect.objectContaining({
                path: ['nameEn'],
                message: 'English name is required',
              }),
              expect.objectContaining({
                path: ['sku'],
                message: 'SKU is required',
              }),
            ])
          )
        }
      })

      it('rejects negative numeric values', () => {
        const invalidItem = {
          organizationId: 'org-123',
          nameEn: 'Test Product',
          sku: 'TEST-SKU-001',
          costPrice: -10,
          sellingPrice: -20,
          weight: -5,
          minStockLevel: -1,
          maxStockLevel: -1,
          tax: -5,
        }

        const result = createItemSchema.safeParse(invalidItem)

        expect(result.success).toBe(false)
        if (!result.success) {
          expect(result.error.issues.length).toBeGreaterThan(0)
        }
      })

      it('rejects strings that are too long', () => {
        const invalidItem = {
          organizationId: 'org-123',
          nameEn: 'A'.repeat(256), // Too long
          sku: 'B'.repeat(129), // Too long
        }

        const result = createItemSchema.safeParse(invalidItem)

        expect(result.success).toBe(false)
      })

      it('rejects invalid initial inventory', () => {
        const invalidItem = {
          organizationId: 'org-123',
          nameEn: 'Test Product',
          sku: 'TEST-SKU-001',
          initialInventory: {
            locationId: '', // Invalid empty string
            quantity: -1, // Invalid negative
            unitCost: -10, // Invalid negative
          },
        }

        const result = createItemSchema.safeParse(invalidItem)

        expect(result.success).toBe(false)
      })

      it('rejects invalid quantity in initial inventory', () => {
        const invalidItem = {
          organizationId: 'org-123',
          nameEn: 'Test Product',
          sku: 'TEST-SKU-001',
          initialInventory: {
            locationId: 'location-123',
            quantity: 1.5, // Should be integer
          },
        }

        const result = createItemSchema.safeParse(invalidItem)

        expect(result.success).toBe(false)
      })
    })
  })

  describe('basicInfoSchema', () => {
    it('validates basic information fields', () => {
      const basicInfo = {
        nameEn: 'Test Product',
        descriptionEn: 'Test description',
        imageUrls: 'https://example.com/image.jpg',
        thumbnail: 'https://example.com/thumb.jpg',
      }

      const result = basicInfoSchema.safeParse(basicInfo)

      expect(result.success).toBe(true)
    })

    it('rejects empty name', () => {
      const basicInfo = {
        nameEn: '',
      }

      const result = basicInfoSchema.safeParse(basicInfo)

      expect(result.success).toBe(false)
    })

    it('allows optional fields to be null', () => {
      const basicInfo = {
        nameEn: 'Test Product',
        descriptionEn: null,
        imageUrls: null,
        thumbnail: null,
      }

      const result = basicInfoSchema.safeParse(basicInfo)

      expect(result.success).toBe(true)
    })
  })

  describe('detailsSchema', () => {
    it('validates details fields', () => {
      const details = {
        sku: 'TEST-SKU-001',
        barcode: '1234567890123',
        dimensions: '10 x 5 x 3 cm',
        weight: 2.5,
        upc: '123456789012',
        ean: '1234567890123',
        mpn: 'MPN-123',
        isbn: '978-0123456789',
      }

      const result = detailsSchema.safeParse(details)

      expect(result.success).toBe(true)
    })

    it('rejects empty SKU', () => {
      const details = {
        sku: '',
      }

      const result = detailsSchema.safeParse(details)

      expect(result.success).toBe(false)
    })

    it('coerces string weight to number', () => {
      const details = {
        sku: 'TEST-SKU-001',
        weight: '2.5',
      }

      const result = detailsSchema.safeParse(details)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.weight).toBe(2.5)
      }
    })
  })

  describe('pricingSchema', () => {
    it('validates pricing fields', () => {
      const pricing = {
        costPrice: 100.50,
        sellingPrice: 150.75,
        tax: 15.0,
      }

      const result = pricingSchema.safeParse(pricing)

      expect(result.success).toBe(true)
    })

    it('rejects negative prices', () => {
      const pricing = {
        costPrice: -10,
        sellingPrice: -20,
      }

      const result = pricingSchema.safeParse(pricing)

      expect(result.success).toBe(false)
    })

    it('coerces string prices to numbers', () => {
      const pricing = {
        costPrice: '100.50',
        sellingPrice: '150.75',
      }

      const result = pricingSchema.safeParse(pricing)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.costPrice).toBe(100.50)
        expect(result.data.sellingPrice).toBe(150.75)
      }
    })
  })

  describe('relationsSchema', () => {
    it('validates relation fields', () => {
      const relations = {
        categoryId: 'category-123',
        brandId: 'brand-123',
        unitId: 'unit-123',
        taxRateId: 'tax-rate-123',
      }

      const result = relationsSchema.safeParse(relations)

      expect(result.success).toBe(true)
    })

    it('allows null values for optional relations', () => {
      const relations = {
        categoryId: null,
        brandId: null,
        unitId: null,
        taxRateId: null,
      }

      const result = relationsSchema.safeParse(relations)

      expect(result.success).toBe(true)
    })
  })

  describe('stockSchema', () => {
    it('validates stock fields', () => {
      const stock = {
        minStockLevel: 10,
        maxStockLevel: 100,
        unitOfMeasure: 'pieces',
      }

      const result = stockSchema.safeParse(stock)

      expect(result.success).toBe(true)
    })

    it('rejects negative stock levels', () => {
      const stock = {
        minStockLevel: -1,
        maxStockLevel: -10,
      }

      const result = stockSchema.safeParse(stock)

      expect(result.success).toBe(false)
    })

    it('coerces string numbers to actual numbers', () => {
      const stock = {
        minStockLevel: '10',
        maxStockLevel: '100',
      }

      const result = stockSchema.safeParse(stock)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.minStockLevel).toBe(10)
        expect(result.data.maxStockLevel).toBe(100)
      }
    })
  })

  describe('trackingSchema', () => {
    it('validates tracking fields', () => {
      const tracking = {
        isActive: true,
        isSerialTracked: false,
        slug: 'test-product-slug',
      }

      const result = trackingSchema.safeParse(tracking)

      expect(result.success).toBe(true)
    })

    it('coerces string booleans to actual booleans', () => {
      const tracking = {
        isActive: 'true',
        isSerialTracked: 'false',
      }

      const result = trackingSchema.safeParse(tracking)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.isActive).toBe(true)
        expect(result.data.isSerialTracked).toBe(false)
      }
    })
  })

  describe('listItemsSchema', () => {
    it('validates list items query parameters', () => {
      const query = {
        organizationId: 'org-123',
        q: 'search term',
        page: 2,
        pageSize: 50,
        sortBy: 'nameEn' as const,
        sortOrder: 'asc' as const,
        categoryId: 'category-123',
        brandId: 'brand-123',
        unitId: 'unit-123',
        taxRateId: 'tax-rate-123',
        isActive: true,
      }

      const result = listItemsSchema.safeParse(query)

      expect(result.success).toBe(true)
    })

    it('applies default values for query parameters', () => {
      const minimalQuery = {
        organizationId: 'org-123',
      }

      const result = listItemsSchema.safeParse(minimalQuery)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.page).toBe(1)
        expect(result.data.pageSize).toBe(20)
        expect(result.data.sortBy).toBe('createdAt')
        expect(result.data.sortOrder).toBe('desc')
      }
    })

    it('rejects invalid sort fields', () => {
      const query = {
        organizationId: 'org-123',
        sortBy: 'invalidField',
      }

      const result = listItemsSchema.safeParse(query)

      expect(result.success).toBe(false)
    })

    it('rejects invalid page size', () => {
      const query = {
        organizationId: 'org-123',
        pageSize: 300, // Too large
      }

      const result = listItemsSchema.safeParse(query)

      expect(result.success).toBe(false)
    })
  })

  describe('getItemSchema', () => {
    it('validates get item parameters', () => {
      const params = {
        id: 'item-123',
        organizationId: 'org-123',
      }

      const result = getItemSchema.safeParse(params)

      expect(result.success).toBe(true)
    })

    it('rejects empty ID', () => {
      const params = {
        id: '',
        organizationId: 'org-123',
      }

      const result = getItemSchema.safeParse(params)

      expect(result.success).toBe(false)
    })
  })

  describe('Update Schemas', () => {
    describe('updateBasicInfoSchema', () => {
      it('validates update basic info with partial data', () => {
        const update = {
          id: 'item-123',
          organizationId: 'org-123',
          nameEn: 'Updated Name',
        }

        const result = updateBasicInfoSchema.safeParse(update)

        expect(result.success).toBe(true)
      })
    })

    describe('updateDetailsSchema', () => {
      it('validates update details with partial data', () => {
        const update = {
          id: 'item-123',
          organizationId: 'org-123',
          sku: 'UPDATED-SKU',
        }

        const result = updateDetailsSchema.safeParse(update)

        expect(result.success).toBe(true)
      })
    })

    describe('updatePricingSchema', () => {
      it('validates update pricing with partial data', () => {
        const update = {
          id: 'item-123',
          organizationId: 'org-123',
          costPrice: 120.00,
        }

        const result = updatePricingSchema.safeParse(update)

        expect(result.success).toBe(true)
      })
    })

    describe('updateStockSchema', () => {
      it('validates update stock with inventory adjustment', () => {
        const update = {
          id: 'item-123',
          organizationId: 'org-123',
          minStockLevel: 5,
          adjustInventory: {
            locationId: 'location-123',
            deltaQty: 50,
            unitCost: 25.0,
            notes: 'Stock adjustment',
          },
        }

        const result = updateStockSchema.safeParse(update)

        expect(result.success).toBe(true)
      })
    })
  })

  describe('deleteItemSchema', () => {
    it('validates delete item parameters', () => {
      const params = {
        id: 'item-123',
        organizationId: 'org-123',
      }

      const result = deleteItemSchema.safeParse(params)

      expect(result.success).toBe(true)
    })
  })

  describe('slugify utility', () => {
    it('converts string to URL-friendly slug', () => {
      expect(slugify('Hello World')).toBe('hello-world')
      expect(slugify('Test Product Name')).toBe('test-product-name')
      expect(slugify('Special Characters!@#$%')).toBe('special-characters')
    })

    it('handles empty strings', () => {
      expect(slugify('')).toBe('')
      expect(slugify('   ')).toBe('')
    })

    it('handles special characters', () => {
      expect(slugify('Product (New) & Improved!')).toBe('product-new-improved')
      expect(slugify('SKU_123-ABC')).toBe('sku-123-abc')
    })

    it('limits length to 120 characters', () => {
      const longString = 'A'.repeat(150)
      const result = slugify(longString)
      expect(result.length).toBeLessThanOrEqual(120)
    })

    it('removes leading and trailing hyphens', () => {
      expect(slugify('---test---')).toBe('test')
      expect(slugify('!!!product!!!')).toBe('product')
    })
  })

  describe('TypeScript Types', () => {
    it('has correct CreateItemInput type', () => {
      const item: CreateItemInput = {
        organizationId: 'org-123',
        nameEn: 'Test Product',
        sku: 'TEST-SKU',
        costPrice: 100,
        sellingPrice: 150,
        minStockLevel: 10,
      }

      expect(item).toBeDefined()
    })

    it('has correct ActionResult type', () => {
      const successResult: ActionResult<string> = {
        success: true,
        data: 'test data',
        message: 'Success',
      }

      const failureResult: ActionResult<string> = {
        success: false,
        error: 'Error message',
      }

      expect(successResult.success).toBe(true)
      expect(failureResult.success).toBe(false)
    })
  })
})