import { redirect } from "next/navigation";

interface BrandProductsPageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default async function BrandProductsPage({ params }: BrandProductsPageProps) {
  const resolvedParams = await Promise.resolve(params);
  const brandId = resolvedParams.id;

  // Redirect to items page with brand filter
  redirect(`/dashboard/inventory/items?brandId=${brandId}`);
}