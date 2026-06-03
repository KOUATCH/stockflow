"use client"

import { Card, CardContent } from "@/components/ui/card"
import { ArrowUpIcon, ArrowDownIcon, DollarSign, ShoppingCart, Users, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Mock data - replace with real data from your analytics functions
const stats = [
  {
    title: "Total Revenue",
    value: "$24,580",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    description: "vs last month",
  },
  {
    title: "Transactions",
    value: "1,247",
    change: "+8.2%",
    trend: "up",
    icon: ShoppingCart,
    description: "vs last month",
  },
  {
    title: "Active Cashiers",
    value: "12",
    change: "+2",
    trend: "up",
    icon: Users,
    description: "currently online",
  },
  {
    title: "Avg. Transaction",
    value: "$19.72",
    change: "-2.1%",
    trend: "down",
    icon: TrendingUp,
    description: "vs last month",
  },
]

export function DashboardStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 animate-fade-in">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        const isPositive = stat.trend === "up"

        return (
          <Card key={index} className="glass-effect border-0 hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold font-[family-name:var(--font-montserrat)]">{stat.value}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4">
                <Badge variant={isPositive ? "default" : "destructive"} className="text-xs">
                  {isPositive ? <ArrowUpIcon className="h-3 w-3 mr-1" /> : <ArrowDownIcon className="h-3 w-3 mr-1" />}
                  {stat.change}
                </Badge>
                <span className="text-xs text-muted-foreground">{stat.description}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
