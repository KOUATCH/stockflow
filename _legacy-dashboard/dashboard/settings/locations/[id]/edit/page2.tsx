import { redirect } from "next/navigation"

interface EditLocationPage2Props {
  params: Promise<{ id: string }> | { id: string }
}

export default async function EditLocationPage2({ params }: EditLocationPage2Props) {
  const resolvedParams = await Promise.resolve(params)

  redirect(`/dashboard/settings/locations/${resolvedParams.id}/edit`)
}
