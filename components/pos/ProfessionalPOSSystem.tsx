"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useLocale, useTranslations } from "next-intl"
import {
  AlertTriangle,
  Banknote,
  Barcode,
  Boxes,
  CheckCircle2,
  Clock,
  ClipboardList,
  CreditCard,
  Eye,
  Heart,
  ImageIcon,
  LayoutGrid,
  List,
  Minus,
  Monitor,
  PackageCheck,
  PauseCircle,
  Plus,
  Printer,
  Receipt,
  Search,
  ShieldCheck,
  Smartphone,
  Star,
  Tag,
  Trash2,
  UserRound,
  UsersRound,
  Wallet,
  Wifi,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ButtonProps } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import { cn } from "@/lib/utils"
import {
  useActivePOSCart,
  useActivePOSShift,
  useAddPOSCartLine,
  useClosePOSShift,
  useCommitPOSSale,
  useOpenPOSShift,
  usePOSCatalog,
  usePOSCustomers,
  usePOSLocations,
  usePOSTerminals,
  useRemovePOSCartLine,
  useUpdatePOSCartLine,
} from "@/hooks/posHooks/usePosOperations"

type ActionResponse<T> = { success: true; data: T; error: null } | { success: false; data: null; error: string }

type TenderMethod = "CASH" | "CARD" | "MOBILE_MONEY" | "BANK_TRANSFER" | "STORE_CREDIT" | "ON_ACCOUNT"
type ReceiptChannel = "PRINT" | "EMAIL" | "SMS" | "WHATSAPP" | "NONE"
type CatalogView = "all" | "favorites" | "recent"

type CommitSaleResult = {
  saleId: string
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  amountPaid: number
  onAccountAmount: number
  changeDue: number
  receipt?: { digitalReceiptUrl?: string | null } & Record<string, unknown>
  delivery: {
    channel: ReceiptChannel
    status: string
    message: string
    digitalReceiptUrl?: string | null
  } | null
}

type CatalogItem = {
  id: string
  sku: string
  barcode: string | null
  nameEn: string
  nameFr: string | null
  thumbnail: string | null
  sellingPrice: number
  trackInventory: boolean
  brand?: { nameEn: string; nameFr: string | null } | null
  category?: { id: string; titleEn: string; titleFr: string | null } | null
  stock: {
    quantityOnHand: number
    quantityAvailable: number
    reorderPoint: number
    status: string
  }
}

type POSCustomer = {
  id: string
  name: string
  code: string | null
  email: string | null
  phone: string | null
  creditLimit: number | null
  isActive: boolean
  totalOrders: number
  totalRevenue: number
}

type TenderLineState = {
  id: string
  method: TenderMethod
  amount: string
  reference: string
}

type TenderPreview = {
  tenders: Array<{ method: TenderMethod; amount: number; reference?: string }>
  totalTendered: number
  paid: number
  due: number
  change: number
  hasNonCashOverpay: boolean
}

function unwrap<T>(response: ActionResponse<T> | undefined | null, fallback: T): T {
  return response?.success ? response.data : fallback
}

function firstLocationId(locations: Array<{ id: string; isDefault?: boolean }>) {
  return locations.find((location) => location.isDefault)?.id || locations[0]?.id || ""
}

function stockBadgeVariant(status: string) {
  if (status === "out") return "destructive" as const
  if (status === "low") return "secondary" as const
  return "outline" as const
}

function localizedName(entity: { nameEn?: string; nameFr?: string | null; titleEn?: string; titleFr?: string | null }, locale: string) {
  if (locale === "fr") return entity.nameFr || entity.titleFr || entity.nameEn || entity.titleEn || ""
  return entity.nameEn || entity.titleEn || entity.nameFr || entity.titleFr || ""
}

function stockProgress(item: CatalogItem, displayedOnHand: number) {
  if (!item.trackInventory || item.stock.status === "not_tracked") return 100
  const reorderPoint = Math.max(1, Number(item.stock.reorderPoint || 8))
  return Math.min(100, Math.round((Math.max(0, displayedOnHand) / Math.max(reorderPoint * 2, displayedOnHand, 1)) * 100))
}

function customerInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "C"
}

function uniqueTenderAmounts(amounts: number[]) {
  return Array.from(new Set(amounts.map((amount) => Number(amount.toFixed(2))).filter((amount) => Number.isFinite(amount) && amount > 0)))
}

function cashTenderOptions(total: number) {
  if (total <= 0) return []

  return uniqueTenderAmounts([
    total,
    Math.ceil(total / 5) * 5,
    Math.ceil(total / 10) * 10,
    Math.ceil(total / 20) * 20,
    Math.ceil(total / 50) * 50,
  ]).slice(0, 4)
}

function createTenderLine(method: TenderMethod = "CASH", amount = ""): TenderLineState {
  return {
    id: `tender-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    method,
    amount,
    reference: "",
  }
}

function parseTenderAmount(value: string) {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function previewTenders(lines: TenderLineState[], total: number): TenderPreview {
  const normalizedLines = lines
    .map((line) => ({
      method: line.method,
      amount: lines.length === 1 && line.amount.trim() === "" ? total : parseTenderAmount(line.amount),
      reference: line.reference.trim() || undefined,
    }))
    .filter((line) => line.amount > 0)

  let remaining = total
  let change = 0
  let paid = 0
  let hasNonCashOverpay = false

  for (const line of normalizedLines) {
    if (remaining <= 0) {
      if (line.method !== "CASH") hasNonCashOverpay = true
      change += line.method === "CASH" ? line.amount : 0
      continue
    }

    if (line.method === "CASH") {
      const applied = Math.min(line.amount, remaining)
      paid += applied
      change += Math.max(0, line.amount - remaining)
      remaining = Math.max(0, remaining - applied)
      continue
    }

    if (line.amount > remaining) {
      hasNonCashOverpay = true
    }

    paid += Math.min(line.amount, remaining)
    remaining = Math.max(0, remaining - line.amount)
  }

  return {
    tenders: normalizedLines.map((line) => ({ method: line.method, amount: line.amount, reference: line.reference })),
    totalTendered: normalizedLines.reduce((sum, line) => sum + line.amount, 0),
    paid: Math.min(paid, total),
    due: Math.max(0, total - paid),
    change,
    hasNonCashOverpay,
  }
}

function actionError(response: unknown) {
  if (typeof response === "object" && response !== null && "success" in response && response.success === false) {
    return String((response as { error?: unknown }).error || "Unknown error")
  }

  return null
}

function toErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message
  if (typeof error === "string") return error
  return fallback
}

const tenderMethods: TenderMethod[] = ["CASH", "CARD", "MOBILE_MONEY", "BANK_TRANSFER", "STORE_CREDIT", "ON_ACCOUNT"]
const receiptChannels: ReceiptChannel[] = ["NONE", "PRINT", "EMAIL", "SMS", "WHATSAPP"]
const posSurfaceClass =
  "border border-[#254653] bg-[#142129] text-[#e6f3f8] shadow-[0_18px_44px_rgba(5,12,16,0.24)]"
const posPanelClass =
  "rounded-md border border-[#2b4b58] bg-[#102027] text-[#e6f3f8] shadow-sm"
const posInsetClass =
  "rounded-md border border-[#345966] bg-[#162b35] text-[#e6f3f8] shadow-sm"
const posFieldClass =
  "border-[#3a606c] bg-[#0f1d25] text-[#eef8fb] placeholder:text-[#78919a] focus-visible:ring-[#2dd4bf]/30 disabled:cursor-not-allowed disabled:opacity-60"
const posSelectClass =
  "mt-1 h-10 w-full rounded-md border border-[#3a606c] bg-[#0f1d25] px-3 text-sm text-[#eef8fb] shadow-sm outline-none transition focus:border-[#2dd4bf] focus:ring-2 focus:ring-[#2dd4bf]/20 disabled:cursor-not-allowed disabled:opacity-60"
const posLabelClass = "block text-xs font-medium text-[#a9c3c8]"
const posMutedTextClass = "text-[#a9c3c8]"
const posDividerClass = "border-[#2b4b58]"
const posDialogClass = "border-[#2b4b58] bg-[#142129] text-[#e6f3f8] shadow-[0_20px_50px_rgba(5,12,16,0.34)]"
const posDialogHeaderClass = "border-b border-[#2b4b58] bg-[#0f171d] px-5 py-4"
const posButtonBaseClass = "font-semibold tracking-normal disabled:cursor-not-allowed disabled:opacity-60"
const posButtonClass =
  "border !border-[#3d6372] !bg-[#17313d] !text-[#f1fbff] shadow-sm transition hover:!border-[#2dd4bf]/60 hover:!bg-[#214858] hover:!text-white focus-visible:!ring-[#2dd4bf]/35 disabled:!border-[#2a4652] disabled:!bg-[#13262f] disabled:!text-[#78919a]"
const posButtonActiveClass =
  "border !border-[#2dd4bf]/70 !bg-[#0f746c] !text-white shadow-[0_10px_22px_rgba(15,116,108,0.24)] ring-2 ring-[#2dd4bf]/25 hover:!border-[#43e3d4] hover:!bg-[#0b625c] hover:!text-white"
const posButtonDangerClass =
  "border !border-[#7f1d1d]/70 !bg-[#3b1118] !text-[#ffd4db] shadow-sm hover:!border-[#ef8ea0]/45 hover:!bg-[#561722] hover:!text-white"
const posButtonPrimaryClass =
  "border !border-[#43d6c7] !bg-[#0f746c] !bg-none !text-white shadow-[0_12px_26px_rgba(15,116,108,0.30)] hover:!border-[#6ceee1] hover:!bg-[#0b625c] hover:!text-white disabled:!border-[#2f5360] disabled:!bg-[#17313d] disabled:!text-[#78919a]"
const posChipClass =
  "!border-[#2dd4bf]/35 !bg-[#11363a] !text-[#c8fff8]"
const posCountChipClass =
  "!border-[#3d6372] !bg-[#17313d] !text-[#e6f3f8]"

function POSButton({ className, variant: _variant, ...buttonProps }: ButtonProps) {
  void _variant

  return <Button {...buttonProps} variant={null as ButtonProps["variant"]} className={cn(posButtonBaseClass, className)} />
}

export default function ProfessionalPOSSystem() {
  const t = useTranslations("pos")
  const locale = useLocale()
  const notifications = useNotifications()
  const searchRef = useRef<HTMLInputElement>(null)
  const customerSearchRef = useRef<HTMLInputElement>(null)
  const tenderAmountRef = useRef<HTMLInputElement>(null)
  const [selectedLocationId, setSelectedLocationId] = useState("")
  const [selectedTerminalId, setSelectedTerminalId] = useState("")
  const [selectedCategoryId, setSelectedCategoryId] = useState("")
  const [selectedCustomerId, setSelectedCustomerId] = useState("")
  const [selectedProductId, setSelectedProductId] = useState("")
  const [catalogView, setCatalogView] = useState<CatalogView>("all")
  const [search, setSearch] = useState("")
  const [customerSearch, setCustomerSearch] = useState("")
  const [openingBalance, setOpeningBalance] = useState("0")
  const [closingBalance, setClosingBalance] = useState("")
  const [tenderLines, setTenderLines] = useState<TenderLineState[]>(() => [createTenderLine()])
  const [receiptChannel, setReceiptChannel] = useState<ReceiptChannel>("NONE")
  const [receiptDestination, setReceiptDestination] = useState("")
  const [lastSale, setLastSale] = useState<CommitSaleResult | null>(null)
  const [favoriteItemIds, setFavoriteItemIds] = useState<string[]>([])
  const [recentItemIds, setRecentItemIds] = useState<string[]>([])
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [isEndShiftDialogOpen, setIsEndShiftDialogOpen] = useState(false)
  const [touchMode, setTouchMode] = useState(false)
  const [gridMode, setGridMode] = useState<"grid" | "list">("grid")

  const locationsQuery = usePOSLocations()
  const locations = unwrap(locationsQuery.data, [])
  const terminalsQuery = usePOSTerminals(selectedLocationId || undefined)
  const terminals = unwrap(terminalsQuery.data, [])
  const activeShiftQuery = useActivePOSShift(selectedTerminalId || undefined)
  const activeShift = unwrap(activeShiftQuery.data, null)
  const customersQuery = usePOSCustomers()
  const customers = useMemo(
    () => customersQuery.data?.success ? ((customersQuery.data.data ?? []) as POSCustomer[]) : [],
    [customersQuery.data],
  )
  const catalogQuery = usePOSCatalog({
    locationId: selectedLocationId || undefined,
    search,
    categoryId: selectedCategoryId || undefined,
  })
  const catalog = unwrap(catalogQuery.data, { categories: [], items: [] })
  const cartQuery = useActivePOSCart({
    locationId: selectedLocationId || undefined,
    terminalId: selectedTerminalId || undefined,
    sessionId: activeShift?.id,
  })
  const cart = unwrap(cartQuery.data, null)

  const openShift = useOpenPOSShift()
  const closeShift = useClosePOSShift()
  const addLine = useAddPOSCartLine()
  const updateLine = useUpdatePOSCartLine()
  const removeLine = useRemovePOSCartLine()
  const commitSale = useCommitPOSSale()

  const selectedLocation = locations.find((location) => location.id === selectedLocationId)
  const selectedTerminal = terminals.find((terminal) => terminal.id === selectedTerminalId)
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId)
  const selectedProduct = (catalog.items as CatalogItem[]).find((item) => item.id === selectedProductId) || null
  const currency = selectedLocation?.organization?.currency || "USD"
  const money = useMemo(
    () => new Intl.NumberFormat(locale, { style: "currency", currency }),
    [currency, locale],
  )

  const cartQuantitiesByItemId = useMemo(() => {
    const quantities = new Map<string, number>()
    cart?.lines.forEach((line) => {
      quantities.set(line.itemId, (quantities.get(line.itemId) ?? 0) + line.quantity)
    })
    return quantities
  }, [cart?.lines])

  const visibleCatalogItems = useMemo(() => {
    const items = catalog.items as CatalogItem[]
    if (catalogView === "favorites") return items.filter((item) => favoriteItemIds.includes(item.id))
    if (catalogView === "recent") return items.filter((item) => recentItemIds.includes(item.id))
    return items
  }, [catalog.items, catalogView, favoriteItemIds, recentItemIds])

  const visibleCustomers = useMemo(() => {
    const query = customerSearch.trim().toLowerCase()
    return customers
      .filter((customer) => customer.isActive && customer.code !== "WALK_IN")
      .filter((customer) => {
        if (!query) return true
        return [customer.name, customer.code, customer.email, customer.phone]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
      })
      .slice(0, 12)
  }, [customerSearch, customers])

  useEffect(() => {
    if (!selectedLocationId && locations.length > 0) {
      setSelectedLocationId(firstLocationId(locations))
    }
  }, [locations, selectedLocationId])

  useEffect(() => {
    if (terminals.length > 0 && !terminals.some((terminal) => terminal.id === selectedTerminalId)) {
      setSelectedTerminalId(terminals[0].id)
    }
  }, [selectedTerminalId, terminals])

  useEffect(() => {
    searchRef.current?.focus()
  }, [cart?.lines.length, selectedLocationId, selectedTerminalId])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        searchRef.current?.focus()
      }
      if (event.key === "Escape") {
        setSearch("")
        setCustomerSearch("")
        searchRef.current?.focus()
      }
      if (event.key === "F4") {
        event.preventDefault()
        setIsCustomerDialogOpen(true)
      }
      if (event.key === "F8") {
        event.preventDefault()
        tenderAmountRef.current?.focus()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  useEffect(() => {
    if (!isCustomerDialogOpen) return

    const focusTimer = window.setTimeout(() => customerSearchRef.current?.focus(), 0)
    return () => window.clearTimeout(focusTimer)
  }, [isCustomerDialogOpen])

  const canSell = !!selectedLocationId && !!selectedTerminalId && !!activeShift
  const cartTotal = cart?.total ?? 0
  const cartLineCount = cart?.lines.reduce((total, line) => total + line.quantity, 0) ?? 0
  const hasCartLines = (cart?.lines.length ?? 0) > 0
  const tenderPreview = useMemo(() => previewTenders(tenderLines, cartTotal), [cartTotal, tenderLines])
  const primaryTenderMethod = tenderLines[0]?.method ?? "CASH"
  const activeTenderCount = tenderPreview.tenders.length
  const changePreview = tenderPreview.change
  const balancePreview = tenderPreview.due
  const paidPreview = tenderPreview.paid
  const quickCashAmounts = useMemo(() => cashTenderOptions(cartTotal), [cartTotal])
  const isTenderShort = hasCartLines && balancePreview > 0
  const isAccountTenderMissingCustomer = tenderLines.some((line) => line.method === "ON_ACCOUNT") && !selectedCustomer
  let tenderBlocker: string | null = null
  if (isAccountTenderMissingCustomer) {
    tenderBlocker = t("tender.customerRequired")
  } else if (tenderPreview.hasNonCashOverpay) {
    tenderBlocker = t("tender.nonCashOverpay")
  } else if (isTenderShort) {
    tenderBlocker = t("tender.shortPayment", { amount: money.format(balancePreview) })
  }
  const canCommitSale = hasCartLines && !commitSale.isPending && tenderPreview.totalTendered > 0 && !tenderBlocker
  const currentCustomerLabel = selectedCustomer?.name || cart?.customer?.name || t("cart.walkIn")
  const onAccountAmountPreview = tenderPreview.tenders
    .filter((line) => line.method === "ON_ACCOUNT")
    .reduce((sum, line) => sum + line.amount, 0)
  const customerCreditLimit = selectedCustomer?.creditLimit ?? cart?.customer?.creditLimit ?? null
  const customerCurrentBalance = cart?.customer?.id === selectedCustomer?.id ? cart?.customer?.currentBalance ?? 0 : 0
  const projectedCustomerBalance = customerCurrentBalance + onAccountAmountPreview
  const isCustomerCreditRisk = customerCreditLimit !== null && projectedCustomerBalance > customerCreditLimit
  const expectedCloseBalance = activeShift?.cashDrawer?.currentBalance ?? activeShift?.expectedBalance ?? 0
  const countedCloseBalance = Number(closingBalance || expectedCloseBalance || 0)
  const closeVariance = countedCloseBalance - expectedCloseBalance
  const hardwareStatuses = [
    { label: t("hardware.scanner"), value: canSell ? t("hardware.ready") : t("hardware.waiting"), ready: canSell },
    { label: t("hardware.drawer"), value: activeShift?.cashDrawer?.isOpen ? t("hardware.open") : t("hardware.closed"), ready: !!activeShift?.cashDrawer?.isOpen },
    { label: t("hardware.printer"), value: receiptChannel === "PRINT" ? t("hardware.selected") : t("hardware.standby"), ready: true },
    { label: t("hardware.network"), value: t("hardware.online"), ready: true },
  ]

  async function handleOpenShift() {
    if (!selectedLocationId || !selectedTerminalId) {
      notifications.warning(t("notifications.setupRequiredTitle"), t("notifications.setupRequiredMessage"), { category: "pos" })
      return
    }

    const pendingId = notifications.info(t("notifications.openShiftPendingTitle"), t("notifications.openShiftPendingMessage"), {
      category: "pos",
      duration: 0,
      showProgress: true,
    })

    try {
      const response = await openShift.mutateAsync({
        locationId: selectedLocationId,
        terminalId: selectedTerminalId,
        openingBalance,
      })
      const error = actionError(response)

      notifications.removeNotification(pendingId)
      if (error) {
        notifications.error(t("notifications.openShiftErrorTitle"), error, { category: "pos", priority: "high" })
        return
      }

      setOpeningBalance("0")
      notifications.success(
        t("notifications.openShiftSuccessTitle"),
        t("notifications.openShiftSuccessMessage", {
          terminal: selectedTerminal?.name || t("setup.terminal"),
          amount: money.format(Number(openingBalance || 0)),
        }),
        { category: "pos" },
      )
    } catch (error) {
      notifications.removeNotification(pendingId)
      notifications.error(
        t("notifications.openShiftErrorTitle"),
        toErrorMessage(error, t("notifications.genericError")),
        { category: "pos", priority: "high" },
      )
    }
  }

  async function handleCloseShift() {
    if (!activeShift) return

    const actualBalance = closingBalance || activeShift.cashDrawer?.currentBalance || activeShift.expectedBalance
    const pendingId = notifications.info(t("notifications.closeShiftPendingTitle"), t("notifications.closeShiftPendingMessage"), {
      category: "pos",
      duration: 0,
      showProgress: true,
    })

    try {
      const response = await closeShift.mutateAsync({
        sessionId: activeShift.id,
        actualBalance,
      })
      const error = actionError(response)

      notifications.removeNotification(pendingId)
      if (error) {
        notifications.error(t("notifications.closeShiftErrorTitle"), error, { category: "pos", priority: "high" })
        return
      }

      setClosingBalance("")
      notifications.success(
        t("notifications.closeShiftSuccessTitle"),
        t("notifications.closeShiftSuccessMessage", {
          number: activeShift.sessionNumber,
          amount: money.format(Number(actualBalance || 0)),
        }),
        { category: "pos" },
      )
    } catch (error) {
      notifications.removeNotification(pendingId)
      notifications.error(
        t("notifications.closeShiftErrorTitle"),
        toErrorMessage(error, t("notifications.genericError")),
        { category: "pos", priority: "high" },
      )
    }
  }

  async function handleAddItem(itemId: string) {
    const item = (catalog.items as CatalogItem[]).find((catalogItem) => catalogItem.id === itemId)
    const itemName = item ? localizedName(item, locale) : t("catalog.item")

    if (!canSell) {
      notifications.warning(t("notifications.openShiftRequiredTitle"), t("notifications.openShiftRequiredMessage"), { category: "pos" })
      return
    }

    try {
      const response = await addLine.mutateAsync({
        locationId: selectedLocationId,
        terminalId: selectedTerminalId,
        sessionId: activeShift.id,
        itemId,
        quantity: 1,
      })
      const error = actionError(response)

      if (error) {
        notifications.error(t("notifications.addItemErrorTitle"), error, { category: "inventory", priority: "high" })
        return
      }

      setRecentItemIds((current) => [itemId, ...current.filter((id) => id !== itemId)].slice(0, 12))
      notifications.success(t("notifications.addItemSuccessTitle"), t("notifications.addItemSuccessMessage", { item: itemName }), {
        category: "pos",
        duration: 2500,
      })
      searchRef.current?.focus()
    } catch (error) {
      notifications.error(
        t("notifications.addItemErrorTitle"),
        toErrorMessage(error, t("notifications.genericError")),
        { category: "inventory", priority: "high" },
      )
    }
  }

  async function handleQuantity(lineId: string, quantity: number) {
    if (!cart) return
    const line = cart.lines.find((cartLine) => cartLine.id === lineId)

    try {
      const response = await updateLine.mutateAsync({
        salesOrderId: cart.id,
        lineId,
        quantity,
      })
      const error = actionError(response)

      if (error) {
        notifications.error(t("notifications.quantityErrorTitle"), error, { category: "pos", priority: "high" })
        return
      }

      notifications.info(
        t("notifications.quantitySuccessTitle"),
        t("notifications.quantitySuccessMessage", {
          item: line ? (locale === "fr" ? line.nameFr || line.nameEn : line.nameEn) : t("catalog.item"),
          count: quantity,
        }),
        { category: "pos", duration: 2200 },
      )
    } catch (error) {
      notifications.error(
        t("notifications.quantityErrorTitle"),
        toErrorMessage(error, t("notifications.genericError")),
        { category: "pos", priority: "high" },
      )
    }
  }

  async function handleRemove(lineId: string) {
    if (!cart) return
    const line = cart.lines.find((cartLine) => cartLine.id === lineId)
    const itemName = line ? (locale === "fr" ? line.nameFr || line.nameEn : line.nameEn) : t("catalog.item")

    try {
      const response = await removeLine.mutateAsync({
        salesOrderId: cart.id,
        lineId,
      })
      const error = actionError(response)

      if (error) {
        notifications.error(t("notifications.removeItemErrorTitle"), error, { category: "pos", priority: "high" })
        return
      }

      notifications.info(t("notifications.removeItemSuccessTitle"), t("notifications.removeItemSuccessMessage", { item: itemName }), {
        category: "pos",
        duration: 2500,
      })
    } catch (error) {
      notifications.error(
        t("notifications.removeItemErrorTitle"),
        toErrorMessage(error, t("notifications.genericError")),
        { category: "pos", priority: "high" },
      )
    }
  }

  async function handleCommitSale() {
    if (!cart || !activeShift) return
    if (!canCommitSale) {
      notifications.warning(t("notifications.saleBlockedTitle"), tenderBlocker || t("notifications.saleBlockedMessage"), { category: "pos" })
      return
    }

    const pendingId = notifications.info(
      t("notifications.salePendingTitle"),
      t("notifications.salePendingMessage", {
        amount: money.format(cartTotal),
        customer: currentCustomerLabel,
      }),
      {
        category: "pos",
        duration: 0,
        showProgress: true,
      },
    )

    try {
      const response = await commitSale.mutateAsync({
        salesOrderId: cart.id,
        locationId: selectedLocationId,
        terminalId: selectedTerminalId,
        sessionId: activeShift.id,
        customerId: selectedCustomer?.id || undefined,
        tenders: tenderPreview.tenders,
        receipt: {
          channel: receiptChannel,
          destination: receiptDestination || undefined,
          locale: locale === "fr" ? "FR" : "EN",
        },
      })
      const error = actionError(response)

      notifications.removeNotification(pendingId)
      if (error || !response.success) {
        notifications.error(t("notifications.saleErrorTitle"), error || t("notifications.genericError"), { category: "sales", priority: "high" })
        return
      }

      setLastSale(response.data)
      setTenderLines([createTenderLine()])
      setReceiptChannel("NONE")
      setReceiptDestination("")
      setSelectedCustomerId("")
      searchRef.current?.focus()
      notifications.success(
        t("notifications.saleSuccessTitle"),
        t("notifications.saleSuccessMessage", {
          number: response.data.orderNumber,
          total: money.format(response.data.total),
          tender: activeTenderCount > 1 ? t("tender.splitTender", { count: activeTenderCount }) : t(`tender.methods.${primaryTenderMethod}`),
        }),
        { category: "sales", priority: "high", duration: 9000 },
      )
      notifications.info(
        t("notifications.salePostedTitle"),
        t("notifications.salePostedMessage", {
          inventory: t("notifications.inventoryPosted"),
          finance: t("notifications.financePosted"),
          drawer: t("notifications.drawerPosted"),
          customer: selectedCustomer ? t("notifications.customerPosted") : t("notifications.walkInPosted"),
        }),
        { category: "financial", duration: 9000 },
      )
      if (response.data.delivery) {
        notifications.info(
          t("notifications.receiptTitle"),
          t("notifications.receiptMessage", {
            channel: t(`receipt.channels.${response.data.delivery.channel}`),
            status: response.data.delivery.status,
          }),
          { category: "receipt", duration: 7000 },
        )
      }
    } catch (error) {
      notifications.removeNotification(pendingId)
      notifications.error(
        t("notifications.saleErrorTitle"),
        toErrorMessage(error, t("notifications.genericError")),
        { category: "sales", priority: "high" },
      )
    }
  }

  function toggleFavorite(itemId: string) {
    setFavoriteItemIds((current) =>
      current.includes(itemId) ? current.filter((id) => id !== itemId) : [itemId, ...current],
    )
  }

  function chooseCatalogView(view: CatalogView) {
    setCatalogView(view)
    setSelectedCategoryId("")
  }

  function chooseCategory(categoryId: string) {
    setCatalogView("all")
    setSelectedCategoryId(categoryId)
  }

  function selectCustomer(customerId: string) {
    setSelectedCustomerId(customerId)
    setIsCustomerDialogOpen(false)
    setCustomerSearch("")
  }

  function selectWalkInCustomer() {
    setSelectedCustomerId("")
    setIsCustomerDialogOpen(false)
    setCustomerSearch("")
  }

  function updateTenderLine(id: string, patch: Partial<TenderLineState>) {
    setTenderLines((current) => current.map((line) => (line.id === id ? { ...line, ...patch } : line)))
  }

  function addTenderLine() {
    setTenderLines((current) => [...current, createTenderLine(current.some((line) => line.method === "CASH") ? "CARD" : "CASH")])
  }

  function removeTenderLine(id: string) {
    setTenderLines((current) => (current.length <= 1 ? current : current.filter((line) => line.id !== id)))
  }

  function setExactCash() {
    setTenderLines([createTenderLine("CASH", String(cartTotal))])
    window.setTimeout(() => tenderAmountRef.current?.focus(), 0)
  }

  function handleBackendGatedFeature(feature: string) {
    notifications.warning(t("featureGates.title"), t("featureGates.message", { feature }), { category: "pos", duration: 7000 })
  }

  return (
    <div className={cn("min-h-screen bg-[#0f171d] text-[#e6f3f8]", touchMode && "text-base")}>
      <header className="sticky top-0 z-20 border-b border-[#21333d] bg-[#0f171d]/95 px-4 py-3 text-white shadow-[0_14px_34px_rgba(5,12,16,0.20)] backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-gradient-to-br from-[#2f7df6] to-[#2dd4bf] text-white shadow-sm">
                <Monitor className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-semibold tracking-normal">{t("shell.title")}</h1>
                <p className="truncate text-sm text-[#9fb4bb]">{t("shell.subtitle")}</p>
              </div>
              {activeShift ? (
                <Badge variant="outline" className="border-[#2dd4bf]/35 bg-[#2dd4bf]/14 text-[#7de8dc]">
                  {t("shift.open", { number: activeShift.sessionNumber })}
                </Badge>
              ) : (
                <Badge variant="secondary">{t("shift.closed")}</Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="hidden gap-1.5 border-[#2f7df6]/35 bg-[#2f7df6]/14 px-3 py-2 text-[#cfe8ff] md:flex">
              <Barcode className="h-4 w-4" />
              {t("shell.scannerReady")}
            </Badge>
            <POSButton
              type="button"
              variant="outline"
              size="icon"
              className={cn(gridMode === "grid" ? posButtonActiveClass : posButtonClass)}
              onClick={() => setGridMode("grid")}
              title={t("view.grid")}
            >
              <LayoutGrid className="h-4 w-4" />
            </POSButton>
            <POSButton
              type="button"
              variant="outline"
              size="icon"
              className={cn(gridMode === "list" ? posButtonActiveClass : posButtonClass)}
              onClick={() => setGridMode("list")}
              title={t("view.list")}
            >
              <List className="h-4 w-4" />
            </POSButton>
            <POSButton
              type="button"
              variant="outline"
              onClick={() => setTouchMode((value) => !value)}
              className={cn(touchMode ? posButtonActiveClass : posButtonClass, touchMode && "h-14 px-5")}
            >
              <Smartphone className="h-4 w-4" />
              {t("shell.touchMode")}
            </POSButton>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-74px)] w-full max-w-[1920px] flex-col gap-3 p-3 pb-12">
        <section className={cn("rounded-md p-3", posSurfaceClass)}>
          <div className="grid gap-3 xl:grid-cols-[minmax(340px,0.9fr)_minmax(360px,1fr)_minmax(420px,1.2fr)]">
            <div className={cn("p-3", posPanelClass)}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Monitor className="h-4 w-4 text-[#2f7df6]" />
                <h2 className="text-sm font-semibold">{t("setup.title")}</h2>
                {activeShift ? (
                  <Badge variant="outline" className={cn("ml-auto", posChipClass)}>
                    {t("setup.activeRegister")}
                  </Badge>
                ) : null}
              </div>
              <div className="grid gap-3">
                <label className={posLabelClass}>
                  {t("setup.location")}
                  <select
                    className={posSelectClass}
                    value={selectedLocationId}
                    disabled={locationsQuery.isLoading}
                    onChange={(event) => {
                      setSelectedLocationId(event.target.value)
                      setSelectedTerminalId("")
                    }}
                  >
                    <option value="">{t("setup.chooseLocation")}</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.id}>
                        {location.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={posLabelClass}>
                  {t("setup.terminal")}
                  <select
                    className={posSelectClass}
                    value={selectedTerminalId}
                    disabled={!selectedLocationId || terminalsQuery.isLoading}
                    onChange={(event) => setSelectedTerminalId(event.target.value)}
                  >
                    <option value="">{t("setup.chooseTerminal")}</option>
                    {terminals.map((terminal) => (
                      <option key={terminal.id} value={terminal.id}>
                        {terminal.terminalNumber} - {terminal.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            <div className={cn("p-3", posPanelClass)}>
              <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-[#0f9f8d]" />
                    <h2 className="text-sm font-semibold">{t("shift.title")}</h2>
                  </div>
                  <p className={cn("mt-1 text-xs", posMutedTextClass)}>
                    {selectedLocation?.name || t("setup.noLocation")} / {selectedTerminal?.name || t("setup.noTerminal")}
                  </p>
                </div>
                <Badge variant={activeShift ? "outline" : "secondary"}>
                  {activeShift ? t("shift.active") : t("shift.notOpen")}
                </Badge>
              </div>

              {activeShift ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className={cn("p-2", posInsetClass)}>
                      <div className={cn("flex items-center gap-1.5 text-xs", posMutedTextClass)}>
                        <Banknote className="h-3.5 w-3.5" />
                        {t("metrics.sessionSales")}
                      </div>
                      <div className="mt-1 font-semibold tabular-nums">{money.format(activeShift.totalSales)}</div>
                    </div>
                    <div className={cn("p-2", posInsetClass)}>
                      <div className={cn("flex items-center gap-1.5 text-xs", posMutedTextClass)}>
                        <Receipt className="h-3.5 w-3.5" />
                        {t("metrics.transactions")}
                      </div>
                      <div className="mt-1 font-semibold tabular-nums">{activeShift.transactionCount}</div>
                    </div>
                    <div className={cn("p-2", posInsetClass)}>
                      <div className={cn("flex items-center gap-1.5 text-xs", posMutedTextClass)}>
                        <Wallet className="h-3.5 w-3.5" />
                        {t("metrics.cashDrawer")}
                      </div>
                      <div className="mt-1 font-semibold tabular-nums">
                        {money.format(activeShift.cashDrawer?.currentBalance ?? activeShift.expectedBalance)}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={closingBalance}
                      type="number"
                      min="0"
                      step="0.01"
                      onChange={(event) => setClosingBalance(event.target.value)}
                      placeholder={t("shift.closingPlaceholder")}
                      className={posFieldClass}
                    />
                    <POSButton
                      type="button"
                      variant="outline"
                      className={posButtonClass}
                      onClick={() => setIsEndShiftDialogOpen(true)}
                      disabled={closeShift.isPending}
                    >
                      {t("shift.close")}
                    </POSButton>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={openingBalance}
                    type="number"
                    min="0"
                    step="0.01"
                    onChange={(event) => setOpeningBalance(event.target.value)}
                    placeholder={t("shift.openingPlaceholder")}
                    className={posFieldClass}
                  />
                  <POSButton
                    type="button"
                    className={posButtonPrimaryClass}
                    onClick={handleOpenShift}
                    disabled={!selectedTerminalId || openShift.isPending}
                  >
                    {t("shift.openCta")}
                  </POSButton>
                </div>
              )}
            </div>

            <div className={cn("p-3", posPanelClass)}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <UsersRound className="h-4 w-4 text-[#2f7df6]" />
                <h2 className="text-sm font-semibold">{t("customers.title")}</h2>
                {selectedCustomer ? (
                  <Badge variant="outline" className={cn("ml-auto", posChipClass)}>
                    {t("customers.locked")}
                  </Badge>
                ) : null}
              </div>
              <div className={cn("p-3", posInsetClass)}>
                <div className="flex items-start gap-3">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-[#2f7df6] to-[#2dd4bf] text-sm font-semibold text-white">
                    {selectedCustomer ? customerInitials(selectedCustomer.name) : "WI"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{currentCustomerLabel}</div>
                    <div className={cn("mt-1 truncate text-xs", posMutedTextClass)}>
                      {selectedCustomer
                        ? selectedCustomer.phone || selectedCustomer.email || selectedCustomer.code || t("customers.noContact")
                        : t("customers.walkInMeta")}
                    </div>
                    <div className={cn("mt-2 flex flex-wrap gap-2 text-xs", posMutedTextClass)}>
                      <span className="rounded-md bg-[#11363a] px-2 py-1 text-[#c8fff8]">
                        {selectedCustomer ? t("customers.selected") : t("customers.walkIn")}
                      </span>
                      {selectedCustomer ? (
                        <span className="rounded-md bg-[#143052] px-2 py-1 text-[#b9d5ff]">
                          {t("customers.orders", { count: selectedCustomer.totalOrders })}
                        </span>
                      ) : null}
                      {selectedCustomer ? (
                        <span
                          className={cn(
                            "rounded-md px-2 py-1",
                            isCustomerCreditRisk
                              ? "bg-[#382d14] text-[#f1d28a]"
                              : "bg-[#143052] text-[#b9d5ff]",
                          )}
                        >
                          {customerCreditLimit ? t("customers.creditLimit", { amount: money.format(customerCreditLimit) }) : t("customers.noCreditLimit")}
                        </span>
                      ) : null}
                    </div>
                    {selectedCustomer && isCustomerCreditRisk ? (
                      <div className="mt-2 flex items-center gap-1.5 rounded-md border border-[#d7a84f]/25 bg-[#382d14] px-2 py-1 text-xs text-[#f1d28a]">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {t("customers.creditWarning")}
                      </div>
                    ) : null}
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <POSButton
                    type="button"
                    variant="outline"
                    onClick={() => setIsCustomerDialogOpen(true)}
                    className={posButtonClass}
                  >
                    <UsersRound className="h-4 w-4" />
                    {selectedCustomer ? t("customers.change") : t("customers.choose")}
                  </POSButton>
                  <POSButton
                    type="button"
                    variant="outline"
                    disabled={!selectedCustomerId}
                    onClick={selectWalkInCustomer}
                    className={posButtonClass}
                  >
                    <UserRound className="h-4 w-4" />
                    {t("customers.walkIn")}
                  </POSButton>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid min-h-0 flex-1 gap-3 xl:grid-cols-[minmax(0,1fr)_420px]">
          <section className="min-w-0">
            <div className={cn("mb-3 rounded-md p-3", posSurfaceClass)}>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative min-w-[260px] flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b8584]" />
                  <Input
                    ref={searchRef}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={t("search.placeholder")}
                    className={cn(posFieldClass, "pl-9", touchMode && "h-14 text-base")}
                  />
                </div>
                <Badge variant="outline" className={cn("px-3 py-2", posChipClass)}>
                  {t("catalog.showing", { count: visibleCatalogItems.length })}
                </Badge>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-3 xl:grid-cols-6">
                <POSButton type="button" variant="outline" className={posButtonClass} onClick={() => setIsCustomerDialogOpen(true)}>
                  <UsersRound className="h-4 w-4" />
                  {selectedCustomer ? t("smart.changeCustomer") : t("smart.addCustomer")}
                </POSButton>
                <POSButton type="button" variant="outline" className={posButtonClass} disabled={!hasCartLines} onClick={setExactCash}>
                  <Banknote className="h-4 w-4" />
                  {t("smart.exactCash")}
                </POSButton>
                <POSButton
                  type="button"
                  variant="outline"
                  className={posButtonClass}
                  disabled={!lastSale}
                  onClick={() => lastSale?.delivery && notifications.info(t("notifications.receiptTitle"), lastSale.delivery.message, { category: "receipt" })}
                >
                  <Printer className="h-4 w-4" />
                  {t("smart.receiptStatus")}
                </POSButton>
                <POSButton type="button" variant="outline" className={posButtonClass} onClick={() => handleBackendGatedFeature(t("smart.parkSale"))}>
                  <PauseCircle className="h-4 w-4" />
                  {t("smart.parkSale")}
                </POSButton>
                <POSButton type="button" variant="outline" className={posButtonClass} onClick={() => handleBackendGatedFeature(t("smart.managerOverride"))}>
                  <ShieldCheck className="h-4 w-4" />
                  {t("smart.managerOverride")}
                </POSButton>
                <POSButton type="button" variant="outline" className={posButtonClass} disabled={!activeShift} onClick={() => setIsEndShiftDialogOpen(true)}>
                  <ClipboardList className="h-4 w-4" />
                  {t("smart.endShift")}
                </POSButton>
              </div>

              <div className="mt-3 grid gap-2 md:grid-cols-4">
                {hardwareStatuses.map((status) => (
                  <div
                    key={status.label}
                    className={cn(
                      "flex items-center gap-2 rounded-md border px-2 py-1.5 text-xs",
                      status.ready
                        ? "border-[#2dd4bf]/25 bg-[#11363a] text-[#c8fff8]"
                        : "border-[#d7a84f]/25 bg-[#382d14] text-[#f1d28a]",
                    )}
                  >
                    <Wifi className="h-3.5 w-3.5" />
                    <span className="font-medium">{status.label}</span>
                    <span className="ml-auto">{status.value}</span>
                  </div>
                ))}
              </div>

              <ScrollArea className="mt-3 w-full whitespace-nowrap">
                <div className="flex gap-2 pb-2">
                  <POSButton
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(catalogView === "all" && !selectedCategoryId ? posButtonActiveClass : posButtonClass)}
                    onClick={() => chooseCatalogView("all")}
                  >
                    <Boxes className="h-4 w-4" />
                    {t("categories.all")}
                  </POSButton>
                  <POSButton
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(catalogView === "favorites" ? posButtonActiveClass : posButtonClass)}
                    onClick={() => chooseCatalogView("favorites")}
                  >
                    <Star className="h-4 w-4" />
                    {t("categories.favorites")}
                    <Badge variant="outline" className={cn("ml-1 h-5 px-1.5", posCountChipClass)}>
                      {favoriteItemIds.length}
                    </Badge>
                  </POSButton>
                  <POSButton
                    type="button"
                    variant="outline"
                    size="sm"
                    className={cn(catalogView === "recent" ? posButtonActiveClass : posButtonClass)}
                    onClick={() => chooseCatalogView("recent")}
                  >
                    <Clock className="h-4 w-4" />
                    {t("categories.recent")}
                    <Badge variant="outline" className={cn("ml-1 h-5 px-1.5", posCountChipClass)}>
                      {recentItemIds.length}
                    </Badge>
                  </POSButton>
                  <Separator orientation="vertical" className="h-8" />
                  {catalog.categories.map((category) => (
                    <POSButton
                      key={category.id}
                      type="button"
                      variant="outline"
                      size="sm"
                      className={cn(selectedCategoryId === category.id ? posButtonActiveClass : posButtonClass)}
                      onClick={() => chooseCategory(category.id)}
                    >
                      {localizedName(category, locale)}
                    </POSButton>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>

            {!canSell ? (
              <div className="rounded-md border border-dashed border-[#345966] bg-[#162b35] p-8 text-center shadow-sm">
                <Barcode className="mx-auto mb-3 h-10 w-10 text-[#2f7df6]" />
                <h2 className="text-lg font-semibold">{t("empty.openShiftTitle")}</h2>
                <p className={cn("mx-auto mt-2 max-w-md text-sm", posMutedTextClass)}>{t("empty.openShiftDescription")}</p>
              </div>
            ) : catalogQuery.isLoading ? (
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 12 }).map((_, index) => (
                  <div key={index} className="h-56 animate-pulse rounded-md border border-[#2b4b58] bg-[#162b35]" />
                ))}
              </div>
            ) : visibleCatalogItems.length === 0 ? (
              <div className="rounded-md border border-dashed border-[#345966] bg-[#162b35] p-8 text-center text-[#a9c3c8] shadow-sm">
                {t("empty.noItems")}
              </div>
            ) : (
              <div className={cn(gridMode === "grid" ? "grid gap-3 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4" : "space-y-2")}>
                {visibleCatalogItems.map((item) => {
                  const itemLabel = localizedName(item, locale)
                  const isFavorite = favoriteItemIds.includes(item.id)
                  const outOfStock = item.stock.status === "out"
                  const inCartQuantity = cartQuantitiesByItemId.get(item.id) ?? 0
                  const displayedOnHand = item.trackInventory
                    ? Math.max(0, Number(item.stock.quantityOnHand || 0) - inCartQuantity)
                    : Number(item.stock.quantityOnHand || 0)
                  const categoryLabel = item.category ? localizedName(item.category, locale) : t("catalog.noCategory")
                  const brandLabel = item.brand ? localizedName(item.brand, locale) : t("catalog.noBrand")

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-md border border-[#2b4b58] bg-[#142129] p-3 text-[#e6f3f8] shadow-[0_12px_30px_rgba(5,12,16,0.18)] transition hover:border-[#2dd4bf]/55 hover:bg-[#162b35]",
                        touchMode && "p-4",
                        outOfStock && "opacity-65",
                        inCartQuantity > 0 && "border-[#2dd4bf]/70 bg-[#11363a] ring-1 ring-[#2dd4bf]/25",
                        gridMode === "list" && "grid items-center gap-3 lg:grid-cols-[minmax(0,1fr)_280px]",
                      )}
                    >
                      <div className={cn(gridMode === "grid" ? "space-y-3" : "flex min-w-0 gap-3")}>
                        <div
                          className={cn(
                            "flex shrink-0 items-center justify-center overflow-hidden rounded-md border border-[#345966] bg-[#0f1d25] text-[#8aa3aa]",
                            gridMode === "grid" ? "h-36 w-full" : "h-24 w-24",
                          )}
                        >
                          {item.thumbnail ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={item.thumbnail} alt={itemLabel} className="h-full w-full object-cover" />
                          ) : (
                            <ImageIcon className="h-8 w-8" />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="min-w-0">
                            <div className={cn("text-sm font-semibold leading-snug text-[#f1fbff]", gridMode === "list" ? "line-clamp-2" : "break-words")}>
                              {itemLabel}
                            </div>
                            <div className="mt-1 text-base font-bold tabular-nums text-[#f1fbff]">
                              {money.format(item.sellingPrice)}
                            </div>
                            <div className="mt-1 flex flex-wrap items-center gap-1.5">
                              <Badge variant={stockBadgeVariant(item.stock.status)}>
                                {t(`stock.${item.stock.status}`, { count: item.stock.quantityAvailable })}
                              </Badge>
                              {inCartQuantity > 0 ? (
                                <Badge variant="outline" className={posChipClass}>
                                  {t("stock.inCartCount", { count: inCartQuantity })}
                                </Badge>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-3 overflow-x-auto rounded-md border border-[#345966] bg-[#0f1d25]">
                            <div className="flex min-w-max items-center gap-2 px-2 py-1.5 text-[10px] leading-none">
                              <span className={cn("shrink-0 font-semibold uppercase tracking-normal", posMutedTextClass)}>
                                {t("catalog.sku")}
                              </span>
                              <span className="font-mono font-semibold text-[#7de8dc]">{item.sku}</span>
                              <span className="h-3 w-px shrink-0 bg-[#345966]" />
                              <span className={cn("shrink-0 font-semibold uppercase tracking-normal", posMutedTextClass)}>
                                {t("catalog.barcode")}
                              </span>
                              <span className="font-mono font-semibold text-[#8fb7ff]">
                                {item.barcode || t("catalog.noBarcode")}
                              </span>
                            </div>
                          </div>

                          <div className={cn("mt-2 flex flex-wrap gap-1.5 text-xs", posMutedTextClass)}>
                            <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-[#17313d] px-2 py-1">
                              <Tag className="h-3 w-3 shrink-0" />
                              <span className={cn(gridMode === "list" ? "truncate" : "whitespace-normal break-words")}>
                                {categoryLabel}
                              </span>
                            </span>
                            <span className="inline-flex max-w-full items-center gap-1 rounded-md bg-[#143052] px-2 py-1">
                              <PackageCheck className="h-3 w-3 shrink-0" />
                              <span className={cn(gridMode === "list" ? "truncate" : "whitespace-normal break-words")}>
                                {brandLabel}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={cn("mt-3 space-y-3", gridMode === "list" && "mt-0")}>
                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-md border border-[#2dd4bf]/20 bg-[#11363a] p-2">
                            <div className={cn("text-[11px]", posMutedTextClass)}>{t("stock.onHand")}</div>
                            <div className="text-lg font-bold tabular-nums text-[#7de8dc]">{displayedOnHand}</div>
                          </div>
                          <div className="rounded-md border border-[#2f7df6]/20 bg-[#143052] p-2">
                            <div className={cn("text-[11px]", posMutedTextClass)}>{t("stock.availableLabel")}</div>
                            <div className="text-lg font-bold tabular-nums text-[#8fb7ff]">{item.stock.quantityAvailable}</div>
                          </div>
                          <div className="rounded-md border border-[#d7a84f]/25 bg-[#382d14] p-2">
                            <div className={cn("text-[11px]", posMutedTextClass)}>{t("stock.inCart")}</div>
                            <div className="text-lg font-bold tabular-nums text-[#f1d28a]">{inCartQuantity}</div>
                          </div>
                        </div>
                        <Progress value={stockProgress(item, displayedOnHand)} className="h-1.5 bg-[#2b4b58]" />
                        <div className="flex items-center gap-2">
                          <POSButton
                            type="button"
                            variant="outline"
                            size="icon"
                            className={posButtonClass}
                            onClick={() => setSelectedProductId(item.id)}
                            title={t("catalog.details")}
                          >
                            <Eye className="h-4 w-4" />
                          </POSButton>
                          <POSButton
                            type="button"
                            variant="outline"
                            size="icon"
                            className={cn(isFavorite ? posButtonActiveClass : posButtonClass)}
                            onClick={() => toggleFavorite(item.id)}
                            title={isFavorite ? t("catalog.removeFavorite") : t("catalog.addFavorite")}
                          >
                            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
                          </POSButton>
                          <POSButton
                            type="button"
                            onClick={() => handleAddItem(item.id)}
                            disabled={outOfStock || addLine.isPending}
                            className={cn("flex-1", posButtonPrimaryClass, touchMode && "h-12 px-5")}
                          >
                            <Plus className="h-4 w-4" />
                            {outOfStock ? t("stock.out") : t("catalog.add")}
                          </POSButton>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </section>

          <aside className="min-w-0">
            <div className={cn("flex h-full min-h-[560px] flex-col rounded-md", posSurfaceClass)}>
              <div className={cn("border-b p-4", posDividerClass)}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{t("cart.title")}</h2>
                    <div className={cn("mt-1 flex items-center gap-2 text-sm", posMutedTextClass)}>
                      <UserRound className="h-4 w-4" />
                      <span>{currentCustomerLabel}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    {cart ? (
                      <Badge variant="outline" className={posCountChipClass}>
                        {cart.orderNumber}
                      </Badge>
                    ) : null}
                    <div className={cn("mt-2 text-xs", posMutedTextClass)}>
                      {t("cart.lines", { count: cartLineCount })}
                    </div>
                  </div>
                </div>
              </div>

              <ScrollArea className="min-h-0 flex-1">
                <div className="p-3">
                  {!cart || cart.lines.length === 0 ? (
                    <div className="rounded-md border border-dashed border-[#345966] bg-[#102027] p-6 text-center text-sm text-[#a9c3c8]">
                      {t("cart.empty")}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {cart.lines.map((line) => (
                        <div key={line.id} className={cn("p-3", posPanelClass)}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium">
                                {locale === "fr" ? line.nameFr || line.nameEn : line.nameEn}
                              </div>
                              <div className={cn("mt-1 text-xs", posMutedTextClass)}>
                                {line.sku} - {money.format(line.unitPrice)}
                              </div>
                            </div>
                            <POSButton
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={posButtonDangerClass}
                              disabled={removeLine.isPending}
                              onClick={() => handleRemove(line.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </POSButton>
                          </div>
                          <div className="mt-3 flex items-center justify-between">
                            <div className="flex items-center gap-1">
                              <POSButton
                                type="button"
                                variant="outline"
                                size="icon"
                                disabled={line.quantity <= 1 || updateLine.isPending}
                                className={cn(posButtonClass, touchMode && "h-12 w-12")}
                                onClick={() => handleQuantity(line.id, line.quantity - 1)}
                              >
                                <Minus className="h-4 w-4" />
                              </POSButton>
                              <span className="w-12 text-center text-sm font-semibold tabular-nums">{line.quantity}</span>
                              <POSButton
                                type="button"
                                variant="outline"
                                size="icon"
                                disabled={updateLine.isPending}
                                className={cn(posButtonClass, touchMode && "h-12 w-12")}
                                onClick={() => handleQuantity(line.id, line.quantity + 1)}
                              >
                                <Plus className="h-4 w-4" />
                              </POSButton>
                            </div>
                            <div className="font-semibold tabular-nums">{money.format(line.lineTotal)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>

              <div className={cn("mt-auto border-t p-4", posDividerClass)}>
                {lastSale ? (
                  <div className="mb-3 rounded-md border border-[#2dd4bf]/25 bg-[#11363a] p-3 text-sm text-[#c8fff8]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 font-semibold">
                          <CheckCircle2 className="h-4 w-4" />
                          {t("sale.committed", { number: lastSale.orderNumber })}
                        </div>
                        <div className="mt-1">
                          {t("sale.summary", {
                            total: money.format(lastSale.total),
                            change: money.format(lastSale.changeDue),
                          })}
                        </div>
                      </div>
                      <Badge variant="outline" className={posChipClass}>
                        {lastSale.paymentStatus}
                      </Badge>
                    </div>

                    <div className="mt-3 grid gap-1.5">
                      {[
                        t("timeline.saleCreated"),
                        t("timeline.inventoryUpdated"),
                        t("timeline.financePosted"),
                        t("timeline.drawerUpdated"),
                        lastSale.onAccountAmount > 0 ? t("timeline.customerLedgerUpdated") : t("timeline.walkInRecorded"),
                        lastSale.delivery
                          ? t("timeline.receiptStatus", {
                              channel: t(`receipt.channels.${lastSale.delivery.channel}`),
                              status: lastSale.delivery.status,
                            })
                          : t("timeline.noReceipt"),
                      ].map((entry) => (
                        <div key={entry} className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                          <span>{entry}</span>
                        </div>
                      ))}
                    </div>
                    {lastSale.receipt?.digitalReceiptUrl ? (
                      <div className={cn("mt-2 truncate text-xs", posMutedTextClass)}>
                        {lastSale.receipt.digitalReceiptUrl}
                      </div>
                    ) : null}
                  </div>
                ) : null}

                <div className="space-y-2 text-sm tabular-nums">
                  <div className="flex justify-between">
                    <span className={posMutedTextClass}>{t("totals.subtotal")}</span>
                    <span>{money.format(cart?.subtotal ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={posMutedTextClass}>{t("totals.discount")}</span>
                    <span>{money.format(cart?.discount ?? 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className={posMutedTextClass}>{t("totals.tax")}</span>
                    <span>{money.format(cart?.taxAmount ?? 0)}</span>
                  </div>
                  <div className={cn("flex justify-between border-t pt-2 text-lg font-semibold", posDividerClass)}>
                    <span>{t("totals.total")}</span>
                    <span>{money.format(cart?.total ?? 0)}</span>
                  </div>
                </div>

                <div className={cn("mt-4 space-y-3 p-3", posPanelClass)}>
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold">{t("tender.panelTitle")}</div>
                      <div className={cn("text-xs", posMutedTextClass)}>
                        {t("tender.splitSummary", { count: tenderLines.length })}
                      </div>
                    </div>
                    <POSButton type="button" variant="outline" size="sm" className={posButtonClass} onClick={addTenderLine}>
                      <Plus className="h-4 w-4" />
                      {t("tender.addTender")}
                    </POSButton>
                  </div>

                  <div className="space-y-2">
                    {tenderLines.map((line, index) => (
                      <div key={line.id} className={cn("p-2", posInsetClass)}>
                        <div className="grid gap-2 lg:grid-cols-[1fr_1fr_auto]">
                          <label className={posLabelClass}>
                            {t("tender.method")}
                            <select
                              className={posSelectClass}
                              value={line.method}
                              onChange={(event) => updateTenderLine(line.id, { method: event.target.value as TenderMethod })}
                            >
                              {tenderMethods.map((method) => (
                                <option key={method} value={method}>
                                  {t(`tender.methods.${method}`)}
                                </option>
                              ))}
                            </select>
                          </label>

                          <label className={posLabelClass}>
                            {t("tender.amount")}
                            <Input
                              ref={index === 0 ? tenderAmountRef : undefined}
                              value={line.amount}
                              type="number"
                              min="0"
                              step="0.01"
                              onChange={(event) => updateTenderLine(line.id, { amount: event.target.value })}
                              placeholder={index === 0 && tenderLines.length === 1 ? money.format(cartTotal) : "0.00"}
                              className={cn("mt-1", posFieldClass)}
                            />
                          </label>

                          <POSButton
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn("mt-5", posButtonDangerClass)}
                            disabled={tenderLines.length <= 1}
                            onClick={() => removeTenderLine(line.id)}
                            title={t("tender.removeTender")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </POSButton>
                        </div>

                        {line.method !== "CASH" && line.method !== "ON_ACCOUNT" ? (
                          <label className={cn("mt-2", posLabelClass)}>
                            {t("tender.reference")}
                            <Input
                              value={line.reference}
                              onChange={(event) => updateTenderLine(line.id, { reference: event.target.value })}
                              placeholder={t("tender.referencePlaceholder")}
                              className={cn("mt-1", posFieldClass)}
                            />
                          </label>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  {primaryTenderMethod === "CASH" && quickCashAmounts.length > 0 ? (
                    <div className="grid grid-cols-4 gap-2">
                      {quickCashAmounts.map((amount, index) => (
                        <POSButton
                          key={amount}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn(tenderPreview.totalTendered === amount ? posButtonActiveClass : posButtonClass)}
                          onClick={() => updateTenderLine(tenderLines[0].id, { amount: String(amount), method: "CASH" })}
                        >
                          {index === 0 ? t("tender.exact") : money.format(amount)}
                        </POSButton>
                      ))}
                    </div>
                  ) : null}

                  <div>
                    <div className={cn("mb-1 text-xs font-medium", posMutedTextClass)}>{t("receipt.options")}</div>
                    <div className="grid grid-cols-5 gap-1">
                      {receiptChannels.map((channel) => (
                        <POSButton
                          key={channel}
                          type="button"
                          variant="outline"
                          size="sm"
                          className={cn("min-w-0 px-2", receiptChannel === channel ? posButtonActiveClass : posButtonClass)}
                          onClick={() => setReceiptChannel(channel)}
                          title={t(`receipt.channels.${channel}`)}
                        >
                          <span className="truncate">{t(`receipt.channels.${channel}`)}</span>
                        </POSButton>
                      ))}
                    </div>
                    {receiptChannel !== "NONE" ? (
                      <Input
                        value={receiptDestination}
                        onChange={(event) => setReceiptDestination(event.target.value)}
                        placeholder={t("receipt.destinationPlaceholder")}
                        className={cn("mt-2", posFieldClass)}
                      />
                    ) : null}
                  </div>

                  <div className="space-y-1 text-sm tabular-nums">
                    <div className="flex justify-between">
                      <span className={posMutedTextClass}>{t("tender.paid")}</span>
                      <span>{money.format(paidPreview)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={posMutedTextClass}>{t("tender.due")}</span>
                      <span>{money.format(balancePreview)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={posMutedTextClass}>{t("tender.change")}</span>
                      <span>{money.format(changePreview)}</span>
                    </div>
                  </div>
                  {tenderBlocker ? (
                    <div className="rounded-md border border-[#d7a84f]/25 bg-[#382d14] px-3 py-2 text-xs font-medium text-[#f1d28a]">
                      {tenderBlocker}
                    </div>
                  ) : null}
                </div>

                <POSButton
                  type="button"
                  className={cn("mt-4 w-full", posButtonPrimaryClass, touchMode && "h-14 text-base")}
                  disabled={!canCommitSale}
                  onClick={handleCommitSale}
                >
                  <CreditCard className="h-4 w-4" />
                  {t("charge.cta", { amount: money.format(cart?.total ?? 0) })}
                </POSButton>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Dialog open={!!selectedProduct} onOpenChange={(open) => !open && setSelectedProductId("")}>
        <DialogContent className={cn("max-w-2xl", posDialogClass)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-[#2f7df6]" />
              {selectedProduct ? localizedName(selectedProduct, locale) : t("catalog.details")}
            </DialogTitle>
            <DialogDescription className={posMutedTextClass}>
              {t("catalog.detailDescription")}
            </DialogDescription>
          </DialogHeader>

          {selectedProduct ? (
            <div className="grid gap-3 md:grid-cols-[160px_1fr]">
              <div className="flex h-40 items-center justify-center overflow-hidden rounded-md border border-[#345966] bg-[#0f1d25] text-[#8aa3aa]">
                {selectedProduct.thumbnail ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedProduct.thumbnail} alt={localizedName(selectedProduct, locale)} className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-8 w-8" />
                )}
              </div>
              <div className="grid gap-2 text-sm">
                <div className="text-2xl font-semibold tabular-nums">{money.format(selectedProduct.sellingPrice)}</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className={cn("p-2", posInsetClass)}>
                    <div className={cn("text-xs", posMutedTextClass)}>{t("catalog.sku")}</div>
                    <div className="font-mono font-semibold">{selectedProduct.sku}</div>
                  </div>
                  <div className={cn("p-2", posInsetClass)}>
                    <div className={cn("text-xs", posMutedTextClass)}>{t("catalog.barcode")}</div>
                    <div className="font-mono font-semibold">{selectedProduct.barcode || t("catalog.noBarcode")}</div>
                  </div>
                  <div className={cn("p-2", posInsetClass)}>
                    <div className={cn("text-xs", posMutedTextClass)}>{t("stock.onHand")}</div>
                    <div className="font-semibold">{selectedProduct.stock.quantityOnHand}</div>
                  </div>
                  <div className={cn("p-2", posInsetClass)}>
                    <div className={cn("text-xs", posMutedTextClass)}>{t("stock.availableLabel")}</div>
                    <div className="font-semibold">{selectedProduct.stock.quantityAvailable}</div>
                  </div>
                </div>
                <div className="rounded-md border border-[#d7a84f]/25 bg-[#382d14] p-2 text-xs text-[#f1d28a]">
                  {t("catalog.detailBackendNote")}
                </div>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={isEndShiftDialogOpen} onOpenChange={setIsEndShiftDialogOpen}>
        <DialogContent className={cn("max-w-2xl", posDialogClass)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5 text-[#2f7df6]" />
              {t("shift.closeWizardTitle")}
            </DialogTitle>
            <DialogDescription className={posMutedTextClass}>
              {t("shift.closeWizardDescription")}
            </DialogDescription>
          </DialogHeader>

          {activeShift ? (
            <div className="space-y-4">
              <div className="grid gap-2 md:grid-cols-4">
                {[
                  [t("metrics.sessionSales"), money.format(activeShift.totalSales)],
                  [t("metrics.transactions"), activeShift.transactionCount],
                  [t("shift.expectedCash"), money.format(expectedCloseBalance)],
                  [t("shift.variance"), money.format(closeVariance)],
                ].map(([label, value]) => (
                  <div key={label} className={cn("p-2", posInsetClass)}>
                    <div className={cn("text-xs", posMutedTextClass)}>{label}</div>
                    <div className="mt-1 font-semibold tabular-nums">{value}</div>
                  </div>
                ))}
              </div>

              <div className="grid gap-2 md:grid-cols-5">
                {[
                  [t("tender.methods.CASH"), activeShift.cashTotal],
                  [t("tender.methods.CARD"), activeShift.cardTotal],
                  [t("tender.methods.MOBILE_MONEY"), activeShift.mobileMoneyTotal],
                  [t("tender.methods.BANK_TRANSFER"), activeShift.bankTransferTotal],
                  [t("tender.methods.ON_ACCOUNT"), activeShift.creditTotal],
                ].map(([label, value]) => (
                  <div key={label} className={cn("p-2", posInsetClass)}>
                    <div className={cn("text-xs", posMutedTextClass)}>{label}</div>
                    <div className="mt-1 font-semibold tabular-nums">{money.format(Number(value))}</div>
                  </div>
                ))}
              </div>

              <label className={posLabelClass}>
                {t("shift.countedCash")}
                <Input
                  value={closingBalance}
                  type="number"
                  min="0"
                  step="0.01"
                  onChange={(event) => setClosingBalance(event.target.value)}
                  placeholder={money.format(expectedCloseBalance)}
                  className={cn("mt-1", posFieldClass)}
                />
              </label>

              {Math.abs(closeVariance) > 0 ? (
                <div className="flex items-center gap-2 rounded-md border border-[#d7a84f]/25 bg-[#382d14] px-3 py-2 text-sm text-[#f1d28a]">
                  <AlertTriangle className="h-4 w-4" />
                  {t("shift.varianceWarning", { amount: money.format(closeVariance) })}
                </div>
              ) : null}

              <div className="flex justify-end gap-2">
                <POSButton type="button" variant="outline" className={posButtonClass} onClick={() => setIsEndShiftDialogOpen(false)}>
                  {t("common.cancel")}
                </POSButton>
                <POSButton
                  type="button"
                  className={posButtonPrimaryClass}
                  disabled={closeShift.isPending}
                  onClick={async () => {
                    await handleCloseShift()
                    setIsEndShiftDialogOpen(false)
                  }}
                >
                  {t("shift.close")}
                </POSButton>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>

      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent className={cn("max-h-[86vh] max-w-3xl overflow-hidden p-0", posDialogClass)}>
          <DialogHeader className={posDialogHeaderClass}>
            <DialogTitle className="flex items-center gap-2">
              <UsersRound className="h-5 w-5 text-[#2f7df6]" />
              {t("customers.choose")}
            </DialogTitle>
            <DialogDescription className={posMutedTextClass}>
              {t("customers.description")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 p-5">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6b8584]" />
              <Input
                ref={customerSearchRef}
                value={customerSearch}
                onChange={(event) => setCustomerSearch(event.target.value)}
                placeholder={t("customers.searchPlaceholder")}
                className={cn(posFieldClass, "pl-9")}
              />
            </div>

            <POSButton
              type="button"
              variant="outline"
              disabled={!selectedCustomerId}
              className={cn("h-auto w-full justify-start gap-3 rounded-md p-3 disabled:cursor-default disabled:opacity-100", !selectedCustomerId ? posButtonActiveClass : posButtonClass)}
              onClick={selectWalkInCustomer}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#143052] text-sm font-semibold text-[#8fb7ff]">
                WI
              </span>
              <span className="min-w-0 flex-1 text-left">
                <span className="block truncate text-sm font-semibold">{t("customers.walkIn")}</span>
                <span className={cn("block text-xs", posMutedTextClass)}>{t("customers.walkInMeta")}</span>
              </span>
              {!selectedCustomerId ? (
                <Badge variant="outline" className={posChipClass}>
                  {t("customers.selected")}
                </Badge>
              ) : null}
            </POSButton>

            <ScrollArea className="h-[420px] pr-3">
              <div className="grid gap-2 md:grid-cols-2">
                {visibleCustomers.map((customer) => {
                  const isSelected = selectedCustomerId === customer.id

                  return (
                    <POSButton
                      key={customer.id}
                      type="button"
                      variant="outline"
                      disabled={isSelected}
                      className={cn("h-auto justify-start gap-3 rounded-md p-3 text-left disabled:cursor-default disabled:opacity-100", isSelected ? posButtonActiveClass : posButtonClass)}
                      onClick={() => selectCustomer(customer.id)}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#11363a] text-sm font-semibold text-[#7de8dc]">
                        {customerInitials(customer.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{customer.name}</span>
                        <span className={cn("block truncate text-xs", posMutedTextClass)}>
                          {customer.phone || customer.email || customer.code || t("customers.noContact")}
                        </span>
                        <span className={cn("block text-xs", posMutedTextClass)}>
                          {t("customers.orders", { count: customer.totalOrders })} / {money.format(customer.totalRevenue)}
                        </span>
                      </span>
                      {isSelected ? (
                        <Badge variant="outline" className={posChipClass}>
                          {t("customers.selected")}
                        </Badge>
                      ) : null}
                    </POSButton>
                  )
                })}
                {visibleCustomers.length === 0 ? (
                  <div className="col-span-full rounded-md border border-dashed border-[#345966] bg-[#102027] px-4 py-8 text-center text-sm text-[#a9c3c8]">
                    {customersQuery.isLoading ? t("customers.loading") : t("customers.empty")}
                  </div>
                ) : null}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>

      <div className="fixed bottom-0 left-0 right-0 z-30 hidden border-t border-[#254653] bg-[#0f171d]/95 px-4 py-2 text-xs text-[#a9c3c8] backdrop-blur lg:block">
        {t("hotkeys")}
      </div>
    </div>
  )
}
