"use client"

import { useAuth } from "./auth-provider"

export function UserInfo() {
  const { user } = useAuth()

  return (
    <div className="flex items-center space-x-4">
      <span className="text-sm text-gray-600">Welcome, {user?.name || user?.email}</span>
      {user?.image && (
        <img src={user.image || "/placeholder.svg"} alt="Profile" className="w-8 h-8 rounded-full" loading="lazy" />
      )}
    </div>
  )
}
