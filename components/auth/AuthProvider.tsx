"use client"

import { SessionProvider } from "next-auth/react"
import { ReactNode } from "react"

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider
      // Re-fetch session every 30 minutes
      refetchInterval={30 * 60}
      // Re-fetch session when window gains focus
      refetchOnWindowFocus={true}
    >
      {children}
    </SessionProvider>
  )
}