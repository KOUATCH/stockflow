import React from 'react'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function ProductionPlanningPage() {
  const session = await auth()

  if (!session || !session.user?.id) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto p-6">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Production Planning</h1>
          <p className="text-gray-600">Plan and schedule your production activities</p>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-purple-900 mb-2">
            Production Planning Module
          </h2>
          <p className="text-purple-700 mb-4">
            This module will help you plan, schedule, and optimize your bakery production workflow.
          </p>

          <div className="space-y-2">
            <p className="text-sm text-purple-600">Features coming soon:</p>
            <ul className="list-disc list-inside text-sm text-purple-600 space-y-1">
              <li>Production schedule planning</li>
              <li>Capacity planning and optimization</li>
              <li>Resource allocation</li>
              <li>Demand forecasting</li>
              <li>Batch scheduling optimization</li>
              <li>Equipment utilization planning</li>
            </ul>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-2">Schedule Overview</h3>
            <p className="text-sm text-gray-600">
              Visual production schedule will be displayed here.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-2">Capacity Planning</h3>
            <p className="text-sm text-gray-600">
              Manage your production capacity and resource allocation.
            </p>
          </div>

          <div className="p-4 border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-2">Optimization</h3>
            <p className="text-sm text-gray-600">
              AI-powered scheduling optimization tools.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}