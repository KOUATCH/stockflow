import React from 'react';
import { Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TeamPresenceClient } from '@/components/presence/TeamPresenceClient';
import { AuthenticatedUser, getAuthenticatedUser } from '@/config/useAuth';

export default async function TeamPresencePage() {
  const user: AuthenticatedUser = await getAuthenticatedUser();
  const userOrgId: string = user?.organizationId;

  // Check if user has manager permissions
  const isManager = user.roles?.some(role =>
    ['manager', 'admin', 'supervisor'].includes(role.name.toLowerCase())
  ) || false;

  if (!isManager) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">
              You don't have permission to view team presence data. Please contact your administrator.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Users className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Team Presence</h1>
          <p className="text-gray-600">Monitor and manage your team's attendance</p>
        </div>
      </div>

      {/* Client Component */}
      <TeamPresenceClient organizationId={userOrgId} />
    </div>
  );
}