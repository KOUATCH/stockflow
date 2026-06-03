"use server"

// Import and re-export supplier actions as individual async functions
import {
  getSuppliers as _getSuppliers,
  getSupplier as _getSupplier,
  createSupplier as _createSupplier,
  updateSupplier as _updateSupplier,
  deleteSupplier as _deleteSupplier,
  setSupplierActive as _setSupplierActive,
  linkItemsToSupplier as _linkItemsToSupplier,
  unlinkItemFromSupplier as _unlinkItemFromSupplier,
  getSuppliersSummary as _getSuppliersSummary,
} from "@/actions/suppliers/supplierActions"

export async function getSuppliers(filters: any) {
  return await _getSuppliers(filters)
}

export async function getSupplier(id: string, organizationId?: string) {
  return await _getSupplier(id, organizationId)
}

export async function createSupplier(payload: any) {
  return await _createSupplier(payload)
}

export async function updateSupplier(payload: any) {
  return await _updateSupplier(payload)
}

export async function deleteSupplier(id: string, organizationId: string) {
  return await _deleteSupplier(id, organizationId)
}

export async function setSupplierActive(id: string, organizationId: string, isActive: boolean) {
  return await _setSupplierActive(id, organizationId, isActive)
}

export async function linkItemsToSupplier(payload: any) {
  return await _linkItemsToSupplier(payload)
}

export async function unlinkItemFromSupplier(payload: any) {
  return await _unlinkItemFromSupplier(payload)
}

export async function getSuppliersSummary(organizationId: string) {
  return await _getSuppliersSummary(organizationId)
}

// Additional action stubs that are being imported
export async function deleteItemSupplierLink({ id, organizationId }: { id: string; organizationId: string }) {
  // Implementation needed - this should delete an ItemSupplier link by ID
  throw new Error("deleteItemSupplierLink not implemented yet")
}

export async function getRecentPOItemsForSupplier({
  supplierId,
  organizationId,
  months,
  limit
}: {
  supplierId: string;
  organizationId: string;
  months: number;
  limit: number;
}) {
  // Implementation needed - this should get recent PO items for a supplier
  throw new Error("getRecentPOItemsForSupplier not implemented yet")
}

export async function searchItemsLite({
  organizationId,
  q,
  limit
}: {
  organizationId: string;
  q: string;
  limit: number;
}) {
  // Implementation needed - this should search items for linking to suppliers
  throw new Error("searchItemsLite not implemented yet")
}

export async function upsertItemSupplierBulk({
  supplierId,
  organizationId,
  rows
}: {
  supplierId: string;
  organizationId: string;
  rows: Array<any>;
}) {
  // Implementation needed - this should bulk upsert item supplier relationships
  throw new Error("upsertItemSupplierBulk not implemented yet")
}

export async function getSupplierItemLinks({
  supplierId,
  organizationId
}: {
  supplierId: string;
  organizationId: string;
}) {
  // Implementation needed - this should get all item links for a supplier
  throw new Error("getSupplierItemLinks not implemented yet")
}