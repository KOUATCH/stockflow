"use client"

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import type { UnitType } from "@prisma/client"
import {
  AlertCircle,
  ArrowDownUp,
  CheckCircle2,
  ChevronsUpDown,
  Clock3,
  Copy,
  Download,
  Droplets,
  Edit3,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Plus,
  Power,
  RefreshCw,
  Ruler,
  Scale,
  Search,
  SlidersHorizontal,
  SquareStack,
  Trash2,
  XCircle,
  type LucideIcon,
} from "lucide-react"

import { Link } from "@/i18n/navigation"
import type { Locale } from "@/types/bilingual"
import { cn } from "@/lib/utils"
import { useNotifications } from "@/components/notifications/NotificationProvider"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { UnitManagementInput, UnitManagementRow } from "@/actions/units/unit-management-actions"
import {
  useCreateManagedUnit,
  useDeleteManagedUnit,
  useUnitManagementData,
  useUpdateManagedUnit,
} from "@/hooks/useUnitManagement"

interface UnitsManagementDashboardProps {
  organizationId: string
  locale?: Locale
  initialAction?: "create"
  initialEditId?: string
}

type StatusFilter = "all" | "active" | "inactive"
type UnitFormState = {
  nameEn: string
  nameFr: string
  symbol: string
  type: UnitType
  baseUnit: string
  conversionRate: string
  isActive: boolean
}

const DASHBOARD_SEGMENT = "dashboard"

const dashboardPath = (...segments: string[]) =>
  `/${[DASHBOARD_SEGMENT, ...segments].join("/")}`

const UNIT_TYPES = [
  "QUANTITY",
  "WEIGHT",
  "VOLUME",
  "LENGTH",
  "AREA",
  "TIME",
] as const satisfies readonly UnitType[]

const copy = {
  en: {
    eyebrow: "Measurement control",
    title: "Units dashboard",
    subtitle: "Maintain the reusable measurement units that drive inventory, purchasing, pricing, and POS quantities.",
    search: "Search name, French name, symbol, type, base unit...",
    status: "Status",
    type: "Type",
    all: "All",
    active: "Active",
    inactive: "Inactive",
    create: "Create unit",
    edit: "Edit unit",
    refresh: "Refresh",
    refreshing: "Refreshing",
    export: "Export",
    actions: "Actions",
    viewDetails: "View details",
    copyId: "Copy ID",
    remove: "Remove",
    loadingTitle: "Loading units",
    loadingBody: "Collecting measurement definitions and item usage counts.",
    errorTitle: "Units unavailable",
    retry: "Try again",
    emptyTitle: "No units found",
    emptyBody: "Create units such as Piece, Kilogram, Liter, Meter, or Hour before building item records.",
    rows: "rows",
    page: "Page",
    of: "of",
    previous: "Previous",
    next: "Next",
    totalUnits: "Total units",
    activeUnits: "Active",
    referencedUnits: "Used by items",
    conversionUnits: "Conversions",
    noBase: "Base unit",
    noConversion: "No conversion",
    noFrenchName: "No French name",
    copiedTitle: "Unit ID copied",
    copiedBody: "The unit identifier is ready to paste.",
    copyFailedTitle: "Copy failed",
    copyFailedBody: "The browser could not copy this identifier.",
    exportTitle: "Units exported",
    exportBody: "The current units view was exported as CSV.",
    requiredTitle: "Unit details required",
    requiredBody: "Enter an English name and symbol before saving.",
    invalidRateTitle: "Invalid conversion rate",
    invalidRateBody: "Use a positive number for conversion rate, or leave it blank.",
    removeTitle: "Remove unit",
    removeBody: "Unused units are deleted. Units attached to items are deactivated to preserve inventory history.",
    confirmRemove: "Remove unit",
    cancel: "Cancel",
    saving: "Saving",
    creating: "Creating",
    formDescription: "Unit identity, classification, optional base conversion, and active status.",
    fields: {
      nameEn: "English name",
      nameFr: "French name",
      symbol: "Symbol",
      type: "Type",
      baseUnit: "Base unit",
      conversionRate: "Conversion rate",
      isActive: "Active",
    },
    placeholders: {
      nameEn: "Kilogram",
      nameFr: "Kilogramme",
      symbol: "kg",
      baseUnit: "Gram",
      conversionRate: "1000",
    },
    tableColumns: {
      unit: "Unit",
      type: "Type",
      conversion: "Conversion",
      usage: "Usage",
      activity: "Activity",
      status: "Status",
      actions: "Actions",
    },
    types: {
      QUANTITY: "Quantity",
      WEIGHT: "Weight",
      VOLUME: "Volume",
      LENGTH: "Length",
      AREA: "Area",
      TIME: "Time",
    },
  },
  fr: {
    eyebrow: "Controle des mesures",
    title: "Tableau des unites",
    subtitle: "Gerez les unites de mesure reutilisables pour le stock, les achats, les prix et les quantites POS.",
    search: "Rechercher nom, nom francais, symbole, type, unite de base...",
    status: "Statut",
    type: "Type",
    all: "Tous",
    active: "Actif",
    inactive: "Inactif",
    create: "Creer une unite",
    edit: "Modifier l'unite",
    refresh: "Actualiser",
    refreshing: "Actualisation",
    export: "Exporter",
    actions: "Actions",
    viewDetails: "Voir details",
    copyId: "Copier ID",
    remove: "Retirer",
    loadingTitle: "Chargement des unites",
    loadingBody: "Collecte des definitions de mesure et des compteurs articles.",
    errorTitle: "Unites indisponibles",
    retry: "Reessayer",
    emptyTitle: "Aucune unite trouvee",
    emptyBody: "Creez des unites comme Piece, Kilogramme, Litre, Metre ou Heure avant les articles.",
    rows: "lignes",
    page: "Page",
    of: "sur",
    previous: "Retour",
    next: "Suivant",
    totalUnits: "Total unites",
    activeUnits: "Actives",
    referencedUnits: "Utilisees",
    conversionUnits: "Conversions",
    noBase: "Unite de base",
    noConversion: "Aucune conversion",
    noFrenchName: "Pas de nom francais",
    copiedTitle: "ID unite copie",
    copiedBody: "L'identifiant de l'unite est pret a coller.",
    copyFailedTitle: "Copie echouee",
    copyFailedBody: "Le navigateur n'a pas pu copier cet identifiant.",
    exportTitle: "Unites exportees",
    exportBody: "La vue actuelle des unites a ete exportee en CSV.",
    requiredTitle: "Details unite requis",
    requiredBody: "Saisissez un nom anglais et un symbole avant l'enregistrement.",
    invalidRateTitle: "Taux de conversion invalide",
    invalidRateBody: "Utilisez un nombre positif, ou laissez le champ vide.",
    removeTitle: "Retirer l'unite",
    removeBody: "Les unites inutilisees sont supprimees. Celles liees aux articles sont desactivees pour preserver l'historique.",
    confirmRemove: "Retirer l'unite",
    cancel: "Annuler",
    saving: "Enregistrement",
    creating: "Creation",
    formDescription: "Identite, classification, conversion optionnelle et statut actif.",
    fields: {
      nameEn: "Nom anglais",
      nameFr: "Nom francais",
      symbol: "Symbole",
      type: "Type",
      baseUnit: "Unite de base",
      conversionRate: "Taux de conversion",
      isActive: "Actif",
    },
    placeholders: {
      nameEn: "Kilogram",
      nameFr: "Kilogramme",
      symbol: "kg",
      baseUnit: "Gramme",
      conversionRate: "1000",
    },
    tableColumns: {
      unit: "Unite",
      type: "Type",
      conversion: "Conversion",
      usage: "Utilisation",
      activity: "Activite",
      status: "Statut",
      actions: "Actions",
    },
    types: {
      QUANTITY: "Quantite",
      WEIGHT: "Poids",
      VOLUME: "Volume",
      LENGTH: "Longueur",
      AREA: "Surface",
      TIME: "Temps",
    },
  },
} as const

const typeMeta: Record<UnitType, { icon: LucideIcon; tone: "brand" | "spruce" | "gold" | "success" }> = {
  QUANTITY: { icon: SquareStack, tone: "brand" },
  WEIGHT: { icon: Scale, tone: "success" },
  VOLUME: { icon: Droplets, tone: "spruce" },
  LENGTH: { icon: Ruler, tone: "gold" },
  AREA: { icon: SquareStack, tone: "spruce" },
  TIME: { icon: Clock3, tone: "brand" },
}

function getDefaultForm(): UnitFormState {
  return {
    nameEn: "",
    nameFr: "",
    symbol: "",
    type: "QUANTITY",
    baseUnit: "",
    conversionRate: "",
    isActive: true,
  }
}

function formFromUnit(unit: UnitManagementRow): UnitFormState {
  return {
    nameEn: unit.nameEn,
    nameFr: unit.nameFr ?? "",
    symbol: unit.symbol,
    type: unit.type,
    baseUnit: unit.baseUnit ?? "",
    conversionRate: unit.conversionRate ?? "",
    isActive: unit.isActive,
  }
}

function formatNumber(value: number, locale: Locale) {
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-US", {
    maximumFractionDigits: 2,
  }).format(value)
}

function formatDate(value: Date | string | null | undefined, locale: Locale, fallback: string) {
  if (!value) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return new Intl.DateTimeFormat(locale === "fr" ? "fr-FR" : "en-US", { dateStyle: "medium" }).format(date)
}

function escapeCsv(value: string | number | boolean | null | undefined) {
  const text = String(value ?? "")
  return `"${text.replace(/"/g, '""')}"`
}

function toneClass(tone: "brand" | "spruce" | "gold" | "success" | "danger") {
  return {
    brand: "border-[var(--dash-brand)] bg-[var(--dash-brand-soft)] text-[var(--dash-brand-strong)]",
    spruce: "border-[var(--dash-spruce)] bg-[var(--dash-spruce-soft)] text-[var(--dash-spruce)]",
    gold: "border-[var(--dash-gold)] bg-[var(--dash-gold-soft)] text-[var(--dash-gold)]",
    success: "border-[var(--dash-success)] bg-[var(--dash-success-soft)] text-[var(--dash-success)]",
    danger: "border-[var(--dash-danger)] bg-[var(--dash-danger-soft)] text-[var(--dash-danger)]",
  }[tone]
}

function SortIcon({ sorted }: { sorted: false | "asc" | "desc" }) {
  return (
    <ChevronsUpDown
      className={cn("h-3.5 w-3.5", sorted ? "text-[var(--dash-brand-strong)]" : "text-[var(--dash-text-faint)]")}
    />
  )
}

export default function UnitsManagementDashboard({
  organizationId,
  locale = "en",
  initialAction,
  initialEditId,
}: UnitsManagementDashboardProps) {
  const t = copy[locale]
  const notifications = useNotifications()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<UnitType | "all">("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [sorting, setSorting] = useState<SortingState>([])
  const [formOpen, setFormOpen] = useState(false)
  const [editingUnit, setEditingUnit] = useState<UnitManagementRow | null>(null)
  const [removeTarget, setRemoveTarget] = useState<UnitManagementRow | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [formState, setFormState] = useState<UnitFormState>(() => getDefaultForm())
  const [initialRequestHandled, setInitialRequestHandled] = useState(false)

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useUnitManagementData(organizationId)
  const createMutation = useCreateManagedUnit(organizationId, locale)
  const updateMutation = useUpdateManagedUnit(organizationId, locale)
  const deleteMutation = useDeleteManagedUnit(organizationId, locale)

  const units = useMemo(() => data?.units ?? [], [data?.units])
  const isSaving = createMutation.isPending || updateMutation.isPending

  const filteredUnits = useMemo(() => {
    const query = search.trim().toLowerCase()

    return units.filter((unit) => {
      if (typeFilter !== "all" && unit.type !== typeFilter) return false
      if (statusFilter === "active" && !unit.isActive) return false
      if (statusFilter === "inactive" && unit.isActive) return false

      if (!query) return true

      return [
        unit.nameEn,
        unit.nameFr,
        unit.symbol,
        unit.type,
        unit.baseUnit,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
  }, [search, statusFilter, typeFilter, units])

  const summary = useMemo(() => {
    const activeUnits = units.filter((unit) => unit.isActive).length
    const referencedUnits = units.filter((unit) => unit.itemsCount > 0).length
    const conversionUnits = units.filter((unit) => unit.conversionRate && unit.baseUnit).length
    const typeCounts = UNIT_TYPES.map((type) => ({
      type,
      count: units.filter((unit) => unit.type === type).length,
    })).filter((item) => item.count > 0)

    return {
      activeUnits,
      referencedUnits,
      conversionUnits,
      typeCounts,
    }
  }, [units])

  const openCreate = useCallback(() => {
    setEditingUnit(null)
    setFormError(null)
    setFormState(getDefaultForm())
    setFormOpen(true)
  }, [])

  const openEdit = useCallback((unit: UnitManagementRow) => {
    setEditingUnit(unit)
    setFormError(null)
    setFormState(formFromUnit(unit))
    setFormOpen(true)
  }, [])

  useEffect(() => {
    if (initialRequestHandled || isLoading) return

    if (initialAction === "create") {
      openCreate()
      setInitialRequestHandled(true)
      return
    }

    if (initialEditId) {
      const unit = units.find((item) => item.id === initialEditId)

      if (unit) {
        openEdit(unit)
      } else {
        notifications.error(t.errorTitle, "The requested unit could not be opened for editing.")
      }

      setInitialRequestHandled(true)
    }
  }, [initialAction, initialEditId, initialRequestHandled, isLoading, notifications, openCreate, openEdit, t.errorTitle, units])

  const updateFormField = useCallback(<K extends keyof UnitFormState>(field: K, value: UnitFormState[K]) => {
    setFormState((current) => ({ ...current, [field]: value }))
    setFormError(null)
  }, [])

  const buildInput = useCallback((): UnitManagementInput | null => {
    const nameEn = formState.nameEn.trim()
    const symbol = formState.symbol.trim()
    const conversionRateText = formState.conversionRate.trim()

    if (!nameEn || !symbol) {
      notifications.warning(t.requiredTitle, t.requiredBody)
      setFormError(t.requiredBody)
      return null
    }

    const conversionRate = conversionRateText ? Number(conversionRateText) : null

    if (conversionRate !== null && (!Number.isFinite(conversionRate) || conversionRate <= 0)) {
      notifications.warning(t.invalidRateTitle, t.invalidRateBody)
      setFormError(t.invalidRateBody)
      return null
    }

    return {
      nameEn,
      nameFr: formState.nameFr.trim() || null,
      symbol,
      type: formState.type,
      baseUnit: formState.baseUnit.trim() || null,
      conversionRate,
      isActive: formState.isActive,
    }
  }, [formState, notifications, t.invalidRateBody, t.invalidRateTitle, t.requiredBody, t.requiredTitle])

  const submitForm = useCallback(async () => {
    const payload = buildInput()
    if (!payload) return

    try {
      if (editingUnit) {
        await updateMutation.mutateAsync({ id: editingUnit.id, data: payload })
      } else {
        await createMutation.mutateAsync(payload)
      }

      setFormOpen(false)
      setEditingUnit(null)
      setFormState(getDefaultForm())
      setFormError(null)
    } catch (mutationError) {
      setFormError(mutationError instanceof Error ? mutationError.message : t.errorTitle)
    }
  }, [buildInput, createMutation, editingUnit, t.errorTitle, updateMutation])

  const copyUnitId = useCallback(async (unit: UnitManagementRow) => {
    try {
      await navigator.clipboard.writeText(unit.id)
      notifications.success(t.copiedTitle, t.copiedBody)
    } catch {
      notifications.error(t.copyFailedTitle, t.copyFailedBody)
    }
  }, [notifications, t.copiedBody, t.copiedTitle, t.copyFailedBody, t.copyFailedTitle])

  const exportUnits = useCallback(() => {
    const header = ["Name EN", "Name FR", "Symbol", "Type", "Base Unit", "Conversion Rate", "Active", "Items"]
    const rows = filteredUnits.map((unit) => [
      unit.nameEn,
      unit.nameFr ?? "",
      unit.symbol,
      unit.type,
      unit.baseUnit ?? "",
      unit.conversionRate ?? "",
      unit.isActive ? "true" : "false",
      unit.itemsCount,
    ])
    const csv = [header, ...rows]
      .map((row) => row.map((value) => escapeCsv(value)).join(","))
      .join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement("a")
    anchor.href = url
    anchor.download = "units.csv"
    anchor.click()
    URL.revokeObjectURL(url)
    notifications.success(t.exportTitle, t.exportBody)
  }, [filteredUnits, notifications, t.exportBody, t.exportTitle])

  const columns = useMemo<ColumnDef<UnitManagementRow>[]>(() => [
    {
      accessorKey: "nameEn",
      header: ({ column }) => (
        <HeaderButton onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t.tableColumns.unit}
          <SortIcon sorted={column.getIsSorted()} />
        </HeaderButton>
      ),
      cell: ({ row }) => {
        const unit = row.original
        return (
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[var(--dash-border-subtle)] bg-[var(--dash-brand-soft)] text-[var(--dash-brand-strong)]">
                <Ruler className="h-4 w-4" />
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold text-[var(--dash-text)]">{unit.nameEn}</p>
                <p className="truncate text-xs text-[var(--dash-text-soft)]">{unit.nameFr || t.noFrenchName}</p>
              </div>
            </div>
            <Badge variant="outline" className="mt-2 rounded-lg border-[var(--dash-border-subtle)] bg-[rgba(37,57,67,0.34)] font-mono text-[var(--dash-text-soft)]">
              {unit.symbol}
            </Badge>
          </div>
        )
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <HeaderButton onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t.tableColumns.type}
          <SortIcon sorted={column.getIsSorted()} />
        </HeaderButton>
      ),
      cell: ({ row }) => {
        const type = row.original.type
        const meta = typeMeta[type]
        const Icon = meta.icon
        return (
          <Badge variant="outline" className={cn("rounded-lg", toneClass(meta.tone))}>
            <Icon className="me-1.5 h-3.5 w-3.5" />
            {t.types[type]}
          </Badge>
        )
      },
    },
    {
      id: "conversion",
      header: t.tableColumns.conversion,
      cell: ({ row }) => {
        const unit = row.original
        return (
          <div className="space-y-1 text-sm">
            <p className="font-medium text-[var(--dash-text)]">{unit.baseUnit || t.noBase}</p>
            <p className="text-[var(--dash-text-soft)]">
              {unit.conversionRate
                ? `1 ${unit.symbol} = ${unit.conversionRate} ${unit.baseUnit || ""}`.trim()
                : t.noConversion}
            </p>
          </div>
        )
      },
    },
    {
      accessorKey: "itemsCount",
      header: ({ column }) => (
        <HeaderButton onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t.tableColumns.usage}
          <SortIcon sorted={column.getIsSorted()} />
        </HeaderButton>
      ),
      cell: ({ row }) => (
        <div className="grid min-w-36 grid-cols-2 gap-2 text-sm">
          <InlineMetric label="Items" value={formatNumber(row.original.itemsCount, locale)} />
          <InlineMetric label="Active" value={formatNumber(row.original.activeItemsCount, locale)} />
        </div>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: ({ column }) => (
        <HeaderButton onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          {t.tableColumns.activity}
          <SortIcon sorted={column.getIsSorted()} />
        </HeaderButton>
      ),
      cell: ({ row }) => (
        <div className="text-sm text-[var(--dash-text-soft)]">
          {formatDate(row.original.updatedAt, locale, "-")}
        </div>
      ),
    },
    {
      accessorKey: "isActive",
      header: t.tableColumns.status,
      cell: ({ row }) => (
        row.original.isActive ? (
          <Badge variant="outline" className={cn("rounded-lg", toneClass("success"))}>
            <CheckCircle2 className="me-1 h-3.5 w-3.5" />
            {t.active}
          </Badge>
        ) : (
          <Badge variant="outline" className={cn("rounded-lg", toneClass("danger"))}>
            <XCircle className="me-1 h-3.5 w-3.5" />
            {t.inactive}
          </Badge>
        )
      ),
    },
    {
      id: "actions",
      header: t.tableColumns.actions,
      enableSorting: false,
      cell: ({ row }) => {
        const unit = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 rounded-lg text-[var(--dash-text-soft)] hover:bg-[var(--dash-brand-soft)] hover:text-[var(--dash-brand-strong)]">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">{t.actions}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 border-[var(--dash-border-subtle)] bg-[var(--dash-surface-raised)] text-[var(--dash-text)]">
              <DropdownMenuLabel>{t.actions}</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[var(--dash-border-subtle)]" />
              <DropdownMenuItem asChild>
                <Link href={dashboardPath("inventory", "units", unit.id, "details")}>
                  <ExternalLink className="me-2 h-4 w-4" />
                  {t.viewDetails}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEdit(unit)}>
                <Edit3 className="me-2 h-4 w-4" />
                {t.edit}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => copyUnitId(unit)}>
                <Copy className="me-2 h-4 w-4" />
                {t.copyId}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[var(--dash-border-subtle)]" />
              <DropdownMenuItem className="text-[var(--dash-danger)] focus:text-[var(--dash-danger)]" onClick={() => setRemoveTarget(unit)}>
                {unit.itemsCount > 0 ? <Power className="me-2 h-4 w-4" /> : <Trash2 className="me-2 h-4 w-4" />}
                {t.remove}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [copyUnitId, locale, openEdit, t])

  const table = useReactTable({
    data: filteredUnits,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  })

  if (isLoading) {
    return (
      <section className="dashboard-glass-panel flex min-h-[24rem] items-center justify-center rounded-lg border border-[var(--dash-border-subtle)] p-8 text-center">
        <div className="space-y-4">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[var(--dash-brand-strong)]" />
          <div>
            <p className="font-semibold text-[var(--dash-text)]">{t.loadingTitle}</p>
            <p className="mt-1 text-sm text-[var(--dash-text-soft)]">{t.loadingBody}</p>
          </div>
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="dashboard-glass-panel flex min-h-[24rem] items-center justify-center rounded-lg border border-[var(--dash-border-subtle)] p-8 text-center">
        <div className="max-w-md space-y-4">
          <AlertCircle className="mx-auto h-9 w-9 text-[var(--dash-danger)]" />
          <div>
            <p className="font-semibold text-[var(--dash-text)]">{t.errorTitle}</p>
            <p className="mt-1 text-sm text-[var(--dash-text-soft)]">
              {error instanceof Error ? error.message : t.errorTitle}
            </p>
          </div>
          <Button type="button" onClick={() => refetch()} className="dashboard-button-primary h-10 rounded-lg">
            <RefreshCw className="h-4 w-4" />
            {t.retry}
          </Button>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="space-y-6">
        <div className="dashboard-glass-panel rounded-lg border border-[var(--dash-border-subtle)] p-5">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--dash-brand-strong)]">{t.eyebrow}</p>
              <div className="mt-3 flex items-start gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-[var(--dash-border-subtle)] bg-[var(--dash-brand-soft)]">
                  <Ruler className="h-6 w-6 text-[var(--dash-brand-strong)]" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-2xl font-semibold text-[var(--dash-text)] md:text-3xl">{t.title}</h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--dash-text-soft)]">{t.subtitle}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => refetch()}
                disabled={isFetching}
                className="dashboard-button-secondary h-10 rounded-lg"
              >
                <RefreshCw className={cn("h-4 w-4", isFetching && "animate-spin")} />
                {isFetching ? t.refreshing : t.refresh}
              </Button>
              <Button type="button" onClick={openCreate} className="dashboard-button-primary h-10 rounded-lg">
                <Plus className="h-4 w-4" />
                {t.create}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryTile icon={Ruler} label={t.totalUnits} value={units.length} locale={locale} tone="brand" />
            <SummaryTile icon={CheckCircle2} label={t.activeUnits} value={summary.activeUnits} locale={locale} tone="success" />
            <SummaryTile icon={ArrowDownUp} label={t.referencedUnits} value={summary.referencedUnits} locale={locale} tone="spruce" />
            <SummaryTile icon={SlidersHorizontal} label={t.conversionUnits} value={summary.conversionUnits} locale={locale} tone="gold" />
          </div>
        </div>

        <div className="dashboard-glass-panel rounded-lg border border-[var(--dash-border-subtle)] p-4">
          <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_10rem_10rem_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--dash-text-faint)]" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t.search}
                className="dashboard-control h-11 rounded-lg pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as UnitType | "all")}>
              <SelectTrigger className="dashboard-control h-11 rounded-lg">
                <SelectValue placeholder={t.type} />
              </SelectTrigger>
              <SelectContent className="border-[var(--dash-border-subtle)] bg-[var(--dash-surface-raised)] text-[var(--dash-text)]">
                <SelectItem value="all">{t.all}</SelectItem>
                {UNIT_TYPES.map((type) => (
                  <SelectItem key={type} value={type}>{t.types[type]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
              <SelectTrigger className="dashboard-control h-11 rounded-lg">
                <SelectValue placeholder={t.status} />
              </SelectTrigger>
              <SelectContent className="border-[var(--dash-border-subtle)] bg-[var(--dash-surface-raised)] text-[var(--dash-text)]">
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="active">{t.active}</SelectItem>
                <SelectItem value="inactive">{t.inactive}</SelectItem>
              </SelectContent>
            </Select>
            <Button type="button" variant="outline" onClick={exportUnits} className="dashboard-button-secondary h-11 rounded-lg">
              <Download className="h-4 w-4" />
              {t.export}
            </Button>
          </div>

          {summary.typeCounts.length ? (
            <div className="mb-4 flex flex-wrap gap-2">
              {summary.typeCounts.map((item) => {
                const meta = typeMeta[item.type]
                const Icon = meta.icon
                return (
                  <Badge key={item.type} variant="outline" className={cn("rounded-lg", toneClass(meta.tone))}>
                    <Icon className="me-1.5 h-3.5 w-3.5" />
                    {t.types[item.type]}: {formatNumber(item.count, locale)}
                  </Badge>
                )
              })}
            </div>
          ) : null}

          <div className="overflow-hidden rounded-lg border border-[var(--dash-border-subtle)] bg-[rgba(12,20,24,0.35)]">
            <div className="overflow-x-auto">
              <Table className="min-w-[76rem]">
                <TableHeader className="bg-[rgba(16,27,32,0.94)]">
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-[var(--dash-border-subtle)] hover:bg-transparent">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="h-12 px-4 text-xs font-semibold text-[var(--dash-text-muted)]">
                          {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.length ? (
                    table.getRowModel().rows.map((row) => (
                      <TableRow key={row.id} className="border-[var(--dash-border-subtle)] hover:bg-[var(--dash-brand-soft)]">
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id} className="px-4 py-4 align-top">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-48 text-center">
                        <div className="mx-auto flex max-w-sm flex-col items-center gap-3 text-[var(--dash-text-soft)]">
                          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--dash-brand-soft)] text-[var(--dash-brand-strong)]">
                            <Ruler className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-semibold text-[var(--dash-text)]">{t.emptyTitle}</p>
                            <p className="mt-1 text-sm leading-6">{t.emptyBody}</p>
                          </div>
                          <Button type="button" onClick={openCreate} className="dashboard-button-primary h-10 rounded-lg">
                            <Plus className="h-4 w-4" />
                            {t.create}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-sm text-[var(--dash-text-soft)] md:flex-row md:items-center md:justify-between">
            <div>
              {t.page} {table.getState().pagination.pageIndex + 1} {t.of} {Math.max(table.getPageCount(), 1)}
              <span className="ms-2">({formatNumber(filteredUnits.length, locale)} {t.rows})</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(value) => table.setPageSize(Number(value))}
              >
                <SelectTrigger className="dashboard-control h-10 w-24 rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-[var(--dash-border-subtle)] bg-[var(--dash-surface-raised)] text-[var(--dash-text)]">
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="dashboard-button-secondary h-10 rounded-lg"
              >
                {t.previous}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="dashboard-button-secondary h-10 rounded-lg"
              >
                {t.next}
              </Button>
            </div>
          </div>
        </div>
      </section>

      <Dialog
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open)
          if (!open && !isSaving) {
            setEditingUnit(null)
            setFormError(null)
            setFormState(getDefaultForm())
          }
        }}
      >
        <DialogContent className="dashboard-glass-panel max-h-[92vh] max-w-2xl overflow-y-auto rounded-lg border-[var(--dash-border-subtle)] text-[var(--dash-text)]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-[var(--dash-text)]">
              <Ruler className="h-5 w-5 text-[var(--dash-brand-strong)]" />
              {editingUnit ? t.edit : t.create}
            </DialogTitle>
            <DialogDescription className="text-[var(--dash-text-soft)]">
              {t.formDescription}
            </DialogDescription>
          </DialogHeader>

          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault()
              void submitForm()
            }}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <Field label={t.fields.nameEn} required>
                <Input
                  value={formState.nameEn}
                  onChange={(event) => updateFormField("nameEn", event.target.value)}
                  placeholder={t.placeholders.nameEn}
                  className="dashboard-control h-11 rounded-lg"
                />
              </Field>
              <Field label={t.fields.nameFr}>
                <Input
                  value={formState.nameFr}
                  onChange={(event) => updateFormField("nameFr", event.target.value)}
                  placeholder={t.placeholders.nameFr}
                  className="dashboard-control h-11 rounded-lg"
                />
              </Field>
              <Field label={t.fields.symbol} required>
                <Input
                  value={formState.symbol}
                  onChange={(event) => updateFormField("symbol", event.target.value)}
                  placeholder={t.placeholders.symbol}
                  className="dashboard-control h-11 rounded-lg font-mono"
                />
              </Field>
              <Field label={t.fields.type}>
                <Select value={formState.type} onValueChange={(value) => updateFormField("type", value as UnitType)}>
                  <SelectTrigger className="dashboard-control h-11 rounded-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--dash-border-subtle)] bg-[var(--dash-surface-raised)] text-[var(--dash-text)]">
                    {UNIT_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{t.types[type]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
              <Field label={t.fields.baseUnit}>
                <Input
                  value={formState.baseUnit}
                  onChange={(event) => updateFormField("baseUnit", event.target.value)}
                  placeholder={t.placeholders.baseUnit}
                  className="dashboard-control h-11 rounded-lg"
                />
              </Field>
              <Field label={t.fields.conversionRate}>
                <Input
                type="number"
                  min="0.000001"
                  step="0.000001"
                  value={formState.conversionRate}
                  onChange={(event) => updateFormField("conversionRate", event.target.value)}
                  placeholder={t.placeholders.conversionRate}
                  className="dashboard-control h-11 rounded-lg"
                />
              </Field>
            </div>

            <div className="flex items-center justify-between gap-3 rounded-lg border border-[var(--dash-border-subtle)] bg-[rgba(37,57,67,0.36)] p-3">
              <Label className="text-sm font-medium text-[var(--dash-text)]">{t.fields.isActive}</Label>
              <Switch checked={formState.isActive} onCheckedChange={(checked) => updateFormField("isActive", checked)} />
            </div>

            {formError ? (
              <div className="rounded-lg border border-[var(--dash-danger)] bg-[var(--dash-danger-soft)] px-4 py-3 text-sm font-medium text-[var(--dash-danger)]">
                {formError}
              </div>
            ) : null}

            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormOpen(false)}
                disabled={isSaving}
                className="dashboard-button-secondary h-10 rounded-lg"
              >
                {t.cancel}
              </Button>
              <Button type="submit" disabled={isSaving} className="dashboard-button-primary h-10 rounded-lg">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {editingUnit ? t.saving : t.creating}
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    {editingUnit ? t.edit : t.create}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!removeTarget} onOpenChange={(open) => !open && setRemoveTarget(null)}>
        <AlertDialogContent className="dashboard-glass-panel border-[var(--dash-border-subtle)] text-[var(--dash-text)]">
          <AlertDialogHeader>
            <AlertDialogTitle>{t.removeTitle}</AlertDialogTitle>
            <AlertDialogDescription className="text-[var(--dash-text-soft)]">
              {t.removeBody}
              {removeTarget ? ` ${removeTarget.nameEn} (${removeTarget.symbol})` : ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dashboard-button-secondary rounded-lg">{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-lg bg-[var(--dash-danger)] text-white hover:bg-[var(--dash-danger)]/90"
              onClick={async (event) => {
                event.preventDefault()
                if (!removeTarget) return
                try {
                  await deleteMutation.mutateAsync(removeTarget.id)
                  setRemoveTarget(null)
                } catch {
                  // The mutation hook already surfaces provider notifications.
                }
              }}
            >
              {deleteMutation.isPending ? <Loader2 className="me-2 h-4 w-4 animate-spin" /> : null}
              {t.confirmRemove}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function HeaderButton({
  children,
  onClick,
}: {
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 items-center gap-2 text-left text-xs font-semibold text-[var(--dash-text-muted)] transition hover:text-[var(--dash-text)]"
    >
      {children}
    </button>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-[var(--dash-text-muted)]">
        {label}
        {required ? <span className="ms-1 text-[var(--dash-warning)]">*</span> : null}
      </Label>
      {children}
    </div>
  )
}

function SummaryTile({
  icon: Icon,
  label,
  value,
  locale,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: number
  locale: Locale
  tone: "brand" | "success" | "spruce" | "gold"
}) {
  return (
    <div className="rounded-lg border border-[var(--dash-border-subtle)] bg-[rgba(37,57,67,0.46)] p-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg border", toneClass(tone))}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="text-xs text-[var(--dash-text-faint)]">{label}</p>
      <p className="mt-1 truncate text-xl font-semibold text-[var(--dash-text)]">
        {formatNumber(value, locale)}
      </p>
    </div>
  )
}

function InlineMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-[var(--dash-border-subtle)] bg-[rgba(37,57,67,0.32)] p-2">
      <p className="text-[0.68rem] text-[var(--dash-text-faint)]">{label}</p>
      <p className="mt-1 font-semibold text-[var(--dash-text)]">{value}</p>
    </div>
  )
}
