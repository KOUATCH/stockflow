
interface EditItemPageProps {
  params: {
    id: string
  }
}

export default async function EditItemPage({ params }: EditItemPageProps) {
  // This would typically come from your auth system
  const itemId = await params.id
  console.log({ params })
  console.log({ itemId })
  // This would typically be fetched from your API
  const initialData = await itemAPI.getSingleItemById(itemId)
  console.log({ initialData })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-4">
        Edit Item: {initialData ? initialData.name : "Loading..."}
      </h1>
      {/* Pass the initial data to the form */}
      <ComprehensiveItemFormFinal open={false} onOpenChange={function (open: boolean): void {
        throw new Error("Function not implemented.")
      }}      // organizationId={organizationId}
        itemData={initialData ?? undefined}
        onSuccess={() => { }}
      />
    </div>
  )
}
