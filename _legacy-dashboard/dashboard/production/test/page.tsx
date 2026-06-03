import React from 'react'

export default function ProductionTestPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold">Production Test Page</h1>
      <p className="text-gray-600">This is a simple test page to isolate any fetch errors.</p>

      <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded">
        <p className="text-green-800">
          If you see this page without errors, the routing is working correctly.
        </p>
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-500">
          Test URL: /dashboard/production/test
        </p>
      </div>
    </div>
  )
}