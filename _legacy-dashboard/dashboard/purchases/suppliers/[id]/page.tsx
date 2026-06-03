import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { getAuthenticatedUser } from "@/config/useAuth";
import {
  ArrowLeft,
  Building2,
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  Edit,
  FileText,
  Globe,
  Mail,
  MapPin,
  Package,
  Phone,
  Settings,
  Shield,
  ShoppingCart,
  Star,
  TrendingUp,
  Truck,
  User,
  Users,
  XCircle
} from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface SupplierDetailsPageProps {
  params: {
    id: string;
  };
}

// Mock data - replace with actual data fetching
const mockSupplierData = {
  id: "supplier_123",
  name: "TechCorp Solutions Ltd.",
  code: "TC001",
  contactPerson: "John Smith",
  email: "contact@techcorp.com",
  phone: "+1 (555) 123-4567",
  address: "123 Business Ave, Suite 100",
  city: "New York",
  state: "NY",
  zipCode: "10001",
  country: "United States",
  taxId: "TAX123456789",
  paymentTerms: 30,
  creditLimit: 50000,
  notes: "Reliable supplier with excellent track record. Prefers email communication.",
  isActive: true,
  createdAt: new Date("2023-01-15"),
  updatedAt: new Date("2024-11-20"),
  organizationId: "org_123",
  // Performance metrics
  onTimeDelivery: 94,
  qualityScore: 4.7,
  totalOrders: 156,
  totalValue: 325000,
  avgOrderValue: 2083,
  isPreferred: true,
  isVerified: true
};

const getSupplierInitials = (name: string) => {
  return name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
};

const getSupplierColor = (name: string) => {
  const colors = [
    'from-blue-500 to-indigo-500',
    'from-green-500 to-emerald-500',
    'from-purple-500 to-violet-500',
    'from-orange-500 to-red-500',
    'from-teal-500 to-cyan-500',
    'from-pink-500 to-rose-500',
    'from-amber-500 to-yellow-500',
    'from-slate-500 to-gray-500'
  ];
  const index = name.length % colors.length;
  return colors[index];
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
};

export default async function SupplierDetailsPage({ params }: SupplierDetailsPageProps) {
  const user = await getAuthenticatedUser();
  const userOrg = user?.organizationId;

  if (!userOrg) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Access Denied</h3>
            <p className="text-muted-foreground">You need to be part of an organization to view supplier details.</p>
          </div>
        </div>
      </div>
    );
  }

  // In a real app, fetch supplier data based on params.id
  const supplier = mockSupplierData;
  const initials = getSupplierInitials(supplier.name);
  const gradientClass = getSupplierColor(supplier.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Header with Back Button */}
        <div className="mb-6">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/purchases/suppliers">
              <Button variant="outline" size="sm" className="gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Suppliers
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${gradientClass} shadow-lg`}>
                <span className="text-white font-bold text-lg">{initials}</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
                  {supplier.name}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  {supplier.code && (
                    <code className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded text-sm font-mono text-slate-600 dark:text-slate-400">
                      {supplier.code}
                    </code>
                  )}
                  <div className="flex gap-1">
                    {supplier.isActive ? (
                      <Badge className="bg-green-100 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-300">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <XCircle className="w-3 h-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                    {supplier.isPreferred && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400">
                        <Star className="w-3 h-3 mr-1" />
                        Preferred
                      </Badge>
                    )}
                    {supplier.isVerified && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400">
                        <Shield className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-auto flex gap-2">
              <Link href={`/dashboard/purchases/suppliers/${supplier.id}/edit`}>
                <Button className="gap-2">
                  <Edit className="w-4 h-4" />
                  Edit Supplier
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Information */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier.contactPerson && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <User className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">{supplier.contactPerson}</p>
                      <p className="text-sm text-slate-500">Contact Person</p>
                    </div>
                  </div>
                )}

                {supplier.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                      <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <a href={`mailto:${supplier.email}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                        {supplier.email}
                      </a>
                      <p className="text-sm text-slate-500">Email Address</p>
                    </div>
                  </div>
                )}

                {supplier.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                      <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <a href={`tel:${supplier.phone}`} className="font-medium text-slate-900 dark:text-white hover:underline">
                        {supplier.phone}
                      </a>
                      <p className="text-sm text-slate-500">Phone Number</p>
                    </div>
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <h4 className="font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Address
                  </h4>
                  {supplier.address ? (
                    <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      <p>{supplier.address}</p>
                      {(supplier.city || supplier.state || supplier.zipCode) && (
                        <p>
                          {[supplier.city, supplier.state].filter(Boolean).join(", ")}
                          {supplier.zipCode && ` ${supplier.zipCode}`}
                        </p>
                      )}
                      {supplier.country && <p>{supplier.country}</p>}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500 italic">No address provided</p>
                  )}
                </div>

                {supplier.taxId && (
                  <>
                    <Separator />
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <p className="font-medium font-mono text-slate-900 dark:text-white">{supplier.taxId}</p>
                        <p className="text-sm text-slate-500">Tax ID</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-6">
            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Truck className="w-5 h-5 text-blue-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">On-Time Delivery</span>
                    </div>
                    <div className={`text-3xl font-bold ${
                      supplier.onTimeDelivery >= 90 ? "text-green-600 dark:text-green-400" :
                      supplier.onTimeDelivery >= 75 ? "text-yellow-600 dark:text-yellow-400" :
                      "text-red-600 dark:text-red-400"
                    }`}>
                      {supplier.onTimeDelivery}%
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Quality Score</span>
                    </div>
                    <div className={`text-3xl font-bold ${
                      supplier.qualityScore >= 4.5 ? "text-green-600 dark:text-green-400" :
                      supplier.qualityScore >= 3.5 ? "text-yellow-600 dark:text-yellow-400" :
                      "text-red-600 dark:text-red-400"
                    }`}>
                      {supplier.qualityScore}
                    </div>
                    <div className="flex items-center justify-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < Math.floor(supplier.qualityScore)
                              ? "text-yellow-500 fill-yellow-500"
                              : "text-slate-300 dark:text-slate-600"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-2">
                      <ShoppingCart className="w-5 h-5 text-purple-500" />
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Orders</span>
                    </div>
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">
                      {supplier.totalOrders}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Financial Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Financial Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Payment Terms:</span>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-slate-500" />
                        <span className="font-semibold">Net {supplier.paymentTerms} days</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Credit Limit:</span>
                      <span className="font-semibold">{formatCurrency(supplier.creditLimit)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Total Order Value:</span>
                      <span className="font-bold text-lg text-green-600 dark:text-green-400">
                        {formatCurrency(supplier.totalValue)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400">Avg Order Value:</span>
                      <span className="font-semibold">{formatCurrency(supplier.avgOrderValue)}</span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                      <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Credit Available</div>
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(supplier.creditLimit * 0.75)} {/* Mock available credit */}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">75% of limit available</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Additional Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Additional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {supplier.notes && (
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Notes</h4>
                    <p className="text-slate-600 dark:text-slate-400">{supplier.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Partnership Since:</span>
                  <span className="font-medium">{formatDate(supplier.createdAt)}</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-400">Last Updated:</span>
                  <span className="font-medium">{formatDate(supplier.updatedAt)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Link href={`/dashboard/purchases/suppliers/${supplier.id}/purchase-history`}>
                    <Button variant="outline" className="w-full gap-2 h-12">
                      <ShoppingCart className="w-4 h-4" />
                      Purchase History
                    </Button>
                  </Link>

                  <Link href={`/dashboard/purchases/suppliers/${supplier.id}/products`}>
                    <Button variant="outline" className="w-full gap-2 h-12">
                      <Package className="w-4 h-4" />
                      View Products
                    </Button>
                  </Link>

                  <Link href={`/dashboard/purchases/suppliers/${supplier.id}/financial`}>
                    <Button variant="outline" className="w-full gap-2 h-12">
                      <DollarSign className="w-4 h-4" />
                      Financial Summary
                    </Button>
                  </Link>

                  <Link href={`/dashboard/purchases/suppliers/${supplier.id}/manage-terms`}>
                    <Button variant="outline" className="w-full gap-2 h-12">
                      <Settings className="w-4 h-4" />
                      Manage Terms
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}