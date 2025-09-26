"use server"

import { db } from "@/prisma/db"
import type { ItemSupplierUpdateData, UpdateItemSupplierDTO, UpdateItemSupplierResponse } from "@/types/itemSuppliers"
import { revalidatePath } from "next/cache"

export const updateItemSupplier = async (data: UpdateItemSupplierDTO): Promise<UpdateItemSupplierResponse> => {
  try {
    // Validate required fields
    if (!data.itemId || !data.supplierId) {
      return {
        success: false,
        error: "Item ID and Supplier ID are required",
      }
    }

    // Prepare update data - only include fields that can be updated
    // Exclude id, itemId, and supplierId as they're used for identification
    const updateData: ItemSupplierUpdateData = {
      isPreferred: data.isPreferred,
      supplierSku: data.supplierSku,
      leadTime: data.leadTime ?? null, // Convert undefined to null for Prisma
      minOrderQty: data.minOrderQty ?? null, // Convert undefined to null for Prisma
      unitCost: data.unitCost ?? null, // Convert undefined to null for Prisma
      lastPurchaseDate: data.lastPurchaseDate ?? null, // Convert undefined to null for Prisma
      notes: data.notes,
    }

    // Execute both operations in a transaction
    const result = await db.$transaction(async (tx) => {
      // If setting this supplier as preferred, first set all other suppliers to not preferred
      if (updateData.isPreferred) {
        await tx.itemSupplier.updateMany({
          where: {
            itemId: data.itemId,
            supplierId: {
              not: data.supplierId, // Exclude the current supplier
            },
          },
          data: {
            isPreferred: false, // Set all other suppliers to not preferred
          },
        })
      }

      // Update the specific item supplier using the composite key
      const updatedItemSupplier = await tx.itemSupplier.update({
        where: {
          itemId_supplierId: {
            itemId: data.itemId,
            supplierId: data.supplierId,
          },
        },
        data: updateData,
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          item: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return updatedItemSupplier
    })

    // Revalidate the cache for the suppliers page (only after successful transaction)
    revalidatePath(`/dashboard/inventory/items/${data.itemId}/suppliers`)
    // Also revalidate the main item page if it shows supplier info
    revalidatePath(`/dashboard/inventory/items/${data.itemId}`)

    return {
      success: true,
      data: result,
      error: null,
    }
  } catch (error) {
    console.error("Failed to update ItemSupplier:", error)

    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        return {
          success: false,
          error: "Item Supplier not found. It may have been deleted.",
        }
      }

      if (error.message.includes("Unique constraint")) {
        return {
          success: false,
          error: "A supplier relationship with these details already exists.",
        }
      }

      // Handle transaction-specific errors
      if (error.message.includes("Transaction")) {
        return {
          success: false,
          error: "Failed to update supplier due to a data conflict. Please try again.",
        }
      }
    }

    return {
      success: false,
      error: "Failed to update supplier relationship. Please try again.",
    }
  }
}

// Alternative function with transaction support for ID-based updates
export const updateItemSupplierById = async (
  id: string,
  data: Partial<ItemSupplierUpdateData>,
): Promise<UpdateItemSupplierResponse> => {
  try {
    if (!id) {
      return {
        success: false,
        error: "Record ID is required",
      }
    }

    // Execute in a transaction
    const result = await db.$transaction(async (tx) => {
      // First, get the current supplier to check if we need to handle preferred status
      const currentSupplier = await tx.itemSupplier.findUnique({
        where: { id },
        select: { itemId: true, supplierId: true, isPreferred: true },
      })

      if (!currentSupplier) {
        throw new Error("Record to update not found")
      }

      // If setting this supplier as preferred, first set all other suppliers to not preferred
      if (data.isPreferred === true) {
        await tx.itemSupplier.updateMany({
          where: {
            itemId: currentSupplier.itemId,
            supplierId: {
              not: currentSupplier.supplierId,
            },
          },
          data: {
            isPreferred: false,
          },
        })
      }

      // Update the specific supplier
      const updatedItemSupplier = await tx.itemSupplier.update({
        where: { id },
        data: {
          ...data,
          // Ensure undefined values are converted to null for Prisma
          leadTime: data.leadTime ?? null,
          minOrderQty: data.minOrderQty ?? null,
          unitCost: data.unitCost ?? null,
          lastPurchaseDate: data.lastPurchaseDate ?? null,
        },
        include: {
          supplier: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          item: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      })

      return updatedItemSupplier
    })

    // Revalidate paths only after successful transaction
    revalidatePath(`/dashboard/inventory/items/${result.itemId}/suppliers`)
    revalidatePath(`/dashboard/inventory/items/${result.itemId}`)

    return {
      success: true,
      data: result,
      error: null,
    }
  } catch (error) {
    console.error("Failed to update ItemSupplier by ID:", error)

    if (error instanceof Error) {
      if (error.message.includes("Record to update not found")) {
        return {
          success: false,
          error: "Supplier relationship not found.",
        }
      }

      if (error.message.includes("Transaction")) {
        return {
          success: false,
          error: "Failed to update supplier due to a data conflict. Please try again.",
        }
      }
    }

    return {
      success: false,
      error: "Failed to update supplier relationship. Please try again.",
    }
  }
}

// Batch update function with transaction support
export const updateMultipleItemSuppliers = async (
  updates: Array<{ id: string; data: Partial<ItemSupplierUpdateData> }>,
): Promise<UpdateItemSupplierResponse> => {
  try {
    if (!updates.length) {
      return {
        success: false,
        error: "No updates provided",
      }
    }

    const results = await db.$transaction(async (tx) => {
      const updatedSuppliers = []

      for (const update of updates) {
        // Get current supplier info
        const currentSupplier = await tx.itemSupplier.findUnique({
          where: { id: update.id },
          select: { itemId: true, supplierId: true },
        })

        if (!currentSupplier) {
          throw new Error(`Supplier with ID ${update.id} not found`)
        }

        // Handle preferred status
        if (update.data.isPreferred === true) {
          await tx.itemSupplier.updateMany({
            where: {
              itemId: currentSupplier.itemId,
              supplierId: {
                not: currentSupplier.supplierId,
              },
            },
            data: {
              isPreferred: false,
            },
          })
        }

        // Update the supplier
        const updatedSupplier = await tx.itemSupplier.update({
          where: { id: update.id },
          data: {
            ...update.data,
            leadTime: update.data.leadTime ?? null,
            minOrderQty: update.data.minOrderQty ?? null,
            unitCost: update.data.unitCost ?? null,
            lastPurchaseDate: update.data.lastPurchaseDate ?? null,
          },
          include: {
            supplier: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            item: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })

        updatedSuppliers.push(updatedSupplier)
      }

      return updatedSuppliers
    })

    // Revalidate paths for all affected items
    const itemIds = [...new Set(results.map((supplier) => supplier.itemId))]
    for (const itemId of itemIds) {
      revalidatePath(`/dashboard/inventory/items/${itemId}/suppliers`)
      revalidatePath(`/dashboard/inventory/items/${itemId}`)
    }

    return {
      success: true,
      data: results,
      error: null,
    }
  } catch (error) {
    console.error("Failed to update multiple ItemSuppliers:", error)

    if (error instanceof Error && error.message.includes("not found")) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: "Failed to update supplier relationships. Please try again.",
    }
  }
}
