"use client"
import { useNotifications } from "@/components/notifications/NotificationProvider"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useDeleteCustomer } from "@/hooks/useCustomerQueries"
import { Loader2, Trash2 } from "lucide-react"
import { useState } from "react"


interface DeleteCustomerDialogProps {
  customerId: string
  customerName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteCustomerDialog({ customerId, customerName, open, onOpenChange }: DeleteCustomerDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const deleteCustomer = useDeleteCustomer()
  const { formSuccess, formError, operationStart } = useNotifications()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteCustomer.mutateAsync(customerId)
      operationStart("Deleting Customer")
      formSuccess("Customer deleted", `${customerName} has been successfully deleted.`)
      onOpenChange(false)
    } catch (error) {
      formError("Error", "Failed to delete customer. Please try again.")

    } finally {
      setIsDeleting(false)

    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Delete Customer
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete <strong>{customerName}</strong>? This action cannot be undone and will
            permanently remove all customer data including order history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Customer
                </>
              )}
            </Button>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
