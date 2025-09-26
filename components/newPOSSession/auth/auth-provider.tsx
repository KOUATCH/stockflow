"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getCurrentUser } from "@/actions/auth/auth-actions"
import type { User } from "@/actions/auth/auth-actions"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  currentOrganizationId: string | null
  hasPermission: (permission: string) => boolean
  refresh: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  const isAuthenticated = !!user
  const currentOrganizationId = user?.organizations[0]?.organizationId || null

  const hasPermission = (permission: string): boolean => {
    if (!user || user.organizations.length === 0) return false

    return user.organizations.some(
      (org) => org.role.permissions.includes(permission) || org.role.permissions.includes("*"), // Admin permission
    )
  }

  const refresh = async () => {
    try {
      const currentUser = await getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error("Failed to refresh user:", error)
      setUser(null)
    }
  }

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)

        // Redirect logic
        if (currentUser && pathname === "/login") {
          router.push("/pos")
        } else if (!currentUser && pathname !== "/login") {
          router.push("/login")
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setUser(null)
        if (pathname !== "/login") {
          router.push("/login")
        }
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [pathname, router])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    currentOrganizationId,
    hasPermission,
    refresh,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
