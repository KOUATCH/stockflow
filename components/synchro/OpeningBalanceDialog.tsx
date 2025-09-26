"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Calculator, CheckCircle, DollarSign } from "lucide-react"
import { useState } from "react"

interface OpeningBalanceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (balance: number) => void
  terminalName?: string
  locationName?: string
}

export function OpeningBalanceDialog({
  open,
  onOpenChange,
  onConfirm,
  terminalName = "",
  locationName = "",
}: OpeningBalanceDialogProps) {
  const [balance, setBalance] = useState("")
  const [isValidating, setIsValidating] = useState(false)

  const handleConfirm = async () => {
    const numericBalance = Number.parseFloat(balance)
    if (isNaN(numericBalance) || numericBalance < 0) {
      return
    }

    setIsValidating(true)
    // Simulate validation delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    onConfirm(numericBalance)
    setBalance("")
    setIsValidating(false)
    onOpenChange(false)
  }

  const handleCancel = () => {
    setBalance("")
    onOpenChange(false)
  }

  const isValid = balance !== "" && !isNaN(Number.parseFloat(balance)) && Number.parseFloat(balance) >= 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-2 border-primary/20 shadow-2xl">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center shadow-lg">
            <DollarSign className="w-8 h-8 text-primary-foreground" />
          </div>
          <DialogTitle className="text-2xl font-bold text-foreground">Set Opening Balance</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter the cash amount in the drawer to start your POS session
          </DialogDescription>

          <div className="flex items-center justify-center gap-2 text-sm">
            <Badge variant="outline" className="bg-muted">
              {locationName}
            </Badge>
            <span className="text-muted-foreground">•</span>
            <Badge variant="outline" className="bg-muted">
              {terminalName}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="balance" className="text-sm font-medium text-foreground">
              Opening Cash Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="balance"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                className="pl-10 text-lg font-medium bg-input border-2 focus:border-primary/50 transition-colors"
                autoFocus
              />
            </div>
            {balance && !isValid && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>Please enter a valid amount (0 or greater)</span>
              </div>
            )}
          </div>

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Calculator className="w-4 h-4" />
              <span>Quick Amounts</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[50, 100, 200].map((amount) => (
                <Button
                  key={amount}
                  variant="outline"
                  size="sm"
                  onClick={() => setBalance(amount.toString())}
                  className="bg-background hover:bg-primary/10 border-border"
                >
                  ${amount}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isValidating} className="flex-1 bg-transparent">
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!isValid || isValidating}
            className="flex-1 bg-primary hover:bg-primary/90"
          >
            {isValidating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                <span>Starting...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Start Session</span>
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
