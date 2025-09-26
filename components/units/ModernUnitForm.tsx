"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TooltipProvider } from "@/components/ui/tooltip"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  Loader2,
  Ruler,
  Save,
  Sparkles
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNotifications } from "../notifications/NotificationProvider"

// Enhanced validation schema for units
const unitCreationSchema = z.object({
  name: z.string().min(1, "Unit name is required").max(50, "Name must be less than 50 characters").trim(),
  symbol: z.string().min(1, "Symbol is required").max(10, "Symbol must be less than 10 characters").trim(),
})

export type UnitCreationFormData = z.infer<typeof unitCreationSchema>

interface ModernUnitFormProps {
  action?: (formData: FormData) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
  organizationId: string
}

// Common unit suggestions
const UNIT_SUGGESTIONS = [
  { name: "Piece", symbol: "pc" },
  { name: "Kilogram", symbol: "kg" },
  { name: "Gram", symbol: "g" },
  { name: "Liter", symbol: "L" },
  { name: "Milliliter", symbol: "ml" },
  { name: "Meter", symbol: "m" },
  { name: "Centimeter", symbol: "cm" },
  { name: "Inch", symbol: "in" },
  { name: "Foot", symbol: "ft" },
  { name: "Pound", symbol: "lb" },
  { name: "Ounce", symbol: "oz" },
  { name: "Box", symbol: "box" },
  { name: "Pack", symbol: "pack" },
  { name: "Dozen", symbol: "doz" },
  { name: "Pair", symbol: "pair" },
]

export function ModernUnitForm({
  action,
  isLoading = false,
  onCancel,
  organizationId
}: ModernUnitFormProps) {
  const router = useRouter()
  const { success, error, warning, info, operationStart, operationComplete } = useNotifications()

  // Welcome notification when component mounts
  useEffect(() => {
    info("Create Unit", "Add a unit of measurement to standardize your inventory!")
  }, [info])

  const form = useForm<UnitCreationFormData>({
    resolver: zodResolver(unitCreationSchema),
    defaultValues: {
      name: "",
      symbol: "",
    },
    mode: "onChange"
  })

  // Watch form values for real-time feedback
  const watchedValues = form.watch()
  const { name, symbol } = watchedValues

  const handleSubmit = async (data: UnitCreationFormData) => {
    const operationId = operationStart("Creating Unit")

    try {
      info("Processing Unit", "Creating your new unit of measurement...")

      if (action) {
        // Server action approach
        const formData = new FormData()
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            formData.append(key, String(value))
          }
        })
        await action(formData)
      }

      operationComplete("Unit Created", `${data.name} (${data.symbol}) has been successfully added to your units!`)
    } catch (error) {
      console.log("Failed to create unit:", error)
      operationComplete("Creation Failed", "Failed to create unit. Please check your information and try again.")
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  // Handle unit suggestion selection
  const handleUnitSuggestion = (unitSuggestion: typeof UNIT_SUGGESTIONS[0]) => {
    form.setValue("name", unitSuggestion.name, { shouldValidate: true })
    form.setValue("symbol", unitSuggestion.symbol, { shouldValidate: true })
    success("Unit Selected", `Applied ${unitSuggestion.name} (${unitSuggestion.symbol}) to the form`)
  }

  // Calculate completion percentage
  const completionPercentage = (name && symbol) ? 100 : (name || symbol) ? 50 : 0

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-6">
              <Button
                onClick={handleCancel}
                variant="ghost"
                size="sm"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Units
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <Ruler className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Create New Unit
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Add a unit of measurement for your inventory
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-2xl rounded-3xl overflow-hidden">
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg mb-4">
                      <Ruler className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Unit Information</h3>
                    <p className="text-slate-600 dark:text-slate-400">Create a unit of measurement for your products</p>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                      <div className="grid gap-6 md:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-blue-500" />
                                Unit Name *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter unit name (e.g., Kilogram, Piece)"
                                  className="h-12 text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                                The full name of the measurement unit
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="symbol"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Sparkles className="h-4 w-4 text-blue-500" />
                                Unit Symbol *
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Enter symbol (e.g., kg, pc)"
                                  className="h-12 text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl shadow-sm font-mono text-center"
                                  {...field}
                                />
                              </FormControl>
                              <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                                Short abbreviation for the unit
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Unit Suggestions */}
                      <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Common Units</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          Click on any unit below to automatically fill the form:
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                          {UNIT_SUGGESTIONS.map((unit, index) => (
                            <Button
                              key={index}
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleUnitSuggestion(unit)}
                              className="flex flex-col h-auto p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-400 rounded-xl"
                            >
                              <span className="font-medium text-slate-900 dark:text-white">{unit.name}</span>
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">({unit.symbol})</span>
                            </Button>
                          ))}
                        </div>
                      </div>

                      {(name && symbol) && (
                        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-2 border-blue-200 dark:border-blue-700">
                          <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            <h4 className="text-lg font-semibold text-blue-900 dark:text-blue-100">Unit Preview</h4>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-600 dark:text-blue-400">Full Name:</span>
                              <span className="font-medium text-blue-900 dark:text-blue-100">{name}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-blue-600 dark:text-blue-400">Symbol:</span>
                              <span className="font-mono text-sm text-blue-800 dark:text-blue-200 bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded">
                                {symbol}
                              </span>
                            </div>
                            <div className="pt-2 border-t border-blue-200 dark:border-blue-700">
                              <span className="text-sm text-blue-600 dark:text-blue-400">Usage Example:</span>
                              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                                "5 {symbol}" will display as "5 {name}"
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Form Actions */}
                      <div className="flex justify-between items-center pt-8 border-t border-slate-200 dark:border-slate-700">
                        <Button
                          type="button"
                          onClick={handleCancel}
                          variant="outline"
                          className="px-6 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>

                        <Button
                          type="submit"
                          disabled={form.formState.isSubmitting || isLoading || !name || !symbol}
                          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                        >
                          {form.formState.isSubmitting || isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating Unit...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Create Unit
                            </>
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Preview Panel */}
            <div className="lg:col-span-1">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-lg border-0 shadow-2xl rounded-3xl overflow-hidden sticky top-8">
                <div className="bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    Live Preview
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                    See how your unit will appear
                  </CardDescription>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Unit Preview */}
                  <div className="text-center space-y-4">
                    <div className="relative mx-auto w-20 h-20 rounded-2xl overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                      <Ruler className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1">
                        {name || "New Unit"}
                      </h3>
                      {symbol && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg inline-block">
                          {symbol}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="flex justify-center">
                    <Badge
                      variant="default"
                      className="px-3 py-1 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-700"
                    >
                      <div className="w-2 h-2 rounded-full mr-2 bg-green-500"></div>
                      Active Unit
                    </Badge>
                  </div>

                  {/* Completion Status */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Completion</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {completionPercentage}%
                        </span>
                      </div>
                      <Progress value={completionPercentage} className="h-2" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3">
                      {(name && symbol) ? "Ready to create unit!" : "Complete both fields to continue"}
                    </p>
                  </div>

                  {/* Unit Benefits */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Unit Benefits:</h4>
                    <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                      <li>• Standardize measurements</li>
                      <li>• Improve inventory accuracy</li>
                      <li>• Enable proper calculations</li>
                      <li>• Support different product types</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}