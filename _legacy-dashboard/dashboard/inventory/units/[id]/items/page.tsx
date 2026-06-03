import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getItemsByUnit, getUnitById } from "@/actions/units/getUnitActions";
import {
  AlertTriangle,
  ArrowLeft,
  Package,
  Ruler,
  Eye,
  Edit,
  ShoppingCart,
  Calendar,
  Tag,
  DollarSign
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import Image from "next/image";

interface UnitsItemsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UnitsItemsPage({ params }: UnitsItemsPageProps) {
  const { id } = await params;
  const user = await getAuthenticatedUser();
  const userOrg = user?.organizationId;

  if (!userOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Organization Required</h3>
            <p className="text-muted-foreground">No organization found for the current user.</p>
          </div>
        </div>
      </div>
    );
  }

  const [unitResult, itemsResult] = await Promise.all([
    getUnitById(id, userOrg),
    getItemsByUnit(id, userOrg),
  ]);

  if (!unitResult.success || !unitResult.data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <Ruler className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">Unit Not Found</h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              The unit you're looking for could not be found.
            </p>
            <Link href="/dashboard/inventory/units">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Units
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const unit = unitResult.data;
  const items = itemsResult.success ? itemsResult.data || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-blue-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4 mb-4">
            <Link href="/dashboard/inventory/units">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Units
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
              <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                Items using {unit.name} ({unit.symbol})
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {items.length} {items.length === 1 ? 'item' : 'items'} found
              </p>
            </div>
          </div>
        </div>

        {/* Unit Info Card */}
        <Card className="mb-6 border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Ruler className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                    {unit.name}
                  </CardTitle>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Symbol: {unit.symbol}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/inventory/units/${id}/details`}>
                  <Button variant="outline" size="sm">
                    <Eye className="mr-2 h-4 w-4" />
                    Details
                  </Button>
                </Link>
                <Link href={`/dashboard/inventory/units/${id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Items Grid */}
        {items.length === 0 ? (
          <Card className="border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-xl">
            <CardContent className="py-16 text-center">
              <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">No Items Found</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">
                No items are currently using this measurement unit.
              </p>
              <Link href="/dashboard/inventory/items/create">
                <Button>
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Create New Item
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => (
              <Card key={item.id} className="group border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02]">
                <CardContent className="p-4">
                  {/* Item Image */}
                  <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-lg mb-4 overflow-hidden">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.name}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-slate-400" />
                      </div>
                    )}
                  </div>

                  {/* Item Info */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h3 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight line-clamp-2">
                        {item.name}
                      </h3>
                      <Badge variant={item.isActive ? "default" : "secondary"} className="ml-2 text-xs">
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                      <Tag className="w-3 h-3" />
                      <span>{item.sku}</span>
                    </div>

                    {item.category && (
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Category: {item.category.name}
                      </div>
                    )}

                    {item.brand && (
                      <div className="text-xs text-slate-600 dark:text-slate-400">
                        Brand: {item.brand.name}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700">
                      <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                        <DollarSign className="w-3 h-3" />
                        <span>${item.sellingPrice.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      <Link href={`/dashboard/inventory/items/${item.id}/others`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Eye className="mr-2 h-3 w-3" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/dashboard/inventory/items/${item.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          <Edit className="mr-2 h-3 w-3" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}