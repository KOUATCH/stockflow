"use server"

import { db } from "@/prisma/db"
import type {
  ItemSupplierUpdateData,
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

    // Prepare update data
    const updateData: ItemSupplierUpdateData = {
      isPreferred: data.isPreferred,
      supplierSku: data.supplierSku ?? null,
      leadTime: data.leadTime ?? null,
      minOrderQty: data.minOrderQty ?? null,
      unitCost: data.unitCost ?? null,
      lastPurchaseDate: data.lastPurchaseDate ?? null,
      notes: data.notes ?? null,
    }

    const result = await db.$transaction(async (tx) => {
      // If setting this supplier as preferred, unset others
      if (updateData.isPreferred) {
        await tx.itemSupplier.updateMany({
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
      }

      // Update the specific item-supplier relationship
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

    // Revalidate relevant paths
    revalidatePath(`/dashboard/inventory/items/${data.itemId}/suppliers`)
    revalidatePath(`/dashboard/inventory/items/${data.itemId}`)

    return {
      success: true,
      data: result,
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
        default:
          return {
            success: false,
            error: "A database error occurred. Please try again.",
          }
      }
    }

    return {
      success: false,
      error: "An unexpected error occurred. Please try again.",
    }
  }
 }
