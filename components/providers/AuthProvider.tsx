"use client";

import { authClient } from "@/hooks/useAuth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <authClient.SessionProvider>
      {children}
    </authClient.SessionProvider>
  );
}