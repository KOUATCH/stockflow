"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, FolderOpen, Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { useCreateCategory, useUpdateCategory } from "@/hooks/useCategories"
import { CategoryCreateSchema } from "@/services/category/category.schemas"
import type { CategoryDTO } from "@/types/category"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

const categoryFormSchema = CategoryCreateSchema.extend({
  isActive: z.boolean().default(true),
})

type CategoryFormValues = z.infer<typeof categoryFormSchema>

type CategoryOption = Pick<CategoryDTO, "id" | "titleEn" | "titleFr" | "parentId">

type ModernCategoryFormProps = {
  mode?: "create" | "edit"
  organizationId: string
  initialData?: CategoryDTO | null
  categories?: CategoryOption[]
  returnHref?: string
}

function slugPreview(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

export function ModernCategoryForm({
  mode = "create",
  organizationId,
  initialData,
  categories = [],
  returnHref = "/dashboard/inventory/categories",
}: ModernCategoryFormProps) {
  const router = useRouter()
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()
  const [serverError, setServerError] = useState<string | null>(null)

  const isEdit = mode === "edit" && Boolean(initialData)
  const isSubmitting = createCategory.isPending || updateCategory.isPending

  const parentOptions = useMemo(
    () => categories.filter((category) => category.id !== initialData?.id),
    [categories, initialData?.id],
  )

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      titleEn: initialData?.titleEn ?? "",
      titleFr: initialData?.titleFr ?? "",
      descriptionEn: initialData?.descriptionEn ?? "",
      descriptionFr: initialData?.descriptionFr ?? "",
      imageUrl: initialData?.imageUrl ?? "",
      parentId: initialData?.parentId ?? null,
      isActive: initialData?.isActive ?? true,
    },
    mode: "onBlur",
  })

  const watchedTitle = form.watch("titleEn")
  const watchedStatus = form.watch("isActive")
  const watchedParentId = form.watch("parentId")
  const previewSlug = useMemo(() => slugPreview(watchedTitle || ""), [watchedTitle])
  const parentLabel = parentOptions.find((category) => category.id === watchedParentId)?.titleEn

  async function onSubmit(values: CategoryFormValues) {
    setServerError(null)

    const payload = {
      organizationId,
      titleEn: values.titleEn,
      titleFr: values.titleFr || null,
      descriptionEn: values.descriptionEn || null,
      descriptionFr: values.descriptionFr || null,
      imageUrl: values.imageUrl || null,
      parentId: values.parentId || null,
      isActive: values.isActive,
    }

    try {
      if (isEdit && initialData) {
        await updateCategory.mutateAsync({
          id: initialData.id,
          data: payload,
        })
        router.push(`${returnHref}/${initialData.id}`)
      } else {
        await createCategory.mutateAsync(payload)
        form.reset()
        router.push(returnHref)
      }
      router.refresh()
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "The category could not be saved.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" onClick={() => router.push(returnHref)}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to categories</span>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-foreground">
                {isEdit ? "Edit Category" : "Create Category"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEdit ? initialData?.titleEn : "Add a bilingual category record"}
              </p>
            </div>
          </div>
          <Badge variant={watchedStatus ? "secondary" : "outline"} className="w-fit">
            {watchedStatus ? "Active" : "Inactive"}
          </Badge>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <Card>
            <CardHeader>
              <CardTitle>Category Details</CardTitle>
              <CardDescription>Names, descriptions, hierarchy, image, and operating status.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {serverError ? (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                      {serverError}
                    </div>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="titleEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Title (English)</FormLabel>
                          <FormControl>
                            <Input autoComplete="off" placeholder="Electronics" disabled={isSubmitting} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="titleFr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category Title (French)</FormLabel>
                          <FormControl>
                            <Input placeholder="Electronique" disabled={isSubmitting} {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="descriptionEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (English)</FormLabel>
                          <FormControl>
                            <Textarea disabled={isSubmitting} {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="descriptionFr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (French)</FormLabel>
                          <FormControl>
                            <Textarea disabled={isSubmitting} {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px] md:items-end">
                    <FormField
                      control={form.control}
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Image URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com/category.png" disabled={isSubmitting} {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="parentId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Parent Category</FormLabel>
                          <Select
                            value={field.value ?? "none"}
                            onValueChange={(value) => field.onChange(value === "none" ? null : value)}
                            disabled={isSubmitting || parentOptions.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="No parent" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="none">No parent</SelectItem>
                              {parentOptions.map((category) => (
                                <SelectItem key={category.id} value={category.id}>
                                  {category.titleEn}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex h-10 items-center justify-between rounded-md border px-3">
                        <FormLabel className="text-sm font-medium">Active</FormLabel>
                        <FormControl>
                          <Switch checked={Boolean(field.value)} onCheckedChange={field.onChange} disabled={isSubmitting} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => router.push(returnHref)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      {isEdit ? "Save Changes" : "Create Category"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>{previewSlug || "category-slug"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-muted text-muted-foreground">
                <FolderOpen className="h-7 w-7" />
              </div>
              <div>
                <p className="font-medium text-foreground">{watchedTitle || "Category title"}</p>
                <p className="text-sm text-muted-foreground">{form.watch("titleFr") || "French title"}</p>
              </div>
              <div className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
                /categories/{previewSlug || "category-slug"}
              </div>
              <div className="text-sm text-muted-foreground">
                Parent: <span className="text-foreground">{parentLabel || "Root category"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
