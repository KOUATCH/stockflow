"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Info, CheckCircle } from "lucide-react"

const alerts = [
  {
    type: "warning",
    message: "Low stock: Premium Coffee",
    time: "5 min ago",
    icon: AlertTriangle,
  },
  {
    type: "info",
    message: "Daily report ready",
    time: "1 hour ago",
    icon: Info,
  },
  {
    type: "success",
    message: "Cash drawer balanced",
    time: "2 hours ago",
    icon: CheckCircle,
  },
]

export function AlertsCard() {
  return (
    <Card className="glass-effect border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold font-[family-name:var(--font-montserrat)]">Alerts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {alerts.map((alert, index) => {
          const Icon = alert.icon
          const variant = alert.type === "warning" ? "destructive" : alert.type === "success" ? "default" : "secondary"

          return (
            <div key={index} className="flex items-start space-x-3 p-3 rounded-lg bg-muted/30">
              <Icon
                className={`h-4 w-4 mt-0.5 ${
                  alert.type === "warning"
                    ? "text-destructive"
                    : alert.type === "success"
                      ? "text-primary"
                      : "text-muted-foreground"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{alert.message}</p>
                <p className="text-xs text-muted-foreground">{alert.time}</p>
              </div>
              <Badge variant={variant} className="text-xs">
                {alert.type}
              </Badge>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
