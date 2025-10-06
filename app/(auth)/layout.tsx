"use client";

import { ReactNode } from "react";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <NotificationProvider maxNotifications={3} defaultSoundEnabled={false}>
      <div>
        {children}
      </div>
    </NotificationProvider>
  );
}
