"use server"

import { getAuthenticatedUser } from "@/config/useAuth";
import { db } from "@/prisma/db";

export async function receiveItems({
  purchaseOrderId,
  locationId,
  lines,
}: {
  purchaseOrderId: string
  locationId: string
  lines: { lineId: string; quantity: number }[]
}) {
  try {
    console.log("[v0] Starting receiveItems with:", { purchaseOrderId, lines })

    const currentUser = await getAuthenticatedUser()
    console.log("[v0] Current user:", currentUser)
    const receiptNumber = `GR-${Date.now()}`

    const result = await db.$transaction(async (tx) => {
      console.log("[v0] Creating goods receipt with receivedById:", currentUser?.id || null)

      // Create the goods receipt - receivedById can be null since it's optional
      const goodsReceipt = await tx.goodsReceipt.create({
        data: {
          receiptNumber,
          locationId:locationId,
          organizationId:currentUser.organizationId,
          receiptDate: new Date(),
          purchaseOrderId,
          receivedById: currentUser?.id || null, // Allow null for optional field
          status: "COMPLETED",
          notes: `Received ${lines.length} line item(s)`,
        },
      })

      console.log("[v0] Created goods receipt:", goodsReceipt)

      // Update purchase order lines with received quantities
      for (const line of lines) {
        console.log("[v0] Updating line:", line)
        await tx.purchaseOrderLine.update({
          where: { id: line.lineId },
          data: {
            receivedQuantity: {
              increment: line.quantity,
            },
          },
        })
      }

      return goodsReceipt
    })

    console.log("[v0] Transaction completed successfully")
    return { success: true, receipt: result }
  } catch (error: any) {
    console.error("[v0] Error receiving items:", error)

    if (error.code === "P2003") {
      const constraintName = error.meta?.constraint_name || error.meta?.field_name
      if (constraintName?.includes("receivedById")) {
        throw new Error(
          `Invalid user reference. Please ensure you have valid users in your database or run the system user creation script.`,
        )
      }
      throw new Error(`Database constraint violation: ${constraintName}. Please check your data references.`)
    }

    if (error.code === "P2025") {
      throw new Error("Purchase order or line items not found")
    }

    throw new Error(error.message || "Failed to receive items. Please try again.")
  }
}
