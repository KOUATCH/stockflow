"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Archive, Download, FolderOpen, Layers, Package, Plus, RefreshCw, Search } from "lucide-react"

import { createEnhancedCategoriesColumns } from "@/_legacy-dashboard/dashboard/inventory/categories/enhanced-columns"
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
import { useDeleteCategory, useOrgCategories } from "@/hooks/useCategories"
import type { CategoryDTO } from "@/types/category"

interface EnhancedCategoriesManagementProps {
  data: CategoryDTO[]
  organizationId: string
  basePath?: string
}

function downloadCsv(categories: CategoryDTO[]) {
  const headers = ["Title EN", "Title FR", "Slug", "Status", "Hierarchy", "Items", "Created", "Updated"]
  const rows = categories.map((category) => [
    category.titleEn,
    category.titleFr ?? "",
    category.slug,
    category.isActive ? "Active" : "Inactive",
    category.parentId ? "Child" : "Root",
    String(category.itemCount ?? 0),
    new Date(category.createdAt).toISOString(),
    new Date(category.updatedAt).toISOString(),
  ])

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "categories.csv"
  link.click()
  URL.revokeObjectURL(url)
}

export default function EnhancedCategoriesManagement({
  data,
  organizationId,
  basePath = "/dashboard/inventory/categories",
}: EnhancedCategoriesManagementProps) {
  const [statusFilter, setStatusFilter] = useState("all")
  const [hierarchyFilter, setHierarchyFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryToArchive, setCategoryToArchive] = useState<CategoryDTO | null>(null)

  const categoriesQuery = useOrgCategories(organizationId, { initialData: data })
  const archiveCategory = useDeleteCategory()
  const categories = categoriesQuery.data ?? data

  const stats = useMemo(() => {
    const active = categories.filter((category) => category.isActive).length
    const inactive = categories.length - active
    const assignedItems = categories.reduce((total, category) => total + (category.itemCount ?? 0), 0)
    const bilingual = categories.filter((category) => Boolean(category.titleFr)).length
    const root = categories.filter((category) => !category.parentId).length

    return {
      total: categories.length,
      active,
      inactive,
      assignedItems,
      bilingual,
      root,
    }
  }, [categories])

  const filteredData = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()

    return categories.filter((category) => {
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && category.isActive) ||
        (statusFilter === "inactive" && !category.isActive)

      const matchesHierarchy =
        hierarchyFilter === "all" ||
        (hierarchyFilter === "root" && !category.parentId) ||
        (hierarchyFilter === "child" && Boolean(category.parentId))

      const matchesSearch =
        !query ||
        [category.titleEn, category.titleFr, category.slug, category.descriptionEn, category.descriptionFr]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))

      return matchesStatus && matchesHierarchy && matchesSearch
    })
  }, [categories, hierarchyFilter, searchTerm, statusFilter])

  const columns = useMemo(
    () =>
      createEnhancedCategoriesColumns({
        onArchive: setCategoryToArchive,
        basePath,
      }),
    [basePath],
  )

  async function confirmArchive() {
    if (!categoryToArchive) return

    await archiveCategory.mutateAsync(categoryToArchive.id)
    setCategoryToArchive(null)
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <FolderOpen className="h-4 w-4" />
              Total Categories
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
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Layers className="h-4 w-4" />
              Root Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground">{stats.root}</p>
            <p className="text-xs text-muted-foreground">{stats.bilingual} bilingual</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle>Category Management</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                Showing {filteredData.length} of {categories.length} categories
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => categoriesQuery.refetch()} disabled={categoriesQuery.isFetching}>
                <RefreshCw className={`mr-2 h-4 w-4 ${categoriesQuery.isFetching ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button variant="outline" size="sm" onClick={() => downloadCsv(filteredData)}>
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button asChild size="sm">
                <Link href={`${basePath}/create`}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Category
                </Link>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_180px_180px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search categories"
                className="pl-9"
              />
            </div>
            <Select value={hierarchyFilter} onValueChange={setHierarchyFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Hierarchy" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="root">Root</SelectItem>
                <SelectItem value="child">Child</SelectItem>
              </SelectContent>
            </Select>
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

          {(hierarchyFilter !== "all" || statusFilter !== "all" || searchTerm) && (
            <div className="flex flex-wrap items-center gap-2">
              {hierarchyFilter !== "all" ? <Badge variant="secondary">{hierarchyFilter}</Badge> : null}
              {statusFilter !== "all" ? <Badge variant="secondary">{statusFilter}</Badge> : null}
              {searchTerm ? <Badge variant="secondary">Search: {searchTerm}</Badge> : null}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setHierarchyFilter("all")
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
            searchPlaceholder="Search categories"
            showToolbar={false}
          />
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(categoryToArchive)} onOpenChange={(open) => !open && setCategoryToArchive(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Archive Category</AlertDialogTitle>
            <AlertDialogDescription>
              {categoryToArchive
                ? `${categoryToArchive.titleEn} will be hidden from active category lists. Existing item history will be preserved.`
                : "This category will be archived."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={archiveCategory.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive} disabled={archiveCategory.isPending}>
              {archiveCategory.isPending ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Archive className="mr-2 h-4 w-4" />}
              Archive
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
