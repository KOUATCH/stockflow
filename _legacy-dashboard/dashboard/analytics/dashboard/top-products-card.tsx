"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

const topProducts = [
  { name: "Premium Coffee", sales: 245, revenue: 1225, trend: "+15%" },
  { name: "Breakfast Sandwich", sales: 189, revenue: 945, trend: "+8%" },
  { name: "Fresh Pastry", sales: 156, revenue: 624, trend: "+22%" },
  { name: "Iced Latte", sales: 134, revenue: 536, trend: "+5%" },
  { name: "Energy Drink", sales: 98, revenue: 294, trend: "-3%" },
]

export function TopProductsCard() {
  const maxSales = Math.max(...topProducts.map((p) => p.sales))

  return (
    <Card className="glass-effect border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold font-[family-name:var(--font-montserrat)]">Top Products</CardTitle>
        <p className="text-sm text-muted-foreground">Best performing items today</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {topProducts.map((product, index) => (
          <div key={index} className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">#{index + 1}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{product.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {product.sales} sold • ${product.revenue}
                  </p>
                </div>
              </div>
              <Badge variant={product.trend.startsWith("+") ? "default" : "destructive"} className="text-xs">
                {product.trend}
              </Badge>
            </div>
            <Progress value={(product.sales / maxSales) * 100} className="h-2" />
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
