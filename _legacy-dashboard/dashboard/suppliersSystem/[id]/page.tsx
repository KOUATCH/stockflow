import { getSupplierDetail, getSupplierItemLinks, getSupplierItemStats } from "@/actions/supplierSystemActions"
import SupplierAnalytics from "@/components/supplierSystem/supplier-analytics"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { notFound } from "next/navigation"

export default async function SupplierDetailPage({
  params,
  searchParams,
}: {
  params: { id: string }
  searchParams: Record<string, string | string[] | undefined>
}) {
  const organizationId = (searchParams.organizationId as string)
  const { id } = params

  const detail = await getSupplierDetail({ id, organizationId }).catch(() => null)
  if (!detail) notFound()

  const itemLinks = await getSupplierItemLinks({ supplierId: id, organizationId })
  const stats = await getSupplierItemStats({
    supplierId: id,
    organizationId,
    itemIds: itemLinks.map((l) => l.itemId),
  })

  return (
    <main className="container mx-auto max-w-7xl space-y-6 p-4">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{detail.supplier.name}</h1>
          <div className="mt-1 text-sm text-slate-600">
            {detail.supplier.code ? <span>Code: {detail.supplier.code} · </span> : null}
            {detail.supplier.email ? <span>Email: {detail.supplier.email} · </span> : null}
            {detail.supplier.city ? <span>City: {detail.supplier.city}</span> : null}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline">
            <Link href={`/dashboard/suppliers/${id}/edit?organizationId=${organizationId}`}>Edit</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/dashboard/suppliers?organizationId=${organizationId}`}>Back</Link>
          </Button>
        </div>
      </div>

      <SupplierAnalytics monthly={detail.analytics.monthly} topItems={detail.analytics.topItems} />

      <section className="grid gap-4 md:grid-cols-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Related Items</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-slate-50 text-left">
                  <th className="p-2">Item</th>
                  <th className="p-2">Preferred</th>
                  <th className="p-2">Lead Time</th>
                  <th className="p-2">MOQ</th>
                  <th className="p-2">Avg Unit Cost</th>
                  <th className="p-2">Last Purchase</th>
                </tr>
              </thead>
              <tbody>
                {itemLinks.map((l) => {
                  const s = stats[l.itemId]
                  return (
                    <tr key={l.id} className="border-b">
                      <td className="p-2">
                        {l.item?.name} <span className="text-slate-500">({l.item?.sku})</span>
                      </td>
                      <td className="p-2">{l.isPreferred ? "Yes" : "No"}</td>
                      <td className="p-2">{l.leadTimeDays ?? "-"}</td>
                      <td className="p-2">{l.minOrderQuantity ?? "-"}</td>
                      <td className="p-2">
                        {s?.avgUnitCost != null
                          ? `$${(s.avgUnitCost || 0).toFixed(2)}`
                          : l.unitCost != null
                            ? `$${l.unitCost?.toFixed(2)}`
                            : "-"}
                      </td>
                      <td className="p-2">{s?.lastOrderDate ? new Date(s.lastOrderDate).toString() : "-"}</td>
                    </tr>
                  )
                })}
                {itemLinks.length === 0 && (
                  <tr>
                    <td className="p-4 text-slate-500" colSpan={6}>
                      No related items.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </section>
    </main>
  )
}
