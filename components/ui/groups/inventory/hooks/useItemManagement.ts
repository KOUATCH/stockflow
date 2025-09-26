"use client"

import { ItemWithInventoryLevelsPayload } from "@/types/itemTypes"
import { useCallback, useState } from "react"

export const useItemManagement = () => {
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [comprehensiveFormOpen, setComprehensiveFormOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToEdit, setItemToEdit] = useState<ItemWithInventoryLevelsPayload | null>(null)
  const [itemToDelete, setItemToDelete] = useState<ItemWithInventoryLevelsPayload | null>(null)

  const handleAddClick = useCallback(() => {
    setItemToEdit(null)
    setFormDialogOpen(true)
  }, [])

  const handleEditClick = useCallback((item: ItemWithInventoryLevelsPayload) => {
    setItemToEdit(item)
    setComprehensiveFormOpen(true)
  }, [])

  const handleDeleteClick = useCallback((item: ItemWithInventoryLevelsPayload) => {
    setItemToDelete(item)
    setDeleteDialogOpen(true)
  }, [])

  const resetFormToDefaults = useCallback(() => {
    setItemToEdit(null)
    setItemToDelete(null)
  }, [])

  return {
    formDialogOpen,
    setFormDialogOpen,
    comprehensiveFormOpen,
    setComprehensiveFormOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    itemToEdit,
    setItemToEdit,
    itemToDelete,
    setItemToDelete,
    handleAddClick,
    handleEditClick,
    handleDeleteClick,
    resetFormToDefaults,
  }
}
