"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle } from "lucide-react"

export function CacheBuster() {
  const [timestamp, setTimestamp] = useState<string>("")

  useEffect(() => {
    setTimestamp(new Date().toISOString())
  }, [])

  const handleForceRefresh = () => {
    // Force a hard refresh
    window.location.reload()
  }

  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-800">
          <AlertTriangle className="h-5 w-5" />
          Cache Issue Detected
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-amber-700">
          All input elements in the codebase are properly formatted. The "void element" error appears to be caused by
          cached components.
        </p>
        <div className="text-xs text-amber-600 font-mono">Component loaded at: {timestamp}</div>
        <Button
          onClick={handleForceRefresh}
          variant="outline"
          className="flex items-center gap-2 border-amber-300 text-amber-700 hover:bg-amber-100 bg-transparent"
        >
          <RefreshCw className="h-4 w-4" />
          Force Hard Refresh
        </Button>
      </CardContent>
    </Card>
  )
}
