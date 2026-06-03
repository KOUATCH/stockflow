import { Suspense } from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import PhotoStorageConfiguration from '@/components/settings/PhotoStorageConfiguration'
import { Card, CardContent } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export const metadata = {
  title: 'Photo Storage Settings | StockFlow',
  description: 'Configure how photos and images are stored in your system',
}

function LoadingCard() {
  return (
    <Card>
      <CardContent className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading settings...</span>
      </CardContent>
    </Card>
  )
}

export default async function PhotoStorageSettingsPage() {
  const session = await auth()

  if (!session?.user?.organizationId) {
    redirect('/unauthorized')
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Photo Storage Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure how photos and images are stored in your system. Choose between local file storage or cloud-based storage.
        </p>
      </div>

      <Suspense fallback={<LoadingCard />}>
        <PhotoStorageConfiguration organizationId={session.user.organizationId} />
      </Suspense>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Storage Options Explained</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  🗄️ Local Storage
                </h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>Pros:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Full control over your data</li>
                    <li>No external dependencies</li>
                    <li>No monthly storage fees</li>
                    <li>Faster access for local users</li>
                  </ul>

                  <p><strong>Cons:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Requires server disk space</li>
                    <li>Need to handle backups yourself</li>
                    <li>Limited by server storage capacity</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <h3 className="font-semibold flex items-center gap-2">
                  ☁️ Online Storage
                </h3>
                <div className="text-sm text-muted-foreground space-y-2">
                  <p><strong>Pros:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Unlimited scalable storage</li>
                    <li>Automatic backups and redundancy</li>
                    <li>Global CDN for fast access</li>
                    <li>No server maintenance required</li>
                  </ul>

                  <p><strong>Cons:</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Monthly usage fees apply</li>
                    <li>Dependent on third-party service</li>
                    <li>Internet connection required</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-amber-800">Important Notes</h3>
              <div className="text-sm text-amber-700 space-y-2">
                <p>
                  • When switching from online to local storage, existing images stored online will remain accessible but new uploads will be stored locally.
                </p>
                <p>
                  • For local storage, ensure the specified directory has proper write permissions and is accessible via the web.
                </p>
                <p>
                  • Changes take effect immediately for new uploads. Consider your backup strategy when using local storage.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}