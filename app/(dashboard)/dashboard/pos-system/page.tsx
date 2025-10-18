import { auth } from "@/auth"
import { checkAnyPermission } from "@/config/useAuth"
import { PERMISSIONS } from "@/lib/permissions"
import POSSessionManager from '@/components/posSystem/POSSessionManager'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Monitor, MapPin, Wifi, CheckCircle, AlertTriangle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Enterprise POS System | StockFlow',
  description: 'Modern, professional, enterprise-level point of sale system with location-based features and real-time analytics',
}


export default async function ModernPOSSystemPage() {
  // Check POS access permissions
  await checkAnyPermission([
    PERMISSIONS.OPERATE_POS,
    PERMISSIONS.MANAGE_POS_SESSIONS,
    PERMISSIONS.VIEW_POS_REPORTS
  ])

  const session = await auth()

  if (!session?.user?.organizationId) {
    redirect('/login')
  }

  const organizationId = session.user.organizationId
  const userId = session.user.id || 'user_001'
  const userName = session.user.name || `${session.user.firstName} ${session.user.lastName}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="max-w-[2000px] mx-auto">
        {/* System Header */}
        <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
                <Monitor className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Enterprise POS System
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Multi-Location & Multi-Terminal • Modern, Professional, Enterprise-Level
                </p>
              </div>
            </div>

            {/* System Status */}
            <div className="flex items-center gap-4">
              <Card className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Wifi className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Online</span>
                    </div>
                    <div className="w-px h-4 bg-slate-300 dark:bg-slate-600"></div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Active</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                v2.1.0
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Features Banner */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-6 py-3">
          <div className="flex items-center justify-center gap-8 text-sm font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Location-Based Configuration</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Real-Time Analytics</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Enterprise Security</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Multi-Payment Support</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              <span>Advanced Reporting</span>
            </div>
          </div>
        </div>

        {/* Session Management */}
        <div className="p-6">
          <POSSessionManager
            organizationId={organizationId}
            userId={userId}
            userName={userName}
          />
        </div>

        {/* Main POS Interface - Will be enabled after session selection */}
        <div className="px-6 pb-6">
          <Card className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-0 shadow-2xl overflow-hidden">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <div className="p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                  <Monitor className="w-12 h-12 text-slate-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                    Start a Session to Begin
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-md">
                    Select a location and terminal above to start your POS session and begin processing transactions.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer Info */}
        <div className="px-6 pb-6">
          <div className="bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm rounded-xl p-4 border border-slate-200/50 dark:border-slate-700/50">
            <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-4">
                <span>StockFlow Enterprise POS v2.1.0</span>
                <span>•</span>
                <span>Multi-Location & Multi-Terminal Support</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Enhanced with enterprise features, location-based settings, and real-time analytics</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}