"use client"

import { notify } from "@/lib/notifications/notify"
import { useMemo, useState, useTransition } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ChevronsUpDown, Check, Plus, Trash, LinkIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { SupplierDTO, SupplierInput, ItemSupplierLink, RecentPOItem } from "@/types/suppliersSystemTypes"

type CommonProps = { organizationId: string }
type CreateProps = {
  mode: "create"
  onSubmit: (input: SupplierInput) => Promise<SupplierDTO>
  initial?: Partial<SupplierDTO>
}
type EditProps = {
  mode: "edit"
  onSubmit: (input: SupplierInput & { id: string }) => Promise<SupplierDTO>
  initial: SupplierDTO
  // ItemSupplier integration (edit mode only)
  initialItemLinks?: ItemSupplierLink[]
  itemSearchAction?: (q: string) => Promise<Array<{ id: string; name: string; sku?: string }>>
  upsertItemSuppliersAction?: (rows: Array<Partial<ItemSupplierLink> & { itemId: string }>) => Promise<any>
  deleteItemSupplierAction?: (id: string) => Promise<any>
  linkRecentPOItemsAction?: (months: number) => Promise<RecentPOItem[]>
}

export default function SupplierForm(props: (CreateProps | EditProps) & CommonProps) {

  const [isPending, startTransition] = useTransition()
  const [name, setName] = useState(props.initial?.name || "")
  const [code, setCode] = useState(props.initial?.code || "")
  const [contactPerson, setContactPerson] = useState(props.initial?.contactPerson || "")
  const [email, setEmail] = useState(props.initial?.email || "")
  const [phone, setPhone] = useState(props.initial?.phone || "")
  const [address, setAddress] = useState(props.initial?.address || "")
  const [city, setCity] = useState(props.initial?.city || "")
  const [state, setState] = useState(props.initial?.state || "")
  const [zipCode, setZipCode] = useState(props.initial?.zipCode || "")
  const [country, setCountry] = useState(props.initial?.country || "")
  const [taxId, setTaxId] = useState(props.initial?.taxId || "")
  const [paymentTerms, setPaymentTerms] = useState<number>(props.initial?.paymentTerms ?? 30)
  const [creditLimit, setCreditLimit] = useState<number>(props.initial?.creditLimit ?? 0)
  const [notes, setNotes] = useState(props.initial?.notes || "")
  const [isActive, setIsActive] = useState<boolean>(props.initial?.isActive ?? true)

  const submitSupplier = () => {
    startTransition(async () => {
      try {
        const base: SupplierInput = {
          organizationId: (props as any).organizationId,
          name,
          code,
          contactPerson,
          email,
          phone,
          address,
          city,
          state,
          zipCode,
          country,
          taxId,
          paymentTerms,
          creditLimit,
          notes,
          isActive,
        }
        if (props.mode === "create") {
          await props.onSubmit(base)
        } else {
          await (props as EditProps).onSubmit({ ...base, id: (props.initial as SupplierDTO).id })
        }
        notify({ title: "Saved", description: "Supplier saved successfully." })
      } catch (e: any) {
        notify({ title: "Save failed", description: e?.message || "Please try again.", variant: "destructive" })
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-xs">Name</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Supplies Inc." />
            </div>
            <div>
              <Label className="text-xs">Code</Label>
              <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="ACME" />
            </div>

            <div>
              <Label className="text-xs">Contact person</Label>
              <Input value={contactPerson} onChange={(e) => setContactPerson(e.target.value)} placeholder="Jane Doe" />
            </div>
            <div>
              <Label className="text-xs">Email</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ap@acme.com" />
            </div>

            <div>
              <Label className="text-xs">Phone</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+1 555 555 5555" />
            </div>
            <div>
              <Label className="text-xs">Payment terms (days)</Label>
              <Input
                type="number"
                min={0}
                value={paymentTerms}
                onChange={(e) => setPaymentTerms(Number(e.target.value))}
                placeholder="30"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-xs">Address</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main St." />
            </div>

            <div>
              <Label className="text-xs">City</Label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="San Francisco" />
            </div>
            <div>
              <Label className="text-xs">State</Label>
              <Input value={state} onChange={(e) => setState(e.target.value)} placeholder="CA" />
            </div>
            <div>
              <Label className="text-xs">Zip</Label>
              <Input value={zipCode} onChange={(e) => setZipCode(e.target.value)} placeholder="94105" />
            </div>
            <div>
              <Label className="text-xs">Country</Label>
              <Input value={country} onChange={(e) => setCountry(e.target.value)} placeholder="USA" />
            </div>

            <div>
              <Label className="text-xs">Tax ID</Label>
              <Input value={taxId} onChange={(e) => setTaxId(e.target.value)} placeholder="XX-XXXXXXX" />
            </div>
            <div>
              <Label className="text-xs">Credit limit</Label>
              <Input
                type="number"
                min={0}
                value={creditLimit}
                onChange={(e) => setCreditLimit(Number(e.target.value))}
                placeholder="10000"
              />
            </div>

            <div className="md:col-span-2">
              <Label className="text-xs">Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={isActive} onCheckedChange={setIsActive} id="supplier-active" />
              <Label htmlFor="supplier-active">Active</Label>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={submitSupplier} disabled={isPending} className="bg-teal-600 hover:bg-teal-700">
              {props.mode === "create" ? "Create Supplier" : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {props.mode === "edit" ? (
        <ItemSupplierEditor
          supplierId={(props.initial as SupplierDTO).id}
          organizationId={(props as any).organizationId}
          initialLinks={(props as EditProps).initialItemLinks || []}
          itemSearchAction={(props as EditProps).itemSearchAction}
          upsertAction={(props as EditProps).upsertItemSuppliersAction}
          deleteAction={(props as EditProps).deleteItemSupplierAction}
          linkRecentAction={(props as EditProps).linkRecentPOItemsAction}
        />
      ) : null}
    </div>
  )
}

function useDebounced<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value)
  useMemo(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function ItemSupplierEditor({
  supplierId,
  organizationId,
  initialLinks,
  itemSearchAction,
  upsertAction,
  deleteAction,
  linkRecentAction,
}: {
  supplierId: string
  organizationId: string
  initialLinks: ItemSupplierLink[]
  itemSearchAction?: (q: string) => Promise<Array<{ id: string; name: string; sku?: string }>>
  upsertAction?: (rows: Array<Partial<ItemSupplierLink> & { itemId: string }>) => Promise<any>
  deleteAction?: (id: string) => Promise<any>
  linkRecentAction?: (months: number) => Promise<RecentPOItem[]>
}) {
  const [isPending, startTransition] = useTransition()
  const [months, setMonths] = useState<string>("6")
  const [links, setLinks] = useState<ItemSupplierLink[]>(initialLinks)

  const addEmpty = () => {
    setLinks((prev) => [
      ...prev,
      {
        id: `tmp-${Math.random().toString(36).slice(2)}`,
        itemId: "",
        supplierId,
        isPreferred: false,
        leadTimeDays: null as any,
        minOrderQuantity: null as any,
        unitCost: null as any,
        supplierSku: "",
        supplierName: "",
        notes: "",
        item: undefined as any,
      },
    ])
  }
  const removeRow = (id: string) => {
    const row = links.find((x) => x.id === id)
    if (row && !row.id.startsWith("tmp-") && deleteAction) {
      startTransition(async () => {
        try {
          await deleteAction(row.id)
          setLinks((prev) => prev.filter((x) => x.id !== id))
          notify({ title: "Removed", description: "Item link removed." })
        } catch (e: any) {
          notify({ title: "Remove failed", description: e?.message || "Please try again.", variant: "destructive" })
        }
      })
    } else {
      setLinks((prev) => prev.filter((x) => x.id !== id))
    }
  }
  const updateRow = (id: string, patch: Partial<ItemSupplierLink>) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)))
  }

  const saveAll = () => {
    if (!upsertAction) return
    const rows = links
      .filter((l) => l.itemId)
      .map((l) => ({
        id: l.id.startsWith("tmp-") ? undefined : l.id,
        itemId: l.itemId,
        supplierSku: l.supplierSku || undefined,
        supplierName: l.supplierName || undefined,
        isPreferred: !!l.isPreferred,
        leadTimeDays: l.leadTimeDays ?? null,
        minOrderQuantity: l.minOrderQuantity ?? null,
        unitCost: l.unitCost ?? null,
        notes: l.notes || undefined,
      }))

    startTransition(async () => {
      try {
        await upsertAction(rows)
        notify({ title: "Saved", description: "Supplier item links updated." })
      } catch (e: any) {
        notify({ title: "Save failed", description: e?.message || "Please try again.", variant: "destructive" })
      }
    })
  }

  const linkFromRecent = () => {
    if (!linkRecentAction) return
    startTransition(async () => {
      try {
        const candidates = await linkRecentAction(Number(months) || 6)
        let added = 0
        setLinks((prev) => {
          const existingIds = new Set(prev.map((p) => p.itemId))
          const toAdd = candidates
            .filter((c) => !existingIds.has(c.itemId))
            .map<ItemSupplierLink>((c) => ({
              id: `tmp-${Math.random().toString(36).slice(2)}`,
              itemId: c.itemId,
              supplierId,
              supplierSku: "",
              supplierName: "",
              isPreferred: false,
              leadTimeDays: null,
              minOrderQuantity: null,
              unitCost: c.avgUnitCost ?? null,
              notes: "",
              item: { id: c.itemId, name: c.name, sku: c.sku },
            }))
          added = toAdd.length
          return [...prev, ...toAdd]
        })
        notify({
          title: "Linked from recent POs",
          description: added > 0 ? `Added ${added} items. Review and Save.` : "No new items found to add.",
        })
      } catch (e: any) {
        notify({ title: "Link failed", description: e?.message || "Please try again.", variant: "destructive" })
      }
    })
  }

  return (
    <Card className="border shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm font-medium">Supplier Items</div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={addEmpty} className="gap-2 bg-transparent">
              <Plus className="h-4 w-4" /> Add item
            </Button>
            <div className="flex items-center gap-2">
              <Select value={months} onValueChange={setMonths}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Months" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">Last 3 months</SelectItem>
                  <SelectItem value="6">Last 6 months</SelectItem>
                  <SelectItem value="12">Last 12 months</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={linkFromRecent} className="gap-2 bg-transparent">
                <LinkIcon className="h-4 w-4" /> Link items from recent POs
              </Button>
            </div>
            <Button onClick={saveAll} disabled={isPending} className="bg-teal-600 hover:bg-teal-700">
              Save vendor items
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="p-2">Item</th>
                <th className="p-2">Preferred</th>
                <th className="p-2">Lead days</th>
                <th className="p-2">MOQ</th>
                <th className="p-2">Unit cost</th>
                <th className="p-2">Supplier SKU</th>
                <th className="p-2">Notes</th>
                <th className="p-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((l) => (
                <tr key={l.id} className="border-b">
                  <td className="p-2">
                    <ItemCombo
                      value={l.itemId}
                      label={l.item ? `${l.item.name} · ${l.item.sku}` : ""}
                      onChange={(id, item) => updateRow(l.id, { itemId: id, item })}
                      searchAction={itemSearchAction}
                    />
                  </td>
                  <td className="p-2">
                    <div className="flex items-center gap-2">
                      <SwitchSmall
                        checked={!!l.isPreferred}
                        onCheckedChange={(v) => updateRow(l.id, { isPreferred: v })}
                      />
                    </div>
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min={0}
                      value={l.leadTimeDays ?? ""}
                      onChange={(e) =>
                        updateRow(l.id, { leadTimeDays: e.target.value === "" ? null : Number(e.target.value) })
                      }
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min={0}
                      value={l.minOrderQuantity ?? ""}
                      onChange={(e) =>
                        updateRow(l.id, { minOrderQuantity: e.target.value === "" ? null : Number(e.target.value) })
                      }
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      type="number"
                      min={0}
                      value={l.unitCost ?? ""}
                      onChange={(e) =>
                        updateRow(l.id, { unitCost: e.target.value === "" ? null : Number(e.target.value) })
                      }
                    />
                  </td>
                  <td className="p-2">
                    <Input
                      value={l.supplierSku || ""}
                      onChange={(e) => updateRow(l.id, { supplierSku: e.target.value })}
                    />
                  </td>
                  <td className="p-2">
                    <Input value={l.notes || ""} onChange={(e) => updateRow(l.id, { notes: e.target.value })} />
                  </td>
                  <td className="p-2 text-right">
                    <Button
                      variant="ghost"
                      className="text-rose-600 hover:text-rose-700"
                      onClick={() => removeRow(l.id)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {links.length === 0 && (
                <tr>
                  <td className="p-4 text-slate-500" colSpan={8}>
                    No vendor items. Use “Add item” or “Link items from recent POs” to populate from history.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}

/* Minimal switch using shadcn Switch but sized smaller */
function SwitchSmall({
  checked,
  onCheckedChange,
}: {
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center">
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

/* Item combobox */
function ItemCombo({
  value,
  label,
  onChange,
  searchAction,
}: {
  value?: string
  label?: string
  onChange: (id: string, item?: { id: string; name: string; sku?: string }) => void
  searchAction?: (q: string) => Promise<Array<{ id: string; name: string; sku?: string }>>
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState("")
  const debounced = useDebounced(q)
  const [display, setDisplay] = useState(label || "")

  const [results, setResults] = useState<Array<{ id: string; name: string; sku?: string }>>([])
  useMemo(() => {
    let cancelled = false
    ;(async () => {
      if (searchAction) {
        const r = await searchAction(debounced)
        if (!cancelled) setResults(r || [])
      }
    })()
    return () => {
      cancelled = true
    }
  }, [debounced, searchAction])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-64 justify-between", !value && "text-muted-foreground")}
        >
          {value ? display : "Select item..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0">
        <Command>
          <CommandInput placeholder="Search items..." value={q} onValueChange={setQ} />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup>
              {results.map((it) => (
                <CommandItem
                  key={it.id}
                  value={it.name}
                  onSelect={() => {
                    onChange(it.id, it)
                    setDisplay(`${it.name}${it.sku ? ` · ${it.sku}` : ""}`)
                    setOpen(false)
                  }}
                  className="flex items-center justify-between"
                >
                  <span>
                    {it.name} <span className="text-slate-500">{it.sku ? `· ${it.sku}` : ""}</span>
                  </span>
                  <Check className={cn("h-4 w-4", value === it.id ? "opacity-100" : "opacity-0")} />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
