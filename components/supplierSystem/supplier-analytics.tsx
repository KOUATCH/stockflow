"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface SupplierAnalyticsProps {
  supplierId: string
  organizationId: string
}

export default function SupplierAnalytics({ supplierId, organizationId }: SupplierAnalyticsProps) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Supplier Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Analytics for supplier {supplierId} in organization {organizationId}</p>
          <p className="text-muted-foreground">Implementation coming soon...</p>
        </CardContent>
      </Card>
    </div>
  )
}

export { SupplierAnalytics }