"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function InputTest() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Input Diagnostic Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="test1">Test Input 1</Label>
          <Input id="test1" type="text" placeholder="Test input" />
        </div>
        <div>
          <Label htmlFor="test2">Test Input 2</Label>
          <Input id="test2" type="number" placeholder="123" />
        </div>
        <div>
          <Label htmlFor="test3">Test Input 3</Label>
          <Input id="test3" type="email" placeholder="test@example.com" />
        </div>
      </CardContent>
    </Card>
  )
}
