"use client"
import addItemSuppliers from "@/actions/item-suppliers/addItemSuppliers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";


type Supplier = {
  id: string,
  name: string
}


interface itemSupplierModalProps {
  itemId: string;
  suppliers: Supplier[],
  existingSupplierIds?: string[]

}
export const AddItemSuppliersModal = ({ itemId, suppliers, existingSupplierIds }: itemSupplierModalProps) => {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSuppliers, setSelectedSuppliers] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredSuppliers = suppliers.filter((sup) => sup.name.toLocaleLowerCase().includes(searchQuery.toLocaleLowerCase()))


  useEffect(() => {
    if (open)
      setSearchQuery("")
    setSelectedSuppliers([])
  }, [open])


  const toggleSupplier = (supplierId: string) => {
    setSelectedSuppliers((prev) => prev.includes(supplierId) ? prev.filter((id) => id !== supplierId) : [...prev, supplierId])
  }

  const handleSubmit = async () => {
    if (selectedSuppliers.length === 0) return
    setIsSubmitting(true)
    try {
      await addItemSuppliers(itemId, selectedSuppliers)
      setOpen(false)
      router.refresh()
    } catch (error) {
      console.log("Failed to add suppliers", error)
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button >

          add Item Supplier
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Suppliers</DialogTitle>
          <DialogDescription>
            Select Suppliers to associate with this item
          </DialogDescription>
        </DialogHeader>

        <div className="">
          <Input
            placeholder="Search Supplier"
            className="ps-8"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value) }}
          />

        </div>
        <ScrollArea className="h-[300px] mt-2 rounded-md border p-2">
          {filteredSuppliers.length > 0 ? (
            <div className="space-y-2">
              {filteredSuppliers.map((supplier) => {
                const isExisting = existingSupplierIds?.includes(supplier.id)
                return (
                  <div className={`flex items-center space-x-2 p2 rounded-md 
                    ${isExisting ? "bg-muted" : ""}`} key={supplier.id}>
                    {supplier.name}
                    {isExisting && <span className="ms-2 text-sm">(Already Added)</span>}

                    {isExisting ? (<div className="h-4 w-4 flex items-center justify-center rounded-sm border-primary border bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                    </div>) : (
                      <Checkbox
                        id={`supplier-${supplier.id}`}
                        checked={selectedSuppliers.includes(supplier.id)}
                        onCheckedChange={() => toggleSupplier(supplier.id)}
                        disabled={isExisting}
                      />
                    )}
                    <div>
                      <Label
                        htmlFor={`supplier-${supplier.id}`}
                        className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed  peer-disabled:opacity-70 flex-1 ${isExisting ? "to-muted-foreground" : ""}`}
                      >

                        {supplier.name}
                        {isExisting && <span className="ms-2 text-xs">(Already Added)</span>}

                      </Label>
                    </div>
                  </div>
                )

              })

              }
            </div>) : (
            <div className="flex h-full items-center justify-centerc text-muted-foreground">
              No Suppliers Found
            </div>)


          }
        </ScrollArea>
        <DialogFooter className="flex items-center justify-between">
          <div className="text-sm to-muted-foreground">
            {selectedSuppliers.length} supplier {selectedSuppliers.length !== 1 ? "s" : ""} selected
          </div>
          <div className="flex gap-5">
            <Button variant={"outline"} onClick={() => setOpen(true)}>

            </Button>
          </div>
          <div className="">
            <Button>Cancel</Button>
            <Button onClick={handleSubmit} disabled={
              selectedSuppliers.length === 0 || isSubmitting
            }>{isSubmitting ? "Adding..." : "Add Selected"}</Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog >
  )
}

export default AddItemSuppliersModal