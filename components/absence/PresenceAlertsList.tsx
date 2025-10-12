"use client"

import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface PresenceAlertsListProps {
  userId?: string
  organizationId: string
  isManager: boolean
}

export function PresenceAlertsList({ userId, organizationId, isManager }: PresenceAlertsListProps) {
  // TODO: Fetch and display actual alerts from your API

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center py-8 text-gray-500">
          <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <p className="font-medium mb-2">No Alerts</p>
          <p className="text-sm">
            {isManager
              ? "All team members are compliant with attendance policies"
              : "You have no attendance alerts at this time"}
          </p>
          <p className="text-xs mt-4 text-gray-400">TODO: Implement alerts fetching and display</p>
        </div>
      </CardContent>
    </Card>
  )
}
