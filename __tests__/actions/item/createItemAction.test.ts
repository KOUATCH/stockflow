import { createItemAction } from '@/actions/item/createItemAction'
import { db } from '@/prisma/db'
import { Prisma } from '@prisma/client'
import {
  createMockCreateItemInput,
  createMockItemWithRelations,
  createSuccessfulActionResponse,
  createFailedActionResponse,
} from '../../utils/mock-factories'

// Mock dependencies
jest.mock('@/prisma/db')
jest.mock('@/lib/generateSKU')
jest.mock('@/lib/generateSlug')
jest.mock('@/lib/inventory/update-inventory-levels')
jest.mock('@/lib/item/revalidation')

const mockDb = db as jest.Mocked<typeof db>
const mockItemFindFirst = mockDb.item.findFirst as jest.Mock
const mockTransaction = mockDb.$transaction as jest.Mock

describe('createItemAction', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Successful Item Creation', () => {
    it('creates an item successfully with valid data', async () => {
      const mockInput = createMockCreateItemInput()
      const mockCreatedItem = createMockItemWithRelations()

      // Mock database queries
      mockItemFindFirst
        .mockResolvedValueOnce(null) // No existing SKU
        .mockResolvedValueOnce(null) // No existing name

      mockTransaction.mockResolvedValueOnce(mockCreatedItem)

      const result = await createItemAction(mockInput)

      expect(result).toEqual({
        success: true,
        data: mockCreatedItem,
        message: 'Item created successfully',
      })

      expect(mockItemFindFirst).toHaveBeenCalledTimes(2)
      expect(mockTransaction).toHaveBeenCalledTimes(1)
    })

    it('auto-generates SKU when not provided', async () => {
      const mockInput = createMockCreateItemInput({ sku: '' })
      const mockCreatedItem = createMockItemWithRelations()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      mockTransaction.mockResolvedValueOnce(mockCreatedItem)

      const result = await createItemAction(mockInput)

      expect(result.success).toBe(true)
      expect(mockTransaction).toHaveBeenCalled()
    })

    it('handles optional fields correctly', async () => {
      const mockInput = createMockCreateItemInput({
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
      })
      const mockCreatedItem = createMockItemWithRelations()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      mockTransaction.mockResolvedValueOnce(mockCreatedItem)

      const result = await createItemAction(mockInput)

      expect(result.success).toBe(true)
    })

    it('creates item with initial inventory when provided', async () => {
      const mockInput = createMockCreateItemInput({
        initialInventory: {
          locationId: 'location-123',
          quantity: 100,
          unitCost: 50.0,
          notes: 'Initial stock',
          createdById: 'user-123',
        },
      })
      const mockCreatedItem = createMockItemWithRelations()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      mockTransaction.mockResolvedValueOnce(mockCreatedItem)

      const result = await createItemAction(mockInput)

      expect(result.success).toBe(true)
    })

    it('handles default values correctly', async () => {
      const mockInput = createMockCreateItemInput({
        costPrice: undefined,
        sellingPrice: undefined,
        minStockLevel: undefined,
        isActive: undefined,
      })
      const mockCreatedItem = createMockItemWithRelations()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      mockTransaction.mockResolvedValueOnce(mockCreatedItem)

      const result = await createItemAction(mockInput)

      expect(result.success).toBe(true)
    })
  })

  describe('Validation Errors', () => {
    it('returns error for invalid input schema', async () => {
      const invalidInput = {
        organizationId: '', // Invalid empty string
        nameEn: '', // Invalid empty string
        sku: '', // Invalid empty string
      }

      const result = await createItemAction(invalidInput)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('returns error for missing required fields', async () => {
      const invalidInput = {
        // Missing organizationId, name, sku
        descriptionEn: 'Test description',
      }

      const result = await createItemAction(invalidInput)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })

    it('returns error for invalid data types', async () => {
      const invalidInput = {
        organizationId: 'valid-org-id',
        nameEn: 'Valid Name',
        sku: 'VALID-SKU',
        costPrice: 'invalid-number', // Should be number
        sellingPrice: 'invalid-number', // Should be number
      }

      const result = await createItemAction(invalidInput)

      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })

  describe('Duplicate Detection', () => {
    it('returns error when SKU already exists', async () => {
      const mockInput = createMockCreateItemInput()

      mockItemFindFirst
        .mockResolvedValueOnce({ id: 'existing-item-id' }) // Existing SKU found
        .mockResolvedValueOnce(null) // No existing name

      const result = await createItemAction(mockInput)

      expect(result).toEqual({
        success: false,
        error: 'SKU already exists in this organization',
      })

      expect(mockTransaction).not.toHaveBeenCalled()
    })

    it('returns error when product name already exists', async () => {
      const mockInput = createMockCreateItemInput()

      mockItemFindFirst
        .mockResolvedValueOnce(null) // No existing SKU
        .mockResolvedValueOnce({ id: 'existing-item-id' }) // Existing name found

      const result = await createItemAction(mockInput)

      expect(result).toEqual({
        success: false,
        error: 'Product name already exists in this organization',
      })

      expect(mockTransaction).not.toHaveBeenCalled()
    })
  })

  describe('Database Errors', () => {
    it('handles Prisma unique constraint violation for name', async () => {
      const mockInput = createMockCreateItemInput()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint violation',
        {
          code: 'P2002',
          meta: { target: ['nameEn'] },
          clientVersion: '5.0.0',
        }
      )

      mockTransaction.mockRejectedValueOnce(prismaError)

      const result = await createItemAction(mockInput)

      expect(result).toEqual({
        success: false,
        error: 'Product name already exists in this organization',
      })
    })

    it('handles Prisma unique constraint violation for SKU', async () => {
      const mockInput = createMockCreateItemInput()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint violation',
        {
          code: 'P2002',
          meta: { target: ['sku'] },
          clientVersion: '5.0.0',
        }
      )

      mockTransaction.mockRejectedValueOnce(prismaError)

      const result = await createItemAction(mockInput)

      expect(result).toEqual({
        success: false,
        error: 'SKU already exists in this organization',
      })
    })

    it('handles Prisma unique constraint violation for slug', async () => {
      const mockInput = createMockCreateItemInput()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Unique constraint violation',
        {
          code: 'P2002',
          meta: { target: ['slug'] },
          clientVersion: '5.0.0',
        }
      )

      mockTransaction.mockRejectedValueOnce(prismaError)

      const result = await createItemAction(mockInput)

      expect(result).toEqual({
        success: false,
        error: 'Product slug already exists. Please try a different name',
      })
    })

    it('handles generic Prisma known request errors', async () => {
      const mockInput = createMockCreateItemInput()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      const prismaError = new Prisma.PrismaClientKnownRequestError(
        'Some database error',
        {
          code: 'P2003',
          clientVersion: '5.0.0',
        }
      )

      mockTransaction.mockRejectedValueOnce(prismaError)

      const result = await createItemAction(mockInput)

      expect(result).toEqual({
        success: false,
        error: 'Database error: P2003',
      })
    })

    it('handles generic errors', async () => {
      const mockInput = createMockCreateItemInput()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      const genericError = new Error('Something went wrong')

      mockTransaction.mockRejectedValueOnce(genericError)

      const result = await createItemAction(mockInput)

      expect(result).toEqual({
        success: false,
        error: 'Something went wrong',
      })
    })

    it('handles unknown errors', async () => {
      const mockInput = createMockCreateItemInput()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      mockTransaction.mockRejectedValueOnce('String error')

      const result = await createItemAction(mockInput)

      expect(result).toEqual({
        success: false,
        error: 'Failed to create item',
      })
    })
  })

  describe('Transaction Handling', () => {
    it('properly uses database transaction', async () => {
      const mockInput = createMockCreateItemInput()
      const mockCreatedItem = createMockItemWithRelations()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      mockTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          item: {
            create: jest.fn().mockResolvedValue(mockCreatedItem),
          },
        }
        return callback(mockTx as any)
      })

      const result = await createItemAction(mockInput)

      expect(result.success).toBe(true)
      expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function))
    })

    it('handles transaction callback execution', async () => {
      const mockInput = createMockCreateItemInput()
      const mockCreatedItem = createMockItemWithRelations()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      const mockItemCreate = jest.fn().mockResolvedValue(mockCreatedItem)

      mockTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          item: {
            create: mockItemCreate,
          },
        }
        return callback(mockTx as any)
      })

      const result = await createItemAction(mockInput)

      expect(result.success).toBe(true)
      expect(mockItemCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          organizationId: mockInput.organizationId,
          nameEn: mockInput.nameEn,
          sku: mockInput.sku,
        }),
        include: expect.any(Object),
      })
    })
  })

  describe('Data Processing', () => {
    it('processes imageUrls correctly', async () => {
      const mockInput = createMockCreateItemInput({
        imageUrls: 'https://example.com/image.jpg',
        thumbnail: 'https://example.com/thumb.jpg',
      })
      const mockCreatedItem = createMockItemWithRelations()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      const mockItemCreate = jest.fn().mockResolvedValue(mockCreatedItem)

      mockTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          item: {
            create: mockItemCreate,
          },
        }
        return callback(mockTx as any)
      })

      await createItemAction(mockInput)

      expect(mockItemCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          imageUrls: 'https://example.com/image.jpg',
          thumbnail: 'https://example.com/thumb.jpg',
        }),
        include: expect.any(Object),
      })
    })

    it('processes null values correctly', async () => {
      const mockInput = createMockCreateItemInput({
        descriptionEn: null,
        imageUrls: null,
        thumbnail: null,
        barcode: null,
        dimensions: null,
        weight: null,
      })
      const mockCreatedItem = createMockItemWithRelations()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      const mockItemCreate = jest.fn().mockResolvedValue(mockCreatedItem)

      mockTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          item: {
            create: mockItemCreate,
          },
        }
        return callback(mockTx as any)
      })

      await createItemAction(mockInput)

      expect(mockItemCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          descriptionEn: null,
          imageUrls: '',
          thumbnail: null,
          barcode: null,
          dimensions: null,
          weight: 0,
        }),
        include: expect.any(Object),
      })
    })

    it('processes pricing data correctly', async () => {
      const mockInput = createMockCreateItemInput({
        costPrice: 100.50,
        sellingPrice: 150.75,
        tax: 15.0,
      })
      const mockCreatedItem = createMockItemWithRelations()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      const mockItemCreate = jest.fn().mockResolvedValue(mockCreatedItem)

      mockTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          item: {
            create: mockItemCreate,
          },
        }
        return callback(mockTx as any)
      })

      await createItemAction(mockInput)

      expect(mockItemCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          costPrice: 100.50,
          sellingPrice: 150.75,
        }),
        include: expect.any(Object),
      })
    })

    it('processes stock levels correctly', async () => {
      const mockInput = createMockCreateItemInput({
        minStockLevel: 10,
        maxStockLevel: 100,
      })
      const mockCreatedItem = createMockItemWithRelations()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      const mockItemCreate = jest.fn().mockResolvedValue(mockCreatedItem)

      mockTransaction.mockImplementation(async (callback) => {
        const mockTx = {
          item: {
            create: mockItemCreate,
          },
        }
        return callback(mockTx as any)
      })

      await createItemAction(mockInput)

      expect(mockItemCreate).toHaveBeenCalledWith({
        data: expect.objectContaining({
          minStockLevel: 10,
          maxStockLevel: 100,
        }),
        include: expect.any(Object),
      })
    })
  })

  describe('Console Logging', () => {
    beforeEach(() => {
      jest.spyOn(console, 'log').mockImplementation(() => {})
      jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    afterEach(() => {
      jest.restoreAllMocks()
    })

    it('logs input data for debugging', async () => {
      const mockInput = createMockCreateItemInput()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      const result = await createItemAction(mockInput)

      expect(console.log).toHaveBeenCalledWith(
        'Server action received input:',
        expect.objectContaining({
          input: mockInput,
        })
      )
    })

    it('logs errors when they occur', async () => {
      const mockInput = createMockCreateItemInput()

      mockItemFindFirst
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null)

      const error = new Error('Test error')
      mockTransaction.mockRejectedValueOnce(error)

      await createItemAction(mockInput)

      expect(console.error).toHaveBeenCalledWith('createItemAction error:', error)
    })
  })
})
