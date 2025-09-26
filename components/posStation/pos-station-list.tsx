"use client"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useDeletePosStation, useOrganizations, usePosStations } from "@/hooks/posStation/use-pos-stations"
import { Building2, Edit, Loader2, MapPin, Terminal, Trash2 } from "lucide-react"
import { useState } from "react"

export function PosStationList() {
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>("all")

  const { data: organizations } = useOrganizations()
  const { data: posStations, isLoading } = usePosStations(selectedOrganizationId || undefined)
  const deletePosStation = useDeletePosStation()

  const handleDelete = async (id: string) => {
    await deletePosStation.mutateAsync(id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">POS Stations</h2>
          <p className="text-muted-foreground">Manage your point-of-sale stations</p>
        </div>

        <Select value={selectedOrganizationId} onValueChange={setSelectedOrganizationId}>
          <SelectTrigger className="w-64">
            <SelectValue placeholder="Filter by organization" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Organizations</SelectItem>
            {organizations?.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {posStations?.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Terminal className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No POS stations found</h3>
            <p className="text-muted-foreground text-center">
              {selectedOrganizationId !== "all"
                ? "No stations found for the selected organization"
                : "Create your first POS station to get started"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {posStations?.map((station) => (
            <Card key={station.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{station.name}</CardTitle>
                    <CardDescription className="font-mono text-sm">{station.terminalNumber}</CardDescription>
                  </div>
                  <Badge variant={station.isActive ? "default" : "secondary"}>
                    {station.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span>{station.organization.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{station.location.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {station.hasCashDrawer ? "Cash Drawer" : "No Cash Drawer"}
                  </Badge>
                  {station.currentSession && (
                    <Badge variant="default" className="text-xs">
                      Session Active
                    </Badge>
                  )}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive hover:text-destructive bg-transparent"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete POS Station</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{station.name}"? This action cannot be undone. The station
                          must have no active sessions or sales orders.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(station.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
