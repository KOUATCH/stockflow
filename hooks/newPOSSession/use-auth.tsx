"use client"

import { createContext, useContext, type ReactNode } from "react"
import { loginUser, logoutUser, getCurrentUser } from "@/actions/auth/auth-actions"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"

interface User {
  id: string
  email: string
  name: string
  role: "ADMIN" | "MANAGER" | "CASHIER"
  organizationId: string
  locationId?: string
  location?: {
    id: string
    name: string
  }
  organization?: {
    id: string
    name: string
  }
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  // Query for current user
  const { data: user, isLoading } = useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Login mutation
  const loginMutation = useMutation({
    meta: { operation: 'login', entity: 'User', notify: false },
    mutationFn: ({ email, password }: { email: string; password: string }) => loginUser(email, password),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ["current-user"] })
      }
    },
  })

  // Logout mutation
  const logoutMutation = useMutation({
    meta: { operation: 'logout', entity: 'User', notify: false },
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.clear()
    },
  })

  const login = async (email: string, password: string) => {
    const result = await loginMutation.mutateAsync({ email, password })
    return result
  }

  const logout = async () => {
    await logoutMutation.mutateAsync()
  }

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated: !!user,
    login,
    logout,
    isLoading: isLoading || loginMutation.isPending || logoutMutation.isPending,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: getCurrentUser,
    retry: false,
    staleTime: 5 * 60 * 1000,
  })
}
