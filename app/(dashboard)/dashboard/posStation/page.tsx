"use client"

import { CacheBuster } from "@/components/posStation/diagnostic/cache-buster"
import { InputTest } from "@/components/posStation/diagnostic/input-test"
import { PosStationForm } from "@/components/posStation/pos-station-form"
import { PosStationList } from "@/components/posStation/pos-station-list"
import { PosStationManagement } from "@/components/posStation/pos/pos-station-management"
import { PosStationWithSession } from "@/components/posStation/pos/pos-terminal-with-session"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePosStations } from "@/hooks/posStation/use-pos-terminals"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import { POSSessionStatus } from "@/lib/newPOSSession/types"
import { Activity, Bug, Database, Monitor, Settings, Terminal } from "lucide-react"
import { useClientAuth } from "@/hooks/useClientAuth"
import { useEffect, useMemo, useState } from "react"

export default function HomePage() {

  const [selectedLocationId, setSelectedLocationId] = useState<string>()
  const [selectedTerminalId, setSelectedTerminalId] = useState<string>()
  const [currentSession, setCurrentSession] = useState<{
    id: string
    sessionNumber: string
    status: POSSessionStatus
    startTime: Date
    openingBalance: number
    totalSales: number
    transactionCount: number
    cashTotal: number
    cardTotal: number
    digitalTotal: number
  } | null>(null)


  const { user, organizationId } = useClientAuth()
  const mockOrganizationId = organizationId || "org_123"

  const mockUserId = user?.id || "user_123"
  const mockUserName = user?.name || "John Doe"
  const orgId = organizationId || "org_123"

  // const { data: locations, isLoading: locationsLoading } = useLocationsByOrganization(orgId)
  const userId = user?.id
  const userName = user?.name


  const {
    data: terminalResponse,
    isLoading: terminalLoading,
    error: terminalError,
    refetch: refetchTerminals,
  } = usePosStations(orgId)

  const terminalData = terminalResponse?.data

  const {
    data: locationResponse,
    isLoading: locationsLoading,
    error: locationsError,
    refetch: refetchLocations,
  } = useOrgLocationsNew(orgId, { enabled: !!orgId })

  const locationsData = locationResponse?.data
  console.log(locationResponse)
  const locationName = locationsData?.find((loc) => loc.id === selectedLocationId)?.name || "Select Location"
  const organizationName = locationsData?.[0]?.organization?.name

  // Filter terminals based on selected location
  const availableTerminals = useMemo(() => {
    if (!terminalData || !selectedLocationId) {
      return terminalData || []
    }
    return terminalData.filter((terminal: any) => terminal.locationId === selectedLocationId)
  }, [terminalData, selectedLocationId])

  // Handle location change - reset terminal selection
  const handleLocationChange = (locationId: string) => {
    setSelectedLocationId(locationId)
    setSelectedTerminalId(undefined) // Reset terminal selection when location changes
  }


  // Auto-select first location and terminal on initial load
  useEffect(() => {
    if (locationsData && locationsData.length > 0 && !selectedLocationId) {
      const firstLocation = locationsData[0]
      setSelectedLocationId(firstLocation.id)
    }
  }, [locationsData, selectedLocationId])

  // Auto-select first available terminal when location changes or terminals load
  useEffect(() => {
    if (availableTerminals && availableTerminals.length > 0 && selectedLocationId && !selectedTerminalId) {
      setSelectedTerminalId(availableTerminals[0].id)
    }
  }, [availableTerminals, selectedLocationId, selectedTerminalId])






  return (
    <div className="container mx-auto py-8 space-y-8">

      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          POS Management System
        </h1>
        <p className="text-muted-foreground text-lg mt-2">
          Comprehensive point of sale terminal and session management
        </p>
      </div>

      <Tabs defaultValue="terminal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm shadow-sm">
          <TabsTrigger
            value="terminal"
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Terminal className="h-4 w-4" />
            POS Terminal
          </TabsTrigger>
          <TabsTrigger
            value="stations"
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Settings className="h-4 w-4" />
            Station Management
          </TabsTrigger>
          <TabsTrigger
            value="comprehensive"
            className="flex items-center gap-2 data-[state=active]:bg-green-600 data-[state=active]:text-white"
          >
            <Database className="h-4 w-4" />
            Station Admin
          </TabsTrigger>
          <TabsTrigger
            value="monitoring"
            className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
          >
            <Monitor className="h-4 w-4" />
            System Monitor
          </TabsTrigger>
          <TabsTrigger
            value="diagnostic"
            className="flex items-center gap-2 data-[state=active]:bg-red-600 data-[state=active]:text-white"
          >
            <Bug className="h-4 w-4" />
            Diagnostic
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terminal" className="space-y-6">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Active Terminal Session
                </span>
                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300">
                  Terminal: {selectedTerminalId}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PosStationWithSession
                organizationId={orgId}
                locationId={selectedLocationId ?? ""}
                terminalId={selectedTerminalId ?? ""}
                userId={userId ?? ""}
                userName={userName ?? ""}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stations" className="space-y-6">
          <PosStationForm />
          <div className="border-t pt-8">
            <PosStationList />
          </div>
        </TabsContent>

        <TabsContent value="comprehensive" className="space-y-6">
          <PosStationManagement />
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                System Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                <Monitor className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">System Monitoring</p>
                <p className="text-sm">Real-time monitoring dashboard coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostic" className="space-y-6">
          <CacheBuster />
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bug className="h-5 w-5" />
                Input Element Diagnostic
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This diagnostic test helps identify any issues with input elements that might cause void element
                  errors.
                </p>
                <InputTest />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
