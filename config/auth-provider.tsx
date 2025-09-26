"use client"

import { createContext, useContext, type ReactNode } from "react"
import type { Session } from "next-auth"

interface AuthContextType {
  user: Session["user"] | null
  session: Session | null
}

const AuthContext = createContext<AuthContextType | null>(null)

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

export function AuthProvider({
  children,
  user,
  session,
}: {
  children: ReactNode
  user: Session["user"] | null
  session: Session | null
}) {
  return <AuthContext.Provider value={{ user, session }}>{children}</AuthContext.Provider>
}
