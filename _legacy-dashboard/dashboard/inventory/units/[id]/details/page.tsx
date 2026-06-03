import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getUnitById } from "@/actions/units/getUnitActions";
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Edit,
  Package,
  Ruler,
  Users,
  TrendingUp,
  Info,
  Clock
} from "lucide-react";
import Link from "next/link";

interface UnitDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UnitDetailsPage({ params }: UnitDetailsPageProps) {
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

  const unitResult = await getUnitById(id, userOrg);

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

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg">
                <Ruler className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Unit Details
                </h1>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  View complete information about this measurement unit
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/dashboard/inventory/units/${id}/items`}>
                <Button variant="outline">
                  <Package className="mr-2 h-4 w-4" />
                  View Items
                </Button>
              </Link>
              <Link href={`/dashboard/inventory/units/${id}/edit`}>
                <Button>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Unit
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Unit Information Card */}
          <div className="lg:col-span-2">
            <Card className="border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                    Unit Information
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Basic Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                      Unit Name
                    </label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="text-slate-900 dark:text-white font-medium">{unit.name}</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                      Symbol
                    </label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="text-slate-900 dark:text-white font-medium">{unit.symbol}</p>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-200 dark:border-slate-700 my-6"></div>

                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                      Created Date
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Calendar className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <p className="text-slate-900 dark:text-white">
                        {new Date(unit.createdAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                      Last Updated
                    </label>
                    <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                      <Clock className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      <p className="text-slate-900 dark:text-white">
                        {new Date(unit.updatedAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Unit ID */}
                <div>
                  <label className="text-sm font-medium text-slate-700 dark:text-slate-300 block mb-2">
                    Unit ID
                  </label>
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <p className="text-slate-600 dark:text-slate-400 font-mono text-sm">{unit.id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Statistics Sidebar */}
          <div className="space-y-6">
            {/* Item Count Card */}
            <Card className="border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
                    <Package className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                    Items Using This Unit
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                    {unit._count.items}
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                    {unit._count.items === 1 ? 'Item uses' : 'Items use'} this unit
                  </p>
                  <Link href={`/dashboard/inventory/units/${id}/items`}>
                    <Button variant="outline" size="sm" className="w-full">
                      <Package className="mr-2 h-4 w-4" />
                      View Items
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions Card */}
            <Card className="border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                    <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                    Quick Actions
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link href={`/dashboard/inventory/units/${id}/edit`} className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Unit Details
                  </Button>
                </Link>
                <Link href={`/dashboard/inventory/units/${id}/items`} className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Package className="mr-2 h-4 w-4" />
                    View Associated Items
                  </Button>
                </Link>
                <Link href="/dashboard/inventory/items/create" className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Users className="mr-2 h-4 w-4" />
                    Create New Item
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Usage Status */}
            <Card className="border border-slate-200/60 dark:border-slate-700/60 bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-900 dark:text-white">
                  Usage Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                    <Badge variant={unit._count.items > 0 ? "default" : "secondary"}>
                      {unit._count.items > 0 ? "In Use" : "Not Used"}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">Items Count</span>
                    <span className="text-sm font-medium text-slate-900 dark:text-white">
                      {unit._count.items}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}