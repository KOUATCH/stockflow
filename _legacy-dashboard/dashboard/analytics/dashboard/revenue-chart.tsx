"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"

const data = [
  { time: "00:00", revenue: 0, transactions: 0 },
  { time: "06:00", revenue: 1200, transactions: 45 },
  { time: "09:00", revenue: 3400, transactions: 120 },
  { time: "12:00", revenue: 5800, transactions: 200 },
  { time: "15:00", revenue: 4200, transactions: 150 },
  { time: "18:00", revenue: 6800, transactions: 250 },
  { time: "21:00", revenue: 3200, transactions: 100 },
  { time: "23:59", revenue: 1800, transactions: 60 },
]

export function RevenueChart() {
  return (
    <Card className="glass-effect border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold font-[family-name:var(--font-montserrat)]">Revenue Trends</CardTitle>
        <p className="text-sm text-muted-foreground">Hourly revenue and transaction volume</p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="time" className="text-xs" tick={{ fontSize: 12 }} />
              <YAxis className="text-xs" tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
