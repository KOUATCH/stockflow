import React from 'react';
import { PresenceDashboard } from '@/components/presence/PresenceDashboard';
import { AuthenticatedUser, getAuthenticatedUser } from '@/config/useAuth';

export default async function PresencePage() {
  const user: AuthenticatedUser = await getAuthenticatedUser();
  const userOrgId: string = user?.organizationId;

  return (
    <PresenceDashboard
      organizationId={userOrgId}
      currentUserId={user.id}
      userRole={user.roles?.[0]?.name || 'employee'}
    />
  );
}