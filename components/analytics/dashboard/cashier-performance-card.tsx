"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Star } from "lucide-react"

const cashiers = [
  { name: "Sarah Johnson", sales: 2450, transactions: 89, score: 98, status: "online" },
  { name: "Mike Chen", sales: 2180, transactions: 76, score: 95, status: "online" },
  { name: "Emma Davis", sales: 1890, transactions: 65, score: 92, status: "break" },
  { name: "Alex Rodriguez", sales: 1650, transactions: 58, score: 88, status: "online" },
]

export function CashierPerformanceCard() {
  return (
    <Card className="glass-effect border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold font-[family-name:var(--font-montserrat)]">
          Cashier Performance
        </CardTitle>
        <p className="text-sm text-muted-foreground">Today's top performers</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {cashiers.map((cashier, index) => (
          <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {cashier.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium text-sm">{cashier.name}</p>
                <p className="text-xs text-muted-foreground">
                  ${cashier.sales} • {cashier.transactions} transactions
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-medium">{cashier.score}</span>
              </div>
              <Badge variant={cashier.status === "online" ? "default" : "secondary"} className="text-xs">
                {cashier.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
