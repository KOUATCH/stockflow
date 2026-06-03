import { db } from "@/prisma/db"
import { TransactionType, type StockAdjustmentData } from "@/types/inventory"
import type { Decimal } from "@prisma/client/runtime/library"

const toN = (v: Decimal | number | string | null | undefined): number => {
  if (v === null || v === undefined) return 0
  if (typeof v === "number") return v
  if (typeof v === "string") return Number(v) || 0
  return Number(v.toString()) || 0
}

export type StockAdjustmentResult = {
  inventoryLevel: {
    id: string
    itemId: string
    locationId: string
    quantityOnHand: number
    quantityAvailable: number
    averageCost: number
    totalValue: number
  }
  transaction: { id: string; type: string; quantity: number; balanceAfter: number }
}

export async function adjustStock(
  orgId: string,
  userId: string,
  adjustments: StockAdjustmentData[],
): Promise<StockAdjustmentResult[]> {
  if (adjustments.length === 0) return []

  return db.$transaction(async (tx) => {
    // Bulk-read all current levels in one query (was 1 read per adjustment = N).
    const levelKeys = adjustments.map((a) => ({ itemId: a.itemId, locationId: a.locationId }))
    const currentLevels = await tx.inventoryLevel.findMany({
      where: { OR: levelKeys },
    })
    const levelByKey = new Map(currentLevels.map((l) => [`${l.itemId}::${l.locationId}`, l]))

    // Sanity: every adjustment must have a corresponding level
    for (const adj of adjustments) {
      if (!levelByKey.has(`${adj.itemId}::${adj.locationId}`)) {
        throw new Error(
          `No inventory level found for item ${adj.itemId} at location ${adj.locationId}`,
        )
      }
    }

    // Compute everything up front (pure functions), then commit in two bulks + per-row updates.
    type Plan = {
      levelId: string
      adjustment: StockAdjustmentData
      currentLevel: (typeof currentLevels)[number]
      unitCost: number
      newQtyOnHand: number
      newQtyAvailable: number
      newAverageCost: number
    }
    const plans: Plan[] = adjustments.map((adj) => {
      const level = levelByKey.get(`${adj.itemId}::${adj.locationId}`)!
      const newQtyOnHand = Math.max(0, toN(level.quantityOnHand) + adj.adjustmentQuantity)
      const newQtyAvailable = Math.max(0, newQtyOnHand - toN(level.quantityReserved))
      let newAverageCost = toN(level.averageCost)
      const unitCost = adj.unitCost ?? toN(level.averageCost)
      if (adj.adjustmentQuantity > 0 && adj.unitCost) {
        const currentValue = toN(level.averageCost) * toN(level.quantityOnHand)
        newAverageCost = (currentValue + adj.unitCost * adj.adjustmentQuantity) / newQtyOnHand
      }
      return {
        levelId: level.id,
        adjustment: adj,
        currentLevel: level,
        unitCost,
        newQtyOnHand,
        newQtyAvailable,
        newAverageCost,
      }
    })

    // Bulk-insert all transactions in a single round-trip (was 1 create per adjustment).
    // Uses createManyAndReturn so callers still see the created rows.
    const createdTxs = await tx.inventoryTransaction.createManyAndReturn({
      data: plans.map((p) => ({
        type: TransactionType.ADJUSTMENT_IN,
        quantity: p.adjustment.adjustmentQuantity,
        unitCost: p.unitCost,
        totalCost: p.unitCost * Math.abs(p.adjustment.adjustmentQuantity),
        notes: p.adjustment.notes ?? "Stock adjustment",
        itemId: p.adjustment.itemId,
        locationId: p.adjustment.locationId,
        organizationId: orgId,
        createdById: userId,
        batchNumber: p.adjustment.batchNumber,
        expiryDate: p.adjustment.expiryDate,
        serialNumbers: [],
        balanceAfter: p.newQtyOnHand,
      })),
    })

    // Match created transactions back to their plans by ordinal (createManyAndReturn
    // preserves input order on Postgres).
    const results: StockAdjustmentResult[] = []
    for (let i = 0; i < plans.length; i++) {
      const p = plans[i]
      const tx_ = createdTxs[i]
      if (!p || !tx_) continue

      const updatedLevel = await tx.inventoryLevel.update({
        where: { id: p.levelId },
        data: {
          quantityOnHand: p.newQtyOnHand,
          quantityAvailable: p.newQtyAvailable,
          averageCost: p.newAverageCost,
          totalValue: p.newAverageCost * p.newQtyOnHand,
          lastTransactionAt: new Date(),
        },
      })

      results.push({
        inventoryLevel: {
          id: updatedLevel.id,
          itemId: updatedLevel.itemId,
          locationId: updatedLevel.locationId,
          quantityOnHand: toN(updatedLevel.quantityOnHand),
          quantityAvailable: toN(updatedLevel.quantityAvailable),
          averageCost: toN(updatedLevel.averageCost),
          totalValue: toN(updatedLevel.totalValue),
        },
        transaction: {
          id: tx_.id,
          type: tx_.type,
          quantity: toN(tx_.quantity),
          balanceAfter: toN(tx_.balanceAfter),
        },
      })
    }

    return results
  })
}
