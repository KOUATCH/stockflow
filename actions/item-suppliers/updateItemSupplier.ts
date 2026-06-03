"use server"

import { db } from "@/prisma/db"
import type {
  UpdateItemSupplierDTO,
  UpdateItemSupplierResponse,
} from "@/types/itemSuppliers"
import { Prisma } from "@prisma/client"
import { revalidatePath } from "next/cache"

export const updateItemSupplier = async (
  data: UpdateItemSupplierDTO
): Promise<UpdateItemSupplierResponse> => {
  try {
    // Validate required fields
    if (!data.itemId || !data.supplierId) {
      return {
        success: false,
        error: "Item ID and Supplier ID are required.",
      }
    }

    // Additional validation to ensure IDs are valid
    if (typeof data.itemId !== 'string' || typeof data.supplierId !== 'string') {
      return {
        success: false,
        error: "Item ID and Supplier ID must be valid strings.",
      }
    }

    console.log('Updating ItemSupplier with:', { itemId: data.itemId, supplierId: data.supplierId })

    // Prepare update data
    const updateData: Prisma.ItemSupplierUpdateInput = {
      isPreferred: data.isPreferred,
      supplierSku: data.supplierSku ?? null,
      leadTimeDays: data.leadTime ?? null,
      minOrderQuantity: data.minOrderQty ?? null,
      unitCost: data.unitCost ?? null,
      lastPurchaseDate: data.lastPurchaseDate ?? null,
      notes: data.notes ?? null,
    }

    const result = await db.$transaction(async (tx) => {
      // First, check if the record exists
      const existing = await tx.itemSupplier.findUnique({
        where: {
          itemId_supplierId: {
            itemId: data.itemId,
            supplierId: data.supplierId,
          },
        },
      })

      if (!existing) {
        console.error('ItemSupplier not found:', { itemId: data.itemId, supplierId: data.supplierId })
        throw new Error("ItemSupplier relationship not found")
      }

      console.log('Found existing ItemSupplier:', existing.id)

      // If setting this as preferred, unset others for this item
      if (data.isPreferred === true) {
        const updateResult = await tx.itemSupplier.updateMany({
          where: {
            itemId: data.itemId,
            supplierId: {
              not: data.supplierId,
            },
          },
          data: {
            isPreferred: false,
          },
        })
        console.log('Updated other suppliers to non-preferred:', updateResult.count)
      }

      // Update the specific ItemSupplier
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
              sku: true,
              nameEn: true,
              nameFr: true,
            },
          },
        },
      })

      console.log('Updated ItemSupplier:', updatedItemSupplier?.id)

      // Verify the result has the expected structure
      if (!updatedItemSupplier) {
        throw new Error("Update operation did not return a result")
      }

      if (!updatedItemSupplier.supplier) {
        console.error('Updated record missing supplier:', updatedItemSupplier)
        throw new Error("Updated record is missing supplier information")
      }

      if (!updatedItemSupplier.item) {
        console.error('Updated record missing item:', updatedItemSupplier)
        throw new Error("Updated record is missing item information")
      }

      return updatedItemSupplier
    })

    console.log('Transaction completed successfully')

    // Revalidate relevant paths
    revalidatePath(`/dashboard/inventory/items/${data.itemId}/suppliers`)
    revalidatePath(`/dashboard/inventory/items/${data.itemId}`)

    return {
      success: true,
      data: {
        ...result,
        leadTime: result.leadTimeDays,
        minOrderQty: result.minOrderQuantity ? Number(result.minOrderQuantity) : null,
        unitCost: result.unitCost ? Number(result.unitCost) : null,
        item: result.item
          ? {
              ...result.item,
              name: result.item.nameEn ?? result.item.nameFr ?? "",
            }
          : undefined,
      },
    }
  } catch (error) {
    console.error("Failed to update Item Supplier:", error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      switch (error.code) {
        case "P2025":
          return {
            success: false,
            error: "Item Supplier not found. It may have been deleted.",
          }
        case "P2002":
          return {
            success: false,
            error: "A supplier relationship with these details already exists.",
          }
        case "P2003":
          return {
            success: false,
            error: "Invalid item or supplier reference.",
          }
        default:
          return {
            success: false,
            error: `Database error (${error.code}): ${error.message}`,
          }
      }
    }

    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
}
