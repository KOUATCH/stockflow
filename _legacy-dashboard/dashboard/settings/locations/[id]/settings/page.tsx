import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getOrgLocationsClientSafe } from "@/actions/locations/clientSafeLocationActions";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  CheckCircle,
  MapPin,
  Package,
  Save,
  Settings,
  Shield,
  Star,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface LocationSettingsPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function LocationSettingsPage(props: LocationSettingsPageProps) {
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
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Location Settings
                  </h1>
                  {location.isDefault && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Configure {location.name} settings and preferences
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic Settings */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Basic Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Location Status */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Location Status
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Enable or disable this location for operations
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={location.isActive !== false}
                    // onChange handler would be implemented in client component
                  />
                  <Badge
                    variant={location.isActive !== false ? "default" : "destructive"}
                    className={`flex items-center gap-1 ${
                      location.isActive !== false
                        ? "bg-green-100 text-green-700 border-green-200"
                        : "bg-red-100 text-red-700 border-red-200"
                    }`}
                  >
                    {location.isActive !== false ? (
                      <CheckCircle className="w-3 h-3" />
                    ) : (
                      <XCircle className="w-3 h-3" />
                    )}
                    {location.isActive !== false ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Default Location */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Default Location
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Set as the primary location for new items and operations
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={location.isDefault === true}
                    // onChange handler would be implemented in client component
                  />
                  {location.isDefault && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Settings */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5" />
                Inventory Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Allow Negative Stock */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Allow Negative Stock
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Permit inventory levels to go below zero at this location
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={location.allowNegativeStock === true}
                    // onChange handler would be implemented in client component
                  />
                  {location.allowNegativeStock && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Enabled
                    </Badge>
                  )}
                </div>
              </div>

              {/* Requires Approval */}
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-medium text-slate-900 dark:text-white">
                    Requires Approval
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Require approval for inventory movements at this location
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={location.requiresApproval === true}
                    // onChange handler would be implemented in client component
                  />
                  {location.requiresApproval && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Required
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security & Access */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      Location Permissions
                    </h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Manage user access and permissions for this location
                    </p>
                  </div>
                  <Link href={`/dashboard/settings/locations/${locationId}/permissions`}>
                    <Button variant="outline" size="sm">
                      <Shield className="w-4 h-4 mr-2" />
                      Manage
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location Information */}
          <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Location Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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
              <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  To update location information, use the edit form
                </p>
                <Link href={`/dashboard/settings/locations/${locationId}/edit`}>
                  <Button variant="outline" size="sm">
                    Edit Location
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Save Actions */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Link href={`/dashboard/settings/locations/${locationId}`}>
              <Button variant="outline">
                Cancel
              </Button>
            </Link>
            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}