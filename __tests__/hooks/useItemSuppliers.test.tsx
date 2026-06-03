import React from 'react'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  useAddItemSuppliers,
  useCreateItemSupplier,
  useItemSuppliers,
  useItemSuppliersByItemId,
  useItemWithSuppliers,
  usePreferredSupplier,
  useSuppliersByItem,
  useUpdateItemSupplier,
} from '@/hooks/useItemSuppliers'
import addItemSuppliers from '@/actions/item-suppliers/addItemSuppliers'
import getItemWithSuppliersById from '@/actions/item-suppliers/getItemWithSuppliers'
import { updateItemSupplier } from '@/actions/item-suppliers/updateItemSupplier'

jest.mock('@/actions/item-suppliers/addItemSuppliers', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('@/actions/item-suppliers/getItemWithSuppliers', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('@/actions/item-suppliers/updateItemSupplier', () => ({
  updateItemSupplier: jest.fn(),
}))

const mockAddItemSuppliers = addItemSuppliers as jest.MockedFunction<typeof addItemSuppliers>
const mockGetItemWithSuppliersById = getItemWithSuppliersById as jest.MockedFunction<
  typeof getItemWithSuppliersById
>
const mockUpdateItemSupplier = updateItemSupplier as jest.MockedFunction<typeof updateItemSupplier>

const mockItemSuppliers = [
  {
    id: 'item-supplier-1',
    itemId: 'item-123',
    supplierId: 'supplier-1',
    name: 'Coffee Beans',
    slug: 'coffee-beans',
    isPreferred: true,
    supplierSku: 'COF-001',
    leadTime: 3,
    minOrderQty: 10,
    unitCost: 12.5,
    notes: 'Primary supplier',
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-02T00:00:00.000Z'),
    costPrice: 10,
    sellingPrice: 18,
    imageUrls: '',
    thumbnail: null,
    organizationId: 'org-123',
    sku: 'ITEM-001',
    supplierItems: {} as any,
    supplier: {
      id: 'supplier-1',
      name: 'Preferred Supplier',
      email: 'preferred@example.com',
    },
  },
  {
    id: 'item-supplier-2',
    itemId: 'item-123',
    supplierId: 'supplier-2',
    name: 'Coffee Beans',
    slug: 'coffee-beans',
    isPreferred: false,
    supplierSku: 'COF-002',
    leadTime: 7,
    minOrderQty: 5,
    unitCost: 13.75,
    notes: 'Backup supplier',
    createdAt: new Date('2026-01-03T00:00:00.000Z'),
    updatedAt: new Date('2026-01-04T00:00:00.000Z'),
    costPrice: 10,
    sellingPrice: 18,
    imageUrls: '',
    thumbnail: null,
    organizationId: 'org-123',
    sku: 'ITEM-001',
    supplierItems: {} as any,
    supplier: {
      id: 'supplier-2',
      name: 'Backup Supplier',
      email: 'backup@example.com',
    },
  },
]

describe('useItemSuppliers hooks', () => {
  let queryClient: QueryClient
  let wrapper: React.ComponentType<{ children: React.ReactNode }>

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          retryDelay: 0,
        },
        mutations: {
          retry: false,
        },
      },
    })

    wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    jest.clearAllMocks()
  })

  describe('query hooks', () => {
    it('fetches item suppliers for an item', async () => {
      mockGetItemWithSuppliersById.mockResolvedValueOnce({
        success: true,
        data: mockItemSuppliers,
        error: null,
      })

      const { result } = renderHook(() => useItemSuppliers('item-123'), { wrapper })

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true)
      })

      expect(result.current.data).toEqual(mockItemSuppliers)
      expect(mockGetItemWithSuppliersById).toHaveBeenCalledWith('item-123')
    })

    it('uses the item supplier query key', async () => {
      mockGetItemWithSuppliersById.mockResolvedValueOnce({
        success: true,
        data: mockItemSuppliers,
        error: null,
      })

      renderHook(() => useItemSuppliers('item-123'), { wrapper })

      await waitFor(() => {
        expect(mockGetItemWithSuppliersById).toHaveBeenCalledWith('item-123')
      })

      expect(
        queryClient.getQueryCache().find({
          queryKey: ['itemSuppliers', 'item-123'],
        })
      ).toBeDefined()
    })

    it('does not fetch without an item id', () => {
      renderHook(() => useItemSuppliers(''), { wrapper })

      expect(mockGetItemWithSuppliersById).not.toHaveBeenCalled()
    })

    it('throws the server action error when fetching fails', async () => {
      mockGetItemWithSuppliersById.mockResolvedValue({
        success: false,
        data: [],
        error: 'Item not found',
      })

      const { result } = renderHook(() => useItemSuppliers('missing-item'), { wrapper })

      await waitFor(() => {
        expect(result.current.isError).toBe(true)
      })

      expect(result.current.error).toEqual(new Error('Item not found'))
    })

    it('deduplicates simultaneous item supplier requests', async () => {
      mockGetItemWithSuppliersById.mockResolvedValue({
        success: true,
        data: mockItemSuppliers,
        error: null,
      })

      const { result: first } = renderHook(() => useItemSuppliers('item-123'), { wrapper })
      const { result: second } = renderHook(() => useItemSuppliers('item-123'), { wrapper })

      await waitFor(() => {
        expect(first.current.isSuccess).toBe(true)
        expect(second.current.isSuccess).toBe(true)
      })

      expect(mockGetItemWithSuppliersById).toHaveBeenCalledTimes(1)
      expect(first.current.data).toEqual(mockItemSuppliers)
      expect(second.current.data).toEqual(mockItemSuppliers)
    })

    it('keeps the alias query hooks on the same item supplier surface', async () => {
      mockGetItemWithSuppliersById.mockResolvedValue({
        success: true,
        data: mockItemSuppliers,
        error: null,
      })

      const hooks = [
        () => useItemWithSuppliers('item-123'),
        () => useItemSuppliersByItemId('item-123'),
        () => useSuppliersByItem('item-123'),
      ]

      for (const hook of hooks) {
        const { result } = renderHook(hook, { wrapper })

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true)
        })

        expect(result.current.data).toEqual(mockItemSuppliers)
      }
    })

    it('returns the preferred supplier relationship', async () => {
      mockGetItemWithSuppliersById.mockResolvedValueOnce({
        success: true,
        data: mockItemSuppliers,
        error: null,
      })

      const { result } = renderHook(() => usePreferredSupplier('item-123'), { wrapper })

      await waitFor(() => {
        expect(result.current.data?.id).toBe('item-supplier-1')
      })

      expect(result.current.data?.isPreferred).toBe(true)
    })
  })

  describe('mutation hooks', () => {
    it('adds multiple suppliers to an item', async () => {
      const response = { success: true }
      mockAddItemSuppliers.mockResolvedValueOnce(response)

      const { result } = renderHook(() => useAddItemSuppliers(), { wrapper })

      await expect(
        result.current.mutateAsync({
          itemId: 'item-123',
          supplierIds: ['supplier-1', 'supplier-2'],
        })
      ).resolves.toEqual(response)

      expect(mockAddItemSuppliers).toHaveBeenCalledWith('item-123', ['supplier-1', 'supplier-2'])
    })

    it('throws when adding suppliers fails', async () => {
      mockAddItemSuppliers.mockResolvedValueOnce({
        success: false,
      })

      const { result } = renderHook(() => useAddItemSuppliers(), { wrapper })

      await expect(
        result.current.mutateAsync({
          itemId: 'item-123',
          supplierIds: ['supplier-1'],
        })
      ).rejects.toThrow('Failed to add suppliers to item')
    })

    it('invalidates item supplier queries after adding suppliers', async () => {
      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries')
      mockAddItemSuppliers.mockResolvedValueOnce({ success: true })

      const { result } = renderHook(() => useAddItemSuppliers(), { wrapper })

      await result.current.mutateAsync({
        itemId: 'item-123',
        supplierIds: ['supplier-1'],
      })

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['itemSuppliers', 'item-123'] })
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['item', 'item-123'] })
    })

    it('creates a single item-supplier relationship through addItemSuppliers', async () => {
      const response = { success: true }
      mockAddItemSuppliers.mockResolvedValueOnce(response)

      const { result } = renderHook(() => useCreateItemSupplier(), { wrapper })

      await expect(
        result.current.mutateAsync({
          itemId: 'item-123',
          supplierId: 'supplier-1',
          isPreferred: true,
        })
      ).resolves.toEqual(response)

      expect(mockAddItemSuppliers).toHaveBeenCalledWith('item-123', ['supplier-1'])
    })

    it('throws when creating a single item-supplier relationship fails', async () => {
      mockAddItemSuppliers.mockResolvedValueOnce({
        success: false,
      })

      const { result } = renderHook(() => useCreateItemSupplier(), { wrapper })

      await expect(
        result.current.mutateAsync({
          itemId: 'item-123',
          supplierId: 'supplier-1',
        })
      ).rejects.toThrow('Failed to create item supplier relationship')
    })

    it('updates an item supplier relationship', async () => {
      const updateData = {
        id: 'item-supplier-1',
        itemId: 'item-123',
        supplierId: 'supplier-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        isPreferred: false,
        supplierSku: 'UPDATED-SKU',
      }
      const updatedItemSupplier = {
        ...mockItemSuppliers[0],
        isPreferred: false,
        supplierSku: 'UPDATED-SKU',
      }
      mockUpdateItemSupplier.mockResolvedValueOnce({
        success: true,
        data: updatedItemSupplier,
        error: null,
      })

      const { result } = renderHook(() => useUpdateItemSupplier(), { wrapper })

      await expect(result.current.mutateAsync(updateData)).resolves.toEqual(updatedItemSupplier)
      expect(mockUpdateItemSupplier).toHaveBeenCalledWith(updateData)
    })

    it('throws the server action error when an item supplier update fails', async () => {
      mockUpdateItemSupplier.mockResolvedValueOnce({
        success: false,
        error: 'ItemSupplier relationship not found',
      })

      const { result } = renderHook(() => useUpdateItemSupplier(), { wrapper })

      await expect(
        result.current.mutateAsync({
          id: 'missing-link',
          itemId: 'item-123',
          supplierId: 'supplier-1',
          createdAt: new Date('2026-01-01T00:00:00.000Z'),
          updatedAt: new Date('2026-01-02T00:00:00.000Z'),
        })
      ).rejects.toThrow('ItemSupplier relationship not found')
    })

    it('invalidates item supplier queries after updating a relationship', async () => {
      const invalidateQueriesSpy = jest.spyOn(queryClient, 'invalidateQueries')
      mockUpdateItemSupplier.mockResolvedValueOnce({
        success: true,
        data: mockItemSuppliers[0],
        error: null,
      })

      const { result } = renderHook(() => useUpdateItemSupplier(), { wrapper })

      await result.current.mutateAsync({
        id: 'item-supplier-1',
        itemId: 'item-123',
        supplierId: 'supplier-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        updatedAt: new Date('2026-01-02T00:00:00.000Z'),
      })

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['itemSuppliers', 'item-123'] })
      expect(invalidateQueriesSpy).toHaveBeenCalledWith({ queryKey: ['item', 'item-123'] })
    })
  })
})
