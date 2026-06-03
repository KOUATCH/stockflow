"use client"

import { notify } from "@/lib/notifications/notify"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { Download, Edit, MoreHorizontal, Plus, RefreshCw, Search, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useCallback, useEffect, useMemo, useState } from "react"
import { FormProvider, useForm } from "react-hook-form"
import * as XLSX from "xlsx"
import { z } from "zod"

// Mock types - replace with your actual types
interface BriefBrandPayload {
  id: string
  brandName: string
  slug: string
  createdAt: Date | string
  organizationId: string
}

interface BrandDetailProps {
  title: string
  editingId: string
  organizationId: string
  initialData?: BriefBrandPayload[]
}

// Form schema for editing/adding items
const itemFormSchema = z.object({
  id: z.string().optional(),
  brandName: z.string().min(1, "Name is required"),
  slug: z.string().optional(),
  createdAt: z.date().optional(),
  organizationId: z.string().optional(),
})

type BrandFormValues = z.infer<typeof itemFormSchema>

// // Mock data for demonstration
// const mockBrands: BriefBrandPayload[] = [
//   {
//     id: "1",
//     brandName: "Nike",
//     slug: "nike",
//     createdAt: new Date("2024-01-15"),
//     organizationId: "org1",
//   },
//   {
//     id: "2",
//     brandName: "Adidas",
//     slug: "adidas",
//     createdAt: new Date("2024-01-20"),
//     organizationId: "org1",
//   },
//   {
//     id: "3",
//     brandName: "Puma",
//     slug: "puma",
//     createdAt: new Date("2024-01-25"),
//     organizationId: "org1",
//   },
// ]

// Simple slug generation function
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

const NewDecentBrandForm = ({ title, organizationId, editingId, initialData }: BrandDetailProps) => {
  // Ensure organizationId is provided
  if (!organizationId) {
    throw new Error("Organization ID is required to fetch items")
  }

  console.log({ initialData })

  // Local state to simulate data fetching
  const [brands, setBrands] = useState<BriefBrandPayload[]>(initialData || [])
  const [isLoading, setIsLoading] = useState(false)

  // Local state
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToEdit, setBrandToEdit] = useState<BriefBrandPayload | null>(null)
  const [itemToDelete, setBrandToDelete] = useState<BriefBrandPayload | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  // Handle mounting to prevent hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  // Form for editing/adding items
  const form = useForm<BrandFormValues>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      brandName: "",
      slug: "",
      organizationId: "",
    },
  })

  // Function to reset form to default values
  const resetFormToDefaults = useCallback(() => {
    form.reset({
      brandName: "",
      slug: "",
      organizationId: organizationId,
    })
    setIsEditMode(false)
    setBrandToEdit(null)
  }, [form, organizationId])

  // Function to populate form with item data
  const populateFormWithBrand = useCallback(
    (item: BriefBrandPayload) => {
      const formData = {
        id: item.id,
        brandName: item.brandName || "",
        slug: item.slug || item.brandName?.toLowerCase().replace(/\s+/g, "-") || "",
        organizationId: organizationId,
      }

      form.reset(formData)
      setIsEditMode(true)
      setBrandToEdit(item)
    },
    [form, organizationId],
  )

  // Update form when dialog state changes
  useEffect(() => {
    if (!formDialogOpen) {
      return
    }

    if (!itemToEdit) {
      resetFormToDefaults()
    } else {
      populateFormWithBrand(itemToEdit)
    }
  }, [formDialogOpen, itemToEdit, resetFormToDefaults, populateFormWithBrand])

  // Handle form dialog close
  const handleFormDialogClose = (open: boolean) => {
    setFormDialogOpen(open)
    if (!open) {
      setTimeout(() => {
        resetFormToDefaults()
      }, 150)
    }
  }

  // Format date function - consistent formatting to prevent hydration issues
  const formatDate = useCallback(
    (date: Date | string) => {
      if (!mounted) return "" // Prevent hydration mismatch

      try {
        const dateObj = typeof date === "string" ? new Date(date) : date

        // Check if date is valid
        if (isNaN(dateObj.getTime())) {
          return "Invalid Date"
        }

        // Use UTC to ensure consistent formatting across server/client
        return format(dateObj, "MMM dd, yyyy")
      } catch (error) {
        return "Invalid Date"
      }
    },
    [mounted],
  )

  // Export to Excel - wrapped in useCallback to prevent recreation
  const handleExport = useCallback(
    (filteredBrands: BriefBrandPayload[]) => {
      if (!mounted) return

      try {
        // Prepare data for export
        const exportData = filteredBrands.map((item) => ({
          Name: item.brandName,
          Slug: item.slug,
          "Date Added": formatDate(item.createdAt),
        }))

        // Create workbook and worksheet
        const worksheet = XLSX.utils.json_to_sheet(exportData)
        const workbook = XLSX.utils.book_new()
        XLSX.utils.book_append_sheet(workbook, worksheet, "Brands")

        // Generate filename with current date
        const fileName = `Brands_${format(new Date(), "yyyy-MM-dd")}.xlsx`

        // Export to file
        XLSX.writeFile(workbook, fileName)

        notify.success("Export successful", {
          description: `Brands exported to ${fileName}`,
        })
      } catch (error) {
        notify.error("Export failed", {
          description: error instanceof Error ? error.message : "Unknown error occurred",
        })
      }
    },
    [formatDate, mounted],
  )

  // Handle add new click
  const handleAddClick = () => {
    setBrandToEdit(null)
    setIsEditMode(false)
    setFormDialogOpen(true)
  }

  const router = useRouter()

  // Handle edit click
  const handleEditClick = (item: BriefBrandPayload) => {
    console.log("Editing item:", item)
    setBrandToEdit(item)
    setIsEditMode(true)
    setFormDialogOpen(true)
  }

  // Handle delete click
  const handleDeleteClick = (item: BriefBrandPayload) => {
    setBrandToDelete(item)
    setDeleteDialogOpen(true)
  }

  // Handle refresh - simulate data refetch
  const handleRefresh = useCallback(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      // setBrands([...initialData])
      setIsLoading(false)
      notify.success("Data refreshed")
    }, 1000)
  }, [])

  // Generate consistent ID on client side only
  const generateClientId = useCallback(() => {
    if (typeof window === "undefined") {
      // Server-side: return a placeholder that will be replaced on client
      return "temp_id"
    }
    // Client-side: generate actual ID
    return `brand_${Date.now()}_${Math.floor(Math.random() * 1000)}`
  }, [])

  // Handle form submission (edit or add)
  const onSubmit = async (data: BrandFormValues) => {
    try {
      setIsLoading(true)

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      if (!isEditMode || !itemToEdit) {
        // Add new item
        const newBrandData: BriefBrandPayload = {
          id: generateClientId(),
          brandName: data.brandName,
          slug: generateSlug(data.brandName),
          organizationId: organizationId || "",
          createdAt: new Date(),
        }

        setBrands((prev) => [...prev, newBrandData])
        notify.success("Brand added successfully")
      } else {
        // Edit existing item
        const updateData: BriefBrandPayload = {
          id: itemToEdit.id,
          brandName: data.brandName,
          slug: data.slug ?? generateSlug(data.brandName),
          createdAt: itemToEdit.createdAt,
          organizationId: organizationId || "",
        }

        setBrands((prev) => prev.map((brand) => (brand.id === itemToEdit.id ? updateData : brand)))
        notify.success("Brand updated successfully")
      }

      setFormDialogOpen(false)
      resetFormToDefaults()
    } catch (error) {
      notify.error("An unexpected error occurred", {
        description: error instanceof Error ? error.message : "Unknown error",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter items based on search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return brands
    return brands.filter(
      (item) =>
        item.brandName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.slug?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }, [brands, searchTerm])

  // Handle delete confirmation
  const handleDeleteBrandConfirmation = async () => {
    if (itemToDelete) {
      try {
        setIsLoading(true)

        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        setBrands((prev) => prev.filter((brand) => brand.id !== itemToDelete.id))
        notify.success("Brand deleted successfully")
      } catch (error) {
        notify.error("Failed to delete item", {
          description: error instanceof Error ? error.message : "Unknown error occurred",
        })
      } finally {
        setIsLoading(false)
        setDeleteDialogOpen(false)
        setBrandToDelete(null)
      }
    }
  }

  // Don't render until mounted to prevent hydration mismatches
  if (!mounted) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{title}</CardTitle>
              <CardDescription>
                {filteredItems.length} {filteredItems.length === 1 ? "brand" : "brands"} | Sleak Modifications
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleExport(filteredItems)}>
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button size="sm" onClick={handleAddClick}>
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search */}
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Brand Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Date Added</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Loading...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredItems.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                      No brands found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.brandName.length > 20 ? `${item.brandName.substring(0, 20)}...` : item.brandName}
                      </TableCell>
                      <TableCell>{item.slug}</TableCell>
                      <TableCell>{formatDate(item.createdAt)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditClick(item)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteClick(item)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Brand Form Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={handleFormDialogClose}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Brand" : "Add New Brand"}</DialogTitle>
            <DialogDescription>
              {isEditMode ? "Make changes to the brand here." : "Add a new brand to your organization."}
            </DialogDescription>
          </DialogHeader>
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="brandName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand name *</FormLabel>
                    <FormControl>
                      <Input type="text" {...field} />
                    </FormControl>
                    <FormDescription>Enter the brand name</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setFormDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Add Brand"}
                </Button>
              </DialogFooter>
            </form>
          </FormProvider>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Brand</DialogTitle>
            <DialogDescription>
              {itemToDelete ? (
                <>
                  Are you sure you want to delete <strong>{itemToDelete.brandName}</strong> ({itemToDelete.slug})? This
                  action is irreversible.
                </>
              ) : (
                "Are you sure you want to delete this item?"
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBrandConfirmation} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default NewDecentBrandForm
