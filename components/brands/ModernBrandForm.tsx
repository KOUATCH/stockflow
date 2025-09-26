"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { TooltipProvider } from "@/components/ui/tooltip"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  Loader2,
  Save,
  Sparkles,
  Tag
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useNotifications } from "../notifications/NotificationProvider"

// Enhanced validation schema for brands
const brandCreationSchema = z.object({
  brandName: z.string().min(1, "Brand name is required").max(100, "Name must be less than 100 characters").trim(),
})

export type BrandCreationFormData = z.infer<typeof brandCreationSchema>

interface ModernBrandFormProps {
  action?: (formData: FormData) => Promise<void>
  isLoading?: boolean
  onCancel?: () => void
  organizationId: string
}

export function ModernBrandForm({
  action,
  isLoading = false,
  onCancel,
  organizationId
}: ModernBrandFormProps) {
  const router = useRouter()
  const { success, error, warning, info, operationStart, operationComplete } = useNotifications()

  // Welcome notification when component mounts
  useEffect(() => {
    info("Create Brand", "Enter a memorable brand name to add to your inventory system!")
  }, [info])

  const form = useForm<BrandCreationFormData>({
    resolver: zodResolver(brandCreationSchema),
    defaultValues: {
      brandName: "",
    },
    mode: "onChange"
  })

  // Watch form values for real-time feedback
  const watchedValues = form.watch()
  const { brandName } = watchedValues

  const handleSubmit = async (data: BrandCreationFormData) => {
    const operationId = operationStart("Creating Brand")

    try {
      info("Processing Brand", "Creating your new brand...")

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

      operationComplete("Brand Created", `${data.brandName} has been successfully added to your brands!`)
    } catch (error) {
      console.log("Failed to create brand:", error)
      operationComplete("Creation Failed", "Failed to create brand. Please check your information and try again.")
    }
  }

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      router.back()
    }
  }

  // Generate slug preview from brand name
  const slugPreview = brandName
    ? brandName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    : ""

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
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
                Back to Brands
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg">
                <Tag className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Create New Brand
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Add a new brand to organize your inventory
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
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg mb-4">
                      <Tag className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Brand Information</h3>
                    <p className="text-slate-600 dark:text-slate-400">Enter the name of the brand you want to add</p>
                  </div>

                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
                      <FormField
                        control={form.control}
                        name="brandName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                              <Sparkles className="h-4 w-4 text-pink-500" />
                              Brand Name *
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter brand name (e.g., Nike, Apple, Samsung)"
                                className="h-12 text-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-2 border-slate-200 dark:border-slate-700 focus:border-pink-500 dark:focus:border-pink-400 rounded-xl shadow-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription className="text-sm text-slate-500 dark:text-slate-400">
                              This will be used to categorize products in your inventory
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {brandName && (
                        <div className="p-6 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20 border-2 border-pink-200 dark:border-pink-700">
                          <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                            <h4 className="text-lg font-semibold text-pink-900 dark:text-pink-100">Brand Preview</h4>
                          </div>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-pink-600 dark:text-pink-400">Name:</span>
                              <span className="font-medium text-pink-900 dark:text-pink-100">{brandName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-pink-600 dark:text-pink-400">URL Slug:</span>
                              <span className="font-mono text-sm text-pink-800 dark:text-pink-200 bg-pink-100 dark:bg-pink-900/30 px-2 py-1 rounded">
                                {slugPreview || "auto-generated"}
                              </span>
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
                          disabled={form.formState.isSubmitting || isLoading || !brandName}
                          className="px-8 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white shadow-lg"
                        >
                          {form.formState.isSubmitting || isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Creating Brand...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Create Brand
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
                <div className="bg-gradient-to-r from-slate-50 to-pink-50/50 dark:from-slate-800 dark:to-slate-700 px-6 py-4 border-b border-slate-200/60 dark:border-slate-700/60">
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Eye className="h-5 w-5 text-pink-600 dark:text-pink-400" />
                    Live Preview
                  </CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400 mt-1">
                    See how your brand will appear
                  </CardDescription>
                </div>
                <CardContent className="p-6 space-y-6">
                  {/* Brand Preview */}
                  <div className="text-center space-y-4">
                    <div className="relative mx-auto w-20 h-20 rounded-2xl overflow-hidden border-4 border-slate-200 dark:border-slate-700 shadow-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                      <Tag className="w-10 h-10 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-xl mb-1">
                        {brandName || "New Brand"}
                      </h3>
                      {slugPreview && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg inline-block">
                          {slugPreview}
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
                      Active Brand
                    </Badge>
                  </div>

                  {/* Completion Status */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Completion</span>
                        <span className="font-medium text-slate-900 dark:text-white">
                          {brandName ? "100" : "0"}%
                        </span>
                      </div>
                      <Progress value={brandName ? 100 : 0} className="h-2" />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-3">
                      {brandName ? "Ready to create brand!" : "Enter a brand name to continue"}
                    </p>
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