"use client"

import { notify } from "@/lib/notifications/notify"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DatePicker } from "@/components/ui/date-picker"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCreateTransfer } from "@/hooks/useTransferQueries"
import { useOrgLocationsNew } from "@/hooks/useAllLocationsQueries"
import { useOrgItemsNew } from "@/hooks/useAllItemQueries"
import { useInventory } from "@/hooks/useInventoryQueries"
import type { CreateTransferPayload, TransferPriority } from "@/types/inventoryMovementTypes"
import { ArrowRight, MapPin, Package, Plus, Search, Trash2, AlertTriangle, CheckCircle, X } from 'lucide-react'
import { useClientAuth } from "@/hooks/useClientAuth"
import { useState, useMemo } from "react"
interface CreateTransferModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  organizationId: string
}

interface TransferLineItem {
  id: string
  itemId: string
  itemName: string
  itemSku: string
  requestedQuantity: number
  availableQuantity: number
  notes?: string
}

export function CreateTransferModal({ open, onOpenChange, organizationId }: CreateTransferModalProps) {
  const { data: session } = useSession()
  const userId = user || ""

  const [fromLocationId, setFromLocationId] = useState("")
  const [toLocationId, setToLocationId] = useState("")
  const [priority, setPriority] = useState<TransferPriority>("NORMAL")
  const [notes, setNotes] = useState("")
  const [internalNotes, setInternalNotes] = useState("")
  const [requestedDate, setRequestedDate] = useState<Date | undefined>(undefined)
  
  const [lines, setLines] = useState<TransferLineItem[]>([])
  const [itemSearch, setItemSearch] = useState("")
  const [selectedItemId, setSelectedItemId] = useState("")
  const [quantity, setQuantity] = useState("")

  const createTransferMutation = useCreateTransfer()

  // Fetch data
  const { data: locationsResponse } = useOrgLocationsNew(organizationId, { enabled: !!organizationId })
  const { data: itemsResponse } = useOrgItemsNew(organizationId, { enabled: !!organizationId })
  const { data: inventoryResponse } = useInventory({
    organizationId,
    locationId: fromLocationId || undefined,
    limit: 1000,
  })

  const locations = locationsResponse?.data || []
  const items = itemsResponse?.data || []
  const inventory = inventoryResponse?.data || []

  // Filter available locations (exclude selected from/to)
  const availableFromLocations = locations.filter(loc => loc.id !== toLocationId)
  const availableToLocations = locations.filter(loc => loc.id !== fromLocationId)

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!itemSearch.trim()) return items.slice(0, 10)
    
    return items.filter(item => 
      item.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
      item.sku.toLowerCase().includes(itemSearch.toLowerCase())
    ).slice(0, 10)
  }, [items, itemSearch])

  // Get inventory for selected item at from location
  const selectedItemInventory = useMemo(() => {
    if (!selectedItemId || !fromLocationId) return null
    return inventory.find(inv => inv.itemId === selectedItemId && inv.locationId === fromLocationId)
  }, [selectedItemId, fromLocationId, inventory])

  const handleAddLine = () => {
    if (!selectedItemId || !quantity || Number(quantity) <= 0) {
      notify.error("Please select an item and enter a valid quantity")
      return
    }

    const item = items.find(i => i.id === selectedItemId)
    const availableQty = selectedItemInventory?.quantity || 0

    if (Number(quantity) > availableQty) {
      notify.error(`Insufficient inventory. Available: ${availableQty}`)
      return
    }

    // Check if item already exists in lines
    const existingLineIndex = lines.findIndex(line => line.itemId === selectedItemId)
    
    if (existingLineIndex >= 0) {
      // Update existing line
      const updatedLines = [...lines]
      updatedLines[existingLineIndex].requestedQuantity += Number(quantity)
      
      if (updatedLines[existingLineIndex].requestedQuantity > availableQty) {
        notify.error(`Total quantity exceeds available inventory. Available: ${availableQty}`)
        return
      }
      
      setLines(updatedLines)
    } else {
      // Add new line
      const newLine: TransferLineItem = {
        id: `temp-${Date.now()}`,
        itemId: selectedItemId,
        itemName: item?.name || "",
        itemSku: item?.sku || "",
        requestedQuantity: Number(quantity),
        availableQuantity: availableQty,
      }
      setLines([...lines, newLine])
    }

    // Reset form
    setSelectedItemId("")
    setQuantity("")
    setItemSearch("")
  }

  const handleRemoveLine = (lineId: string) => {
    setLines(lines.filter(line => line.id !== lineId))
  }

  const handleUpdateLineQuantity = (lineId: string, newQuantity: number) => {
    const line = lines.find(l => l.id === lineId)
    if (!line) return

    if (newQuantity > line.availableQuantity) {
      notify.error(`Quantity exceeds available inventory. Available: ${line.availableQuantity}`)
      return
    }

    setLines(lines.map(line => 
      line.id === lineId 
        ? { ...line, requestedQuantity: newQuantity }
        : line
    ))
  }

  const handleSubmit = async () => {
    if (!fromLocationId || !toLocationId) {
      notify.error("Please select both source and destination locations")
      return
    }

    if (lines.length === 0) {
      notify.error("Please add at least one item to transfer")
      return
    }

    const payload: CreateTransferPayload = {
      fromLocationId,
      toLocationId,
      priority,
      requestedDate: requestedDate || undefined,
      notes: notes.trim() || undefined,
      internalNotes: internalNotes.trim() || undefined,
      organizationId,
      createdById: userId,
      lines: lines.map(line => ({
        itemId: line.itemId,
        requestedQuantity: line.requestedQuantity,
        notes: line.notes,
      })),
    }

    try {
      await createTransferMutation.mutateAsync(payload)
      onOpenChange(false)
      // Reset form
      setFromLocationId("")
      setToLocationId("")
      setPriority("NORMAL")
      setNotes("")
      setInternalNotes("")
      setRequestedDate(undefined)
      setLines([])
    } catch (error) {
      // Error handled by mutation
    }
  }

  const totalItems = lines.reduce((sum, line) => sum + line.requestedQuantity, 0)
  const isValid = fromLocationId && toLocationId && lines.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Create Location Transfer
          </DialogTitle>
          <DialogDescription>
            Transfer inventory items between locations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Transfer Route */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transfer Route</CardTitle>
              <CardDescription>Select source and destination locations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fromLocation">From Location</Label>
                  <Select value={fromLocationId} onValueChange={setFromLocationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source location" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableFromLocations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{location.name}</div>
                              {location.address && (
                                <div className="text-sm text-muted-foreground">{location.address}</div>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="toLocation">To Location</Label>
                  <Select value={toLocationId} onValueChange={setToLocationId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select destination location" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableToLocations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{location.name}</div>
                              {location.address && (
                                <div className="text-sm text-muted-foreground">{location.address}</div>
                              )}
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Route Visualization */}
              {fromLocationId && toLocationId && (
                <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-2">
                        <MapPin className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="font-medium text-sm">
                        {locations.find(l => l.id === fromLocationId)?.name}
                      </div>
                    </div>
                    <ArrowRight className="h-8 w-8 text-muted-foreground" />
                    <div className="text-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-2">
                        <MapPin className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="font-medium text-sm">
                        {locations.find(l => l.id === toLocationId)?.name}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transfer Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Transfer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={(value) => setPriority(value as TransferPriority)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low Priority</SelectItem>
                      <SelectItem value="NORMAL">Normal Priority</SelectItem>
                      <SelectItem value="HIGH">High Priority</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="requestedDate">Requested Date</Label>
                  <DatePicker
                    date={requestedDate}
                    onDateChange={setRequestedDate}
                    placeholder="Select requested date"
                    minDate={new Date()}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  placeholder="Add any notes about this transfer..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="internalNotes">Internal Notes</Label>
                <Textarea
                  placeholder="Internal notes (not visible to all users)..."
                  value={internalNotes}
                  onChange={(e) => setInternalNotes(e.target.value)}
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Add Items */}
          {fromLocationId && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Add Items</CardTitle>
                <CardDescription>Search and add items to transfer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label>Search Items</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          placeholder="Search by name or SKU..."
                          value={itemSearch}
                          onChange={(e) => setItemSearch(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Select Item</Label>
                      <Select value={selectedItemId} onValueChange={setSelectedItemId}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose item" />
                        </SelectTrigger>
                        <SelectContent>
                          {filteredItems.map((item) => {
                            const itemInventory = inventory.find(inv => inv.itemId === item.id && inv.locationId === fromLocationId)
                            const available = itemInventory?.quantity || 0
                            
                            return (
                              <SelectItem key={item.id} value={item.id} disabled={available === 0}>
                                <div className="flex items-center justify-between w-full">
                                  <div>
                                    <div className="font-medium">{item.name}</div>
                                    <div className="text-sm text-muted-foreground">{item.sku}</div>
                                  </div>
                                  <Badge variant={available > 0 ? "secondary" : "destructive"}>
                                    {available} available
                                  </Badge>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        min="1"
                        max={selectedItemInventory?.quantity || 0}
                      />
                      {selectedItemInventory && (
                        <div className="text-sm text-muted-foreground">
                          Available: {selectedItemInventory.quantity}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>&nbsp;</Label>
                      <Button 
                        onClick={handleAddLine}
                        disabled={!selectedItemId || !quantity || Number(quantity) <= 0}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Transfer Lines */}
          {lines.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Items to Transfer</span>
                  <Badge variant="secondary">{lines.length} items, {totalItems} total qty</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {lines.map((line) => (
                    <div key={line.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{line.itemName}</div>
                        <div className="text-sm text-muted-foreground">{line.itemSku}</div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-sm text-muted-foreground">
                          Available: {line.availableQuantity}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Qty:</Label>
                          <Input
                            type="number"
                            value={line.requestedQuantity}
                            onChange={(e) => handleUpdateLineQuantity(line.id, Number(e.target.value))}
                            min="1"
                            max={line.availableQuantity}
                            className="w-20"
                          />
                        </div>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveLine(line.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!isValid || createTransferMutation.isPending}
            className="gap-2"
          >
            {createTransferMutation.isPending ? (
              <>Creating...</>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Create Transfer
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
