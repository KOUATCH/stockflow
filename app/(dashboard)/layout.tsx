"use client";

import { ReactNode } from 'react';
import { NotificationProvider } from '@/components/notifications/NotificationProvider';
import ModernNavigation from '@/components/dashboard/ModernNavigation';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <NotificationProvider maxNotifications={5} defaultSoundEnabled={true}>
      <ModernNavigation>
        {children}
      </ModernNavigation>
    </NotificationProvider>
  );
};

export default DashboardLayout;