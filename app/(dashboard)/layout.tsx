"use client";

import ModernNavigation from '@/components/dashboard/ModernNavigation';
import { NotificationProvider } from '@/components/notifications/NotificationProvider';
import { ReactNode } from 'react';

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