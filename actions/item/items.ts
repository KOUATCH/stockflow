"use server"

import { updateInventoryLevels } from "@/lib/inventory/update-inventory-levels"
import { itemStandardInclude } from "@/lib/item/includes"
import {
  type ActionResult,
  createItemSchema,
  deleteItemSchema,
  getItemSchema,
  type ItemWithRelations,
  listItemsSchema,
  revalidateItems,
  slugify,
  updateBasicInfoSchema,
  updateDetailsSchema,
  updatePricingSchema,
  updateRelationsSchema,
  updateStockSchema,
  updateTrackingSchema,
} from "@/lib/item/schemas"
import { db } from "@/prisma/db"
import { Prisma } from "@prisma/client"
import { revalidatePath, revalidateTag } from "next/cache"

export type PaginatedItems = {
  data: ItemWithRelations[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Create Item (optionally seed initial inventory at a specific location)
export async function createItemAction(input: unknown): Promise<ActionResult<ItemWithRelations>> {
  try {
    const data = createItemSchema.parse(input)

    // Enforce unique SKU within org
    const existingSku = await db.item.findFirst({
      where: { sku: data.sku, organizationId: data.organizationId },
      select: { id: true },
    })
    if (existingSku) {
      return { success: false, error: "SKU already exists in this organization" }
    }

    const slug = data.slug ?? slugify(`${data.name}-${data.sku}`)

    const created = await db.$transaction(async (tx) => {
      const item = await tx.item.create({
        data: {
          organizationId: data.organizationId,
          name: data.name,
          description: data.description ?? null,
          imageUrls: data.imageUrls,
          thumbnail: data.thumbnail ?? null,
          sku: data.sku,
          barcode: data.barcode ?? null,
          dimensions: data.dimensions ?? null,
          weight: data.weight ?? 0,
          upc: data.upc ?? null,
          ean: data.ean ?? null,
          mpn: data.mpn ?? null,
          isbn: data.isbn ?? null,
          costPrice: data.costPrice ?? 0,
          sellingPrice: data.sellingPrice ?? 0,
          categoryId: data.categoryId ?? null,
          brandId: data.brandId ?? null,
          unitId: data.unitId ?? null,
          taxRateId: data.taxRateId ?? null,
          minStockLevel: data.minStockLevel ?? 0,
          maxStockLevel: data.maxStockLevel ?? null,
          isActive: data.isActive ?? true,
          slug,
        },
        include: itemStandardInclude,
      })

      // Optional initial inventory
      if (data.initialInventory && data.initialInventory.quantity > 0) {
        const inv = data.initialInventory
        await updateInventoryLevels(tx, {
          itemId: item.id,
          locationId: inv.locationId,
          deltaQty: inv.quantity,
          unitCost: inv.unitCost ?? item.costPrice ?? 0,
          organizationId: data.organizationId,
          meta: {
            notes: inv.notes ?? "Initial item stock",
            createdById: inv.createdById,
            referenceType: "GOODS_RECEIPT",
            referenceId: undefined,
            referenceNumber: inv.referenceNumber,
            batchNumber: inv.batchNumber,
            serialNumbers: inv.serialNumbers,
            expiryDate: inv.expiryDate,
          },
        })
      }

      return item
    })

    revalidateItems(created.id, created.organizationId)

    return {
      success: true,
      data: created,
      message: "Item created successfully",
    }
  } catch (error) {
    console.error("createItemAction error:", error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Database error: ${error.code}`
        : error instanceof Error
          ? error.message
          : "Failed to create item"
    return { success: false, error: message }
  }
}

// Read: Get one
export async function getItemAction(input: unknown): Promise<ActionResult<ItemWithRelations>> {
  try {
    const { id, organizationId } = getItemSchema.parse(input)

    const item = await db.item.findFirst({
      where: { id, organizationId },
      include: itemStandardInclude,
    })
    if (!item) {
      return { success: false, error: "Item not found" }
    }
    return { success: true, data: item }
  } catch (error) {
    console.error("getItemAction error:", error)
    const message = error instanceof Error ? error.message : "Failed to fetch item"
    return { success: false, error: message }
  }
}

// Read: List with search, filters, pagination
export async function listItemsAction(input: unknown): Promise<ActionResult<PaginatedItems>> {
  try {
    const params = listItemsSchema.parse(input)
    const { organizationId, q, page, pageSize, sortBy, sortOrder, ...filters } = params

    const where: Prisma.ItemWhereInput = {
      organizationId,
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { sku: { contains: q, mode: "insensitive" } },
              { barcode: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
      ...(filters.brandId ? { brandId: filters.brandId } : {}),
      ...(filters.unitId ? { unitId: filters.unitId } : {}),
      ...(filters.taxRateId ? { taxRateId: filters.taxRateId } : {}),
      ...(typeof filters.isActive === "boolean" ? { isActive: filters.isActive } : {}),
    }

    const [total, data] = await Promise.all([
      db.item.count({ where }),
      db.item.findMany({
        where,
        include: itemStandardInclude,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    const totalPages = Math.max(1, Math.ceil(total / pageSize))

    return { success: true, data: { data, total, page, pageSize, totalPages } }
  } catch (error) {
    console.error("listItemsAction error:", error)
    const message = error instanceof Error ? error.message : "Failed to list items"
    return { success: false, error: message }
  }
}

// Update: Basic Info
export async function updateItemBasicInfoAction(input: unknown): Promise<ActionResult<ItemWithRelations>> {
  try {
    const data = updateBasicInfoSchema.parse(input)
    const updated = await db.item.update({
      where: { id: data.id },
      data: {
        name: data.name ?? undefined,
        description: data.description ?? undefined,
        imageUrls: data.imageUrls ?? undefined,
        thumbnail: data.thumbnail ?? undefined,
      },
      include: itemStandardInclude,
    })

    revalidateItems(updated.id, data.organizationId)
    return { success: true, data: updated, message: "Item updated" }
  } catch (error) {
    console.error("updateItemBasicInfoAction error:", error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Database error: ${error.code}`
        : error instanceof Error
          ? error.message
          : "Failed to update item"
    return { success: false, error: message }
  }
}

// Update: Item Details (SKU/Barcode/Physical)
export async function updateItemDetailsAction(input: unknown): Promise<ActionResult<ItemWithRelations>> {
  try {
    const data = updateDetailsSchema.parse(input)

    if (data.sku) {
      // Unique SKU per org
      const conflict = await db.item.findFirst({
        where: {
          sku: data.sku,
          organizationId: data.organizationId,
          id: { not: data.id },
        },
        select: { id: true },
      })
      if (conflict) {
        return { success: false, error: "Another item with this SKU already exists" }
      }
    }

    const updated = await db.item.update({
      where: { id: data.id },
      data: {
        sku: data.sku ?? undefined,
        barcode: data.barcode ?? undefined,
        dimensions: data.dimensions ?? undefined,
        weight: data.weight ?? undefined,
        upc: data.upc ?? undefined,
        ean: data.ean ?? undefined,
        mpn: data.mpn ?? undefined,
        isbn: data.isbn ?? undefined,
      },
      include: itemStandardInclude,
    })

    revalidateItems(updated.id, data.organizationId)
    return { success: true, data: updated, message: "Item details updated" }
  } catch (error) {
    console.error("updateItemDetailsAction error:", error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Database error: ${error.code}`
        : error instanceof Error
          ? error.message
          : "Failed to update item details"
    return { success: false, error: message }
  }
}

// Update: Pricing
export async function updateItemPricingAction(input: unknown): Promise<ActionResult<ItemWithRelations>> {
  try {
    const data = updatePricingSchema.parse(input)

    const updated = await db.item.update({
      where: { id: data.id },
      data: {
        costPrice: data.costPrice ?? undefined,
        sellingPrice: data.sellingPrice ?? undefined,
      },
      include: itemStandardInclude,
    })

    revalidateItems(updated.id, data.organizationId)
    return { success: true, data: updated, message: "Item pricing updated" }
  } catch (error) {
    console.error("updateItemPricingAction error:", error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Database error: ${error.code}`
        : error instanceof Error
          ? error.message
          : "Failed to update pricing"
    return { success: false, error: message }
  }
}

// Update: Relations
export async function updateItemRelationsAction(input: unknown): Promise<ActionResult<ItemWithRelations>> {
  try {
    const data = updateRelationsSchema.parse(input)

    const updated = await db.item.update({
      where: { id: data.id },
      data: {
        categoryId: data.categoryId ?? null,
        brandId: data.brandId ?? null,
        unitId: data.unitId ?? null,
        taxRateId: data.taxRateId ?? null,
      },
      include: itemStandardInclude,
    })

    revalidateItems(updated.id, data.organizationId)
    return { success: true, data: updated, message: "Item relations updated" }
  } catch (error) {
    console.error("updateItemRelationsAction error:", error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Database error: ${error.code}`
        : error instanceof Error
          ? error.message
          : "Failed to update relations"
    return { success: false, error: message }
  }
}

// Update: Stock policy + optional inventory adjustment
export async function updateItemStockAction(input: unknown): Promise<ActionResult<ItemWithRelations>> {
  try {
    const data = updateStockSchema.parse(input)

    const updated = await db.$transaction(async (tx) => {
      const updatedItem = await tx.item.update({
        where: { id: data.id },
        data: {
          minStockLevel: data.minStockLevel ?? undefined,
          maxStockLevel: data.maxStockLevel ?? undefined,
        },
        include: itemStandardInclude,
      })

      if (data.adjustInventory && data.adjustInventory.deltaQty !== 0) {
        const {
          locationId,
          deltaQty,
          unitCost,
          notes,
          createdById,
          batchNumber,
          serialNumbers,
          expiryDate,
          referenceNumber,
        } = data.adjustInventory

        // Apply inventory delta with weighted-average costing
        await updateInventoryLevels(tx, {
          itemId: updatedItem.id,
          locationId,
          deltaQty,
          unitCost: unitCost ?? updatedItem.costPrice ?? 0,
          organizationId: updatedItem.organizationId,
          meta: {
            notes: notes ?? "Manual stock adjustment",
            createdById,
            referenceType: "GOODS_RECEIPT",
            referenceId: undefined,
            referenceNumber,
            batchNumber,
            serialNumbers,
            expiryDate,
          },
        })
      }

      return updatedItem
    })

    revalidateItems(updated.id, data.organizationId)
    return { success: true, data: updated, message: "Stock updated" }
  } catch (error) {
    console.error("updateItemStockAction error:", error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code === "P2003"
          ? "Related record not found"
          : `Database error: ${error.code}`
        : error instanceof Error
          ? error.message
          : "Failed to update stock"
    return { success: false, error: message }
  }
}

// Update: Tracking / Flags
export async function updateItemTrackingAction(input: unknown): Promise<ActionResult<ItemWithRelations>> {
  try {
    const data = updateTrackingSchema.parse(input)

    const patch: Prisma.ItemUpdateInput = {
      isActive: data.isActive ?? undefined,
    }

    if (typeof data.slug === "string") {
      patch.slug = data.slug === "" ? slugify(data.id) : slugify(data.slug)
    }

    const updated = await db.item.update({
      where: { id: data.id },
      data: patch,
      include: itemStandardInclude,
    })

    revalidateItems(updated.id, data.organizationId)
    return { success: true, data: updated, message: "Item tracking updated" }
  } catch (error) {
    console.error("updateItemTrackingAction error:", error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? `Database error: ${error.code}`
        : error instanceof Error
          ? error.message
          : "Failed to update tracking"
    return { success: false, error: message }
  }
}

// Delete
export async function deleteItemAction(input: unknown): Promise<ActionResult<{ id: string }>> {
  try {
    const { id, organizationId } = deleteItemSchema.parse(input)

    // Optional: guard if item is referenced elsewhere (purchase order lines, etc.)
    const polCount = await db.purchaseOrderLine.count({
      where: { itemId: id },
    })
    if (polCount > 0) {
      return {
        success: false,
        error: "Cannot delete item that has been used in purchase orders",
      }
    }

    await db.item.delete({
      where: { id },
    })

    revalidateTag("items")
    revalidateTag(`item-${id}`)
    revalidateTag(`org-${organizationId}-items`)
    revalidatePath("/dashboard/items")

    return { success: true, data: { id }, message: "Item deleted" }
  } catch (error) {
    console.error("deleteItemAction error:", error)
    const message =
      error instanceof Prisma.PrismaClientKnownRequestError
        ? error.code === "P2003"
          ? "Cannot delete item due to existing references"
          : `Database error: ${error.code}`
        : error instanceof Error
          ? error.message
          : "Failed to delete item"
    return { success: false, error: message }
  }
}
