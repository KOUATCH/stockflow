import React from 'react';
import { Clock } from 'lucide-react';
import { ClockPageClient } from '@/components/presence/ClockPageClient';
import { AuthenticatedUser, getAuthenticatedUser } from '@/config/useAuth';

export default async function ClockPage() {
  const user: AuthenticatedUser = await getAuthenticatedUser();

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Clock className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Time Clock</h1>
          <p className="text-gray-600">Manage your work time and breaks</p>
        </div>
      </div>

      {/* Client Component */}
      <ClockPageClient userId={user.id} organizationId={user.organizationId} />
    </div>
  );
}