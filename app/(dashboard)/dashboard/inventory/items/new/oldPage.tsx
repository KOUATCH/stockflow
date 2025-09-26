
import ComprehensiveItemFormForEditing from "@/components/dashboard/items/ItemFormForEditing";
import { HelpCircle } from 'lucide-react';


export default function NewItemPage() {
  // This would typically come from your auth system
  const organizationId = "your-org-id"

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl text-sky-950 font-bold tracking-tight">Create New Item</h1>
        <p className="text-muted-foreground">
          <HelpCircle className="inline mr-2" />
          Fill out the form below to add a new item to your inventory.
        </p>
      </div>
      <ComprehensiveItemFormForEditing open={false} onOpenChange={function (open: boolean): void {
        throw new Error("Function not implemented.")
      }}        // organizationId={organizationId}
      />
    </div>
  )
}
