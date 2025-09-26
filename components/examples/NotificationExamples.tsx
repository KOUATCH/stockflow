"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { DollarSign, Calculator, FileText, Zap, AlertTriangle, CheckCircle2, Info } from "lucide-react"
import { useState } from "react"

export function NotificationExamples() {
  const {
    success,
    error,
    warning,
    info,
    formSuccess,
    formError,
    operationStart,
    operationComplete,
    cashOperation,
    reconciliationResult
  } = useNotifications()

  const [amount, setAmount] = useState("")
  const [variance, setVariance] = useState("")

  // Basic notification examples
  const showBasicNotifications = () => {
    success("Success!", "Operation completed successfully")
    setTimeout(() => error("Error!", "Something went wrong"), 1000)
    setTimeout(() => warning("Warning!", "Please check your input"), 2000)
    setTimeout(() => info("Info", "Here's some useful information"), 3000)
  }

  // Form operation examples
  const showFormNotifications = () => {
    formSuccess("Customer Creation", "New customer 'John Doe' has been added to the system")
    setTimeout(() => formError("Product Update", "Failed to update product", "SKU already exists in the system"), 1500)
  }

  // Operation flow examples
  const showOperationFlow = () => {
    const operationId = operationStart("Processing Inventory")
    setTimeout(() => {
      operationComplete("Processing Inventory", "145 items processed successfully")
    }, 3000)
  }

  // Cash drawer specific examples
  const showCashDrawerNotifications = () => {
    if (amount) {
      cashOperation("add", parseFloat(amount), "Main Register")
      setTimeout(() => {
        cashOperation("remove", parseFloat(amount) / 2, "Main Register")
      }, 2000)
    }
  }

  // Reconciliation examples
  const showReconciliationNotifications = () => {
    if (variance) {
      reconciliationResult(parseFloat(variance), "Drawer #001")
    }
  }

  // Priority and category examples
  const showAdvancedNotifications = () => {
    // High priority error
    error("Critical System Error", "Database connection lost", {
      priority: "high",
      duration: 10000,
      action: {
        label: "Retry Connection",
        onClick: () => console.log("Retrying connection...")
      }
    })

    setTimeout(() => {
      // Cash category with action
      success("Payment Processed", "Customer payment of $156.78 received", {
        category: "cash",
        action: {
          label: "Print Receipt",
          onClick: () => console.log("Printing receipt...")
        }
      })
    }, 1000)

    setTimeout(() => {
      // Operation with progress
      info("Backup in Progress", "System backup is running in the background", {
        category: "operation",
        showProgress: true,
        duration: 8000
      })
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
          Notification System Examples
        </h1>
        <p className="text-slate-600 mt-2">
          Comprehensive examples of the integrated notification system
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Basic Notifications
            </CardTitle>
            <CardDescription>
              Standard notification types with different severities
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={showBasicNotifications} className="w-full">
              Show Basic Notifications
            </Button>
            <div className="mt-4 text-sm text-slate-600">
              <p>This will show:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Success notification</li>
                <li>Error notification</li>
                <li>Warning notification</li>
                <li>Info notification</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Form Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-green-600" />
              Form Operations
            </CardTitle>
            <CardDescription>
              Form submission success and error notifications
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={showFormNotifications} className="w-full">
              Show Form Notifications
            </Button>
            <div className="mt-4 text-sm text-slate-600">
              <p>This will show:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Form success with details</li>
                <li>Form error with retry action</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Operation Flow */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-600" />
              Operation Flow
            </CardTitle>
            <CardDescription>
              Start and completion of long-running operations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={showOperationFlow} className="w-full">
              Show Operation Flow
            </Button>
            <div className="mt-4 text-sm text-slate-600">
              <p>This will show:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Operation start notification</li>
                <li>Operation completion (after 3s)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Cash Operations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-600" />
              Cash Operations
            </CardTitle>
            <CardDescription>
              Cash drawer specific notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="100.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <Button
              onClick={showCashDrawerNotifications}
              disabled={!amount}
              className="w-full"
            >
              Show Cash Operations
            </Button>
            <div className="text-sm text-slate-600">
              <p>This will show:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Cash add notification</li>
                <li>Cash remove notification (after 2s)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Reconciliation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-indigo-600" />
              Reconciliation
            </CardTitle>
            <CardDescription>
              Cash drawer reconciliation results
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="variance">Variance Amount</Label>
              <Input
                id="variance"
                type="number"
                step="0.01"
                placeholder="0.00 (try -5.50 or 15.75)"
                value={variance}
                onChange={(e) => setVariance(e.target.value)}
              />
            </div>
            <Button
              onClick={showReconciliationNotifications}
              disabled={!variance}
              className="w-full"
            >
              Show Reconciliation Result
            </Button>
            <div className="text-sm text-slate-600">
              <p>Different notifications based on variance:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>0: Perfect reconciliation</li>
                <li>±1-10: Minor variance warning</li>
                <li>±10+: Significant variance error</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Advanced Features */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              Advanced Features
            </CardTitle>
            <CardDescription>
              Priority levels, categories, and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={showAdvancedNotifications} className="w-full">
              Show Advanced Notifications
            </Button>
            <div className="mt-4 text-sm text-slate-600">
              <p>This will show:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>High priority error with action</li>
                <li>Cash category with receipt action</li>
                <li>Operation with progress bar</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Examples */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Usage</CardTitle>
          <CardDescription>
            How to use notifications in your components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
            <pre className="text-sm overflow-x-auto">
{`// Import the hook
import { useNotifications } from '@/components/notifications/NotificationProvider'

// Use in your component
const { formSuccess, formError, cashOperation } = useNotifications()

// In form submission
const handleSubmit = async (data) => {
  try {
    await submitForm(data)
    formSuccess("Customer Created", "New customer added successfully")
  } catch (error) {
    formError("Customer Creation", "Failed to create customer", error.message)
  }
}

// In cash operations
const handleAddCash = async (amount, drawer) => {
  try {
    await addCashToDrawer(amount, drawer)
    cashOperation("add", amount, drawer)
  } catch (error) {
    formError("Add Cash", "Failed to add cash", error.message)
  }
}`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}