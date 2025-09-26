"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pencil, Plus, RefreshCw } from "lucide-react"
import { useEffect, useState } from "react"
import { useDebouncedCallback } from "use-debounce"
// import { useListItems } from "@/hooks/use-items"
import { useListItems } from "@/hooks/itemsHooks/useItemHooks"
import ItemCreateForm from "./item-create-form"

type Brand = { id: string; brandName: string }
type Category = { id: string; title: string }
type Unit = { id: string; name: string; abbreviation?: string | null }
type TaxRate = { id: string; taxRateName: string; rate: number }
type Location = { id: string; name: string }

export default function ItemsTableWithForm({
  organizationId,
  initialBrandData = [],
  initialUnitData = [],
  initialCategoryData = [],
  initialTaxRateData = [],
  initialLocations = [],
}: {
  organizationId: string
  initialBrandData?: Brand[]
  initialUnitData?: Unit[]
  initialCategoryData?: Category[]
  initialTaxRateData?: TaxRate[]
  initialLocations?: Location[]
}) {
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(20)

  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<"create" | "edit">("create")
  const [editingId, setEditingId] = useState<string | null>(null)

  const debouncedSetQuery = useDebouncedCallback((v: string) => {
    setPage(1)
    setQuery(v)
  }, 300)

  const { data, isLoading, refetch } = useListItems({
    organizationId,
    q: query,
    page,
    pageSize,
    sortBy: "createdAt",
    sortOrder: "desc",
  })

  const items = data?.data ?? []
  const total = data?.total ?? 0
  const totalPages = data?.totalPages ?? 1

  useEffect(() => {
    // When we close the dialog after create/edit, refresh the list lightly
    if (!open) {
      // slight delay to allow cache revalidation to finish
      const t = setTimeout(() => {
        refetch()
      }, 250)
      return () => clearTimeout(t)
    }
  }, [open, refetch])

  const openCreate = () => {
    setMode("create")
    setEditingId(null)
    setOpen(true)
  }

  const openEdit = (id: string) => {
    setMode("edit")
    setEditingId(id)
    setOpen(true)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle className="text-2xl">Items</CardTitle>
            <CardDescription>Manage products, pricing, and relationships.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4 mr-2" />
              New Item
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <Input
                placeholder="Search by name, SKU, barcode..."
                onChange={(e) => debouncedSetQuery(e.target.value)}
                aria-label="Search items"
              />
              <div className="ml-auto flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rows</span>
                <select
                  name="size"
                  className="h-9 rounded-md border bg-transparent px-2 text-sm"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    setPage(1)
                  }}
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-sm text-muted-foreground">
                        Loading items...
                      </TableCell>
                    </TableRow>
                  ) : items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10 text-sm text-muted-foreground">
                        No items found
                      </TableCell>
                    </TableRow>
                  ) : (
                    items.map((it) => (
                      <TableRow key={it.id}>
                        <TableCell className="font-medium">{it.name}</TableCell>
                        <TableCell className="text-muted-foreground">{it.sku}</TableCell>
                        <TableCell>${Number(it.sellingPrice ?? 0).toFixed(2)}</TableCell>
                        <TableCell>
                          {it.isActive ? (
                            <Badge variant="secondary">Active</Badge>
                          ) : (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="outline" onClick={() => openEdit(it.id)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Page {page} of {totalPages} • {total} total
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Create Item" : "Edit Item"}</DialogTitle>
          </DialogHeader>

          <ItemCreateForm
            organizationId={organizationId}
            initialBrandData={initialBrandData}
            initialUnitData={initialUnitData}
            initialCategoryData={initialCategoryData}
            initialTaxRateData={initialTaxRateData}
            initialLocations={initialLocations}
            mode={mode}
            itemId={editingId}
            onCreated={() => setOpen(false)}
            onUpdated={() => setOpen(false)}
            onClose={() => setOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
