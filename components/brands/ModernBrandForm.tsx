"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowLeft, Building2, Loader2, Save } from "lucide-react"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { BrandCreateSchema } from "@/services/brand/brand.schemas"
import { useCreateBrand, useUpdateBrand } from "@/hooks/useBrands"
import type { BrandDTO } from "@/types/brand"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

const brandFormSchema = BrandCreateSchema.extend({
  isActive: z.boolean().default(true),
})

type BrandFormValues = z.infer<typeof brandFormSchema>

type ModernBrandFormProps = {
  mode?: "create" | "edit"
  organizationId: string
  initialData?: BrandDTO | null
  returnHref?: string
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

function slugPreview(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
}

export function ModernBrandForm({
  mode = "create",
  organizationId,
  initialData,
  returnHref = "/dashboard/inventory/brands",
}: ModernBrandFormProps) {
  const router = useRouter()
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand()
  const [serverError, setServerError] = useState<string | null>(null)

  const isEdit = mode === "edit" && Boolean(initialData)
  const isSubmitting = createBrand.isPending || updateBrand.isPending

  const form = useForm<BrandFormValues>({
    resolver: zodResolver(brandFormSchema),
    defaultValues: {
      nameEn: initialData?.nameEn ?? "",
      nameFr: initialData?.nameFr ?? "",
      descriptionEn: initialData?.descriptionEn ?? "",
      descriptionFr: initialData?.descriptionFr ?? "",
      logoUrl: initialData?.logoUrl ?? "",
      isActive: initialData?.isActive ?? true,
    },
    mode: "onBlur",
  })

  const watchedName = form.watch("nameEn")
  const watchedStatus = form.watch("isActive")
  const previewSlug = useMemo(() => slugPreview(watchedName || ""), [watchedName])

  async function onSubmit(values: BrandFormValues) {
    setServerError(null)

    const payload = {
      organizationId,
      nameEn: values.nameEn,
      nameFr: values.nameFr || null,
      descriptionEn: values.descriptionEn || null,
      descriptionFr: values.descriptionFr || null,
      logoUrl: values.logoUrl || null,
      isActive: values.isActive,
    }

    try {
      if (isEdit && initialData) {
        await updateBrand.mutateAsync({
          id: initialData.id,
          data: payload,
        })
        router.push(`${returnHref}/${initialData.id}`)
      } else {
        await createBrand.mutateAsync(payload)
        form.reset()
        router.push(returnHref)
      }
      router.refresh()
    } catch (error) {
      setServerError(error instanceof Error ? error.message : "The brand could not be saved.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Button type="button" variant="ghost" size="icon" onClick={() => router.push(returnHref)}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back to brands</span>
            </Button>
            <div>
              <h1 className="text-2xl font-semibold tracking-normal text-foreground">
                {isEdit ? "Edit Brand" : "Create Brand"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEdit ? initialData?.nameEn : "Add a bilingual brand record"}
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
              <CardTitle>Brand Details</CardTitle>
              <CardDescription>Names, descriptions, logo, and operating status.</CardDescription>
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
                      name="nameEn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Name (English)</FormLabel>
                          <FormControl>
                            <Input autoComplete="organization" placeholder="Acme Foods" disabled={isSubmitting} {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nameFr"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Brand Name (French)</FormLabel>
                          <FormControl>
                            <Input placeholder="Acme Aliments" disabled={isSubmitting} {...field} value={field.value ?? ""} />
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

                  <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_180px] md:items-end">
                    <FormField
                      control={form.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input type="url" placeholder="https://example.com/logo.png" disabled={isSubmitting} {...field} value={field.value ?? ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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
                  </div>

                  <div className="flex flex-col-reverse gap-3 border-t pt-5 sm:flex-row sm:justify-end">
                    <Button type="button" variant="outline" onClick={() => router.push(returnHref)} disabled={isSubmitting}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      {isEdit ? "Save Changes" : "Create Brand"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>{previewSlug || "brand-slug"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-lg border bg-muted text-xl font-semibold text-muted-foreground">
                {watchedName ? initials(watchedName) : <Building2 className="h-7 w-7" />}
              </div>
              <div>
                <p className="font-medium text-foreground">{watchedName || "Brand name"}</p>
                <p className="text-sm text-muted-foreground">{form.watch("nameFr") || "French name"}</p>
              </div>
              <div className="rounded-md border bg-muted/40 px-3 py-2 font-mono text-xs text-muted-foreground">
                /brands/{previewSlug || "brand-slug"}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
