"use client";

import { useSession } from "next-auth/react";

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    user: session?.user || null,
    isLoading: status === "loading",
    isAuthenticated: !!session?.user,
    session,
    status
  };
}

// For components that expect authClient pattern
export const authClient = {
  useSession,
  signIn: async () => {
    // Redirect to login page
    window.location.href = "/login";
  },
  signOut: async () => {
    // Use NextAuth signOut
    const { signOut } = await import("next-auth/react");
    await signOut({ callbackUrl: "/login" });
  },
};

export const {
  useSession: useAuthSession,
} = authClient;