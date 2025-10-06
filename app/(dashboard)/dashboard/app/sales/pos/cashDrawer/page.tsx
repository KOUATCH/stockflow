"use client"

import { CashDrawerDashboard } from "@/components/cashDrawer/cashDrawerDashboard"
// import { CashDrawerDashboard } from "@/components/cash-drawer/cash-drawer-dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import { useClientAuth } from "@/hooks/useClientAuth"
import { useState } from "react"

export default function CashDrawerPage() {
  const { session, status, user, organizationId, isAuthenticated, isLoading } = useClientAuth()
  const [selectedLocationId, setSelectedLocationId] = useState<string>("")

  const user = session?.user
  const organizationId = user?.organizationId || ""

  // Get locations for the organization
  const { data: locationsResult } = useOrgLocationsNew(organizationId)
  const locations = locationsResult?.data || []

  // Handle loading state
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Please wait while we load your session.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Auto-select first location if available and none selected
  if (locations.length > 0 && !selectedLocationId) {
    setSelectedLocationId(locations[0].id)
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>Please sign in to access the cash drawer system.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (locations.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>No Locations Found</CardTitle>
            <CardDescription>No locations are configured for your organization.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {locations.length > 1 && (
        <div className="mb-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg">Select Location</CardTitle>
              <CardDescription>Choose a location to manage cash drawers</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedLocationId} onValueChange={setSelectedLocationId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      )}

      {selectedLocationId && (
        <CashDrawerDashboard
          locationId={selectedLocationId}
          userId={user.id}
          sessionId={session} // Can be passed from POS session context
        />
      )}
    </div>
  )
}
