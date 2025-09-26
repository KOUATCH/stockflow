"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Bar, BarChart } from "recharts"

export default function SupplierAnalytics({
  monthly,
  topItems,
}: {
  monthly: Record<string, { total: number; count: number }>
  topItems: Array<{ itemId: string; name: string; sku?: string; total: number }>
}) {
  const monthlyData = Object.entries(monthly)
    .sort(([a], [b]) => (a > b ? 1 : -1))
    .map(([month, v]) => ({ month, total: Number((v.total || 0).toFixed(2)), orders: v.count }))

  const topItemsData = topItems.map((t) => ({
    item: t.name || t.sku || t.itemId.slice(0, 6),
    total: Number((t.total || 0).toFixed(2)),
  }))

  return (
    <section className="grid gap-4 md:grid-cols-2">
      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Monthly Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              total: { label: "Total", color: "hsl(var(--chart-1))" },
            }}
            className="h-[280px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="total" stroke="var(--color-total)" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="border shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Top Items by Spend</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              total: { label: "Total", color: "hsl(var(--chart-2))" },
            }}
            className="h-[280px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topItemsData} margin={{ left: 10, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="item" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </section>
  )
}
