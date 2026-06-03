'use server'

import { generateSimpleSKU } from '@/lib/generateSKU';
import { generateSlug } from '@/lib/generateSlug';
import { updateInventoryLevels } from '@/lib/inventory/update-inventory-levels';
import { itemStandardInclude } from '@/lib/item/includes';
import {
  type ItemWithRelations,
  createItemSchema
} from '@/lib/item/schemas';
import { revalidateItem } from '@/lib/item/revalidation';
import { db } from '@/prisma/db';
import { Prisma } from '@prisma/client';
import {
  inventoryAction,
  type ServerActionResult,
  ErrorCategory,
  ErrorSeverity
} from '@/lib/error-handling';

// Create Item (optionally seed initial inventory at a specific location)
export const createItemAction = inventoryAction(
  async (input: unknown): Promise<ServerActionResult<ItemWithRelations>> => {
    console.log('Server action received input:', {
      input,
      imageUrls: (input as any)?.imageUrls,
      thumbnail: (input as any)?.thumbnail
    });
    console.log('Full input object:', JSON.stringify(input, null, 2));

    // Validate input with enhanced error handling
    let data: any
    try {
      data = createItemSchema.parse(input)
    } catch (validationError) {
      return {
        success: false,
        error: {
          id: `validation_${Date.now()}`,
          code: 'ITEM_VALIDATION_ERROR',
          message: validationError instanceof Error ? validationError.message : 'Validation failed',
          userMessage: 'Please check your input data and ensure all required fields are filled correctly.',
          category: ErrorCategory.FORM_VALIDATION,
          severity: ErrorSeverity.MEDIUM,
          recoverable: true,
          retryable: false,
          context: {
            action: 'createItem',
            validationErrors: validationError instanceof Error ? validationError.message : 'Unknown validation error'
          }
        }
      }
    }

    // Enforce unique SKU and English name within org
    const [existingSku, existingName] = await Promise.all([
      db.item.findFirst({
        where: { sku: data.sku, organizationId: data.organizationId },
        select: { id: true },
      }),
      db.item.findFirst({
        where: { nameEn: data.nameEn, organizationId: data.organizationId },
        select: { id: true },
      })
    ])

    if (existingSku) {
      return {
        success: false,
        error: {
          id: `sku_duplicate_${Date.now()}`,
          code: 'ITEM_SKU_DUPLICATE',
          message: 'SKU already exists in this organization',
          userMessage: 'This SKU is already in use. Please choose a different SKU.',
          category: ErrorCategory.BUSINESS_RULE,
          severity: ErrorSeverity.MEDIUM,
          recoverable: true,
          retryable: false,
          context: {
            action: 'createItem',
            duplicateField: 'sku',
            duplicateValue: data.sku
          }
        }
      }
    }

    if (existingName) {
      return {
        success: false,
        error: {
          id: `name_duplicate_${Date.now()}`,
          code: 'ITEM_NAME_DUPLICATE',
          message: 'Product name already exists in this organization',
          userMessage: 'This product name is already in use. Please choose a different name.',
          category: ErrorCategory.BUSINESS_RULE,
          severity: ErrorSeverity.MEDIUM,
          recoverable: true,
          retryable: false,
          context: {
            action: 'createItem',
            duplicateField: 'nameEn',
            duplicateValue: data.nameEn
          }
        }
      }
    }

    data.slug = generateSlug(`${data.nameEn}`, `${data.sku}`)
    console.log(data)

    const created = await db.$transaction(async (tx) => {
      const item = await tx.item.create({
        data: {
          organizationId: data.organizationId,
          nameEn: data.nameEn,
          nameFr: data.nameFr ?? null,
          descriptionEn: data.descriptionEn ?? null,
          descriptionFr: data.descriptionFr ?? null,
          imageUrls: data.imageUrls ? [data.imageUrls] : [],
          thumbnail: data.thumbnail ?? null,
          sku: data.sku || generateSimpleSKU(12,"DBAKES"),
          dimensions: data.dimensions ?? null,
          weight: data.weight ?? 0,
          costPrice: data.costPrice ?? 0,
          sellingPrice: data.sellingPrice ?? 0,
          taxRateId: data.taxRateId ?? null ,
          categoryId: data.categoryId ?? null,
          brandId: data.brandId ?? null,
          unitId: data.unitId ?? null,
          minStockLevel: data.minStockLevel ?? 0,
          maxStockLevel: data.maxStockLevel ?? null,
          isActive: data.isActive ?? true,
          slug: generateSlug(`${data.nameEn}`, `${data.sku}`)

          // isSerialTracked: data.isSerialTracked ?? false,
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
            notes: inv.notes ?? 'Initial item stock',
            createdById: inv.createdById,
            referenceType: 'GOODS_RECEIPT',
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

    // Revalidate cache after successful creation
    revalidateItem(created.id, created.organizationId)

    return {
      success: true,
      data: created,
    }
  },
  {
    actionName: 'createItem',
    component: 'ItemCreation',
    notifyUser: true,
    notifyAdmin: false,
    autoRetry: false,
    businessContext: {
      domain: 'inventory',
      operation: 'create',
      resourceType: 'item'
    },
    affectedResources: ['inventory', 'items'],
    customUserMessages: {
      [ErrorCategory.VALIDATION]: 'Please check your product information and try again.',
      [ErrorCategory.BUSINESS_RULE]: 'This product conflicts with existing data. Please check the SKU and name.',
      [ErrorCategory.DATABASE]: 'Unable to save the product. Please try again in a moment.',
      [ErrorCategory.INVENTORY]: 'There was an issue setting up the initial inventory. The product was created but inventory may need to be adjusted manually.'
    }
  }
)
