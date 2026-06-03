"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"

interface SimpleLocationFormProps {
  action?: (formData: FormData) => Promise<void>
  organizationId: string
}

export function SimpleLocationForm({ action, organizationId }: SimpleLocationFormProps) {
  const [name, setName] = useState("")
  const [code, setCode] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!action) {
      alert("No action provided")
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', name)
      formData.append('code', code)
      formData.append('type', 'WAREHOUSE')
      formData.append('isActive', 'true')

      console.log("Submitting simple form:", { name, code })
      await action(formData)
      console.log("Form submitted successfully")
    } catch (error) {
      console.error("Form submission error:", error)
      alert(`Error: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-cyan-50/50">
      <div className="max-w-2xl mx-auto p-8">
        <Card>
          <CardHeader>
            <CardTitle>Create Location (Simple)</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Location Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter location name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="code">Location Code</Label>
                <Input
                  id="code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="Enter location code"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                Create Location
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}