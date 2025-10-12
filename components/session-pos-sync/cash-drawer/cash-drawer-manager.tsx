"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { DollarSign, Plus, Minus, Calculator, History, Lock, Unlock, Clock } from "lucide-react"

interface CashDrawerManagerProps {
  terminalId: string
  locationId: string
  organizationId: string
  userId: string
}

interface CashTransaction {
  id: string
  type: "add" | "remove" | "count" | "open" | "close"
  amount: number
  balance: number
  reason: string
  timestamp: Date
  userId: string
}

interface CashCount {
  pennies: number
  nickels: number
  dimes: number
  quarters: number
  ones: number
  fives: number
  tens: number
  twenties: number
  fifties: number
  hundreds: number
}

export function CashDrawerManager({ terminalId, locationId, organizationId, userId }: CashDrawerManagerProps) {
  const [isOpen, setIsOpen] = useState(true)
  const [currentBalance, setCurrentBalance] = useState(847.25)
  const [isCountDialogOpen, setIsCountDialogOpen] = useState(false)
  const [isAddRemoveDialogOpen, setIsAddRemoveDialogOpen] = useState(false)
  const [transactionType, setTransactionType] = useState<"add" | "remove">("add")
  const [amount, setAmount] = useState("")
  const [reason, setReason] = useState("")
  const [cashCount, setCashCount] = useState<CashCount>({
    pennies: 0,
    nickels: 0,
    dimes: 0,
    quarters: 0,
    ones: 0,
    fives: 0,
    tens: 0,
    twenties: 0,
    fifties: 0,
    hundreds: 0,
  })

  const [transactions, setTransactions] = useState<CashTransaction[]>([
    {
      id: "txn-1",
      type: "add",
      amount: 100.0,
      balance: 847.25,
      reason: "Till replenishment",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      userId: "user-1",
    },
    {
      id: "txn-2",
      type: "count",
      amount: 0,
      balance: 747.25,
      reason: "Scheduled count",
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      userId: "user-1",
    },
  ])

  const notifications = useNotifications()

  const calculateCashCountTotal = () => {
    return (
      cashCount.pennies * 0.01 +
      cashCount.nickels * 0.05 +
      cashCount.dimes * 0.1 +
      cashCount.quarters * 0.25 +
      cashCount.ones * 1 +
      cashCount.fives * 5 +
      cashCount.tens * 10 +
      cashCount.twenties * 20 +
      cashCount.fifties * 50 +
      cashCount.hundreds * 100
    )
  }

  const handleCashCount = () => {
    const countedAmount = calculateCashCountTotal()
    const variance = countedAmount - currentBalance

    const newTransaction: CashTransaction = {
      id: `txn-${Date.now()}`,
      type: "count",
      amount: variance,
      balance: countedAmount,
      reason: `Cash count - Variance: $${variance.toFixed(2)}`,
      timestamp: new Date(),
      userId,
    }

    setTransactions((prev) => [newTransaction, ...prev])
    setCurrentBalance(countedAmount)
    setIsCountDialogOpen(false)

    if (Math.abs(variance) > 5) {
      notifications.warning("Cash Count Completed", `Counted: $${countedAmount.toFixed(2)} | Variance: ${variance >= 0 ? "+" : ""}$${variance.toFixed(2)}`);
    } else {
      notifications.success("Cash Count Completed", `Counted: $${countedAmount.toFixed(2)} | Variance: ${variance >= 0 ? "+" : ""}$${variance.toFixed(2)}`);
    }

    // Reset count
    setCashCount({
      pennies: 0,
      nickels: 0,
      dimes: 0,
      quarters: 0,
      ones: 0,
      fives: 0,
      tens: 0,
      twenties: 0,
      fifties: 0,
      hundreds: 0,
    })
  }

  const handleAddRemoveCash = () => {
    const transactionAmount = Number.parseFloat(amount)
    if (isNaN(transactionAmount) || transactionAmount <= 0) {
      notifications.error("Invalid Amount", "Please enter a valid amount greater than 0")
      return
    }

    if (!reason.trim()) {
      notifications.error("Reason Required", "Please provide a reason for this transaction")
      return
    }

    const finalAmount = transactionType === "add" ? transactionAmount : -transactionAmount
    const newBalance = currentBalance + finalAmount

    if (newBalance < 0) {
      notifications.error("Insufficient Funds", "Cannot remove more cash than available in drawer")
      return
    }

    const newTransaction: CashTransaction = {
      id: `txn-${Date.now()}`,
      type: transactionType,
      amount: finalAmount,
      balance: newBalance,
      reason,
      timestamp: new Date(),
      userId,
    }

    setTransactions((prev) => [newTransaction, ...prev])
    setCurrentBalance(newBalance)
    setIsAddRemoveDialogOpen(false)
    setAmount("")
    setReason("")

    notifications.cashOperation(
      transactionType === "add" ? "addition" : "removal",
      transactionAmount,
      `$${transactionAmount.toFixed(2)} ${transactionType === "add" ? "added to" : "removed from"} drawer`
    )
  }

  const toggleDrawer = () => {
    setIsOpen(!isOpen)
    notifications.info(`Cash Drawer ${!isOpen ? "Opened" : "Closed"}`, `Drawer is now ${!isOpen ? "open" : "closed"} for transactions`)
  }

  const getTransactionIcon = (type: CashTransaction["type"]) => {
    switch (type) {
      case "add":
        return <Plus className="w-4 h-4 text-green-600" />
      case "remove":
        return <Minus className="w-4 h-4 text-red-600" />
      case "count":
        return <Calculator className="w-4 h-4 text-blue-600" />
      case "open":
        return <Unlock className="w-4 h-4 text-green-600" />
      case "close":
        return <Lock className="w-4 h-4 text-gray-600" />
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Cash Drawer Status */}
      <Card className="bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-emerald-800">Cash Drawer</h3>
                <p className="text-sm text-emerald-600">Terminal: {terminalId}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant={isOpen ? "default" : "secondary"}
                className={`px-4 py-2 ${
                  isOpen ? "bg-green-100 text-green-800 border-green-200" : "bg-gray-100 text-gray-800 border-gray-200"
                }`}
              >
                {isOpen ? (
                  <>
                    <Unlock className="w-4 h-4 mr-2" />
                    Open
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Closed
                  </>
                )}
              </Badge>
              <Button variant="outline" onClick={toggleDrawer} className="bg-white/80">
                {isOpen ? "Close Drawer" : "Open Drawer"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm font-medium text-emerald-600 mb-2">Current Balance</p>
              <p className="text-3xl font-bold text-emerald-800">${currentBalance.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-emerald-600 mb-2">Today's Transactions</p>
              <p className="text-3xl font-bold text-emerald-800">{transactions.length}</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-emerald-600 mb-2">Last Activity</p>
              <p className="text-lg font-semibold text-emerald-800">
                {transactions[0]?.timestamp.toLocaleTimeString() || "No activity"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Dialog open={isCountDialogOpen} onOpenChange={setIsCountDialogOpen}>
          <DialogTrigger asChild>
            <Button className="h-20 flex-col gap-2 bg-blue-600 hover:bg-blue-700" disabled={!isOpen}>
              <Calculator className="w-6 h-6" />
              <span>Cash Count</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cash Count</DialogTitle>
              <DialogDescription>Count the physical cash in the drawer</DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-4">
                <h4 className="font-semibold">Coins</h4>
                {[
                  { name: "Pennies", key: "pennies", value: 0.01 },
                  { name: "Nickels", key: "nickels", value: 0.05 },
                  { name: "Dimes", key: "dimes", value: 0.1 },
                  { name: "Quarters", key: "quarters", value: 0.25 },
                ].map((coin) => (
                  <div key={coin.key} className="flex items-center gap-2">
                    <Label className="w-20">{coin.name}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={cashCount[coin.key as keyof CashCount]}
                      onChange={(e) =>
                        setCashCount((prev) => ({
                          ...prev,
                          [coin.key]: Number.parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-gray-500">
                      = ${((cashCount[coin.key as keyof CashCount] || 0) * coin.value).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold">Bills</h4>
                {[
                  { name: "$1", key: "ones", value: 1 },
                  { name: "$5", key: "fives", value: 5 },
                  { name: "$10", key: "tens", value: 10 },
                  { name: "$20", key: "twenties", value: 20 },
                  { name: "$50", key: "fifties", value: 50 },
                  { name: "$100", key: "hundreds", value: 100 },
                ].map((bill) => (
                  <div key={bill.key} className="flex items-center gap-2">
                    <Label className="w-20">{bill.name}</Label>
                    <Input
                      type="number"
                      min="0"
                      value={cashCount[bill.key as keyof CashCount]}
                      onChange={(e) =>
                        setCashCount((prev) => ({
                          ...prev,
                          [bill.key]: Number.parseInt(e.target.value) || 0,
                        }))
                      }
                      className="w-20"
                    />
                    <span className="text-sm text-gray-500">
                      = ${((cashCount[bill.key as keyof CashCount] || 0) * bill.value).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between items-center text-lg font-semibold">
                <span>Total Counted:</span>
                <span>${calculateCashCountTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-600 mt-2">
                <span>Expected Balance:</span>
                <span>${currentBalance.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-medium mt-1">
                <span>Variance:</span>
                <span className={calculateCashCountTotal() - currentBalance >= 0 ? "text-green-600" : "text-red-600"}>
                  {calculateCashCountTotal() - currentBalance >= 0 ? "+" : ""}$
                  {(calculateCashCountTotal() - currentBalance).toFixed(2)}
                </span>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCountDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCashCount}>Complete Count</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isAddRemoveDialogOpen} onOpenChange={setIsAddRemoveDialogOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="h-20 flex-col gap-2 bg-green-50 hover:bg-green-100 border-green-200"
              disabled={!isOpen}
              onClick={() => setTransactionType("add")}
            >
              <Plus className="w-6 h-6 text-green-600" />
              <span>Add Cash</span>
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{transactionType === "add" ? "Add Cash" : "Remove Cash"}</DialogTitle>
              <DialogDescription>
                {transactionType === "add" ? "Add cash to" : "Remove cash from"} the drawer
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="flex gap-2">
                <Button
                  variant={transactionType === "add" ? "default" : "outline"}
                  onClick={() => setTransactionType("add")}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Cash
                </Button>
                <Button
                  variant={transactionType === "remove" ? "default" : "outline"}
                  onClick={() => setTransactionType("remove")}
                  className="flex-1"
                >
                  <Minus className="w-4 h-4 mr-2" />
                  Remove Cash
                </Button>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea
                  id="reason"
                  placeholder="Enter reason for this transaction..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddRemoveDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddRemoveCash}>{transactionType === "add" ? "Add Cash" : "Remove Cash"}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          className="h-20 flex-col gap-2 bg-red-50 hover:bg-red-100 border-red-200"
          disabled={!isOpen}
          onClick={() => {
            setTransactionType("remove")
            setIsAddRemoveDialogOpen(true)
          }}
        >
          <Minus className="w-6 h-6 text-red-600" />
          <span>Remove Cash</span>
        </Button>
      </div>

      {/* Transaction History */}
      <Card className="bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="w-5 h-5" />
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No transactions yet</p>
              </div>
            ) : (
              transactions.slice(0, 10).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getTransactionIcon(transaction.type)}
                    <div>
                      <p className="font-medium text-sm capitalize">{transaction.type}</p>
                      <p className="text-xs text-gray-600">{transaction.reason}</p>
                      <p className="text-xs text-gray-500">{transaction.timestamp.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${transaction.amount >= 0 ? "text-green-600" : "text-red-600"}`}>
                      {transaction.amount !== 0 && (transaction.amount >= 0 ? "+" : "")}$
                      {Math.abs(transaction.amount).toFixed(2)}
                    </p>
                    <p className="text-xs text-gray-500">Balance: ${transaction.balance.toFixed(2)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
