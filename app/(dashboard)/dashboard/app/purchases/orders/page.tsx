import { Suspense } from "react"
import PurchaseOrdersManagement from "@/components/purchases/purchase-orders-management"

export default function PurchaseOrdersPage() {
  return (
    <div className="flex h-screen bg-background">
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-background">
          <div className="container mx-auto px-6 py-8">
            <Suspense fallback={<div>Loading purchase orders...</div>}>
              <PurchaseOrdersManagement />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  )
}
