"use server"

import { randomUUID } from "crypto"
import { revalidatePath } from "next/cache"
import {
  ProductionBatchStatus as PrismaProductionBatchStatus,
  TransactionReferenceType,
  TransactionType,
} from "@prisma/client"
import { prisma } from "@/prisma/db"
import {
  ProductionStatus,
  RecipeStatus,
  ProductionPriority,
  UnitOfMeasure,
  type Recipe,
  type RecipeIngredient,
  type ProductionBatch,
  type CreateRecipeFormData,
  type UpdateRecipeFormData,
  type CreateProductionBatchFormData,
  type ProductionFilters,
  type RecipeFilters,
  type ProductionAnalytics,
  type RecipePerformance,
  calculateMarginPercentage,
} from "@/types/production"

type ActionResult<T> =
  | { success: true; data: T; message?: string }
  | { success: false; error: string }

type RecipeRecord = {
  id: string
  nameEn: string
  nameFr: string | null
  outputItemId: string
  outputQuantity: unknown
  laborCost: unknown
  overheadCost: unknown
  version: number
  isActive: boolean
  notes: string | null
  organizationId: string
  createdAt: Date
  updatedAt: Date
  ingredients?: RecipeIngredientRecord[]
  productionBatches?: ProductionBatchRecord[]
  outputItem?: ItemRecord | null
  _count?: {
    productionBatches?: number
  }
}

type RecipeIngredientRecord = {
  id: string
  recipeId: string
  itemId: string
  quantity: unknown
  wastePercent: unknown
  notes: string | null
  createdAt: Date
  updatedAt: Date
  item?: ItemRecord | null
}

type ProductionBatchRecord = {
  id: string
  batchNumber: string
  recipeId: string
  plannedQuantity: unknown
  actualQuantity: unknown
  status: PrismaProductionBatchStatus
  startedAt: Date
  completedAt: Date | null
  totalInputCost: unknown
  unitCost: unknown
  notes: string | null
  locationId: string
  organizationId: string
  createdById: string | null
  createdAt: Date
  updatedAt: Date
  recipe?: RecipeRecord | null
  location?: unknown
  createdBy?: unknown
}

type ItemRecord = {
  id: string
  sku: string
  nameEn: string
  nameFr: string | null
  descriptionEn: string | null
  descriptionFr: string | null
  costPrice: unknown
  sellingPrice: unknown
  reorderLevel?: unknown
  category?: {
    titleEn: string
    titleFr: string | null
  } | null
}

const DEFAULT_UNIT = UnitOfMeasure.PIECES

const toNumber = (value: unknown): number => {
  if (value == null) return 0
  if (typeof value === "number") return value
  if (typeof value === "bigint") return Number(value)
  if (typeof value === "string") return Number(value) || 0
  if (typeof value === "object" && "toNumber" in value && typeof value.toNumber === "function") {
    return value.toNumber()
  }
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "recipe"

const revalidateProduction = (page: "recipes" | "batches") => {
  revalidatePath(`/[locale]/dashboard/production/${page}`, "page")
}

const revalidateInventory = () => {
  revalidatePath("/[locale]/dashboard/inventory", "page")
}

const mapBatchStatus = (status: PrismaProductionBatchStatus): ProductionStatus => {
  switch (status) {
    case PrismaProductionBatchStatus.IN_PROGRESS:
      return ProductionStatus.IN_PROGRESS
    case PrismaProductionBatchStatus.COMPLETED:
      return ProductionStatus.COMPLETED
    case PrismaProductionBatchStatus.CANCELLED:
    case PrismaProductionBatchStatus.VOIDED:
      return ProductionStatus.CANCELLED
    default:
      return ProductionStatus.PLANNED
  }
}

const mapRecipeIngredient = (ingredient: RecipeIngredientRecord): RecipeIngredient => {
  const item = ingredient.item
  const quantity = toNumber(ingredient.quantity)
  const unitCost = toNumber(item?.costPrice)

  return {
    id: ingredient.id,
    recipeId: ingredient.recipeId,
    rawMaterialId: ingredient.itemId,
    quantity,
    unitOfMeasure: DEFAULT_UNIT,
    cost: quantity * unitCost,
    notes: ingredient.notes ?? undefined,
    isOptional: false,
    rawMaterial: item
      ? ({
          ...item,
          name: item.nameEn,
          description: item.descriptionEn ?? item.descriptionFr ?? undefined,
          unitOfMeasure: DEFAULT_UNIT,
          costPerUnit: unitCost,
          minimumStock: 0,
          maximumStock: 0,
          reorderPoint: toNumber(item.reorderLevel),
        } as never)
      : undefined,
  }
}

const mapRecipe = (recipe: RecipeRecord): Recipe => {
  const ingredients = (recipe.ingredients ?? []).map(mapRecipeIngredient)
  const totalMaterialCost = ingredients.reduce((sum, ingredient) => sum + ingredient.cost, 0)
  const laborCost = toNumber(recipe.laborCost)
  const overheadCost = toNumber(recipe.overheadCost)
  const totalCost = totalMaterialCost + laborCost + overheadCost
  const yields = toNumber(recipe.outputQuantity) || 1
  const costPerUnit = totalCost / yields
  const sellingPrice = toNumber(recipe.outputItem?.sellingPrice) || costPerUnit

  return {
    id: recipe.id,
    name: recipe.nameEn,
    description: recipe.notes ?? recipe.outputItem?.descriptionEn ?? undefined,
    category: recipe.outputItem?.category?.titleEn ?? "",
    servingSize: 1,
    servingUnit: DEFAULT_UNIT,
    preparationTime: 0,
    cookingTime: 0,
    totalTime: 0,
    difficulty: "MEDIUM",
    status: recipe.isActive ? RecipeStatus.ACTIVE : RecipeStatus.INACTIVE,
    version: recipe.version,
    yields,
    yieldUnit: DEFAULT_UNIT,
    ingredients,
    instructions: [],
    totalMaterialCost,
    laborCost,
    overheadCost,
    totalCost,
    costPerUnit,
    suggestedSellingPrice: sellingPrice,
    targetMarginPercentage: calculateMarginPercentage(sellingPrice, costPerUnit),
    organizationId: recipe.organizationId,
    createdById: "",
    createdAt: recipe.createdAt,
    updatedAt: recipe.updatedAt,
    productionBatches: recipe.productionBatches?.map(mapProductionBatch),
  }
}

const mapProductionBatch = (batch: ProductionBatchRecord): ProductionBatch => {
  const plannedQuantity = toNumber(batch.plannedQuantity)
  const quantityProduced = toNumber(batch.actualQuantity)
  const totalCost = toNumber(batch.totalInputCost)
  const costPerUnit = toNumber(batch.unitCost)

  return {
    id: batch.id,
    batchNumber: batch.batchNumber,
    recipeId: batch.recipeId,
    quantityPlanned: plannedQuantity,
    quantityProduced,
    quantityYield: quantityProduced,
    yieldPercentage: plannedQuantity > 0 ? (quantityProduced / plannedQuantity) * 100 : 0,
    status: mapBatchStatus(batch.status),
    priority: ProductionPriority.MEDIUM,
    scheduledStartTime: batch.startedAt,
    scheduledEndTime: batch.completedAt ?? batch.startedAt,
    actualStartTime: batch.startedAt,
    actualEndTime: batch.completedAt ?? undefined,
    locationId: batch.locationId,
    materialCosts: [],
    laborCosts: [],
    overheadCosts: [],
    totalMaterialCost: totalCost,
    totalLaborCost: 0,
    totalOverheadCost: 0,
    totalCost,
    costPerUnit,
    productionNotes: batch.notes ?? undefined,
    organizationId: batch.organizationId,
    createdById: batch.createdById ?? "",
    createdAt: batch.createdAt,
    updatedAt: batch.updatedAt,
    recipe: batch.recipe ? mapRecipe(batch.recipe) : undefined,
    location: batch.location as never,
    createdBy: batch.createdBy as never,
    rawMaterialUsage: [],
    finishedProducts: [],
  }
}

const recipeInclude = {
  ingredients: {
    include: {
      item: true,
    },
  },
  outputItem: {
    include: {
      category: {
        select: {
          titleEn: true,
          titleFr: true,
        },
      },
    },
  },
  _count: {
    select: {
      productionBatches: true,
    },
  },
} as const

const batchInclude = {
  recipe: {
    include: recipeInclude,
  },
  location: true,
  createdBy: true,
} as const

const calculateMaterialCost = async (
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  ingredients: CreateRecipeFormData["ingredients"],
) => {
  let totalMaterialCost = 0

  for (const ingredient of ingredients) {
    const rawMaterial = await tx.item.findUnique({
      where: { id: ingredient.rawMaterialId },
      select: { costPrice: true },
    })

    totalMaterialCost += ingredient.quantity * toNumber(rawMaterial?.costPrice)
  }

  return totalMaterialCost
}

const ensureRecipeOutputItem = async (
  tx: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
  data: CreateRecipeFormData | UpdateRecipeFormData,
  organizationId: string,
  existingItemId?: string,
) => {
  const sku = `RECIPE-${Date.now()}-${randomUUID().slice(0, 8).toUpperCase()}`

  if (existingItemId) {
    return tx.item.update({
      where: { id: existingItemId },
      data: {
        nameEn: data.name,
        nameFr: data.name,
        descriptionEn: data.description,
        descriptionFr: data.description,
        sellingPrice: 0,
      },
    })
  }

  return tx.item.create({
    data: {
      id: randomUUID(),
      slug: `${slugify(data.name)}-${randomUUID().slice(0, 8)}`,
      sku,
      nameEn: data.name,
      nameFr: data.name,
      descriptionEn: data.description,
      descriptionFr: data.description,
      imageUrls: [],
      costPrice: 0,
      sellingPrice: 0,
      organizationId,
      updatedAt: new Date(),
    },
  })
}

export async function createRecipe(
  data: CreateRecipeFormData,
  organizationId: string,
  createdById: string,
): Promise<ActionResult<Recipe>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const totalTime = data.preparationTime + data.cookingTime
      const totalMaterialCost = await calculateMaterialCost(tx, data.ingredients)
      const laborCost = (totalTime / 60) * 15
      const overheadCost = (totalMaterialCost + laborCost) * 0.1
      const totalCost = totalMaterialCost + laborCost + overheadCost
      const costPerUnit = data.yields > 0 ? totalCost / data.yields : 0
      const suggestedSellingPrice =
        data.targetMarginPercentage >= 100
          ? costPerUnit
          : costPerUnit / (1 - data.targetMarginPercentage / 100)

      const outputItem = await ensureRecipeOutputItem(tx, data, organizationId)
      await tx.item.update({
        where: { id: outputItem.id },
        data: {
          costPrice: costPerUnit,
          sellingPrice: suggestedSellingPrice,
        },
      })

      const recipe = await tx.recipe.create({
        data: {
          id: randomUUID(),
          nameEn: data.name,
          nameFr: data.name,
          notes: data.description,
          outputItemId: outputItem.id,
          outputQuantity: data.yields,
          laborCost,
          overheadCost,
          organizationId,
          updatedAt: new Date(),
        },
      })

      for (const ingredient of data.ingredients) {
        await tx.recipeIngredient.create({
          data: {
            id: randomUUID(),
            recipeId: recipe.id,
            itemId: ingredient.rawMaterialId,
            quantity: ingredient.quantity,
            wastePercent: 0,
            notes: ingredient.notes,
            updatedAt: new Date(),
          },
        })
      }

      return tx.recipe.findUniqueOrThrow({
        where: { id: recipe.id },
        include: recipeInclude,
      })
    })

    revalidateProduction("recipes")

    return {
      success: true,
      data: mapRecipe(result),
      message: "Recipe created successfully",
    }
  } catch (error) {
    console.error("Error creating recipe:", error)
    return {
      success: false,
      error: "Failed to create recipe",
    }
  }
}

export async function getRecipes(
  organizationId: string,
  filters?: RecipeFilters,
): Promise<ActionResult<Recipe[]>> {
  try {
    const where: NonNullable<Parameters<typeof prisma.recipe.findMany>[0]>["where"] = {
      organizationId,
      deletedAt: null,
    }

    if (filters?.status?.length) {
      where.isActive = filters.status.some((status) => status === RecipeStatus.ACTIVE)
    }

    if (filters?.searchTerm) {
      where.OR = [
        { nameEn: { contains: filters.searchTerm, mode: "insensitive" } },
        { nameFr: { contains: filters.searchTerm, mode: "insensitive" } },
        { notes: { contains: filters.searchTerm, mode: "insensitive" } },
      ]
    }

    const recipes = await prisma.recipe.findMany({
      where,
      include: recipeInclude,
      orderBy: {
        createdAt: "desc",
      },
    })

    return {
      success: true,
      data: recipes.map(mapRecipe),
    }
  } catch (error) {
    console.error("Error fetching recipes:", error)
    return {
      success: false,
      error: "Failed to fetch recipes",
    }
  }
}

export async function updateRecipeCosts(
  recipeId: string,
  organizationId: string,
): Promise<ActionResult<Recipe>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.findFirst({
        where: {
          id: recipeId,
          organizationId,
          deletedAt: null,
        },
        include: recipeInclude,
      })

      if (!recipe) {
        throw new Error("Recipe not found")
      }

      const ingredients = recipe.ingredients.map((ingredient) => ({
        rawMaterialId: ingredient.itemId,
        quantity: toNumber(ingredient.quantity),
        unitOfMeasure: DEFAULT_UNIT,
        isOptional: false,
        notes: ingredient.notes ?? undefined,
      }))
      const totalMaterialCost = await calculateMaterialCost(tx, ingredients)
      const laborCost = toNumber(recipe.laborCost)
      const overheadCost = toNumber(recipe.overheadCost)
      const totalCost = totalMaterialCost + laborCost + overheadCost
      const costPerUnit = totalCost / (toNumber(recipe.outputQuantity) || 1)

      await tx.item.update({
        where: { id: recipe.outputItemId },
        data: {
          costPrice: costPerUnit,
        },
      })

      return tx.recipe.findUniqueOrThrow({
        where: { id: recipe.id },
        include: recipeInclude,
      })
    })

    revalidateProduction("recipes")

    return {
      success: true,
      data: mapRecipe(result),
      message: "Recipe costs updated successfully",
    }
  } catch (error) {
    console.error("Error updating recipe costs:", error)
    return {
      success: false,
      error: "Failed to update recipe costs",
    }
  }
}

export async function updateRecipe(
  recipeId: string,
  data: UpdateRecipeFormData,
  organizationId: string,
  updatedById: string,
): Promise<ActionResult<Recipe>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingRecipe = await tx.recipe.findFirst({
        where: {
          id: recipeId,
          organizationId,
          deletedAt: null,
        },
      })

      if (!existingRecipe) {
        throw new Error("Recipe not found")
      }

      const totalTime = data.preparationTime + data.cookingTime
      const totalMaterialCost = await calculateMaterialCost(tx, data.ingredients)
      const laborCost = (totalTime / 60) * 15
      const overheadCost = (totalMaterialCost + laborCost) * 0.1
      const totalCost = totalMaterialCost + laborCost + overheadCost
      const costPerUnit = data.yields > 0 ? totalCost / data.yields : 0
      const suggestedSellingPrice =
        data.targetMarginPercentage >= 100
          ? costPerUnit
          : costPerUnit / (1 - data.targetMarginPercentage / 100)

      await ensureRecipeOutputItem(tx, data, organizationId, existingRecipe.outputItemId)
      await tx.item.update({
        where: { id: existingRecipe.outputItemId },
        data: {
          costPrice: costPerUnit,
          sellingPrice: suggestedSellingPrice,
        },
      })

      const recipe = await tx.recipe.update({
        where: { id: recipeId },
        data: {
          nameEn: data.name,
          nameFr: data.name,
          notes: data.description,
          outputQuantity: data.yields,
          laborCost,
          overheadCost,
          updatedAt: new Date(),
        },
      })

      await tx.recipeIngredient.deleteMany({
        where: { recipeId },
      })

      for (const ingredient of data.ingredients) {
        await tx.recipeIngredient.create({
          data: {
            id: randomUUID(),
            recipeId: recipe.id,
            itemId: ingredient.rawMaterialId,
            quantity: ingredient.quantity,
            wastePercent: 0,
            notes: ingredient.notes,
            updatedAt: new Date(),
          },
        })
      }

      return tx.recipe.findUniqueOrThrow({
        where: { id: recipe.id },
        include: recipeInclude,
      })
    })

    void updatedById
    revalidateProduction("recipes")

    return {
      success: true,
      data: mapRecipe(result),
      message: "Recipe updated successfully",
    }
  } catch (error) {
    console.error("Error updating recipe:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update recipe",
    }
  }
}

export async function getRecipeById(
  recipeId: string,
  organizationId: string,
): Promise<ActionResult<Recipe>> {
  try {
    const recipe = await prisma.recipe.findFirst({
      where: {
        id: recipeId,
        organizationId,
        deletedAt: null,
      },
      include: recipeInclude,
    })

    if (!recipe) {
      return {
        success: false,
        error: "Recipe not found",
      }
    }

    return {
      success: true,
      data: mapRecipe(recipe),
    }
  } catch (error) {
    console.error("Error fetching recipe:", error)
    return {
      success: false,
      error: "Failed to fetch recipe",
    }
  }
}

export async function createProductionBatch(
  data: CreateProductionBatchFormData,
  organizationId: string,
  createdById: string,
): Promise<ActionResult<ProductionBatch>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const recipe = await tx.recipe.findFirst({
        where: {
          id: data.recipeId,
          organizationId,
          deletedAt: null,
        },
        include: recipeInclude,
      })

      if (!recipe) {
        throw new Error("Recipe not found")
      }

      const plannedQuantity = data.quantityToProduce
      const recipeYield = toNumber(recipe.outputQuantity) || 1
      const scalingFactor = plannedQuantity / recipeYield
      const recipeDto = mapRecipe(recipe)
      const estimatedInputCost = recipeDto.totalCost * scalingFactor

      for (const ingredient of recipe.ingredients) {
        const requiredQuantity = toNumber(ingredient.quantity) * scalingFactor
        const inventoryLevel = await tx.inventoryLevel.findFirst({
          where: {
            itemId: ingredient.itemId,
            locationId: data.locationId,
          },
        })
        const availableQuantity = toNumber(inventoryLevel?.quantityAvailable)

        if (!inventoryLevel || availableQuantity < requiredQuantity) {
          const itemName = ingredient.item?.nameEn ?? "raw material"
          throw new Error(
            `Insufficient ${itemName}. Required: ${requiredQuantity}, Available: ${availableQuantity}`,
          )
        }
      }

      const batchCount = await tx.productionBatch.count({ where: { organizationId } })
      const batchNumber = `BATCH-${Date.now()}-${(batchCount + 1).toString().padStart(4, "0")}`
      const batch = await tx.productionBatch.create({
        data: {
          id: randomUUID(),
          batchNumber,
          recipeId: data.recipeId,
          plannedQuantity,
          actualQuantity: 0,
          status: PrismaProductionBatchStatus.PLANNED,
          startedAt: data.scheduledStartTime,
          totalInputCost: estimatedInputCost,
          unitCost: plannedQuantity > 0 ? estimatedInputCost / plannedQuantity : 0,
          notes: data.productionNotes,
          locationId: data.locationId,
          organizationId,
          createdById,
          updatedAt: new Date(),
        },
      })

      for (const ingredient of recipe.ingredients) {
        const requiredQuantity = toNumber(ingredient.quantity) * scalingFactor
        const unitCost = toNumber(ingredient.item?.costPrice)
        const inventoryLevel = await tx.inventoryLevel.update({
          where: {
            itemId_locationId: {
              itemId: ingredient.itemId,
              locationId: data.locationId,
            },
          },
          data: {
            quantityReserved: { increment: requiredQuantity },
            quantityAvailable: { decrement: requiredQuantity },
            lastTransactionAt: new Date(),
          },
        })

        await tx.inventoryTransaction.create({
          data: {
            id: randomUUID(),
            type: TransactionType.RESERVATION,
            quantity: requiredQuantity,
            unitCost,
            totalCost: requiredQuantity * unitCost,
            itemId: ingredient.itemId,
            locationId: data.locationId,
            organizationId,
            createdById,
            referenceType: TransactionReferenceType.PRODUCTION_BATCH,
            referenceId: batch.id,
            referenceNumber: batchNumber,
            notes: `Reserved for production batch ${batchNumber}`,
            serialNumbers: [],
            balanceAfter: toNumber(inventoryLevel.quantityAvailable),
          },
        })
      }

      return tx.productionBatch.findUniqueOrThrow({
        where: { id: batch.id },
        include: batchInclude,
      })
    })

    revalidateProduction("batches")
    revalidateInventory()

    return {
      success: true,
      data: mapProductionBatch(result),
      message: `Production batch ${result.batchNumber} created successfully`,
    }
  } catch (error) {
    console.error("Error creating production batch:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create production batch",
    }
  }
}

export async function startProductionBatch(
  batchId: string,
  organizationId: string,
  userId: string,
): Promise<ActionResult<ProductionBatch>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const batch = await tx.productionBatch.findFirst({
        where: {
          id: batchId,
          organizationId,
        },
        include: batchInclude,
      })

      if (!batch) {
        throw new Error("Production batch not found")
      }

      if (batch.status !== PrismaProductionBatchStatus.PLANNED) {
        throw new Error(`Cannot start batch with status ${batch.status}`)
      }

      const scalingFactor =
        toNumber(batch.plannedQuantity) / (toNumber(batch.recipe?.outputQuantity) || 1)

      for (const ingredient of batch.recipe?.ingredients ?? []) {
        const usedQuantity = toNumber(ingredient.quantity) * scalingFactor
        const unitCost = toNumber(ingredient.item?.costPrice)
        const inventoryLevel = await tx.inventoryLevel.update({
          where: {
            itemId_locationId: {
              itemId: ingredient.itemId,
              locationId: batch.locationId,
            },
          },
          data: {
            quantityOnHand: { decrement: usedQuantity },
            quantityReserved: { decrement: usedQuantity },
            lastTransactionAt: new Date(),
          },
        })

        await tx.inventoryTransaction.create({
          data: {
            id: randomUUID(),
            type: TransactionType.PRODUCTION_OUT,
            quantity: -usedQuantity,
            unitCost,
            totalCost: -(usedQuantity * unitCost),
            itemId: ingredient.itemId,
            locationId: batch.locationId,
            organizationId,
            createdById: userId,
            referenceType: TransactionReferenceType.PRODUCTION_BATCH,
            referenceId: batchId,
            referenceNumber: batch.batchNumber,
            notes: `Consumed in production batch ${batch.batchNumber}`,
            serialNumbers: [],
            balanceAfter: toNumber(inventoryLevel.quantityOnHand),
          },
        })
      }

      await tx.productionBatch.update({
        where: { id: batchId },
        data: {
          status: PrismaProductionBatchStatus.IN_PROGRESS,
          startedAt: new Date(),
          updatedAt: new Date(),
        },
      })

      return tx.productionBatch.findUniqueOrThrow({
        where: { id: batchId },
        include: batchInclude,
      })
    })

    revalidateProduction("batches")
    revalidateInventory()

    return {
      success: true,
      data: mapProductionBatch(result),
      message: "Production batch started successfully",
    }
  } catch (error) {
    console.error("Error starting production batch:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to start production batch",
    }
  }
}

export async function completeProductionBatch(
  batchId: string,
  quantityProduced: number,
  qualityScore: number,
  notes: string,
  organizationId: string,
  userId: string,
): Promise<ActionResult<ProductionBatch>> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const batch = await tx.productionBatch.findFirst({
        where: {
          id: batchId,
          organizationId,
        },
        include: batchInclude,
      })

      if (!batch) {
        throw new Error("Production batch not found")
      }

      if (batch.status !== PrismaProductionBatchStatus.IN_PROGRESS) {
        throw new Error(`Cannot complete batch with status ${batch.status}`)
      }

      const totalInputCost = toNumber(batch.totalInputCost)
      const actualCostPerUnit = quantityProduced > 0 ? totalInputCost / quantityProduced : 0
      const outputItemId = batch.recipe?.outputItemId

      if (!outputItemId) {
        throw new Error("Recipe output item not found")
      }

      await tx.productionBatch.update({
        where: { id: batchId },
        data: {
          status: PrismaProductionBatchStatus.COMPLETED,
          actualQuantity: quantityProduced,
          completedAt: new Date(),
          unitCost: actualCostPerUnit,
          notes: [batch.notes, notes, `Quality score: ${qualityScore}`].filter(Boolean).join("\n"),
          updatedAt: new Date(),
        },
      })

      await tx.item.update({
        where: { id: outputItemId },
        data: {
          costPrice: actualCostPerUnit,
        },
      })

      const existingInventoryLevel = await tx.inventoryLevel.findFirst({
        where: {
          itemId: outputItemId,
          locationId: batch.locationId,
        },
      })

      const inventoryLevel = existingInventoryLevel
        ? await tx.inventoryLevel.update({
            where: { id: existingInventoryLevel.id },
            data: {
              quantityOnHand: { increment: quantityProduced },
              quantityAvailable: { increment: quantityProduced },
              averageCost: actualCostPerUnit,
              totalValue: { increment: actualCostPerUnit * quantityProduced },
              lastTransactionAt: new Date(),
            },
          })
        : await tx.inventoryLevel.create({
            data: {
              id: randomUUID(),
              itemId: outputItemId,
              locationId: batch.locationId,
              quantityOnHand: quantityProduced,
              quantityAvailable: quantityProduced,
              quantityReserved: 0,
              quantityInTransit: 0,
              quantityOnOrder: 0,
              reorderPoint: 0,
              averageCost: actualCostPerUnit,
              totalValue: actualCostPerUnit * quantityProduced,
              lastTransactionAt: new Date(),
              updatedAt: new Date(),
            },
          })

      await tx.inventoryTransaction.create({
        data: {
          id: randomUUID(),
          type: TransactionType.PRODUCTION_IN,
          quantity: quantityProduced,
          unitCost: actualCostPerUnit,
          totalCost: actualCostPerUnit * quantityProduced,
          itemId: outputItemId,
          locationId: batch.locationId,
          organizationId,
          createdById: userId,
          referenceType: TransactionReferenceType.PRODUCTION_BATCH,
          referenceId: batchId,
          referenceNumber: batch.batchNumber,
          notes: `Produced from batch ${batch.batchNumber}`,
          serialNumbers: [],
          balanceAfter: toNumber(inventoryLevel.quantityOnHand),
        },
      })

      return tx.productionBatch.findUniqueOrThrow({
        where: { id: batchId },
        include: batchInclude,
      })
    })

    revalidateProduction("batches")
    revalidateInventory()

    return {
      success: true,
      data: mapProductionBatch(result),
      message: "Production batch completed successfully",
    }
  } catch (error) {
    console.error("Error completing production batch:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to complete production batch",
    }
  }
}

export async function getProductionBatches(
  organizationId: string,
  filters?: ProductionFilters,
): Promise<ActionResult<ProductionBatch[]>> {
  try {
    const where: NonNullable<
      Parameters<typeof prisma.productionBatch.findMany>[0]
    >["where"] = {
      organizationId,
      deletedAt: null,
    }

    if (filters?.status?.length) {
      const statuses = filters.status.flatMap((status) => {
        switch (status) {
          case ProductionStatus.IN_PROGRESS:
            return [PrismaProductionBatchStatus.IN_PROGRESS]
          case ProductionStatus.COMPLETED:
            return [PrismaProductionBatchStatus.COMPLETED]
          case ProductionStatus.CANCELLED:
            return [PrismaProductionBatchStatus.CANCELLED, PrismaProductionBatchStatus.VOIDED]
          case ProductionStatus.QUALITY_CHECK:
            return [PrismaProductionBatchStatus.IN_PROGRESS]
          default:
            return [PrismaProductionBatchStatus.PLANNED]
        }
      })
      where.status = { in: statuses }
    }

    if (filters?.recipeId) {
      where.recipeId = filters.recipeId
    }

    if (filters?.locationId) {
      where.locationId = filters.locationId
    }

    if (filters?.dateFrom || filters?.dateTo) {
      where.startedAt = {}
      if (filters.dateFrom) where.startedAt.gte = filters.dateFrom
      if (filters.dateTo) where.startedAt.lte = filters.dateTo
    }

    if (filters?.searchTerm) {
      where.OR = [
        { batchNumber: { contains: filters.searchTerm, mode: "insensitive" } },
        { recipe: { nameEn: { contains: filters.searchTerm, mode: "insensitive" } } },
        { recipe: { nameFr: { contains: filters.searchTerm, mode: "insensitive" } } },
      ]
    }

    const batches = await prisma.productionBatch.findMany({
      where,
      include: batchInclude,
      orderBy: {
        startedAt: "desc",
      },
    })

    return {
      success: true,
      data: batches.map(mapProductionBatch),
    }
  } catch (error) {
    console.error("Error fetching production batches:", error)
    return {
      success: false,
      error: "Failed to fetch production batches",
    }
  }
}

export async function getProductionAnalytics(
  organizationId: string,
  dateFrom?: Date,
  dateTo?: Date,
): Promise<ActionResult<ProductionAnalytics>> {
  try {
    const where: NonNullable<
      Parameters<typeof prisma.productionBatch.findMany>[0]
    >["where"] = {
      organizationId,
      deletedAt: null,
    }

    if (dateFrom || dateTo) {
      where.startedAt = {}
      if (dateFrom) where.startedAt.gte = dateFrom
      if (dateTo) where.startedAt.lte = dateTo
    }

    const [batchRecords, recipes] = await Promise.all([
      prisma.productionBatch.findMany({
        where,
        include: batchInclude,
      }),
      prisma.recipe.findMany({
        where: {
          organizationId,
          deletedAt: null,
        },
        include: recipeInclude,
      }),
    ])

    const batches = batchRecords.map(mapProductionBatch)
    const completedBatches = batches.filter((batch) => batch.status === ProductionStatus.COMPLETED)
    const totalBatches = batches.length
    const totalUnitsProduced = batches.reduce((sum, batch) => sum + batch.quantityProduced, 0)
    const totalCosts = batches.reduce((sum, batch) => sum + batch.totalCost, 0)
    const totalRevenue = batches.reduce(
      (sum, batch) => sum + batch.quantityProduced * (batch.recipe?.suggestedSellingPrice ?? 0),
      0,
    )
    const grossProfit = totalRevenue - totalCosts
    const grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0

    const recipePerformance: RecipePerformance[] = recipes.map((recipe) => {
      const recipeBatches = batches.filter((batch) => batch.recipeId === recipe.id)
      const totalUnits = recipeBatches.reduce((sum, batch) => sum + batch.quantityProduced, 0)
      const totalCost = recipeBatches.reduce((sum, batch) => sum + batch.totalCost, 0)
      const revenue = recipeBatches.reduce(
        (sum, batch) => sum + batch.quantityProduced * (batch.recipe?.suggestedSellingPrice ?? 0),
        0,
      )
      const profitability = revenue - totalCost

      return {
        recipeId: recipe.id,
        recipeName: recipe.nameEn,
        batchesProduced: recipeBatches.length,
        totalUnitsProduced: totalUnits,
        totalCost,
        averageCostPerUnit: totalUnits > 0 ? totalCost / totalUnits : 0,
        averageYield:
          recipeBatches.length > 0
            ? recipeBatches.reduce((sum, batch) => sum + batch.yieldPercentage, 0) /
              recipeBatches.length
            : 0,
        averageQualityScore: 0,
        profitability,
        marginPercentage: revenue > 0 ? (profitability / revenue) * 100 : 0,
      }
    })

    return {
      success: true,
      data: {
        totalBatches,
        totalUnitsProduced,
        totalCosts,
        totalRevenue,
        grossProfit,
        grossMargin,
        averageYieldPercentage:
          completedBatches.length > 0
            ? completedBatches.reduce((sum, batch) => sum + batch.yieldPercentage, 0) /
              completedBatches.length
            : 0,
        averageCostPerUnit: totalUnitsProduced > 0 ? totalCosts / totalUnitsProduced : 0,
        averageProductionTime: 0,
        capacityUtilization: 0,
        materialCostsTotal: totalCosts,
        laborCostsTotal: 0,
        overheadCostsTotal: 0,
        recipePerformance,
        totalWaste: 0,
        wastePercentage: 0,
        wasteByReason: [],
        averageQualityScore: 0,
        qualityDistribution: [],
      },
    }
  } catch (error) {
    console.error("Error fetching production analytics:", error)
    return {
      success: false,
      error: "Failed to fetch production analytics",
    }
  }
}
