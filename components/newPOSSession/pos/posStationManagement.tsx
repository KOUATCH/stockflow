"use client"

import type React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  useCreatePosStation,
  useDeletePosStation,
  useLocationsByOrganization,
  useOrganizations,
  usePosStations,
  useUpdatePosStation,
} from "@/hooks/posStation/use-pos-station-management"
import type {
  CreatePosStationInput,
  PosStationWithRelations,
  UpdatePosStationInput,
} from "@/lib/validations/pos-station"
import {
  AlertCircle,
  CheckCircle,
  DollarSign,
  Edit,
  MapPin,
  Monitor,
  MoreHorizontal,
  Plus,
  Power,
  Search,
  Trash2,
  XCircle,
} from "lucide-react"
import { useState } from "react"

interface PosStationFormData {
  name: string
  isActive: boolean
  hasCashDrawer: boolean
  locationId: string
  organizationId: string
  terminalNumber: string
}

export function PosStationManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [organizationFilter, setOrganizationFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingStation, setEditingStation] = useState<PosStationWithRelations | null>(null)
  const [formData, setFormData] = useState<PosStationFormData>({
    name: "",
    isActive: true,
    hasCashDrawer: true,
    locationId: "",
    organizationId: "",
    terminalNumber: "",
  })

  // Queries
  const { data: stations = [], isLoading: stationsLoading } = usePosStations(
    organizationFilter !== "all" ? organizationFilter : undefined,
  )
  const { data: organizations = [] } = useOrganizations()
  const { data: locations = [] } = useLocationsByOrganization(formData.organizationId)

  // Mutations
  const createMutation = useCreatePosStation()
  const updateMutation = useUpdatePosStation()
  const deleteMutation = useDeletePosStation()

  // Filter stations
  const filteredStations = stations.filter((station) => {
    const matchesSearch =
      station.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.terminalNumber?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesOrganization = organizationFilter === "all" || station.organizationId === organizationFilter
    const matchesLocation = locationFilter === "all" || station.locationId === locationFilter
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && station.isActive) ||
      (statusFilter === "inactive" && !station.isActive) ||
      (statusFilter === "in-session" && station.currentSession) ||
      (statusFilter === "idle" && !station.currentSession)

    return matchesSearch && matchesOrganization && matchesLocation && matchesStatus
  })

  const getStationStatus = (station: PosStationWithRelations) => {
    if (!station.isActive) {
      return { label: "Inactive", variant: "secondary", icon: XCircle }
    }
    if (station.currentSession) {
      return { label: "In Session", variant: "default", icon: CheckCircle }
    }
    return { label: "Idle", variant: "outline", icon: AlertCircle }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (editingStation) {
      // Update existing station
      const updateData: UpdatePosStationInput = {
        id: editingStation.id,
        ...formData,
      }
      await updateMutation.mutateAsync(updateData)
      setIsEditDialogOpen(false)
      setEditingStation(null)
    } else {
      // Create new station
      const createData: CreatePosStationInput = formData
      await createMutation.mutateAsync(createData)
      setIsAddDialogOpen(false)
    }

    // Reset form
    setFormData({
      name: "",
      isActive: true,
      hasCashDrawer: true,
      locationId: "",
      organizationId: "",
      terminalNumber: "",
    })
  }

  const handleEdit = (station: PosStationWithRelations) => {
    setEditingStation(station)
    setFormData({
      name: station.name,
      isActive: station.isActive,
      hasCashDrawer: station.hasCashDrawer,
      locationId: station.locationId,
      organizationId: station.organizationId,
      terminalNumber: station.terminalNumber,
    })
    setIsEditDialogOpen(true)
  }

  const handleDelete = async (station: PosStationWithRelations) => {
    if (confirm(`Are you sure you want to delete "${station.name}"? This action cannot be undone.`)) {
      await deleteMutation.mutateAsync(station.id)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      isActive: true,
      hasCashDrawer: true,
      locationId: "",
      organizationId: "",
      terminalNumber: "",
    })
    setEditingStation(null)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">POS Station Management</h1>
          <p className="text-muted-foreground">Manage your point-of-sale terminals and stations</p>
        </div>
        <Dialog
          open={isAddDialogOpen}
          onOpenChange={(open) => {
            setIsAddDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              Add New Station
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New POS Station</DialogTitle>
              <DialogDescription>Create a new point-of-sale station for your location</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Station Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter station name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="organization">Organization</Label>
                  <Select
                    value={formData.organizationId}
                    onValueChange={(value) => setFormData({ ...formData, organizationId: value, locationId: "" })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map((org) => (
                        <SelectItem key={org.id} value={org.id}>
                          {org.name || "Unknown Organization"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Select
                  value={formData.locationId}
                  onValueChange={(value) => setFormData({ ...formData, locationId: value })}
                  disabled={!formData.organizationId}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location.id} value={location.id}>
                        {location.name || "Unknown Location"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="isActive">Station Active</Label>
                    <p className="text-sm text-muted-foreground">Enable this station for use</p>
                  </div>
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="hasCashDrawer">Cash Drawer</Label>
                    <p className="text-sm text-muted-foreground">Station has a cash drawer</p>
                  </div>
                  <Switch
                    id="hasCashDrawer"
                    checked={formData.hasCashDrawer}
                    onCheckedChange={(checked) => setFormData({ ...formData, hasCashDrawer: checked })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {createMutation.isPending ? "Creating..." : "Create Station"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit POS Station</DialogTitle>
            <DialogDescription>Update station information and settings</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Station Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter station name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-organization">Organization</Label>
                <Select
                  value={formData.organizationId}
                  onValueChange={(value) => setFormData({ ...formData, organizationId: value, locationId: "" })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select organization" />
                  </SelectTrigger>
                  <SelectContent>
                    {organizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name || "Unknown Organization"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-location">Location</Label>
              <Select
                value={formData.locationId}
                onValueChange={(value) => setFormData({ ...formData, locationId: value })}
                disabled={!formData.organizationId}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  {locations.map((location) => (
                    <SelectItem key={location.id} value={location.id}>
                      {location.name || "Unknown Location"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-isActive">Station Active</Label>
                  <p className="text-sm text-muted-foreground">Enable this station for use</p>
                </div>
                <Switch
                  id="edit-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="edit-hasCashDrawer">Cash Drawer</Label>
                  <p className="text-sm text-muted-foreground">Station has a cash drawer</p>
                </div>
                <Switch
                  id="edit-hasCashDrawer"
                  checked={formData.hasCashDrawer}
                  onCheckedChange={(checked) => setFormData({ ...formData, hasCashDrawer: checked })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {updateMutation.isPending ? "Updating..." : "Update Station"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Filters and Search */}
      <Card className="bg-card border-border">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search stations by name or terminal number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={organizationFilter} onValueChange={setOrganizationFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="All Organizations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Organizations</SelectItem>
                {organizations.map((org) => (
                  <SelectItem key={org.id} value={org.id}>
                    {org.name || "Unknown Organization"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-32">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="in-session">In Session</SelectItem>
                <SelectItem value="idle">Idle</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Stations Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">POS Stations ({filteredStations.length})</CardTitle>
          <CardDescription>Manage your point-of-sale terminals and stations</CardDescription>
        </CardHeader>
        <CardContent>
          {stationsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading stations...</div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Station</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Hardware</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Session</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStations.map((station) => {
                  const status = getStationStatus(station)
                  const StatusIcon = status.icon

                  return (
                    <TableRow key={station.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                            <Monitor className="h-5 w-5 text-muted-foreground" />
                          </div>
                          <div>
                            <div className="font-medium text-card-foreground">{station.name || "Unknown Station"}</div>
                            <div className="text-sm text-muted-foreground">#{station.terminalNumber || "N/A"}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium text-card-foreground">
                              {station.location?.name || "Unknown Location"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {station.organization?.name || "Unknown Organization"}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {station.hasCashDrawer && (
                            <Badge variant="outline" className="text-xs">
                              <DollarSign className="mr-1 h-3 w-3" />
                              Cash Drawer
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <StatusIcon className="h-4 w-4" />
                          <Badge variant={status.variant as any} className="text-xs">
                            {status.label}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {station.currentSession ? (
                          <div>
                            <div className="font-medium text-card-foreground">
                              {station.currentSession.sessionNumber || "N/A"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {station.currentSession.status || "Unknown"}
                            </div>
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">No active session</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEdit(station)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Station
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Power className="mr-2 h-4 w-4" />
                              {station.isActive ? "Deactivate" : "Activate"}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(station)}
                              disabled={!!station.currentSession}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete Station
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
