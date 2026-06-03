import { redirect } from "next/navigation"

interface EditLocationPage2Props {
  params: Promise<{ locale: string; id: string }> | { locale: string; id: string }
}

export default async function EditLocationPage2({ params }: EditLocationPage2Props) {
  const resolvedParams = await Promise.resolve(params)

  redirect(`/${resolvedParams.locale}/dashboard/settings/locations`)
}
