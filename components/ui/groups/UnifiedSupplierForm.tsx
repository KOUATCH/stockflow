'use client'

import { Button } from '@/components/ui/button'
import { type Column, ConfirmationDialog, DataTable, TableActions } from '@/components/ui/data-table'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { useGetSuppliersHook } from '@/hooks/supplierHooks/newSupplierHooks/useGetSuppliersHook'
import { useCreateSupplierHook } from '@/hooks/supplierHooks/useCreateSupplierHook'
import { useDeleteSupplierHook } from '@/hooks/supplierHooks/useDeleteSupplierHook'
import { useUpdateSupplierHook } from '@/hooks/supplierHooks/useUpdateSupplierHook'
import { type CreateSupplierDTO, type SupplierDTO, type SupplierFilters, type UpdateSupplierDTO } from '@/types/supplier'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { Building2, ContactRound, DollarSign, Mail, MapPin, Phone, Save, User, UserCheck } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'
import { z } from 'zod'
import EntityForm2 from '../data-table/EntityForm2'

interface SupplierDetailProps {
  title: string
  editingId: string
  organizationId: string
  initialSupplierData: SupplierDTO[] | undefined
  initialTaxRateData: unknown[] // kept for API compatibility; not used in this form
}

// Enhanced form schema for both create and update
const supplierFormSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Supplier name is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  email: z
    .string()
    .email('Invalid email format')
    .optional()
    .or(z.literal('')),
  paymentTerms: z.number().min(0, 'Payment terms must be positive').optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  notes: z.string().optional(),
  isActive: z.boolean().default(true),
  organizationId: z.string().optional(),
})

// Individual section schemas
const basicInfoSchema = z.object({
  name: z.string().min(1, 'Supplier name is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
})
const contactInfoSchema = z.object({
  email: z.string().email('Invalid email format').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
})
const businessInfoSchema = z.object({
  paymentTerms: z.number().min(0, 'Payment terms must be positive').optional(),
  isActive: z.boolean().default(true),
  notes: z.string().optional(),
})

type SupplierFormValues = z.infer<typeof supplierFormSchema>
type BasicInfoValues = z.infer<typeof basicInfoSchema>
type ContactInfoValues = z.infer<typeof contactInfoSchema>
type BusinessInfoValues = z.infer<typeof businessInfoSchema>

export default function UnifiedSupplierForm({
  title,
  organizationId,
  editingId,
  initialSupplierData,
  initialTaxRateData,
}: SupplierDetailProps) {
  if (!organizationId) {
    throw new Error('Organization ID is required to fetch suppliers')
  }

  // Query filters for refetching after mutations
  const baseFilters: SupplierFilters = useMemo(
    () => ({ organizationId, page: 1, limit: 50, sortBy: 'createdAt', sortOrder: 'desc' }),
    [organizationId],
  )

  // Hooks
  const { refetch } = useGetSuppliersHook(baseFilters, { enabled: false })
  const createSupplierMutation = useCreateSupplierHook()
  const updateSupplierMutation = useUpdateSupplierHook()
  const deleteSupplierMutation = useDeleteSupplierHook()

  // State management
  const [formDialogOpen, setFormDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [supplierToEdit, setSupplierToEdit] = useState<SupplierDTO | null>(null)
  const [supplierToDelete, setSupplierToDelete] = useState<SupplierDTO | null>(null)
  const [isEditMode, setIsEditMode] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [sectionUpdating, setSectionUpdating] = useState<string | null>(null)

  // Ensure we have an array of suppliers
  const suppliersArray = Array.isArray(initialSupplierData) ? initialSupplierData : []

  // Form setup with default values
  const defaultValues: SupplierFormValues = {
    name: '',
    contactPerson: '',
    email: '',
    paymentTerms: 0,
    address: '',
    phone: '',
    notes: '',
    isActive: true,
    organizationId,
  }

  const form = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierFormSchema),
    defaultValues,
  })

  // Reset form to default values
  const resetFormToDefaults = useCallback(() => {
    form.reset(defaultValues)
    setSupplierToEdit(null)
    setIsEditMode(false)
    setActiveTab('basic')
  }, [form, defaultValues])

  // Handle form dialog close
  const handleFormDialogClose = (open: boolean) => {
    setFormDialogOpen(open)
    if (!open) {
      setTimeout(() => {
        resetFormToDefaults()
      }, 150)
    }
  }

  // Utility functions
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date
    return format(dateObj, 'MMM dd, yyyy')
  }

  // Export functionality
  const handleExport = useCallback((filteredSuppliers: SupplierDTO[]) => {
    try {
      const exportData = filteredSuppliers.map((supplier) => ({
        Name: supplier.name,
        Contact: supplier.contactPerson || '',
        Email: supplier.email || '',
        Phone: supplier.phone || '',
        Address: supplier.address || '',
        'Payment Terms': supplier.paymentTerms || 0,
        'Date Added': formatDate(supplier.createdAt),
        Status: supplier.isActive ? 'Active' : 'Inactive',
      }))
      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Suppliers')
      const fileName = `Suppliers_${format(new Date(), 'yyyy-MM-dd')}.xlsx`
      XLSX.writeFile(workbook, fileName)
      toast.success('Export successful', {
        description: `Suppliers exported to ${fileName}`,
      })
    } catch (error) {
      toast.error('Export failed', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  }, [])

  // Action handlers
  const handleAddClick = () => {
    setSupplierToEdit(null)
    setIsEditMode(false)
    resetFormToDefaults()
    setFormDialogOpen(true)
  }

  const handleEditClick = (supplier: SupplierDTO) => {
    setSupplierToEdit(supplier)
    setIsEditMode(true)
    form.reset({
      id: supplier.id,
      name: supplier.name,
      contactPerson: supplier.contactPerson || '',
      email: supplier.email || '',
      paymentTerms: supplier.paymentTerms || 0,
      address: supplier.address || '',
      phone: supplier.phone || '',
      notes: supplier.notes || '',
      isActive: supplier.isActive ?? true,
      organizationId: supplier.organizationId,
    })
    setFormDialogOpen(true)
  }

  const handleDeleteClick = (supplier: SupplierDTO) => {
    setSupplierToDelete(supplier)
    setDeleteDialogOpen(true)
  }

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  // Section-specific update handlers
  const updateBasicInfo = async (data: BasicInfoValues) => {
    if (!isEditMode || !supplierToEdit) return
    setSectionUpdating('basic')
    try {
      const validatedData = basicInfoSchema.parse(data)
      const payload: UpdateSupplierDTO = {
        id: supplierToEdit.id,
        organizationId,
        name: validatedData.name,
        contactPerson: validatedData.contactPerson,
      }
      await updateSupplierMutation.mutateAsync(payload)
      toast.success('Basic information updated successfully')
      await refetch()
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          form.setError(err.path[0] as keyof SupplierFormValues, {
            message: err.message,
          })
        })
        toast.error('Validation failed', {
          description: 'Please check the form fields and try again',
        })
      } else {
        toast.error('Failed to update basic information', {
          description: error instanceof Error ? error.message : 'Unknown error occurred',
        })
      }
    } finally {
      setSectionUpdating(null)
    }
  }

  const updateContactInfo = async (data: ContactInfoValues) => {
    if (!isEditMode || !supplierToEdit) return
    setSectionUpdating('contact')
    try {
      const validatedData = contactInfoSchema.parse(data)
      const payload: UpdateSupplierDTO = {
        id: supplierToEdit.id,
        organizationId,
        email: validatedData.email || null,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
      }
      await updateSupplierMutation.mutateAsync(payload)
      toast.success('Contact information updated successfully')
      await refetch()
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          form.setError(err.path[0] as keyof SupplierFormValues, {
            message: err.message,
          })
        })
        toast.error('Validation failed', {
          description: 'Please check the form fields and try again',
        })
      } else {
        toast.error('Failed to update contact information', {
          description: error instanceof Error ? error.message : 'Unknown error occurred',
        })
      }
    } finally {
      setSectionUpdating(null)
    }
  }

  const updateBusinessInfo = async (data: BusinessInfoValues) => {
    if (!isEditMode || !supplierToEdit) return
    setSectionUpdating('business')
    try {
      const validatedData = businessInfoSchema.parse(data)
      const payload: UpdateSupplierDTO = {
        id: supplierToEdit.id,
        organizationId,
        paymentTerms: typeof validatedData.paymentTerms === 'number' ? validatedData.paymentTerms : undefined,
        isActive: typeof validatedData.isActive === 'boolean' ? validatedData.isActive : undefined,
        notes: validatedData.notes ?? undefined,
      }
      await updateSupplierMutation.mutateAsync(payload)
      toast.success('Business information updated successfully')
      await refetch()
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          form.setError(err.path[0] as keyof SupplierFormValues, {
            message: err.message,
          })
        })
        toast.error('Validation failed', {
          description: 'Please check the form fields and try again',
        })
      } else {
        toast.error('Failed to update business information', {
          description: error instanceof Error ? error.message : 'Unknown error occurred',
        })
      }
    } finally {
      setSectionUpdating(null)
    }
  }

  // Create new supplier (full form submission)
  const createSupplier = async (data: SupplierFormValues) => {
    try {
      const payload: CreateSupplierDTO = {
        organizationId,
        name: data.name,
        contactPerson: data.contactPerson,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
        paymentTerms: typeof data.paymentTerms === 'number' ? data.paymentTerms : 0,
        notes: data.notes || null,
        isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
      }
      await createSupplierMutation.mutateAsync(payload)
      toast.success('Supplier created successfully')
      setFormDialogOpen(false)
      resetFormToDefaults()
      await refetch()
    } catch (error) {
      toast.error('Failed to create supplier', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    }
  }

  // Delete confirmation handler
  const handleDeleteSupplierConfirmation = async () => {
    if (!supplierToDelete) return
    try {
      await deleteSupplierMutation.mutateAsync({ id: supplierToDelete.id, organizationId })
      toast.success('Supplier deleted successfully')
      await refetch()
    } catch (error) {
      toast.error('Failed to delete supplier', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      })
    } finally {
      setDeleteDialogOpen(false)
      setSupplierToDelete(null)
    }
  }

  // Helper function to handle section updates with proper validation
  const handleSectionUpdate = async (
    section: 'basic' | 'contact' | 'business',
    getData: () => unknown,
    updateFn: (data: any) => Promise<void>,
  ) => {
    try {
      const data = getData()
      await updateFn(data)
    } catch (error) {
      console.error(`Error updating ${section}:`, error)
    }
  }

  // Unified form submission handler
  const handleFormSubmit = async (data: SupplierFormValues) => {
    if (isEditMode) return
    await createSupplier(data)
  }

  // Table columns configuration
  const columns: Column<SupplierDTO>[] = [
    {
      header: 'Name',
      accessorKey: 'name',
      cell: (row) => (
        <span className="font-medium">
          {row?.name ? (row.name.length > 20 ? `${row.name.substring(0, 20)}...` : row.name) : 'N/A'}
        </span>
      ),
    },
    {
      header: 'Contact Person',
      accessorKey: 'contactPerson',
      cell: (row) => <span>{row?.contactPerson || 'N/A'}</span>,
    },
    {
      header: 'Email',
      accessorKey: 'email',
      cell: (row) => <span className="text-sm text-muted-foreground">{row?.email || 'N/A'}</span>,
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
      cell: (row) => <span className="text-sm">{row?.phone || 'N/A'}</span>,
    },
    {
      header: 'Address',
      accessorKey: 'address',
      cell: (row) => {
        const address = row?.address || ''
        return <span className="text-sm">{address.length > 30 ? `${address.substring(0, 30)}...` : address || 'N/A'}</span>
      },
    },
    {
      header: 'Payment Terms',
      accessorKey: 'paymentTerms',
      cell: (row) => <span>{row?.paymentTerms ? `${row.paymentTerms} days` : 'N/A'}</span>,
    },
    {
      header: 'Status',
      accessorKey: 'isActive',
      cell: (row) => (
        <span
          className={`inline-flex px-2 py-1 text-xs rounded-full ${row?.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}
        >
          {row?.isActive ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      header: 'Date Added',
      accessorKey: 'createdAt',
      cell: (row) => <span className="text-sm text-muted-foreground">{formatDate(row.createdAt)}</span>,
    },
  ]

  // Subtitle generation
  const getSubtitle = useCallback((supplierCount: number) => {
    return `${supplierCount} ${supplierCount === 1 ? 'supplier' : 'suppliers'}`
  }, [])

  return (
    <>
      <DataTable<SupplierDTO>
        title="Suppliers Information"
        subtitle={getSubtitle(suppliersArray.length)}
        data={suppliersArray}
        columns={columns}
        keyField="id"
        onRefresh={handleRefresh}
        actions={{
          onAdd: handleAddClick,
          onExport: handleExport,
        }}
        filters={{
          searchFields: ['name', 'email', 'phone', 'contactPerson'],
          enableDateFilter: true,
          getItemDate: (supplier) => supplier.createdAt,
        }}
        renderRowActions={(supplier) => (
          <TableActions.RowActions
            onEdit={() => handleEditClick(supplier)}
            onDelete={() => handleDeleteClick(supplier)}
            isDeleting={deleteSupplierMutation.isPending && supplierToDelete?.id === supplier.id}
          />
        )}
      />

      {/* Tabbed Create/Update Supplier Form Dialog */}
      <EntityForm2
        open={formDialogOpen}
        onOpenChange={handleFormDialogClose}
        title={isEditMode ? 'Edit Supplier' : 'Add New Supplier'}
        form={form}
        size="xl"
        onSubmit={!isEditMode ? handleFormSubmit : undefined}
        // onSubmit={!isEditMode ? handleFormSubmit : ""}
        isSubmitting={createSupplierMutation.isPending}
        submitLabel={!isEditMode ? 'Create Supplier' : 'Edit Supplier'}
        hideSubmitButton={isEditMode}
      >
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic" className="flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                {'Basic Info'}
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex items-center gap-2">
                <ContactRound className="h-4 w-4" />
                {'Contact Info'}
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                {'Business Info'}
              </TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{'Supplier Name *'}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Enter supplier name" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>{'Enter supplier name'}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactPerson"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{'Contact Person *'}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input placeholder="Enter contact person" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>{"Enter supplier contact person's name"}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                {isEditMode && (
                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      onClick={() =>
                        handleSectionUpdate(
                          'basic',
                          () => ({
                            name: form.getValues('name'),
                            contactPerson: form.getValues('contactPerson'),
                          }),
                          updateBasicInfo,
                        )
                      }
                      disabled={sectionUpdating === 'basic' || updateSupplierMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {sectionUpdating === 'basic' ? 'Updating...' : 'Update Basic Info'}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Contact Information Tab */}
            <TabsContent value="contact" className="space-y-4">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{'Email'}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="email" placeholder="Enter email address" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>{"Enter supplier's contact email address"}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{'Phone'}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input type="tel" placeholder="Enter phone number" className="pl-10" {...field} />
                          </div>
                        </FormControl>
                        <FormDescription>{'Enter supplier contact phone number'}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{'Address'}</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input placeholder="Enter address" className="pl-10" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>{"Enter supplier's address"}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isEditMode && (
                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      onClick={() =>
                        handleSectionUpdate(
                          'contact',
                          () => ({
                            email: form.getValues('email'),
                            phone: form.getValues('phone'),
                            address: form.getValues('address'),
                          }),
                          updateContactInfo,
                        )
                      }
                      disabled={sectionUpdating === 'contact' || updateSupplierMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {sectionUpdating === 'contact' ? 'Updating...' : 'Update Contact Info'}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Business Information Tab */}
            <TabsContent value="business" className="space-y-4">
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="paymentTerms"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{'Payment Terms (Days)'}</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                              type="number"
                              placeholder="30"
                              className="pl-10"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value) || 0)}
                            />
                          </div>
                        </FormControl>
                        <FormDescription>{'Enter payment terms in days'}</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">{'Active Status'}</FormLabel>
                          <FormDescription>{'Enable or disable this supplier'}</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{'Notes'}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter additional notes about the supplier"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>{'Enter additional notes about the supplier'}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {isEditMode && (
                  <div className="flex justify-end pt-4">
                    <Button
                      type="button"
                      onClick={() =>
                        handleSectionUpdate(
                          'business',
                          () => ({
                            paymentTerms: form.getValues('paymentTerms'),
                            isActive: form.getValues('isActive'),
                            notes: form.getValues('notes'),
                          }),
                          updateBusinessInfo,
                        )
                      }
                      disabled={sectionUpdating === 'business' || updateSupplierMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {sectionUpdating === 'business' ? 'Updating...' : 'Update Business Info'}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </EntityForm2 >

      {/* Delete Confirmation Dialog */}
      < ConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Supplier"
        description={
          supplierToDelete ? (
            <>
              {'Are you sure you want to delete '} <strong> {supplierToDelete.name}</strong>
              {supplierToDelete.email ? <> ({supplierToDelete.email})</> : null}
              {'? This action cannot be undone.'}
            </>
          ) : (
            'Are you sure you want to delete this supplier?'
          )
        }
        onConfirm={handleDeleteSupplierConfirmation}
        isConfirming={deleteSupplierMutation.isPending}
        confirmLabel="Delete"
        variant="destructive"
      />
    </>
  )
}
