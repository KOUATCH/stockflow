"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Banknote, Smartphone } from "lucide-react"

const transactions = [
  { id: "#1247", amount: 24.5, method: "card", time: "2 min ago", status: "completed" },
  { id: "#1246", amount: 15.75, method: "cash", time: "5 min ago", status: "completed" },
  { id: "#1245", amount: 32.0, method: "mobile", time: "8 min ago", status: "completed" },
  { id: "#1244", amount: 18.25, method: "card", time: "12 min ago", status: "completed" },
  { id: "#1243", amount: 45.8, method: "cash", time: "15 min ago", status: "refunded" },
]

const getPaymentIcon = (method: string) => {
  switch (method) {
    case "card":
      return CreditCard
    case "cash":
      return Banknote
    case "mobile":
      return Smartphone
    default:
      return CreditCard
  }
}

export function RecentTransactionsCard() {
  return (
    <Card className="glass-effect border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold font-[family-name:var(--font-montserrat)]">
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions.map((transaction, index) => {
          const Icon = getPaymentIcon(transaction.method)

          return (
            <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-sm">{transaction.id}</p>
                  <p className="text-xs text-muted-foreground">{transaction.time}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-sm">${transaction.amount}</p>
                <Badge variant={transaction.status === "completed" ? "default" : "destructive"} className="text-xs">
                  {transaction.status}
                </Badge>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
