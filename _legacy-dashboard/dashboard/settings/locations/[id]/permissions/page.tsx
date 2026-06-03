import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedUser } from "@/config/useAuth";
import { getOrgLocationsClientSafe } from "@/actions/locations/clientSafeLocationActions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  Edit,
  Eye,
  MapPin,
  Plus,
  Search,
  Settings,
  Shield,
  Star,
  Trash2,
  User,
  Users,
  X
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface LocationPermissionsPageProps {
  params: Promise<{ id: string }> | { id: string };
}

// Mock data for permissions - in a real app this would come from your database
const mockUserPermissions = [
  {
    id: "1",
    userName: "John Smith",
    userEmail: "john.smith@company.com",
    role: "Manager",
    permissions: ["read", "write", "manage"],
    canViewInventory: true,
    canModifyInventory: true,
    canViewSales: true,
    canModifySales: false,
    canManageLocation: true,
    assignedAt: new Date("2024-01-15")
  },
  {
    id: "2",
    userName: "Sarah Johnson",
    userEmail: "sarah.johnson@company.com",
    role: "Staff",
    permissions: ["read", "write"],
    canViewInventory: true,
    canModifyInventory: true,
    canViewSales: true,
    canModifySales: false,
    canManageLocation: false,
    assignedAt: new Date("2024-02-20")
  },
  {
    id: "3",
    userName: "Mike Wilson",
    userEmail: "mike.wilson@company.com",
    role: "Viewer",
    permissions: ["read"],
    canViewInventory: true,
    canModifyInventory: false,
    canViewSales: false,
    canModifySales: false,
    canManageLocation: false,
    assignedAt: new Date("2024-03-10")
  },
];

export default async function LocationPermissionsPage(props: LocationPermissionsPageProps) {
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
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
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                    Location Permissions
                  </h1>
                  {location.isDefault && (
                    <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                      <Star className="w-3 h-3 mr-1" />
                      Default
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Manage user access and permissions for {location.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Permissions Overview */}
          <div className="lg:col-span-3 space-y-6">
            {/* Current Users */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    User Permissions ({mockUserPermissions.length})
                  </CardTitle>
                  <Button size="sm" className="bg-gradient-to-r from-blue-600 to-cyan-600">
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search and Filters */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Search users..."
                      className="pl-10"
                    />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Filter by role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Roles</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="staff">Staff</SelectItem>
                      <SelectItem value="viewer">Viewer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Users List */}
                <div className="space-y-4">
                  {mockUserPermissions.map((userPerm) => (
                    <div
                      key={userPerm.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-slate-900 dark:text-white">
                              {userPerm.userName}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {userPerm.role}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {userPerm.userEmail}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {userPerm.canViewInventory && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                                <Eye className="w-3 h-3 mr-1" />
                                View Inventory
                              </Badge>
                            )}
                            {userPerm.canModifyInventory && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
                                <Edit className="w-3 h-3 mr-1" />
                                Modify Inventory
                              </Badge>
                            )}
                            {userPerm.canManageLocation && (
                              <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                                <Settings className="w-3 h-3 mr-1" />
                                Manage Location
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Role Templates */}
            <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Permission Templates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Manager Template */}
                  <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-slate-900 dark:text-white">Manager</h3>
                      <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                        Full Access
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-slate-600 dark:text-slate-400">View all data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-slate-600 dark:text-slate-400">Modify inventory</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-slate-600 dark:text-slate-400">Process sales</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-slate-600 dark:text-slate-400">Manage location</span>
                      </div>
                    </div>
                  </div>

                  {/* Staff Template */}
                  <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-slate-900 dark:text-white">Staff</h3>
                      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        Standard Access
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-slate-600 dark:text-slate-400">View inventory</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-slate-600 dark:text-slate-400">Update stock levels</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-slate-600 dark:text-slate-400">View sales</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-600" />
                        <span className="text-slate-600 dark:text-slate-400">Manage location</span>
                      </div>
                    </div>
                  </div>

                  {/* Viewer Template */}
                  <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-slate-900 dark:text-white">Viewer</h3>
                      <Badge className="bg-gray-100 text-gray-700 border-gray-200">
                        Read Only
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-green-600" />
                        <span className="text-slate-600 dark:text-slate-400">View inventory</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-600" />
                        <span className="text-slate-600 dark:text-slate-400">Modify data</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-600" />
                        <span className="text-slate-600 dark:text-slate-400">Process sales</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-red-600" />
                        <span className="text-slate-600 dark:text-slate-400">Manage location</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Location Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location Info
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Name
                    </label>
                    <p className="font-semibold text-slate-900 dark:text-white">
                      {location.name}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Code
                    </label>
                    <code className="inline-block px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-sm font-mono">
                      {location.code}
                    </code>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Type
                    </label>
                    <p className="text-slate-700 dark:text-slate-300">
                      {location.type?.toLowerCase().replace('_', ' ') || 'Unknown'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add User
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Import Users
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Role Templates
                </Button>
                <Link href={`/dashboard/settings/locations/${locationId}/settings`} className="block">
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Location Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}