"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, CalendarIcon, Clock, ChefHat, DollarSign, Factory, User } from 'lucide-react'
import { useNotifications } from '@/components/notifications/NotificationProvider'
import { createProductionBatch } from '@/actions/production/productionSystemActions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface Recipe {
  id: string
  name: string
  category: string
  yields: number
  yieldUnit: string
  totalCost: number
  costPerUnit: number
  suggestedSellingPrice: number
}

interface CreateBatchDialogProps {
  isOpen: boolean
  onClose: () => void
  recipes: Recipe[]
  organizationId: string
  currentUserId: string
}

export function CreateBatchDialog({
  isOpen,
  onClose,
  recipes,
  organizationId,
  currentUserId
}: CreateBatchDialogProps) {
  const notifications = useNotifications()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  const [formData, setFormData] = useState({
    recipeId: '',
    quantityToProduce: '',
    priority: 'MEDIUM',
    scheduledDate: '',
    scheduledTime: '',
    locationId: '', // This would come from locations
    assignedToId: '',
    supervisorId: '',
    productionNotes: ''
  })

  const handleRecipeSelect = (recipeId: string) => {
    const recipe = recipes.find(r => r.id === recipeId)
    setSelectedRecipe(recipe || null)
    setFormData(prev => ({ ...prev, recipeId }))
  }

  const calculateEstimatedCost = () => {
    if (!selectedRecipe || !formData.quantityToProduce) return 0
    const quantity = parseFloat(formData.quantityToProduce)
    const scalingFactor = quantity / selectedRecipe.yields
    return selectedRecipe.totalCost * scalingFactor
  }

  const calculateEstimatedRevenue = () => {
    if (!selectedRecipe || !formData.quantityToProduce) return 0
    const quantity = parseFloat(formData.quantityToProduce)
    return selectedRecipe.suggestedSellingPrice * quantity
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedRecipe) {
      notifications.error('Validation Error', 'Please select a recipe')
      return
    }

    if (!formData.quantityToProduce) {
      notifications.error('Validation Error', 'Please enter quantity to produce')
      return
    }

    setIsLoading(true)

    try {
      // Combine date and time
      const scheduledStartTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)

      // Estimate end time (add 8 hours as default)
      const scheduledEndTime = new Date(scheduledStartTime.getTime() + 8 * 60 * 60 * 1000)

      const batchData = {
        recipeId: formData.recipeId,
        quantityToProduce: parseFloat(formData.quantityToProduce),
        priority: formData.priority as 'HIGH' | 'MEDIUM' | 'LOW',
        scheduledStartTime,
        scheduledEndTime,
        locationId: 'default-location', // Placeholder - would be selected from locations
        assignedToId: formData.assignedToId || undefined,
        supervisorId: formData.supervisorId || undefined,
        productionNotes: formData.productionNotes
      }

      const result = await createProductionBatch(batchData, organizationId, currentUserId)

      if (result.success) {
        notifications.success('Success', result.message || 'Production batch created successfully')
        onClose()
        // Reset form
        setFormData({
          recipeId: '',
          quantityToProduce: '',
          priority: 'MEDIUM',
          scheduledDate: '',
          scheduledTime: '',
          locationId: '',
          assignedToId: '',
          supervisorId: '',
          productionNotes: ''
        })
        setSelectedRecipe(null)
        window.location.reload() // Refresh to show new batch
      } else {
        notifications.error('Error', result.error || 'Failed to create production batch')
      }
    } catch (error) {
      console.error('Error creating batch:', error)
      notifications.error('Error', 'Failed to create production batch')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-cyan-500/5 to-emerald-500/5 rounded-xl"></div>
        <DialogHeader className="relative z-10">
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl shadow-lg">
              <Factory className="h-6 w-6 text-white" />
            </div>
            Create Production Batch
          </DialogTitle>
          <DialogDescription className="text-slate-600 dark:text-slate-300 text-base font-medium">
            Schedule a new production batch for your bakery operations
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {/* Recipe Selection */}
          <div className="space-y-3">
            <Label htmlFor="recipe" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Recipe *</Label>
            <Select value={formData.recipeId} onValueChange={handleRecipeSelect}>
              <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-teal-200/50 dark:border-teal-700/50 focus:border-teal-400 dark:focus:border-teal-500 focus:ring-teal-400/20 rounded-xl">
                <SelectValue placeholder="Select a recipe" />
              </SelectTrigger>
              <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl">
                {recipes.map((recipe) => (
                  <SelectItem key={recipe.id} value={recipe.id} className="focus:bg-gradient-to-r focus:from-teal-50 focus:to-cyan-50 dark:focus:from-teal-900/30 dark:focus:to-cyan-900/30">
                    <div className="flex items-center space-x-2">
                      <ChefHat className="h-4 w-4 text-teal-600" />
                      <span>{recipe.name} - {recipe.category}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Recipe Details */}
          {selectedRecipe && (
            <Card className="relative overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-0 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/5 via-cyan-500/5 to-emerald-500/5"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg shadow-lg">
                    <ChefHat className="w-4 h-4 text-white" />
                  </div>
                  Recipe Details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6 relative z-10">
                <div className="p-3 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Standard Yield</Label>
                  <p className="font-bold text-teal-700 dark:text-teal-300 text-lg">{selectedRecipe.yields} {selectedRecipe.yieldUnit}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-cyan-900/20 dark:to-emerald-900/20 rounded-xl">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Cost per Unit</Label>
                  <p className="font-bold text-cyan-700 dark:text-cyan-300 text-lg">{formatCurrency(selectedRecipe.costPerUnit)}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-xl">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Total Cost (Standard)</Label>
                  <p className="font-bold text-emerald-700 dark:text-emerald-300 text-lg">{formatCurrency(selectedRecipe.totalCost)}</p>
                </div>
                <div className="p-3 bg-gradient-to-r from-teal-50 to-emerald-50 dark:from-teal-900/20 dark:to-emerald-900/20 rounded-xl">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Suggested Price</Label>
                  <p className="font-bold text-teal-700 dark:text-teal-300 text-lg">{formatCurrency(selectedRecipe.suggestedSellingPrice)}</p>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-2 gap-6">
            {/* Quantity */}
            <div className="space-y-3">
              <Label htmlFor="quantity" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Quantity to Produce *</Label>
              <Input
                id="quantity"
                type="number"
                placeholder="Enter quantity"
                value={formData.quantityToProduce}
                onChange={(e) => setFormData(prev => ({ ...prev, quantityToProduce: e.target.value }))}
                required
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-teal-200/50 dark:border-teal-700/50 focus:border-teal-400 dark:focus:border-teal-500 focus:ring-teal-400/20 rounded-xl"
              />
              {selectedRecipe && (
                <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                  Recipe yields {selectedRecipe.yields} {selectedRecipe.yieldUnit}
                </p>
              )}
            </div>

            {/* Priority */}
            <div className="space-y-3">
              <Label htmlFor="priority" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Priority</Label>
              <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-teal-200/50 dark:border-teal-700/50 focus:border-teal-400 dark:focus:border-teal-500 focus:ring-teal-400/20 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-0 shadow-2xl">
                  <SelectItem value="LOW" className="focus:bg-gradient-to-r focus:from-gray-50 focus:to-slate-50 dark:focus:from-gray-900/30 dark:focus:to-slate-900/30">Low</SelectItem>
                  <SelectItem value="MEDIUM" className="focus:bg-gradient-to-r focus:from-teal-50 focus:to-cyan-50 dark:focus:from-teal-900/30 dark:focus:to-cyan-900/30">Medium</SelectItem>
                  <SelectItem value="HIGH" className="focus:bg-gradient-to-r focus:from-orange-50 focus:to-red-50 dark:focus:from-orange-900/30 dark:focus:to-red-900/30">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Scheduled Date */}
            <div className="space-y-3">
              <Label htmlFor="date" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Scheduled Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.scheduledDate}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledDate: e.target.value }))}
                required
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-teal-200/50 dark:border-teal-700/50 focus:border-teal-400 dark:focus:border-teal-500 focus:ring-teal-400/20 rounded-xl"
              />
            </div>

            {/* Scheduled Time */}
            <div className="space-y-3">
              <Label htmlFor="time" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Scheduled Time *</Label>
              <Input
                id="time"
                type="time"
                value={formData.scheduledTime}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledTime: e.target.value }))}
                required
                className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-teal-200/50 dark:border-teal-700/50 focus:border-teal-400 dark:focus:border-teal-500 focus:ring-teal-400/20 rounded-xl"
              />
            </div>
          </div>

          {/* Cost Estimation */}
          {selectedRecipe && formData.quantityToProduce && (
            <Card className="relative overflow-hidden bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-0 shadow-lg">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-cyan-500/5"></div>
              <CardHeader className="relative z-10">
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg shadow-lg">
                    <DollarSign className="w-4 h-4 text-white" />
                  </div>
                  Cost Estimation
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-6 relative z-10">
                <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Estimated Cost</Label>
                  <p className="text-xl font-bold text-red-600 dark:text-red-400">{formatCurrency(calculateEstimatedCost())}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Estimated Revenue</Label>
                  <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(calculateEstimatedRevenue())}</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl">
                  <Label className="text-xs font-medium text-slate-600 dark:text-slate-400">Estimated Profit</Label>
                  <p className="text-xl font-bold text-teal-600 dark:text-teal-400">
                    {formatCurrency(calculateEstimatedRevenue() - calculateEstimatedCost())}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Production Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Production Notes</Label>
            <Textarea
              id="notes"
              placeholder="Enter any special notes or instructions for this batch..."
              rows={3}
              value={formData.productionNotes}
              onChange={(e) => setFormData(prev => ({ ...prev, productionNotes: e.target.value }))}
              className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-teal-200/50 dark:border-teal-700/50 focus:border-teal-400 dark:focus:border-teal-500 focus:ring-teal-400/20 rounded-xl resize-none"
            />
          </div>

          <DialogFooter className="gap-4 relative z-10">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 font-semibold px-6 py-2.5 rounded-xl transition-all duration-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating...' : 'Create Batch'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
