"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Archive, Download, Package, Plus, RefreshCw, Search, Tags } from "lucide-react"

import { createEnhancedBrandsColumns } from "@/_legacy-dashboard/dashboard/inventory/brands/enhanced-columns"
import DataTable from "@/components/DataTableComponents/DataTable"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useDeleteBrand, useOrgBrands } from "@/hooks/useBrands"
import type { BrandDTO } from "@/types/brand"

interface EnhancedBrandsManagementProps {
  data: BrandDTO[]
  organizationId: string
  basePath?: string
}

function downloadCsv(brands: BrandDTO[]) {
  const headers = ["Name EN", "Name FR", "Slug", "Status", "Items", "Created", "Updated"]
  const rows = brands.map((brand) => [
    brand.nameEn,
    brand.nameFr ?? "",
    brand.slug,
    brand.isActive ? "Active" : "Inactive",
    String(brand.itemCount ?? 0),
    new Date(brand.createdAt).toISOString(),
    new Date(brand.updatedAt).toISOString(),
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "brands.csv"
  link.click()
  URL.revokeObjectURL(url)
}

export default function EnhancedBrandsManagement({
  data,
  organizationId,
  basePath = "/dashboard/inventory/brands",
}: EnhancedBrandsManagementProps) {
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [brandToArchive, setBrandToArchive] = useState<BrandDTO | null>(null)

  const brandsQuery = useOrgBrands(organizationId, { initialData: data })
  const archiveBrand = useDeleteBrand()
  const brands = brandsQuery.data ?? data

  const stats = useMemo(() => {
    const active = brands.filter((brand) => brand.isActive).length
    const inactive = brands.length - active
    const assignedItems = brands.reduce((total, brand) => total + (brand.itemCount ?? 0), 0)
    const bilingual = brands.filter((brand) => Boolean(brand.nameFr)).length

    return {
      total: brands.length,
      active,
      inactive,
      assignedItems,
      bilingual,
    }
  }, [brands])

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return brands.filter((brand) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && brand.isActive) ||
        (statusFilter === "inactive" && !brand.isActive)

      const matchesSearch =
        !query ||
        [brand.nameEn, brand.nameFr, brand.slug, brand.descriptionEn, brand.descriptionFr]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))

      return matchesStatus && matchesSearch
    })
  }, [brands, searchTerm, statusFilter])

  const columns = useMemo(
    () =>
      createEnhancedBrandsColumns({
        onArchive: setBrandToArchive,
        basePath,
      }),
    [basePath],
  )

  async function confirmArchive() {
    if (!brandToArchive) return

    await archiveBrand.mutateAsync(brandToArchive.id)
    setBrandToArchive(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Tags className="h-4 w-4" />
              Total Brands
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Badge variant="secondary" className="h-4 w-4 rounded-full p-0" />
              Active
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.active}</p>
            <p className="text-xs text-muted-foreground">{stats.inactive} inactive</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Package className="h-4 w-4" />
              Assigned Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.assignedItems}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Bilingual Records</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.bilingual}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Brand Management</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing {filteredData.length} of {brands.length} brands
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => brandsQuery.refetch()} disabled={brandsQuery.isFetching}>
                <RefreshCw className={`mr-2 h-4 w-4 ${brandsQuery.isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadCsv(filteredData)}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button asChild size="sm">
                <Link href={`${basePath}/create`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Brand
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search brands"
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(statusFilter !== "all" || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2">
              {statusFilter !== "all" ? <Badge variant="secondary">{statusFilter}</Badge> : null}
              {searchTerm ? <Badge variant="secondary">Search: {searchTerm}</Badge> : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter("all")
                  setSearchTerm("")
                }}
              >
                Clear
              </Button>
            </div>
          )}

          <DataTable
            columns={columns}
            data={filteredData}
            searchPlaceholder="Search brands"
            showToolbar={false}
          />
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(brandToArchive)} onOpenChange={(open) => !open && setBrandToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Brand</AlertDialogTitle>
            <AlertDialogDescription>
              {brandToArchive
                ? `${brandToArchive.nameEn} will be hidden from active brand lists. Existing item history will be preserved.`
                : "This brand will be archived."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveBrand.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive} disabled={archiveBrand.isPending}>
              {archiveBrand.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
