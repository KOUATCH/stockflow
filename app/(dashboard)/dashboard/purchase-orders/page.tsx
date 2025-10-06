"use client";

import { useAuth } from '@/lib/auth-unified';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Clock,
  DollarSign,
  FileText,
  Package,
  Plus,
  ShoppingCart,
  Target,
  TrendingUp,
  Truck
} from "lucide-react";
import Link from "next/link";

export default function ClientPurchaseOrdersPage() {
  const { session, status, hasPermission, user } = useAuth();

  // Show loading state
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl animate-pulse">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Loading Purchase Orders...</h2>
          <p className="text-gray-600">Please wait while we load your data.</p>
        </div>
      </div>
    );
  }

  // Show authentication error
  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Authentication Required</h3>
            <p className="text-muted-foreground">Please log in to access the purchase orders page.</p>
            <div className="mt-4">
              <Link href="/auth/login">
                <Button>Go to Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Check permissions
  const canReadPO = hasPermission('READ_PURCHASE_ORDERS');
  const canCreatePO = hasPermission('CREATE_PURCHASE_ORDERS');

  if (!canReadPO) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <div className="container py-8">
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-3">Access Denied</h3>
            <p className="text-muted-foreground">You don't have permission to view purchase orders.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6 space-y-6 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {/* Enhanced Page Header */}
        <div className="flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800 p-6 rounded-2xl shadow-xl border border-emerald-200/60 dark:border-slate-600/60 backdrop-blur-sm mb-6 sm:mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg">
              <ShoppingCart className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent flex items-center gap-3">
                Purchase Orders
              </h1>
              <p className="text-muted-foreground text-lg mt-1">
                Manage procurement and supplier orders with modern efficiency
              </p>
              <div className="flex items-center gap-4 mt-3">
                <Badge variant="outline" className="flex items-center gap-2 px-3 py-1 bg-white/80 backdrop-blur-sm">
                  <Activity className="h-4 w-4 text-emerald-500" />
                  Client-side Version
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 font-medium bg-white/80 backdrop-blur-sm">
                  User: {user?.name || 'Unknown'}
                </Badge>
                <Badge variant="secondary" className="px-3 py-1 font-medium bg-white/80 backdrop-blur-sm">
                  Org: {user?.organizationName || 'No Organization'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
            >
              <FileText className="w-4 h-4" />
              Export
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex items-center gap-2 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all"
            >
              <BarChart3 className="w-4 h-4" />
              Analytics
            </Button>
            {canCreatePO && (
              <Link href="/dashboard/purchase-orders/new">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-lg hover:shadow-xl transition-all h-12 text-base font-semibold px-6"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create PO
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Debug Information */}
        <Card className="bg-gradient-to-r from-blue-500 via-blue-600 to-blue-600 border-0 shadow-xl text-white overflow-hidden relative mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-500/20 backdrop-blur-3xl"></div>
          <CardContent className="p-6 relative z-10">
            <h3 className="text-xl font-bold mb-4">Authentication Status</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{status}</div>
                <div className="text-blue-100 font-medium">Auth Status</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{session ? 'Yes' : 'No'}</div>
                <div className="text-blue-100 font-medium">Has Session</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{canReadPO ? 'Yes' : 'No'}</div>
                <div className="text-blue-100 font-medium">Can Read PO</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{canCreatePO ? 'Yes' : 'No'}</div>
                <div className="text-blue-100 font-medium">Can Create PO</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-white/20 shadow-2xl rounded-2xl overflow-hidden hover:shadow-3xl transition-all duration-300">
          <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 dark:from-slate-800 dark:to-slate-700 px-6 py-5 border-b border-emerald-200/60 dark:border-slate-700/60 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-sm">
                  <ShoppingCart className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Purchase Order Management</h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Client-side version - Database connection issues prevented server-side rendering
                  </p>
                </div>
              </div>
              <Badge
                variant="secondary"
                className="bg-white/80 backdrop-blur-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700 shadow-sm"
              >
                <Activity className="w-3 h-3 mr-1" />
                Client Mode
              </Badge>
            </div>
          </div>

          <div className="p-6">
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                <ShoppingCart className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Purchase Orders Page Loaded Successfully!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                The navigation and authentication are working correctly.
                The server-side database connection needs to be fixed to load actual purchase order data.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Button variant="outline">
                  <Package className="w-4 h-4 mr-2" />
                  View Mock Data
                </Button>
                {canCreatePO && (
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Purchase Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}