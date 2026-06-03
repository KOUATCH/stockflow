"use client"

import { usePathname } from 'next/navigation'
import { useSession } from '@/lib/auth-client'

export function RouteDebugger() {
  const pathname = usePathname()
  const { data: session, status } = useSession()

  if (
    process.env.NODE_ENV !== 'development' ||
    process.env.NEXT_PUBLIC_SHOW_ROUTE_DEBUGGER !== 'true'
  ) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-2 rounded text-xs z-50 max-w-xs">
      <div>Path: {pathname}</div>
      <div>Auth Status: {status}</div>
      <div>User: {session?.user?.email || 'Not logged in'}</div>
      <div>OrgId: {session?.user?.organizationId || 'None'}</div>
    </div>
  )
}
