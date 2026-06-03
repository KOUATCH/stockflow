import { Suspense } from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PhotoStorageConfiguration from '@/components/settings/PhotoStorageConfiguration'
import OrganizationSettingsForm from '@/components/settings/OrganizationSettingsForm'
import {
  Loader2,
  Building2,
  Database,
  Settings2,
  Globe,
  Calendar,
  DollarSign,
  Shield,
  Mail,
  Plug,
  Archive,
  Info,
  ChevronRight,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

export const metadata = {
  title: 'Company Settings | StockFlow',
  description: 'Manage your organization settings and configuration',
}

function LoadingCard() {
  return (
    <Card className="animate-pulse">
      <CardContent className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          <div className="text-center space-y-1">
            <p className="font-medium">Loading settings...</p>
            <p className="text-sm text-muted-foreground">Fetching your organization configuration</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default async function CompanySettingsPage() {
  const session = await auth()

  if (!session?.user?.organizationId) {
    redirect('/unauthorized')
  }


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto py-8 space-y-8">
        {/* Enhanced Header */}
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200">
                  <Building2 className="h-7 w-7 text-emerald-600" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">Company Settings</h1>
                  <p className="text-muted-foreground mt-1">
                    Configure your organization's core settings, integrations, and preferences
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="font-medium px-3 py-1">
                <Settings2 className="h-3 w-3 mr-2" />
                Enterprise Configuration
              </Badge>
              <Button variant="outline" size="sm">
                <Archive className="h-4 w-4 mr-2" />
                Export Settings
              </Button>
            </div>
          </div>

          {/* Status Banner */}
          <Alert className="bg-blue-50 border-blue-200">
            <Info className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-800">
              <strong>Organization Status:</strong> Your settings are synchronized and up to date.
              Changes take effect immediately across all connected services.
            </AlertDescription>
          </Alert>
        </div>

        {/* Main Content with Tabs */}
        <Tabs defaultValue="organization" className="space-y-6">
          <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full lg:w-auto bg-muted/50">
            <TabsTrigger value="organization" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Organization</span>
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="hidden sm:inline">System</span>
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Plug className="h-4 w-4" />
              <span className="hidden sm:inline">Integrations</span>
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              <span className="hidden sm:inline">Advanced</span>
            </TabsTrigger>
          </TabsList>

          {/* Organization Tab */}
          <TabsContent value="organization" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Quick Stats Sidebar */}
              <div className="xl:col-span-1 space-y-4">
                <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-emerald-600" />
                      Organization Health
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Profile Complete</span>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs font-medium">85%</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Settings Configured</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-orange-500" />
                          <span className="text-xs font-medium">12/16</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Security Score</span>
                        <div className="flex items-center gap-1">
                          <Shield className="h-3 w-3 text-blue-500" />
                          <span className="text-xs font-medium">Good</span>
                        </div>
                      </div>
                    </div>

                    <Button size="sm" variant="outline" className="w-full text-xs">
                      View Recommendations
                      <ChevronRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>

                {/* System Information */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium">System Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Organization ID</span>
                        <Badge variant="outline" className="text-xs font-mono">
                          {session.user.organizationId.slice(-8).toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Your Role</span>
                        <Badge variant="secondary" className="text-xs">
                          {session.user.role || 'Member'}
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Last Updated</span>
                        <span className="text-xs">Just now</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Form */}
              <div className="xl:col-span-3">
                <Suspense fallback={<LoadingCard />}>
                  <OrganizationSettingsForm organizationId={session.user.organizationId} />
                </Suspense>
              </div>
            </div>
          </TabsContent>

          {/* System Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="space-y-6">
              {/* Photo Storage */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                      <Database className="h-5 w-5 text-emerald-600" />
                      Photo Storage Configuration
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Manage how images and media files are stored and accessed across your organization
                    </p>
                  </div>
                  <Badge variant="secondary">
                    Infrastructure
                  </Badge>
                </div>

                <Suspense fallback={<LoadingCard />}>
                  <PhotoStorageConfiguration organizationId={session.user.organizationId} />
                </Suspense>
              </div>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <div className="space-y-6">
              <div className="text-center space-y-3">
                <div className="mx-auto p-4 bg-muted/50 rounded-full w-fit">
                  <Plug className="h-8 w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Integration Hub</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    Connect your organization with third-party services, APIs, and external tools
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Email Services */}
                <Card className="border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-base">Email Services</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Configure SMTP settings, email templates, and notification preferences
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>

                {/* Security & Authentication */}
                <Card className="border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-green-500" />
                      <CardTitle className="text-base">Security</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Advanced authentication, 2FA, and security policy management
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>

                {/* API Management */}
                <Card className="border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <Plug className="h-5 w-5 text-purple-500" />
                      <CardTitle className="text-base">API Keys</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      Manage API keys, webhooks, and third-party integrations
                    </p>
                    <Button variant="outline" size="sm" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Advanced Tab */}
          <TabsContent value="advanced" className="space-y-6">
            <div className="space-y-6">
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertDescription className="text-amber-800">
                  <strong>Advanced Settings:</strong> These settings affect core system functionality.
                  Changes should be made carefully and may require administrator privileges.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backup & Recovery */}
                <Card className="border-dashed border-muted-foreground/25">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Archive className="h-5 w-5 text-orange-500" />
                      <CardTitle className="text-base">Backup & Recovery</CardTitle>
                    </div>
                    <CardDescription>
                      Configure automated backups, data retention, and disaster recovery
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>

                {/* Data Export */}
                <Card className="border-dashed border-muted-foreground/25">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <Database className="h-5 w-5 text-cyan-500" />
                      <CardTitle className="text-base">Data Management</CardTitle>
                    </div>
                    <CardDescription>
                      Export data, manage retention policies, and configure archiving
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" disabled>
                      <Clock className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}