"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  ChefHat,
  Clock,
  DollarSign,
  Package,
  Plus,
  Edit,
  Eye,
  Calculator,
  Users,
  Timer,
  Utensils,
  BookOpen,
  Search,
  Filter,
  Trash2,
  RefreshCw,
  TrendingUp,
  BarChart3
} from 'lucide-react'
import {
  Recipe,
  RecipeStatus,
  UnitOfMeasure,
  CreateRecipeFormData,
  RecipeFilters,
  UNIT_OF_MEASURE_LABELS,
  formatCurrency,
  formatPercentage,
  canEditRecipe,
  calculateMarginPercentage
} from '@/types/production'
import { createRecipe, getRecipes, updateRecipeCosts, updateRecipe, getRecipeById } from '@/actions/production/productionSystemActions'
import { getItemsForOrder } from '@/actions/orders/getOrderFormData'
import { useNotifications } from '@/components/notifications/NotificationProvider'

interface RecipeManagementProps {
  organizationId: string
  currentUserId: string
}

interface RawMaterial {
  id: string
  name: string
  sku: string
  costPrice: number
}

export function RecipeManagement({ organizationId, currentUserId }: RecipeManagementProps) {
  const notifications = useNotifications()

  // State management
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [rawMaterials, setRawMaterials] = useState<RawMaterial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null)

  // Dialog states
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showRecipeDetails, setShowRecipeDetails] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)

  // Filter states
  const [filters, setFilters] = useState<RecipeFilters>({})
  const [searchTerm, setSearchTerm] = useState('')

  // Create recipe form state
  const [recipeName, setRecipeName] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [servingSize, setServingSize] = useState<number>(1)
  const [servingUnit, setServingUnit] = useState<UnitOfMeasure>(UnitOfMeasure.PIECES)
  const [preparationTime, setPreparationTime] = useState<number>(0)
  const [cookingTime, setCookingTime] = useState<number>(0)
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM')
  const [yields, setYields] = useState<number>(1)
  const [yieldUnit, setYieldUnit] = useState<UnitOfMeasure>(UnitOfMeasure.PIECES)
  const [targetMargin, setTargetMargin] = useState<number>(30)

  // Ingredients state
  const [ingredients, setIngredients] = useState<{
    rawMaterialId: string
    quantity: number
    unitOfMeasure: UnitOfMeasure
    isOptional: boolean
    notes: string
  }[]>([])

  // Instructions state
  const [instructions, setInstructions] = useState<{
    stepNumber: number
    instruction: string
    estimatedTime: number
    temperature: number | undefined
    equipment: string
    notes: string
  }[]>([])

  // Load data
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        const [recipesResult, materialsResult] = await Promise.all([
          getRecipes(organizationId, filters),
          getItemsForOrder(organizationId) // Use this to get raw materials
        ])

        if (recipesResult.success) {
          setRecipes(recipesResult.data)
        }

        if (materialsResult.success) {
          setRawMaterials(materialsResult.data.map(item => ({
            id: item.id,
            name: item.name,
            sku: item.sku,
            costPrice: item.sellingPrice // Assuming raw materials use selling price as cost
          })))
        }
      } catch (error) {
        console.error('Error loading data:', error)
        notifications.error('Loading Error', 'Failed to load recipe data')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [organizationId, filters])

  const handleEditRecipe = async (recipe: Recipe) => {
    try {
      const result = await getRecipeById(recipe.id, organizationId)

      if (result.success) {
        const fullRecipe = result.data
        setEditingRecipe(fullRecipe)

        // Populate form fields with existing data
        setRecipeName(fullRecipe.name)
        setDescription(fullRecipe.description || '')
        setCategory(fullRecipe.category)
        setServingSize(fullRecipe.servingSize)
        setServingUnit(fullRecipe.servingUnit)
        setPreparationTime(fullRecipe.preparationTime)
        setCookingTime(fullRecipe.cookingTime)
        setDifficulty(fullRecipe.difficulty as 'EASY' | 'MEDIUM' | 'HARD')
        setYields(fullRecipe.yields)
        setYieldUnit(fullRecipe.yieldUnit)
        setTargetMargin(fullRecipe.targetMarginPercentage)

        // Populate ingredients
        setIngredients(fullRecipe.ingredients.map(ing => ({
          rawMaterialId: ing.rawMaterialId,
          quantity: ing.quantity,
          unitOfMeasure: ing.unitOfMeasure,
          isOptional: ing.isOptional,
          notes: ing.notes || ''
        })))

        // Populate instructions
        setInstructions(fullRecipe.instructions.map(inst => ({
          stepNumber: inst.stepNumber,
          instruction: inst.instruction,
          estimatedTime: inst.estimatedTime,
          temperature: inst.temperature,
          equipment: inst.equipment || '',
          notes: inst.notes || ''
        })))

        setShowEditDialog(true)
      } else {
        notifications.error('Loading Error', result.error || 'Failed to load recipe details')
      }
    } catch (error) {
      console.error('Error loading recipe for editing:', error)
      notifications.error('Loading Error', 'An unexpected error occurred')
    }
  }

  const resetForm = () => {
    setRecipeName('')
    setDescription('')
    setCategory('')
    setServingSize(1)
    setServingUnit(UnitOfMeasure.PIECES)
    setPreparationTime(0)
    setCookingTime(0)
    setDifficulty('MEDIUM')
    setYields(1)
    setYieldUnit(UnitOfMeasure.PIECES)
    setTargetMargin(30)
    setIngredients([])
    setInstructions([])
  }

  const addIngredient = () => {
    setIngredients([...ingredients, {
      rawMaterialId: '',
      quantity: 0,
      unitOfMeasure: UnitOfMeasure.GRAMS,
      isOptional: false,
      notes: ''
    }])
  }

  const updateIngredient = (index: number, field: string, value: any) => {
    const updated = [...ingredients]
    updated[index] = { ...updated[index], [field]: value }
    setIngredients(updated)
  }

  const removeIngredient = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index))
  }

  const addInstruction = () => {
    const stepNumber = instructions.length + 1
    setInstructions([...instructions, {
      stepNumber,
      instruction: '',
      estimatedTime: 0,
      temperature: undefined,
      equipment: '',
      notes: ''
    }])
  }

  const updateInstruction = (index: number, field: string, value: any) => {
    const updated = [...instructions]
    updated[index] = { ...updated[index], [field]: value }
    setInstructions(updated)
  }

  const removeInstruction = (index: number) => {
    const filtered = instructions.filter((_, i) => i !== index)
    // Re-number the steps
    const reNumbered = filtered.map((inst, i) => ({ ...inst, stepNumber: i + 1 }))
    setInstructions(reNumbered)
  }

  const calculateEstimatedCost = () => {
    let totalCost = 0
    ingredients.forEach(ingredient => {
      const rawMaterial = rawMaterials.find(rm => rm.id === ingredient.rawMaterialId)
      if (rawMaterial) {
        totalCost += ingredient.quantity * rawMaterial.costPrice
      }
    })

    // Add labor cost estimate (simplified)
    const totalTime = preparationTime + cookingTime
    const laborCost = (totalTime / 60) * 15 // $15/hour

    // Add overhead (10% of materials + labor)
    const overhead = (totalCost + laborCost) * 0.1

    const totalWithOverhead = totalCost + laborCost + overhead
    return {
      materialCost: totalCost,
      laborCost,
      overhead,
      total: totalWithOverhead,
      costPerUnit: yields > 0 ? totalWithOverhead / yields : 0
    }
  }

  const handleSubmit = async () => {
    const isEditing = !!editingRecipe

    if (!recipeName.trim()) {
      notifications.formError(isEditing ? 'Recipe Update' : 'Recipe Creation', 'Recipe name is required', 'Please enter a recipe name')
      return
    }

    if (ingredients.length === 0) {
      notifications.formError(isEditing ? 'Recipe Update' : 'Recipe Creation', 'Ingredients required', 'Please add at least one ingredient')
      return
    }

    if (instructions.length === 0) {
      notifications.formError(isEditing ? 'Recipe Update' : 'Recipe Creation', 'Instructions required', 'Please add at least one instruction')
      return
    }

    try {
      const formData = {
        name: recipeName,
        description,
        category,
        servingSize,
        servingUnit,
        preparationTime,
        cookingTime,
        difficulty,
        yields,
        yieldUnit,
        targetMarginPercentage: targetMargin,
        ingredients: ingredients.filter(ing => ing.rawMaterialId && ing.quantity > 0),
        instructions: instructions.filter(inst => inst.instruction.trim())
      }

      let result
      if (isEditing) {
        result = await updateRecipe(editingRecipe.id, formData, organizationId, currentUserId)
      } else {
        result = await createRecipe(formData, organizationId, currentUserId)
      }

      if (result.success) {
        notifications.success(
          isEditing ? 'Recipe Updated' : 'Recipe Created',
          `Recipe "${recipeName}" ${isEditing ? 'updated' : 'created'} successfully`
        )

        // Reset form
        resetForm()
        setEditingRecipe(null)
        setShowCreateDialog(false)
        setShowEditDialog(false)

        // Reload recipes
        const recipesResult = await getRecipes(organizationId, filters)
        if (recipesResult.success) {
          setRecipes(recipesResult.data)
        }
      } else {
        notifications.error(
          isEditing ? 'Update Failed' : 'Creation Failed',
          result.error || `Failed to ${isEditing ? 'update' : 'create'} recipe`
        )
      }
    } catch (error) {
      console.error(`Error ${isEditing ? 'updating' : 'creating'} recipe:`, error)
      notifications.error(
        isEditing ? 'Update Error' : 'Creation Error',
        'An unexpected error occurred'
      )
    }
  }

  const costEstimate = calculateEstimatedCost()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Recipe Management
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Design, cost-analyze, and manage your production recipes with precision
            </p>
          </div>
          <Button onClick={() => {
            resetForm()
            setShowCreateDialog(true)
          }} className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
            <Plus className="w-5 h-5 mr-2" />
            Create New Recipe
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-0 shadow-xl rounded-2xl">
          <CardContent className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                <Filter className="w-5 h-5 text-blue-600" />
                Filter & Search Recipes
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <Label htmlFor="search" className="text-slate-700 dark:text-slate-300 font-medium">Search Recipes</Label>
                <div className="relative mt-2">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="search"
                    placeholder="Search by name or category..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                  />
                </div>
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-300 font-medium">Recipe Status</Label>
                <Select value={filters.status?.[0] || 'all'} onValueChange={(value) => {
                  if (value === 'all') {
                    setFilters({ ...filters, status: undefined })
                  } else {
                    setFilters({ ...filters, status: [value as RecipeStatus] })
                  }
                }}>
                  <SelectTrigger className="mt-2 bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border-slate-200 dark:border-slate-600 focus:border-green-500 dark:focus:border-green-400 rounded-lg">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-600 rounded-lg">
                    <SelectItem value="all">All Status</SelectItem>
                    {Object.values(RecipeStatus).map((status) => (
                      <SelectItem key={status} value={status}>
                        {status.replace('_', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-300 font-medium">Category</Label>
                <Input
                  placeholder="Filter by category"
                  value={filters.category || ''}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="mt-2 bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border-slate-200 dark:border-slate-600 focus:border-orange-500 dark:focus:border-orange-400 focus:ring-orange-500/20 rounded-lg transition-all duration-200"
                />
              </div>
              <div>
                <Label className="text-slate-700 dark:text-slate-300 font-medium">Difficulty Level</Label>
                <Select value={filters.difficulty?.[0] || 'all'} onValueChange={(value) => {
                  if (value === 'all') {
                    setFilters({ ...filters, difficulty: undefined })
                  } else {
                    setFilters({ ...filters, difficulty: [value] })
                  }
                }}>
                  <SelectTrigger className="mt-2 bg-white/60 dark:bg-slate-700/60 backdrop-blur-sm border-slate-200 dark:border-slate-600 focus:border-purple-500 dark:focus:border-purple-400 rounded-lg">
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-slate-200 dark:border-slate-600 rounded-lg">
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {recipes.filter(recipe =>
            !searchTerm || recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            recipe.category.toLowerCase().includes(searchTerm.toLowerCase())
          ).map((recipe) => (
            <Card key={recipe.id} className="group bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-0 shadow-xl rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-translate-y-2">
              <CardHeader className="p-6 pb-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-3 text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                      <div className="p-2 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl">
                        <ChefHat className="w-5 h-5 text-white" />
                      </div>
                      {recipe.name}
                    </CardTitle>
                    <CardDescription className="text-slate-600 dark:text-slate-300 font-medium">
                      {recipe.category}
                    </CardDescription>
                  </div>
                  <Badge className={
                    recipe.status === RecipeStatus.ACTIVE ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg' :
                    recipe.status === RecipeStatus.DRAFT ? 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-lg' :
                    'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg'
                  }>
                    {recipe.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl p-4 border border-blue-200/30 dark:border-blue-700/30">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs font-medium">Total Time</span>
                    </div>
                    <span className="font-bold text-blue-800 dark:text-blue-200">{recipe.totalTime} min</span>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 rounded-xl p-4 border border-purple-200/30 dark:border-purple-700/30">
                    <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 mb-1">
                      <Package className="w-4 h-4" />
                      <span className="text-xs font-medium">Yields</span>
                    </div>
                    <span className="font-bold text-purple-800 dark:text-purple-200">{recipe.yields} {UNIT_OF_MEASURE_LABELS[recipe.yieldUnit]}</span>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 rounded-xl p-4 border border-green-200/30 dark:border-green-700/30">
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-300 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-xs font-medium">Cost/Unit</span>
                    </div>
                    <span className="font-bold text-green-800 dark:text-green-200">{formatCurrency(recipe.costPerUnit)}</span>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/30 dark:to-red-900/30 rounded-xl p-4 border border-orange-200/30 dark:border-orange-700/30">
                    <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300 mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-xs font-medium">Margin</span>
                    </div>
                    <span className="font-bold text-orange-800 dark:text-orange-200">{formatPercentage(calculateMarginPercentage(recipe.suggestedSellingPrice, recipe.costPerUnit))}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedRecipe(recipe)
                      setShowRecipeDetails(true)
                    }}
                    className="bg-gradient-to-r from-teal-500/10 to-cyan-500/10 hover:from-teal-500/20 hover:to-cyan-500/20 border-teal-300/50 dark:border-teal-600/50 text-teal-700 dark:text-teal-300 hover:text-teal-800 dark:hover:text-teal-200 transition-all duration-200"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  {canEditRecipe(recipe.status) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditRecipe(recipe)}
                      className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border-purple-300/50 dark:border-purple-600/50 text-purple-700 dark:text-purple-300 hover:text-purple-800 dark:hover:text-purple-200 transition-all duration-200"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={async () => {
                      const result = await updateRecipeCosts(recipe.id, organizationId)
                      if (result.success) {
                        notifications.success('Costs Updated', 'Recipe costs updated successfully')
                        const recipesResult = await getRecipes(organizationId, filters)
                        if (recipesResult.success) {
                          setRecipes(recipesResult.data)
                        }
                      }
                    }}
                    className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20 border-green-300/50 dark:border-green-600/50 text-green-700 dark:text-green-300 hover:text-green-800 dark:hover:text-green-200 transition-all duration-200"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Update Costs
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Create Recipe Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-0 shadow-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
              <ChefHat className="w-6 h-6 text-green-600" />
              Create New Recipe
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-300 text-base">
              Design your production recipe with detailed ingredients, step-by-step instructions, and cost analysis
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border shadow-lg rounded-xl p-1">
              <TabsTrigger value="basic" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg font-medium">
                <Package className="w-4 h-4 mr-2" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="ingredients" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg font-medium">
                <Utensils className="w-4 h-4 mr-2" />
                Ingredients
              </TabsTrigger>
              <TabsTrigger value="instructions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg font-medium">
                <BookOpen className="w-4 h-4 mr-2" />
                Instructions
              </TabsTrigger>
              <TabsTrigger value="costing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg font-medium">
                <Calculator className="w-4 h-4 mr-2" />
                Costing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-8">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg rounded-xl p-6">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Basic Recipe Information
                </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name">Recipe Name *</Label>
                  <Input
                    id="name"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    placeholder="Enter recipe name"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Bread, Pastry, Cake"
                  />
                </div>
                <div>
                  <Label htmlFor="serving-size">Serving Size</Label>
                  <div className="flex gap-2">
                    <Input
                      id="serving-size"
                      type="number"
                      value={servingSize}
                      onChange={(e) => setServingSize(Number(e.target.value))}
                      className="flex-1"
                    />
                    <Select value={servingUnit} onValueChange={(value) => setServingUnit(value as UnitOfMeasure)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(UNIT_OF_MEASURE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="yields">Recipe Yields</Label>
                  <div className="flex gap-2">
                    <Input
                      id="yields"
                      type="number"
                      value={yields}
                      onChange={(e) => setYields(Number(e.target.value))}
                      className="flex-1"
                    />
                    <Select value={yieldUnit} onValueChange={(value) => setYieldUnit(value as UnitOfMeasure)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(UNIT_OF_MEASURE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="prep-time">Preparation Time (minutes)</Label>
                  <Input
                    id="prep-time"
                    type="number"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="cook-time">Cooking Time (minutes)</Label>
                  <Input
                    id="cook-time"
                    type="number"
                    value={cookingTime}
                    onChange={(e) => setCookingTime(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={(value) => setDifficulty(value as 'EASY' | 'MEDIUM' | 'HARD')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="margin">Target Margin (%)</Label>
                  <Input
                    id="margin"
                    type="number"
                    value={targetMargin}
                    onChange={(e) => setTargetMargin(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="mt-6">
                <Label htmlFor="description" className="text-slate-700 dark:text-slate-300 font-medium">Recipe Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your recipe, special techniques, or notes..."
                  rows={4}
                  className="mt-2 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                />
              </div>
              </Card>
            </TabsContent>

            <TabsContent value="ingredients" className="space-y-6 mt-8">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-green-600" />
                    Recipe Ingredients
                  </h3>
                  <Button onClick={addIngredient} size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ingredient
                  </Button>
                </div>

              <div className="space-y-4">
                {ingredients.map((ingredient, index) => (
                  <Card key={index} className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <Label>Raw Material</Label>
                        <Select
                          value={ingredient.rawMaterialId}
                          onValueChange={(value) => updateIngredient(index, 'rawMaterialId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {rawMaterials.map((material) => (
                              <SelectItem key={material.id} value={material.id}>
                                {material.name} - {formatCurrency(material.costPrice)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(index, 'quantity', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Select
                          value={ingredient.unitOfMeasure}
                          onValueChange={(value) => updateIngredient(index, 'unitOfMeasure', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(UNIT_OF_MEASURE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Input
                          value={ingredient.notes}
                          onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                          placeholder="Optional notes"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={ingredient.isOptional}
                            onCheckedChange={(checked) => updateIngredient(index, 'isOptional', checked)}
                          />
                          <Label className="text-sm">Optional</Label>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              </Card>
            </TabsContent>

            <TabsContent value="instructions" className="space-y-6 mt-8">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                    Cooking Instructions
                  </h3>
                  <Button onClick={addInstruction} size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>

              <div className="space-y-4">
                {instructions.map((instruction, index) => (
                  <Card key={index} className="bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20 backdrop-blur-sm border border-orange-200/30 dark:border-orange-700/30 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Step {instruction.stepNumber}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeInstruction(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div>
                        <Label>Instruction</Label>
                        <Textarea
                          value={instruction.instruction}
                          onChange={(e) => updateInstruction(index, 'instruction', e.target.value)}
                          placeholder="Describe this step..."
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Time (minutes)</Label>
                          <Input
                            type="number"
                            value={instruction.estimatedTime}
                            onChange={(e) => updateInstruction(index, 'estimatedTime', Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>Temperature (°F)</Label>
                          <Input
                            type="number"
                            value={instruction.temperature || ''}
                            onChange={(e) => updateInstruction(index, 'temperature', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <Label>Equipment</Label>
                          <Input
                            value={instruction.equipment}
                            onChange={(e) => updateInstruction(index, 'equipment', e.target.value)}
                            placeholder="e.g., Oven, Mixer"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              </Card>
            </TabsContent>

            <TabsContent value="costing" className="space-y-6 mt-8">
              <Card className="bg-gradient-to-br from-pink-50/80 via-purple-50/80 to-violet-50/80 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-violet-900/20 backdrop-blur-sm border-0 shadow-lg rounded-xl p-8">
                <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-pink-600" />
                  Real-Time Cost Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg p-4 backdrop-blur-sm">
                      <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Cost Breakdown</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-300">Material Cost:</span>
                          <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(costEstimate.materialCost)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-300">Labor Cost:</span>
                          <span className="font-medium text-orange-600 dark:text-orange-400">{formatCurrency(costEstimate.laborCost)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-300">Overhead Cost:</span>
                          <span className="font-medium text-purple-600 dark:text-purple-400">{formatCurrency(costEstimate.overhead)}</span>
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-600 pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-800 dark:text-slate-100">Total Cost:</span>
                            <span className="font-bold text-lg text-slate-900 dark:text-slate-50">{formatCurrency(costEstimate.total)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">Cost Per Unit:</span>
                          <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{formatCurrency(costEstimate.costPerUnit)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-4 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Profitability Analysis
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-green-700 dark:text-green-300">Target Margin:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">{targetMargin}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700 dark:text-green-300">Suggested Price:</span>
                          <span className="font-bold text-lg text-green-600 dark:text-green-400">
                            {formatCurrency(costEstimate.costPerUnit / (1 - (targetMargin / 100)))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700 dark:text-green-300">Profit Per Unit:</span>
                          <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                            {formatCurrency((costEstimate.costPerUnit / (1 - (targetMargin / 100))) - costEstimate.costPerUnit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
            <Button variant="outline" onClick={() => {
              setShowCreateDialog(false)
              resetForm()
            }} className="px-6 py-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <ChefHat className="w-4 h-4 mr-2" />
              Create Recipe
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Recipe Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(open) => {
        setShowEditDialog(open)
        if (!open) {
          setEditingRecipe(null)
          resetForm()
        }
      }}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-0 shadow-2xl">
          <DialogHeader className="pb-6">
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
              <Edit className="w-6 h-6 text-purple-600" />
              Edit Recipe
            </DialogTitle>
            <DialogDescription className="text-slate-600 dark:text-slate-300 text-base">
              Update your production recipe with new ingredients, instructions, and cost analysis
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border shadow-lg rounded-xl p-1">
              <TabsTrigger value="basic" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg font-medium">
                <Package className="w-4 h-4 mr-2" />
                Basic Info
              </TabsTrigger>
              <TabsTrigger value="ingredients" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg font-medium">
                <Utensils className="w-4 h-4 mr-2" />
                Ingredients
              </TabsTrigger>
              <TabsTrigger value="instructions" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg font-medium">
                <BookOpen className="w-4 h-4 mr-2" />
                Instructions
              </TabsTrigger>
              <TabsTrigger value="costing" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200 rounded-lg font-medium">
                <Calculator className="w-4 h-4 mr-2" />
                Costing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-6 mt-8">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg rounded-xl p-6">
                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  Basic Recipe Information
                </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="edit-name">Recipe Name *</Label>
                  <Input
                    id="edit-name"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                    placeholder="Enter recipe name"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-category">Category</Label>
                  <Input
                    id="edit-category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="e.g., Bread, Pastry, Cake"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-serving-size">Serving Size</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-serving-size"
                      type="number"
                      value={servingSize}
                      onChange={(e) => setServingSize(Number(e.target.value))}
                      className="flex-1"
                    />
                    <Select value={servingUnit} onValueChange={(value) => setServingUnit(value as UnitOfMeasure)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(UNIT_OF_MEASURE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-yields">Recipe Yields</Label>
                  <div className="flex gap-2">
                    <Input
                      id="edit-yields"
                      type="number"
                      value={yields}
                      onChange={(e) => setYields(Number(e.target.value))}
                      className="flex-1"
                    />
                    <Select value={yieldUnit} onValueChange={(value) => setYieldUnit(value as UnitOfMeasure)}>
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(UNIT_OF_MEASURE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-prep-time">Preparation Time (minutes)</Label>
                  <Input
                    id="edit-prep-time"
                    type="number"
                    value={preparationTime}
                    onChange={(e) => setPreparationTime(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-cook-time">Cooking Time (minutes)</Label>
                  <Input
                    id="edit-cook-time"
                    type="number"
                    value={cookingTime}
                    onChange={(e) => setCookingTime(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label>Difficulty</Label>
                  <Select value={difficulty} onValueChange={(value) => setDifficulty(value as 'EASY' | 'MEDIUM' | 'HARD')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="EASY">Easy</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HARD">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-margin">Target Margin (%)</Label>
                  <Input
                    id="edit-margin"
                    type="number"
                    value={targetMargin}
                    onChange={(e) => setTargetMargin(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="mt-6">
                <Label htmlFor="edit-description" className="text-slate-700 dark:text-slate-300 font-medium">Recipe Description</Label>
                <Textarea
                  id="edit-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your recipe, special techniques, or notes..."
                  rows={4}
                  className="mt-2 bg-white/50 dark:bg-slate-700/50 backdrop-blur-sm border-slate-200 dark:border-slate-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500/20 rounded-lg transition-all duration-200"
                />
              </div>
              </Card>
            </TabsContent>

            <TabsContent value="ingredients" className="space-y-6 mt-8">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-green-600" />
                    Recipe Ingredients
                  </h3>
                  <Button onClick={addIngredient} size="sm" className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Ingredient
                  </Button>
                </div>

              <div className="space-y-4">
                {ingredients.map((ingredient, index) => (
                  <Card key={index} className="bg-gradient-to-r from-green-50/50 to-emerald-50/50 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm border border-green-200/30 dark:border-green-700/30 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                      <div>
                        <Label>Raw Material</Label>
                        <Select
                          value={ingredient.rawMaterialId}
                          onValueChange={(value) => updateIngredient(index, 'rawMaterialId', value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select material" />
                          </SelectTrigger>
                          <SelectContent>
                            {rawMaterials.map((material) => (
                              <SelectItem key={material.id} value={material.id}>
                                {material.name} - {formatCurrency(material.costPrice)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Quantity</Label>
                        <Input
                          type="number"
                          value={ingredient.quantity}
                          onChange={(e) => updateIngredient(index, 'quantity', Number(e.target.value))}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label>Unit</Label>
                        <Select
                          value={ingredient.unitOfMeasure}
                          onValueChange={(value) => updateIngredient(index, 'unitOfMeasure', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(UNIT_OF_MEASURE_LABELS).map(([value, label]) => (
                              <SelectItem key={value} value={value}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Notes</Label>
                        <Input
                          value={ingredient.notes}
                          onChange={(e) => updateIngredient(index, 'notes', e.target.value)}
                          placeholder="Optional notes"
                        />
                      </div>
                      <div className="flex items-end gap-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={ingredient.isOptional}
                            onCheckedChange={(checked) => updateIngredient(index, 'isOptional', checked)}
                          />
                          <Label className="text-sm">Optional</Label>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeIngredient(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              </Card>
            </TabsContent>

            <TabsContent value="instructions" className="space-y-6 mt-8">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg rounded-xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-orange-600" />
                    Cooking Instructions
                  </h3>
                  <Button onClick={addInstruction} size="sm" className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg transition-all duration-200">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Step
                  </Button>
                </div>

              <div className="space-y-4">
                {instructions.map((instruction, index) => (
                  <Card key={index} className="bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20 backdrop-blur-sm border border-orange-200/30 dark:border-orange-700/30 p-5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">Step {instruction.stepNumber}</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeInstruction(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div>
                        <Label>Instruction</Label>
                        <Textarea
                          value={instruction.instruction}
                          onChange={(e) => updateInstruction(index, 'instruction', e.target.value)}
                          placeholder="Describe this step..."
                          rows={2}
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label>Time (minutes)</Label>
                          <Input
                            type="number"
                            value={instruction.estimatedTime}
                            onChange={(e) => updateInstruction(index, 'estimatedTime', Number(e.target.value))}
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <Label>Temperature (°F)</Label>
                          <Input
                            type="number"
                            value={instruction.temperature || ''}
                            onChange={(e) => updateInstruction(index, 'temperature', e.target.value ? Number(e.target.value) : undefined)}
                            placeholder="Optional"
                          />
                        </div>
                        <div>
                          <Label>Equipment</Label>
                          <Input
                            value={instruction.equipment}
                            onChange={(e) => updateInstruction(index, 'equipment', e.target.value)}
                            placeholder="e.g., Oven, Mixer"
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              </Card>
            </TabsContent>

            <TabsContent value="costing" className="space-y-6 mt-8">
              <Card className="bg-gradient-to-br from-pink-50/80 via-purple-50/80 to-violet-50/80 dark:from-pink-900/20 dark:via-purple-900/20 dark:to-violet-900/20 backdrop-blur-sm border-0 shadow-lg rounded-xl p-8">
                <h3 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                  <Calculator className="w-6 h-6 text-pink-600" />
                  Real-Time Cost Analysis
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <div className="bg-white/60 dark:bg-slate-700/60 rounded-lg p-4 backdrop-blur-sm">
                      <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-3">Cost Breakdown</h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-300">Material Cost:</span>
                          <span className="font-medium text-blue-600 dark:text-blue-400">{formatCurrency(costEstimate.materialCost)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-300">Labor Cost:</span>
                          <span className="font-medium text-orange-600 dark:text-orange-400">{formatCurrency(costEstimate.laborCost)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-600 dark:text-slate-300">Overhead Cost:</span>
                          <span className="font-medium text-purple-600 dark:text-purple-400">{formatCurrency(costEstimate.overhead)}</span>
                        </div>
                        <div className="border-t border-slate-200 dark:border-slate-600 pt-3 mt-3">
                          <div className="flex justify-between items-center">
                            <span className="font-semibold text-slate-800 dark:text-slate-100">Total Cost:</span>
                            <span className="font-bold text-lg text-slate-900 dark:text-slate-50">{formatCurrency(costEstimate.total)}</span>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-slate-800 dark:text-slate-100">Cost Per Unit:</span>
                          <span className="font-bold text-lg text-indigo-600 dark:text-indigo-400">{formatCurrency(costEstimate.costPerUnit)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-5">
                    <div className="bg-gradient-to-br from-green-50/80 to-emerald-50/80 dark:from-green-900/30 dark:to-emerald-900/30 rounded-lg p-4 backdrop-blur-sm border border-green-200/50 dark:border-green-700/50">
                      <h4 className="font-semibold text-green-800 dark:text-green-200 mb-3 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        Profitability Analysis
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-green-700 dark:text-green-300">Target Margin:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">{targetMargin}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700 dark:text-green-300">Suggested Price:</span>
                          <span className="font-bold text-lg text-green-600 dark:text-green-400">
                            {formatCurrency(costEstimate.costPerUnit / (1 - (targetMargin / 100)))}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-green-700 dark:text-green-300">Profit Per Unit:</span>
                          <span className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                            {formatCurrency((costEstimate.costPerUnit / (1 - (targetMargin / 100))) - costEstimate.costPerUnit)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-slate-200/60 dark:border-slate-700/60">
            <Button variant="outline" onClick={() => {
              setShowEditDialog(false)
              setEditingRecipe(null)
              resetForm()
            }} className="px-6 py-2 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200">
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Edit className="w-4 h-4 mr-2" />
              Update Recipe
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recipe Details Dialog */}
      {selectedRecipe && (
        <Dialog open={showRecipeDetails} onOpenChange={setShowRecipeDetails}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-slate-50 via-teal-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-0 shadow-2xl">
            <DialogHeader className="pb-8">
              <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-2xl">
                  <Eye className="w-6 h-6 text-white" />
                </div>
                {selectedRecipe.name}
              </DialogTitle>
              <DialogDescription className="text-lg text-slate-600 dark:text-slate-300 mt-2">
                {selectedRecipe.category} • {selectedRecipe.difficulty} Difficulty • Version {selectedRecipe.version}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-8">
              {/* Recipe Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-gradient-to-br from-teal-50/90 to-cyan-50/90 dark:from-teal-900/30 dark:to-cyan-900/30 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl">
                      <Clock className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-teal-800 dark:text-teal-200 text-lg">Timing</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-teal-700 dark:text-teal-300">Preparation:</span>
                      <span className="font-semibold text-teal-800 dark:text-teal-200">{selectedRecipe.preparationTime} min</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-teal-700 dark:text-teal-300">Cooking:</span>
                      <span className="font-semibold text-teal-800 dark:text-teal-200">{selectedRecipe.cookingTime} min</span>
                    </div>
                    <div className="border-t border-teal-200/50 dark:border-teal-700/50 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-teal-800 dark:text-teal-100">Total Time:</span>
                        <span className="font-bold text-lg text-teal-900 dark:text-teal-50">{selectedRecipe.totalTime} min</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-purple-50/90 to-pink-50/90 dark:from-purple-900/30 dark:to-pink-900/30 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-purple-800 dark:text-purple-200 text-lg">Yield</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700 dark:text-purple-300">Recipe Makes:</span>
                      <span className="font-semibold text-purple-800 dark:text-purple-200">{selectedRecipe.yields} {UNIT_OF_MEASURE_LABELS[selectedRecipe.yieldUnit]}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-purple-700 dark:text-purple-300">Serving Size:</span>
                      <span className="font-semibold text-purple-800 dark:text-purple-200">{selectedRecipe.servingSize} {UNIT_OF_MEASURE_LABELS[selectedRecipe.servingUnit]}</span>
                    </div>
                    <div className="border-t border-purple-200/50 dark:border-purple-700/50 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-purple-800 dark:text-purple-100">Status:</span>
                        <Badge className={
                          selectedRecipe.status === RecipeStatus.ACTIVE ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' :
                          selectedRecipe.status === RecipeStatus.DRAFT ? 'bg-gradient-to-r from-gray-500 to-slate-500 text-white' :
                          'bg-gradient-to-r from-red-500 to-pink-500 text-white'
                        }>
                          {selectedRecipe.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="bg-gradient-to-br from-green-50/90 to-emerald-50/90 dark:from-green-900/30 dark:to-emerald-900/30 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl">
                      <DollarSign className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-green-800 dark:text-green-200 text-lg">Cost Analysis</span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 dark:text-green-300">Cost Per Unit:</span>
                      <span className="font-semibold text-green-800 dark:text-green-200">{formatCurrency(selectedRecipe.costPerUnit)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-green-700 dark:text-green-300">Suggested Price:</span>
                      <span className="font-semibold text-green-800 dark:text-green-200">{formatCurrency(selectedRecipe.suggestedSellingPrice)}</span>
                    </div>
                    <div className="border-t border-green-200/50 dark:border-green-700/50 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-green-800 dark:text-green-100">Profit Margin:</span>
                        <span className="font-bold text-lg text-green-900 dark:text-green-50">{formatPercentage(calculateMarginPercentage(selectedRecipe.suggestedSellingPrice, selectedRecipe.costPerUnit))}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Recipe Description */}
              {selectedRecipe.description && (
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-0 shadow-lg rounded-2xl p-6">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-200 dark:to-slate-100 bg-clip-text text-transparent mb-4 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                    Recipe Description
                  </h3>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">{selectedRecipe.description}</p>
                </Card>
              )}

              {/* Ingredients & Instructions - if available */}
              {(selectedRecipe.ingredients && selectedRecipe.ingredients.length > 0) && (
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-0 shadow-lg rounded-2xl p-6">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                    <Utensils className="w-6 h-6 text-orange-600" />
                    Ingredients ({selectedRecipe.ingredients.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRecipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20 rounded-xl p-4 border border-orange-200/30 dark:border-orange-700/30">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <span className="font-semibold text-orange-800 dark:text-orange-200">{ingredient.rawMaterial?.name}</span>
                            {ingredient.notes && (
                              <p className="text-sm text-orange-700 dark:text-orange-300 mt-1">{ingredient.notes}</p>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <span className="font-bold text-orange-900 dark:text-orange-100">{ingredient.quantity}</span>
                            <span className="text-sm text-orange-700 dark:text-orange-300 ml-1">{UNIT_OF_MEASURE_LABELS[ingredient.unitOfMeasure]}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {(selectedRecipe.instructions && selectedRecipe.instructions.length > 0) && (
                <Card className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border-0 shadow-lg rounded-2xl p-6">
                  <h3 className="text-xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent mb-6 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-teal-600" />
                    Instructions ({selectedRecipe.instructions.length} steps)
                  </h3>
                  <div className="space-y-4">
                    {selectedRecipe.instructions.map((instruction, index) => (
                      <div key={index} className="bg-gradient-to-r from-teal-50/50 to-cyan-50/50 dark:from-teal-900/20 dark:to-cyan-900/20 rounded-xl p-5 border border-teal-200/30 dark:border-teal-700/30">
                        <div className="flex items-start gap-4">
                          <div className="bg-gradient-to-br from-teal-500 to-cyan-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {instruction.stepNumber}
                          </div>
                          <div className="flex-1">
                            <p className="text-slate-800 dark:text-slate-200 leading-relaxed mb-3">{instruction.instruction}</p>
                            <div className="flex flex-wrap gap-4 text-sm">
                              {instruction.estimatedTime && (
                                <span className="bg-teal-100/50 dark:bg-teal-800/30 text-teal-700 dark:text-teal-300 px-3 py-1 rounded-lg">
                                  <Timer className="w-4 h-4 inline mr-1" />
                                  {instruction.estimatedTime} min
                                </span>
                              )}
                              {instruction.temperature && (
                                <span className="bg-orange-100/50 dark:bg-orange-800/30 text-orange-700 dark:text-orange-300 px-3 py-1 rounded-lg">
                                  🌡️ {instruction.temperature}°F
                                </span>
                              )}
                              {instruction.equipment && (
                                <span className="bg-cyan-100/50 dark:bg-cyan-800/30 text-cyan-700 dark:text-cyan-300 px-3 py-1 rounded-lg">
                                  🔧 {instruction.equipment}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}