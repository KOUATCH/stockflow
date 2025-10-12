"use client";

import React from 'react';
import { ClockInOutPanel } from './ClockInOutPanel';
import { PresenceStatusCard } from './PresenceStatusCard';
import { useCurrentPresenceStatus } from '@/hooks/usePresenceQueries';

interface ClockPageClientProps {
  userId: string;
  organizationId: string;
}

export function ClockPageClient({ userId, organizationId }: ClockPageClientProps) {
  const { data: currentStatus } = useCurrentPresenceStatus(userId);

  return (
    <>
      {/* Current Status */}
      <PresenceStatusCard
        status={currentStatus}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
      />

      {/* Clock In/Out Panel */}
      <ClockInOutPanel currentStatus={currentStatus} organizationId={organizationId} />
    </>
  );
}