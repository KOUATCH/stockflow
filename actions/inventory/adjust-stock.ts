'use server'

import { db } from "@/prisma/db";
import { StockAdjustmentData, TransactionType } from "@/types/inventory";
import { revalidatePath } from "next/cache";
import { inventoryAction } from "@/lib/error-handling";
import type { ServerActionResult } from "@/lib/error-handling/types";

type DecimalLike = { toNumber?: () => number; toString: () => string } | number | string | null | undefined;

function toNumber(value: DecimalLike): number {
  if (value == null) return 0;
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value) || 0;
  if (typeof value.toNumber === "function") return value.toNumber();
  return Number(value.toString()) || 0;
}

export const adjustStock = inventoryAction(
  async ({
    adjustments,
    organizationId,
    userId
  }: {
    adjustments: StockAdjustmentData[]
    organizationId: string
    userId: string
  }): Promise<ServerActionResult<any>> => {
    const result = await db.$transaction(async (tx) => {
      const processedAdjustments = [];

      for (const adjustment of adjustments) {
        const {
          itemId,
          locationId,
          adjustmentQuantity,
          unitCost,
          notes,
          batchNumber,
          expiryDate,
        } = adjustment;

        // Get current inventory level
        const currentLevel = await tx.inventoryLevel.findUnique({
          where: {
            itemId_locationId: {
              itemId,
              locationId,
            },
          },
        });

        if (!currentLevel) {
          throw new Error(`No inventory level found for item ${itemId} at location ${locationId}`);
        }

        const currentQuantityOnHand = toNumber(currentLevel.quantityOnHand);
        const currentQuantityReserved = toNumber(currentLevel.quantityReserved);
        const currentAverageCost = toNumber(currentLevel.averageCost);
        const effectiveUnitCost = unitCost || currentAverageCost;
        const newQuantityOnHand = Math.max(0, currentQuantityOnHand + adjustmentQuantity);
        const newQuantityAvailable = Math.max(0, newQuantityOnHand - currentQuantityReserved);
        
        // Calculate new average cost using weighted average
        let newAverageCost = currentAverageCost;
        if (adjustmentQuantity > 0 && unitCost) {
          const totalCurrentValue = currentAverageCost * currentQuantityOnHand;
          const adjustmentValue = unitCost * adjustmentQuantity;
          newAverageCost = (totalCurrentValue + adjustmentValue) / newQuantityOnHand;
        }

        // Update inventory level
        const updatedLevel = await tx.inventoryLevel.update({
          where: {
            itemId_locationId: {
              itemId,
              locationId,
            },
          },
          data: {
            quantityOnHand: newQuantityOnHand,
            quantityAvailable: newQuantityAvailable,
            averageCost: newAverageCost,
            totalValue: newAverageCost * newQuantityOnHand,
            lastTransactionAt: new Date(),
          },
        });

        // Create inventory transaction
        const transaction = await tx.inventoryTransaction.create({
          data: {
            type: adjustmentQuantity >= 0 ? TransactionType.ADJUSTMENT_IN : TransactionType.ADJUSTMENT_OUT,
            quantity: adjustmentQuantity,
            unitCost: effectiveUnitCost,
            totalCost: effectiveUnitCost * Math.abs(adjustmentQuantity),
            notes: notes || `Stock adjustment`,
            itemId,
            locationId,
            organizationId: organizationId,
            createdById: userId,
            batchNumber,
            expiryDate,
            serialNumbers: [],
            balanceAfter: newQuantityOnHand,
          },
        });

        processedAdjustments.push({
          inventoryLevel: updatedLevel,
          transaction,
        });
      }

      return {
        success: true,
        data: processedAdjustments,
      };
    });

    revalidatePath("/inventory/levels");
    revalidatePath("/inventory/transactions");
    return result;
  },
  {
    actionName: 'adjustStock',
    component: 'StockAdjustmentForm',
    businessContext: {
      domain: 'inventory',
      operation: 'update',
      resourceType: 'stockAdjustment',
      criticalOperation: false
    }
  }
)
