'use server'

import { db } from "@/prisma/db";
import { StockAdjustmentData, TransactionType } from "@/types/inventory";
import { revalidatePath } from "next/cache";

export async function adjustStock(adjustments: StockAdjustmentData[], organizationId: string, userId: string) {

  try {
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

        const newQuantityOnHand = Math.max(0, currentLevel.quantityOnHand + adjustmentQuantity);
        const newQuantityAvailable = Math.max(0, newQuantityOnHand - currentLevel.quantityReserved);
        
        // Calculate new average cost using weighted average
        let newAverageCost = currentLevel.averageCost;
        if (adjustmentQuantity > 0 && unitCost) {
          const totalCurrentValue = currentLevel.averageCost * currentLevel.quantityOnHand;
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
            type: TransactionType.ADJUSTMENT_IN,
            quantity: adjustmentQuantity,
            unitCost: unitCost || currentLevel.averageCost,
            totalCost: (unitCost || currentLevel.averageCost) * Math.abs(adjustmentQuantity),
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
        error: null,
      };
    });

    revalidatePath("/inventory/levels");
    revalidatePath("/inventory/transactions");
    return result;
  } catch (error) {
    console.error("Error adjusting stock:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      data: null,
    };
  }
}
