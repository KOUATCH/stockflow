import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getOrgLocationsClientSafe } from "@/actions/locations/clientSafeLocationActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle,
  MapPin,
  Package,
  ShoppingCart,
  Star,
  Trash2,
  TrendingUp,
  Users,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface DeleteLocationPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function DeleteLocationPage(props: DeleteLocationPageProps) {
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

  const canDelete = !isDefault && !hasInventory && !hasSales && !hasPurchaseOrders;

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
              <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-pink-600 shadow-lg">
                <Trash2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Delete Location
                  </h1>
                  {location.isDefault && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Permanently delete {location.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Danger Alert */}
          <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 dark:text-red-200">
              <strong>Danger Zone:</strong> This action cannot be undone. Deleting a location will permanently remove
              all associated data, including historical records, inventory movements, and transaction history.
              Consider archiving instead of deleting to preserve data.
            </AlertDescription>
          </Alert>

          {/* Location Overview */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 dark:text-red-400">
                <Building2 className="w-5 h-5" />
                Location to be Deleted
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

          {/* Delete Requirements */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-600" />
                Delete Requirements
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
                        ? "This is a default location and cannot be deleted. Please set another location as default first."
                        : "This location is not set as default and can be deleted."}
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
                      No inventory items
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {hasInventory
                        ? `Location has ${location._count?.inventoryLevels} inventory items. Transfer or remove all inventory before deleting.`
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
                      No sales orders
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {hasSales
                        ? `Location has ${location._count?.salesOrders} sales orders. Complete or transfer all sales orders before deleting.`
                        : "No sales orders are associated with this location."}
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
                      No purchase orders
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {hasPurchaseOrders
                        ? `Location has ${location._count?.purchaseOrders} purchase orders. Complete or cancel all purchase orders before deleting.`
                        : "No purchase orders are associated with this location."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Loss Warning */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-red-200 dark:border-red-800">
            <CardHeader>
              <CardTitle className="text-red-600 dark:text-red-400">Data Loss Warning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p className="text-slate-600 dark:text-slate-400">
                  <strong>The following data will be permanently deleted:</strong>
                </p>
                <div className="space-y-2 ml-4">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Location configuration and settings
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Historical inventory movement records
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Sales and purchase order history
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                    <p className="text-slate-600 dark:text-slate-400">
                      Financial reports and analytics data
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-2"></div>
                    <p className="text-slate-600 dark:text-slate-400">
                      User permissions and access controls
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alternative Actions */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Consider These Alternatives</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                    Archive Location
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Hide the location from operations while preserving all historical data.
                  </p>
                  <Link href={`/dashboard/settings/locations/${locationId}/archive`}>
                    <Button variant="outline" size="sm" className="w-full">
                      Archive Instead
                    </Button>
                  </Link>
                </div>
                <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                  <h3 className="font-medium text-slate-900 dark:text-white mb-2">
                    Export Data
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Download all location data before deletion for your records.
                  </p>
                  <Button variant="outline" size="sm" className="w-full">
                    Export Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Confirmation Section */}
          {canDelete && (
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-red-200 dark:border-red-800">
              <CardHeader>
                <CardTitle className="text-red-600 dark:text-red-400">Confirm Deletion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Checkbox id="confirm-understand" />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="confirm-understand"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I understand that this action cannot be undone
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        All location data will be permanently deleted
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Checkbox id="confirm-backup" />
                    <div className="grid gap-1.5 leading-none">
                      <label
                        htmlFor="confirm-backup"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        I have backed up all necessary data
                      </label>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        Important data has been exported or backed up
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Link href={`/dashboard/settings/locations/${locationId}`}>
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
            <Link href={`/dashboard/settings/locations/${locationId}/archive`}>
              <Button variant="outline" className="border-orange-200 text-orange-600 hover:bg-orange-50">
                Archive Instead
              </Button>
            </Link>
            <Button
              variant="destructive"
              disabled={!canDelete}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {canDelete ? "Delete Location" : "Cannot Delete"}
            </Button>
          </div>

          {!canDelete && (
            <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                This location cannot be deleted yet. Please resolve the requirements above before proceeding.
                Consider archiving the location instead to preserve historical data.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </div>
    </div>
  );
}