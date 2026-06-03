import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function ProductionCostingPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Cost Analysis</h1>
          <p className="text-gray-600">Analyze and track your production costs</p>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-orange-900 mb-2">
            Production Cost Analysis
          </h2>
          <p className="text-orange-700 mb-4">
            This module provides comprehensive cost analysis for your bakery production operations.
          </p>

          <div className="space-y-2">
            <p className="text-sm text-orange-600">Features coming soon:</p>
            <ul className="list-disc list-inside text-sm text-orange-600 space-y-1">
              <li>Real-time cost tracking by batch</li>
              <li>Material, labor, and overhead cost breakdown</li>
              <li>Cost variance analysis</li>
              <li>Cost per unit calculations</li>
              <li>Profitability analysis by recipe</li>
              <li>Budget vs actual cost reporting</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-2">Cost Categories</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Raw Materials</span>
                <span className="font-medium">Coming soon</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Labor</span>
                <span className="font-medium">Coming soon</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Overhead</span>
                <span className="font-medium">Coming soon</span>
              </div>
            </div>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-2">Analysis Tools</h3>
            <p className="text-sm text-gray-600">
              Advanced cost analysis tools and reporting will be available here.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}