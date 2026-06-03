"use server"

// Import and re-export inventory functions as async wrapper functions
import {
  getInventoryTransactions as _getInventoryTransactions,
  createInventoryTransaction as _createInventoryTransaction,
  getInventoryLevels as _getInventoryLevels,
  createInventoryLevel as _createInventoryLevel,
  updateInventoryLevel as _updateInventoryLevel,
  deleteInventoryLevel as _deleteInventoryLevel,
  getItemsWithInventory as _getItemsWithInventory,
  getStockAdjustments as _getStockAdjustments,
  createStockAdjustment as _createStockAdjustment,
  updateStockAdjustment as _updateStockAdjustment,
  getStockTransfers as _getStockTransfers,
  createStockTransfer as _createStockTransfer,
  updateStockTransfer as _updateStockTransfer,
} from "@/actions/inventory/inventoryActions"

export async function getInventoryTransactions(params: any) {
  return await _getInventoryTransactions(params)
}

export async function createInventoryTransaction(data: any) {
  return await _createInventoryTransaction(data)
}

export async function getInventoryLevels(params: any) {
  return await _getInventoryLevels(params)
}

export async function createInventoryLevel(data: any) {
  return await _createInventoryLevel(data)
}

export async function updateInventoryLevel(id: string, data: any) {
  return await _updateInventoryLevel(id, data)
}

export async function deleteInventoryLevel(id: string) {
  return await _deleteInventoryLevel(id)
}

export async function getItemsWithInventory(params: any) {
  return await _getItemsWithInventory(params)
}

export async function getStockAdjustments(params: any) {
  return await _getStockAdjustments(params)
}

export async function createStockAdjustment(data: any) {
  return await _createStockAdjustment(data)
}

export async function updateStockAdjustment(id: string, data: any) {
  return await _updateStockAdjustment(id, data)
}

export async function getStockTransfers(params: any) {
  return await _getStockTransfers(params)
}

export async function createStockTransfer(data: any) {
  return await _createStockTransfer(data)
}

export async function updateStockTransfer(id: string, data: any) {
  return await _updateStockTransfer(id, data)
}