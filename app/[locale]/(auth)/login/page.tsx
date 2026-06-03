import { AuthLayout, EnhancedLoginForm } from "@/components/auth";
import { auth } from "@/auth";
import { localizePath, pickLocale } from "@/i18n/routing";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = pickLocale(rawLocale);
  const session = await auth();

  if (session) {
    redirect(localizePath("/dashboard", locale));
  }

  return (
    <AuthLayout variant="login">
      <EnhancedLoginForm />
    </AuthLayout>
  );
}
