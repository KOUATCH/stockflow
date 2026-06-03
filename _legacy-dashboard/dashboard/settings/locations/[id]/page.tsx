import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getOrgLocationsClientSafe } from "@/actions/locations/clientSafeLocationActions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  Edit,
  Mail,
  MapPin,
  Package,
  Phone,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  TrendingUp,
  Users,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface LocationDetailsPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function LocationDetailsPage(props: LocationDetailsPageProps) {
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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date));
  };

  const getLocationTypeIcon = (type: string | undefined) => {
    switch (type) {
      case "WAREHOUSE":
        return Package;
      case "STORE":
        return ShoppingCart;
      case "DISTRIBUTION_CENTER":
        return Building2;
      case "SUPPLIER":
      case "CUSTOMER":
        return Users;
      case "MANUFACTURING":
        return Settings;
      case "QUARANTINE":
      case "DAMAGED":
        return Shield;
      case "TRANSIT":
        return TrendingUp;
      default:
        return Building2;
    }
  };

  const IconComponent = getLocationTypeIcon(location.type);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/settings/locations">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Locations
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {location.name}
                  </h1>
                  {location.isDefault && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Location Details & Management
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <IconComponent className="w-5 h-5" />
                    Basic Information
                  </CardTitle>
                  <Link href={`/dashboard/settings/locations/${location.id}/edit`}>
                    <Button size="sm" variant="outline">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                </div>
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

                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Location Type
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <IconComponent className="w-4 h-4" />
                    <Badge variant="outline">
                      {location.type?.toLowerCase().replace('_', ' ') || 'Unknown'}
                    </Badge>
                  </div>
                </div>

                {location.address && (
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Address
                    </label>
                    <div className="flex items-start gap-2 mt-1">
                      <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
                      <p className="text-slate-700 dark:text-slate-300">{location.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contact Information */}
            {(location.phone || location.email) && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {location.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">{location.email}</span>
                    </div>
                  )}
                  {location.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">{location.phone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Activity Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center">
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
                  <div className="text-center">
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
                  <div className="text-center">
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
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle>Status & Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400 block mb-2">
                    Current Status
                  </label>
                  <Badge
                    variant={location.isActive !== false ? "default" : "destructive"}
                    className={`flex items-center gap-1 w-fit ${
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

                <div className="space-y-2">
                  {location.allowNegativeStock && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      Allows Negative Stock
                    </Badge>
                  )}
                  {location.requiresApproval && (
                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                      Requires Approval
                    </Badge>
                  )}
                  {location.isDefault && (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default Location
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href={`/dashboard/settings/locations/${location.id}/edit`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Location
                  </Button>
                </Link>
                <Link href={`/dashboard/settings/locations/${location.id}/settings`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Location Settings
                  </Button>
                </Link>
                <Link href={`/dashboard/settings/locations/${location.id}/permissions`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Shield className="w-4 h-4 mr-2" />
                    Manage Permissions
                  </Button>
                </Link>
                <Link href={`/dashboard/inventory/levels?locationId=${location.id}`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-2" />
                    View Inventory
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Created Info */}
            <Card>
              <CardHeader>
                <CardTitle>Location Created</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {formatDate(location.createdAt)}
                  </span>
                </div>
                {location.updatedAt && (
                  <div className="flex items-center gap-2 mt-2">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Updated: {formatDate(location.updatedAt)}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}