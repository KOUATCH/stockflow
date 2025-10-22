"use client"

import {
  createPosStation,
  deletePosStation
} from "@/actions/posSalesProcess/posActions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  useCashDrawer,
  useNotifications,
  usePOSStations
} from "@/hooks/posSalesProcess/usePOSHooks"
import {
  Activity,
  CheckCircle,
  DollarSign,
  Edit,
  Plus,
  Power,
  Terminal,
  Trash2,
  XCircle
} from "lucide-react"
import { useState } from "react"

interface POSStationManagementProps {
  organizationId: string
  userId: string
}

export function POSStationManagement({ organizationId, userId }: POSStationManagementProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedStationId, setSelectedStationId] = useState<string | null>(null)
  const [newStationData, setNewStationData] = useState({
    name: "",
    locationId: "",
    description: "",
    isActive: true
  })

  const { stations, loading, refreshStations } = usePOSStations(organizationId)
  const { success, error } = useNotifications()

  const handleCreateStation = async () => {
    try {
      const result = await createPosStation({
        ...newStationData,
        organizationId
      })

      if (result.success) {
        success("Station Created", `POS Station "${newStationData.name}" created successfully`)
        setIsCreateDialogOpen(false)
        setNewStationData({ name: "", locationId: "", description: "", isActive: true })
        refreshStations()
      } else {
        error("Creation Failed", result.error || "Failed to create POS station")
      }
    } catch (err) {
      error("Creation Failed", "An error occurred while creating the station")
    }
  }

  const handleDeleteStation = async (stationId: string, stationName: string) => {
    if (!confirm(`Are you sure you want to delete "${stationName}"? This action cannot be undone.`)) {
      return
    }

    try {
      const result = await deletePosStation(stationId)

      if (result.success) {
        success("Station Deleted", `POS Station "${stationName}" deleted successfully`)
        refreshStations()
      } else {
        error("Deletion Failed", result.error || "Failed to delete POS station")
      }
    } catch (err) {
      error("Deletion Failed", "An error occurred while deleting the station")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">POS Station Management</h2>
          <p className="text-muted-foreground">Manage your point-of-sale terminals and their configurations</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Station
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create New POS Station</DialogTitle>
              <DialogDescription>
                Add a new point-of-sale terminal to your system
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="stationName">Station Name</Label>
                <Input
                  id="stationName"
                  value={newStationData.name}
                  onChange={(e) => setNewStationData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Main Counter, Express Lane"
                />
              </div>
              <div>
                <Label htmlFor="locationId">Location</Label>
                <Select
                  value={newStationData.locationId}
                  onValueChange={(value) => setNewStationData(prev => ({ ...prev, locationId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="location1">Main Store</SelectItem>
                    <SelectItem value="location2">Branch Store</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  value={newStationData.description}
                  onChange={(e) => setNewStationData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of the station"
                />
              </div>
              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleCreateStation}
                  disabled={!newStationData.name || !newStationData.locationId}
                  className="flex-1"
                >
                  Create Station
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stations.map((station) => (
            <POSStationCard
              key={station.id}
              station={station}
              userId={userId}
              onDelete={() => handleDeleteStation(station.id, station.name)}
              onRefresh={refreshStations}
            />
          ))}
        </div>
      )}

      {!loading && stations.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <Terminal className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No POS Stations</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first POS station
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add First Station
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

interface POSStationCardProps {
  station: any
  userId: string
  onDelete: () => void
  onRefresh: () => void
}

function POSStationCard({ station, userId, onDelete, onRefresh }: POSStationCardProps) {
  const { status, loading: cashDrawerLoading, openDrawer, closeDrawer } = useCashDrawer(station.id)
  const { success, error } = useNotifications()
  const [openingBalance, setOpeningBalance] = useState("200.00")

  const handleOpenDrawer = async () => {
    const balance = parseFloat(openingBalance) || 200.0
    const result = await openDrawer(balance, userId)

    if (result.success) {
      success("Drawer Opened", result.message || "Cash drawer opened successfully")
      onRefresh()
    } else {
      error("Failed to Open", result.error || "Failed to open cash drawer")
    }
  }

  const handleCloseDrawer = async () => {
    const result = await closeDrawer(status.currentBalance, userId)

    if (result.success) {
      success("Drawer Closed", result.message || "Cash drawer closed successfully")
      onRefresh()
    } else {
      error("Failed to Close", result.error || "Failed to close cash drawer")
    }
  }

  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-5 w-5" />
              {station.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {station.stationNumber}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={station.isActive ? "default" : "secondary"}>
              {station.isActive ? "Active" : "Inactive"}
            </Badge>
            {station.currentSession && (
              <Badge variant="outline" className="text-green-600">
                <Activity className="h-3 w-3 mr-1" />
                Session Active
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Location:</span>
          <span className="text-sm text-muted-foreground">
            {station.location?.name || "Not assigned"}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Cash Drawer:</span>
          <div className="flex items-center gap-2">
            {status.isOpen ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <span className="text-sm text-muted-foreground">
              {status.isOpen ? "Open" : "Closed"}
            </span>
          </div>
        </div>

        {status.isOpen && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Balance:</span>
            <span className="text-sm font-semibold text-green-600">
              ${status.currentBalance.toFixed(2)}
            </span>
          </div>
        )}

        <div className="pt-4 space-y-2">
          {!status.isOpen ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={`balance-${station.id}`} className="text-xs">
                  Opening Balance:
                </Label>
                <Input
                  id={`balance-${station.id}`}
                  type="number"
                  step="0.01"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  className="h-7 text-xs"
                />
              </div>
              <Button
                onClick={handleOpenDrawer}
                disabled={cashDrawerLoading}
                size="sm"
                className="w-full"
              >
                <DollarSign className="h-4 w-4 mr-2" />
                Open Drawer
              </Button>
            </div>
          ) : (
            <Button
              onClick={handleCloseDrawer}
              disabled={cashDrawerLoading}
              variant="outline"
              size="sm"
              className="w-full"
            >
              <Power className="h-4 w-4 mr-2" />
              Close Drawer
            </Button>
          )}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button variant="outline" size="sm" className="flex-1">
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}