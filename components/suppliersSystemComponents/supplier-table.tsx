"use client"

import { notify } from "@/lib/notifications/notify"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getLocaleFromPathname, localizePath } from "@/i18n/routing"
import { DEFAULT_LOCALE } from "@/types/bilingual"
import type { SupplierDTO, SupplierFilters } from "@/types/suppliersSystemTypes"
import { MoreVertical } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useTransition } from "react"

export function SupplierTable({
  rows,
  filters,
  onToggleActive,
  onDelete,
}: {
  rows: SupplierDTO[]
  filters: SupplierFilters
  onToggleActive: (id: string, isActive: boolean) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const pathname = usePathname()
  const locale = getLocaleFromPathname(pathname) ?? DEFAULT_LOCALE
  const localizedHref = (href: string) => localizePath(href, locale)
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const [isPending, startTransition] = useTransition()

  const toggleAll = (value: boolean) => {
    const next: Record<string, boolean> = {}
    for (const r of rows) next[r.id] = value
    setChecked(next)
  }

  const onToggle = (id: string, curr: boolean) => {
    startTransition(async () => {
      try {
        await onToggleActive(id, !curr)
        notify({ title: !curr ? "Activated" : "Deactivated", description: "Supplier status updated." })
      } catch (e: any) {
        notify({ title: "Update failed", description: e?.message || "Please try again.", variant: "destructive" })
      }
    })
  }

  const onRemove = (id: string) => {
    startTransition(async () => {
      try {
        await onDelete(id)
        notify({ title: "Deleted", description: "Supplier removed." })
      } catch (e: any) {
        notify({ title: "Delete failed", description: e?.message || "Please try again.", variant: "destructive" })
      }
    })
  }

  const allChecked = rows.length > 0 && rows.every((r) => checked[r.id])
  const someChecked = rows.some((r) => checked[r.id])

  return (
    <Card className="border shadow-sm">
      <CardContent className="p-0">
        <div className="flex items-center justify-between p-4">
          <div className="text-sm text-slate-600">{rows.length} results</div>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={someChecked && !allChecked ? "indeterminate" : allChecked}
                    onCheckedChange={(v) => toggleAll(Boolean(v))}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id} className="hover:bg-slate-50">
                  <TableCell>
                    <Checkbox
                      checked={!!checked[r.id]}
                      onCheckedChange={(v) => setChecked((c) => ({ ...c, [r.id]: Boolean(v) }))}
                      aria-label={`Select ${r.name}`}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <Link
                      href={localizedHref(`/dashboard/suppliers/${r.id}/edit?organizationId=${filters.organizationId}`)}
                      className="text-teal-700 hover:underline"
                    >
                      {r.name}
                    </Link>
                  </TableCell>
                  <TableCell>{r.code || "-"}</TableCell>
                  <TableCell>{r.contactPerson || "-"}</TableCell>
                  <TableCell>{r.email || "-"}</TableCell>
                  <TableCell>{r.phone || "-"}</TableCell>
                  <TableCell>
                    {r.isActive ? (
                      <Badge className="bg-emerald-600 hover:bg-emerald-700">Active</Badge>
                    ) : (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem asChild>
                          <Link href={localizedHref(`/dashboard/suppliers/${r.id}/edit?organizationId=${filters.organizationId}`)}>
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onToggle(r.id, r.isActive ?? false)}>
                          {r.isActive ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-rose-600" onClick={() => onRemove(r.id)}>
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-sm text-slate-500">
                    No suppliers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
