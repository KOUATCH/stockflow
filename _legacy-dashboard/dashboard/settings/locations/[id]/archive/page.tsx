import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getOrgLocationsClientSafe } from "@/actions/locations/clientSafeLocationActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertTriangle,
  Archive,
  ArrowLeft,
  Building2,
  CheckCircle,
  Info,
  MapPin,
  Package,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface ArchiveLocationPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function ArchiveLocationPage(props: ArchiveLocationPageProps) {
  const params = 'id' in props.params ? props.params : await props.params;
  const locationId = params.id;

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

  const locationsResponse = await getOrgLocationsClientSafe(userOrg);
  const location = locationsResponse.data?.find(loc => loc.id === locationId);

  if (!location) {
    notFound();
  }

  const hasInventory = (location._count?.inventoryLevels || 0) > 0;
  const hasSales = (location._count?.salesOrders || 0) > 0;
  const hasPurchaseOrders = (location._count?.purchaseOrders || 0) > 0;
  const isDefault = location.isDefault === true;

  const canArchive = !isDefault && !hasInventory && !hasSales && !hasPurchaseOrders;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/settings/locations/${locationId}`}>
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Details
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-lg">
                <Archive className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Archive Location
                  </h1>
                  {location.isDefault && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Review and archive {location.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Warning Alert */}
          <Alert className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800 dark:text-orange-200">
              <strong>Warning:</strong> Archiving a location will make it read-only and hide it from most operations.
              This action can be reversed, but should only be done when the location is no longer actively used.
            </AlertDescription>
          </Alert>

          {/* Location Overview */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Location Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Location Name
                  </label>
                  <p className="text-lg font-semibold text-slate-900 dark:text-white">
                    {location.name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Location Code
                  </label>
                  <code className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm font-mono">
                    {location.code}
                  </code>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {location._count?.inventoryLevels || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Inventory Items
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {location._count?.salesOrders || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Sales Orders
                  </div>
                </div>
                <div className="text-center p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                    <TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">
                    {location._count?.purchaseOrders || 0}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    Purchase Orders
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Archive Checklist */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="w-5 h-5" />
                Archive Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {!isDefault ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      Not a default location
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {isDefault
                        ? "This is a default location and cannot be archived. Please set another location as default first."
                        : "This location is not set as default and can be archived."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!hasInventory ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      No active inventory
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {hasInventory
                        ? `Location has ${location._count?.inventoryLevels} inventory items. Transfer or remove all inventory before archiving.`
                        : "No inventory items are associated with this location."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!hasSales ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      No pending sales orders
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {hasSales
                        ? `Location has ${location._count?.salesOrders} sales orders. Complete or cancel all sales orders before archiving.`
                        : "No sales orders are pending at this location."}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {!hasPurchaseOrders ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-600" />
                  )}
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      No pending purchase orders
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {hasPurchaseOrders
                        ? `Location has ${location._count?.purchaseOrders} purchase orders. Complete or cancel all purchase orders before archiving.`
                        : "No purchase orders are pending at this location."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Archive Effects */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>What happens when you archive this location?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <p className="text-slate-600 dark:text-slate-400">
                    The location will be hidden from most lists and dropdown menus
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <p className="text-slate-600 dark:text-slate-400">
                    No new inventory, sales, or purchase orders can be created for this location
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                  <p className="text-slate-600 dark:text-slate-400">
                    Historical data will remain accessible through reports and analytics
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                  <p className="text-slate-600 dark:text-slate-400">
                    The location can be unarchived at any time to restore full functionality
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Link href={`/dashboard/settings/locations/${locationId}`}>
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
            <Button
              variant="destructive"
              disabled={!canArchive}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Archive className="w-4 h-4 mr-2" />
              {canArchive ? "Archive Location" : "Cannot Archive"}
            </Button>
          </div>

          {!canArchive && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                This location cannot be archived yet. Please resolve the requirements above before proceeding.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}