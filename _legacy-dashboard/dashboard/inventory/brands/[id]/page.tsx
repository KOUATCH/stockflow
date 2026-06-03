import { ArrowLeft, Edit, Package, Tags } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

import { getBrandById } from "@/actions/brands/getBrandsAction"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getAuthenticatedUser } from "@/config/useAuth"

interface BrandDetailPageProps {
  params: Promise<{ id: string }> | { id: string }
}

function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date))
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export default async function BrandDetailPage({ params }: BrandDetailPageProps) {
  const { id } = await Promise.resolve(params)
  const user = await getAuthenticatedUser()

  if (!user?.organizationId) {
    notFound()
  }

  const brandResult = await getBrandById(id, user.organizationId)

  if (!brandResult.success || !brandResult.data) {
    notFound()
  }

  const brand = brandResult.data

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <Button asChild variant="ghost" size="icon">
              <Link href="/dashboard/inventory/brands">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to brands</span>
              </Link>
            </Button>
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-lg border bg-muted text-lg font-semibold text-muted-foreground">
                {initials(brand.nameEn)}
              </div>
              <div>
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-semibold tracking-normal text-foreground">{brand.nameEn}</h1>
                  <Badge variant={brand.isActive ? "secondary" : "outline"}>
                    {brand.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{brand.nameFr || "No French name"}</p>
                <code className="mt-2 inline-block rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
                  /brands/{brand.slug}
                </code>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/dashboard/inventory/brands/${brand.id}/products`}>
                <Package className="mr-2 h-4 w-4" />
                View Items
              </Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/dashboard/inventory/brands/${brand.id}/edit`}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Brand
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Package className="h-4 w-4" />
                Assigned Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-foreground">{brand.itemCount ?? 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Tags className="h-4 w-4" />
                Brand ID
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="break-all font-mono text-xs text-muted-foreground">{brand.id}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Updated</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground">{formatDate(brand.updatedAt)}</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Descriptions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">English</p>
                <p className="text-sm text-foreground">{brand.descriptionEn || "No English description"}</p>
              </div>
              <div>
                <p className="mb-1 text-sm font-medium text-muted-foreground">French</p>
                <p className="text-sm text-foreground">{brand.descriptionFr || "No French description"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Record Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Created</span>
                <span className="text-right text-foreground">{formatDate(brand.createdAt)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Organization</span>
                <span className="break-all text-right font-mono text-xs text-foreground">{brand.organizationId}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Logo URL</span>
                <span className="break-all text-right text-foreground">{brand.logoUrl || "None"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
