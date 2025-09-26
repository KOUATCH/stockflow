"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

interface MockUser {
  id: string
  name: string
  email: string
  organizationId: string
}

interface MockSession {
  user: MockUser
}

interface MockSessionContextType {
  data: MockSession | null
  status: "loading" | "authenticated" | "unauthenticated"
  signIn: () => void
  signOut: () => void
}

const MockSessionContext = createContext<MockSessionContextType | undefined>(undefined)

export function MockSessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<MockSession | null>({
    user: {
      id: "mock-user-1",
      name: "John Doe",
      email: "john@example.com",
      organizationId: "org-123",
    },
  })
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("authenticated")

  const signIn = () => {
    setStatus("loading")
    setTimeout(() => {
      setSession({
        user: {
          id: "mock-user-1",
          name: "John Doe",
          email: "john@example.com",
          organizationId: "org-123",
        },
      })
      setStatus("authenticated")
    }, 1000)
  }

  const signOut = () => {
    setSession(null)
    setStatus("unauthenticated")
  }

  return (
    <MockSessionContext.Provider value={{ data: session, status, signIn, signOut }}>
      {children}
    </MockSessionContext.Provider>
  )
}

export function useSession() {
  const context = useContext(MockSessionContext)
  if (context === undefined) {
    throw new Error("useSession must be used within a MockSessionProvider")
  }
  return context
}
