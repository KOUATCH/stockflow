"use server"

import { revalidatePath, revalidateTag } from "next/cache"

import { requireOrg } from "@/services/_shared/require-org"
import {
  approvePurchaseOrder as approvePurchaseOrderService,
  cancelPurchaseOrder as cancelPurchaseOrderService,
  closePurchaseOrder as closePurchaseOrderService,
  getPurchaseOrderById,
  submitPurchaseOrder as submitPurchaseOrderService,
  updatePurchaseOrder as updatePurchaseOrderService,
} from "@/services/purchase-order/purchase-order.service"
import type { PurchaseOrderStatus, PurchaseOrderWithRelations } from "@/types/purchase-orders-system-types"

export interface PurchaseOrderDetails {
  id: string
  orderNumber: string
  orderDate: Date
  status: string
  paymentStatus: string
  priority: string
  expectedDelivery?: Date
  notes?: string
  supplier: {
    id: string
    name: string
    code?: string
    email?: string
    phone?: string
    address?: string
  }
  deliveryAddress: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  lines: Array<{
    id: string
    name: string
    sku: string
    description?: string
    category?: string
    brand?: string
    quantity: number
    receivedQuantity: number
    unitPrice: number
    lineTotal: number
    status: string
  }>
  financials: {
    subtotal: number
    tax: number
    total: number
  }
}

const toDate = (value?: string | Date | null) => (value ? new Date(value) : undefined)

const itemName = (item: any) => item?.name ?? item?.nameEn ?? item?.nameFr ?? item?.sku ?? "Unnamed item"

const toDetails = (purchaseOrder: PurchaseOrderWithRelations): PurchaseOrderDetails => ({
  id: purchaseOrder.id,
  orderNumber: purchaseOrder.orderNumber,
  orderDate: toDate(purchaseOrder.orderDate) ?? new Date(),
  status: purchaseOrder.status,
  paymentStatus: purchaseOrder.paymentTerms || "pending",
  priority: "medium",
  expectedDelivery: toDate(purchaseOrder.expectedDeliveryDate),
  notes: purchaseOrder.notes ?? undefined,
  supplier: {
    id: purchaseOrder.supplier?.id ?? "",
    name: purchaseOrder.supplier?.name ?? "Unknown supplier",
    code: purchaseOrder.supplier?.code ?? undefined,
    email: purchaseOrder.supplier?.email ?? undefined,
    phone: purchaseOrder.supplier?.phone ?? undefined,
    address: purchaseOrder.supplier?.address ?? undefined,
  },
  deliveryAddress: {
    street: purchaseOrder.location?.address ?? "",
    city: "",
    state: "",
    zipCode: "",
    country: "",
  },
  lines: purchaseOrder.lines.map((line) => ({
    id: line.id,
    name: itemName(line.item),
    sku: line.item?.sku ?? "",
    description: line.item?.descriptionEn ?? line.item?.descriptionFr ?? undefined,
    category: line.item?.category?.titleEn ?? line.item?.category?.titleFr ?? undefined,
    brand: line.item?.brand?.nameEn ?? line.item?.brand?.nameFr ?? undefined,
    quantity: line.orderedQuantity,
    receivedQuantity: line.receivedQuantity,
    unitPrice: line.unitCost,
    lineTotal: line.lineTotal,
    status:
      line.receivedQuantity >= line.orderedQuantity
        ? "received"
        : line.receivedQuantity > 0
          ? "partially_received"
          : "pending",
  })),
  financials: {
    subtotal: purchaseOrder.subtotal,
    tax: purchaseOrder.taxAmount,
    total: purchaseOrder.total,
  },
})

const normalizeQuantity = (quantity: number) => Math.max(1, Math.trunc(Number(quantity) || 1))

type ServiceOrderLine = {
  itemId: string
  quantity: number
  unitPrice: number
  taxRate: number
  discount: number
  notes?: string
}

const toOrderLines = (purchaseOrder: PurchaseOrderWithRelations): ServiceOrderLine[] =>
  purchaseOrder.lines.map((line) => ({
    itemId: line.itemId,
    quantity: normalizeQuantity(line.orderedQuantity),
    unitPrice: line.unitCost,
    taxRate: line.taxRate ?? 0,
    discount: line.discount ?? 0,
    notes: line.notes ?? undefined,
  }))

function revalidatePurchaseOrder(id: string) {
  revalidateTag("purchaseOrders")
  revalidatePath("/[locale]/dashboard/purchase-orders", "page")
  revalidatePath("/[locale]/dashboard/purchase-orders/[id]", "page")
  revalidatePath("/[locale]/dashboard/purchase-orders/[id]/edit", "page")
  revalidatePath(`/dashboard/purchase-orders/${id}`)
  revalidatePath(`/dashboard/purchase-orders/${id}/edit`)
}

async function applyStatusTransition(id: string, organizationId: string, userId: string, status: PurchaseOrderStatus) {
  if (status === "DRAFT") return
  if (status === "SUBMITTED") await submitPurchaseOrderService(id, organizationId)
  else if (status === "APPROVED") await approvePurchaseOrderService(id, organizationId, userId)
  else if (status === "CANCELLED") await cancelPurchaseOrderService(id, organizationId)
  else if (status === "COMPLETED") await closePurchaseOrderService(id, organizationId)
  else {
    throw new Error("Use the receiving workflow to move purchase orders into received statuses")
  }
}

export async function getPurchaseOrder(id: string): Promise<PurchaseOrderDetails | null> {
  const { orgId } = await requireOrg()
  const purchaseOrder = await getPurchaseOrderById(id, orgId)
  return purchaseOrder ? toDetails(purchaseOrder as PurchaseOrderWithRelations) : null
}

export async function updatePurchaseOrder(
  id: string,
  data: {
    orderNumber?: string
    status?: string
    priority?: string
    expectedDelivery?: Date
    notes?: string
    deliveryAddress?: {
      street?: string
      city?: string
      state?: string
      zipCode?: string
      country?: string
    }
    items?: Array<{
      itemId: string
      quantity: number
      unitPrice: number
      status: string
    }>
    subtotal?: number
    tax?: number
    taxRate?: number
    shippingCost?: number
    discount?: number
    discountPercentage?: number
    total?: number
  },
): Promise<boolean> {
  const { orgId, userId } = await requireOrg()

  const hasEditableFields =
    data.expectedDelivery !== undefined ||
    data.notes !== undefined ||
    data.shippingCost !== undefined ||
    data.items !== undefined

  if (hasEditableFields) {
    await updatePurchaseOrderService({
      id,
      organizationId: orgId,
      expectedDeliveryDate: data.expectedDelivery?.toISOString(),
      notes: data.notes,
      shippingCost: data.shippingCost,
      orderLines: data.items?.map((item) => ({
        itemId: item.itemId,
        quantity: normalizeQuantity(item.quantity),
        unitPrice: item.unitPrice,
        taxRate: data.taxRate ?? 0,
        discount: 0,
      })),
    })
  }

  if (data.status) {
    const current = await getPurchaseOrderById(id, orgId)
    if (current?.status !== data.status) {
      await applyStatusTransition(id, orgId, userId, data.status as PurchaseOrderStatus)
    }
  }

  revalidatePurchaseOrder(id)
  return true
}

export async function addItemToPurchaseOrder(
  orderId: string,
  itemId: string,
  quantity: number,
  unitPrice: number,
): Promise<boolean> {
  const { orgId } = await requireOrg()
  const purchaseOrder = (await getPurchaseOrderById(orderId, orgId)) as PurchaseOrderWithRelations
  const orderLines = toOrderLines(purchaseOrder)
  const existing = orderLines.find((line) => line.itemId === itemId)

  if (existing) {
    existing.quantity += normalizeQuantity(quantity)
    existing.unitPrice = unitPrice
  } else {
    orderLines.push({
      itemId,
      quantity: normalizeQuantity(quantity),
      unitPrice,
      taxRate: 0,
      discount: 0,
    })
  }

  await updatePurchaseOrderService({ id: orderId, organizationId: orgId, orderLines })
  revalidatePurchaseOrder(orderId)
  return true
}

export async function removeItemFromPurchaseOrder(orderId: string, itemId: string): Promise<boolean> {
  const { orgId } = await requireOrg()
  const purchaseOrder = (await getPurchaseOrderById(orderId, orgId)) as PurchaseOrderWithRelations
  const orderLines = toOrderLines(purchaseOrder).filter((line) => line.itemId !== itemId)

  await updatePurchaseOrderService({ id: orderId, organizationId: orgId, orderLines })
  revalidatePurchaseOrder(orderId)
  return true
}
