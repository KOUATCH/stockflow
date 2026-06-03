import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PresenceAlertsList } from '@/components/presence/PresenceAlertsList';
import { AuthenticatedUser, getAuthenticatedUser } from '@/config/useAuth';

export default async function PresenceAlertsPage() {
  const user: AuthenticatedUser = await getAuthenticatedUser();
  const userOrgId: string = user?.organizationId;

  const isManager = user.roles?.some(role =>
    ['manager', 'admin', 'supervisor'].includes(role.name.toLowerCase())
  ) || false;

  return (
    <div className="container mx-auto p-6 max-w-6xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-8 w-8 text-orange-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Presence Alerts</h1>
          <p className="text-gray-600">
            {isManager
              ? "Monitor and resolve team presence alerts"
              : "View your presence notifications and alerts"
            }
          </p>
        </div>
      </div>

      {/* Alerts List */}
      <PresenceAlertsList
        userId={isManager ? undefined : user.id}
        organizationId={userOrgId}
        isManager={isManager}
      />
    </div>
  );
}