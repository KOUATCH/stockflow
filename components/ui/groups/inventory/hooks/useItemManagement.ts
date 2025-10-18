"use client"

import { ItemWithInventoryLevelsPayload } from "@/types/itemTypes"
import { useRouter } from "next/navigation"
import { useCallback, useState } from "react"

export const useItemManagement = () => {
  const router = useRouter()
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<ItemWithInventoryLevelsPayload | null>(null)

  const handleAddClick = useCallback(() => {
    setFormDialogOpen(true)
  }, [])

  const handleEditClick = useCallback((item: ItemWithInventoryLevelsPayload) => {
    router.push(`/dashboard/inventory/items/${item.id}/edit`)
  }, [router])

  const handleDeleteClick = useCallback((item: ItemWithInventoryLevelsPayload) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }, [])

  const resetFormToDefaults = useCallback(() => {
    setItemToDelete(null)
  }, [])

  return {
    formDialogOpen,
    setFormDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    itemToDelete,
    setItemToDelete,
    handleAddClick,
    handleEditClick,
    handleDeleteClick,
    resetFormToDefaults,
  }
}
