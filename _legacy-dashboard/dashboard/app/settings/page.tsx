import { Suspense } from "react"
import SettingsManagement from "@/components/system/settings/settings-management"

export default function SettingsPage() {
  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-8">
            <Suspense fallback={<div>Loading settings...</div>}>
              <SettingsManagement />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
