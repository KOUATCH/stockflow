"use client";

// =============================================================================
// FINANCIAL REPORTING DASHBOARD PAGE
// Main financial reporting dashboard with role-based access
// =============================================================================

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { RoleBasedFinancialDashboard } from '@/components/financial-reporting/role-based-financial-dashboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, AlertTriangle } from 'lucide-react';

export default function FinancialReportingPage() {
  const { user, isLoading, error } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </CardHeader>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-80 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto py-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load user authentication. Please refresh the page or contact support.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // No user state
  if (!user) {
    return (
      <div className="container mx-auto py-6">
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the financial reporting dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Main dashboard
  return (
    <div className="container mx-auto py-6">
      <RoleBasedFinancialDashboard
        organizationId={user.organizationId}
      />
    </div>
  );
}