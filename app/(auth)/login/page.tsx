import { AuthLayout, EnhancedLoginForm } from "@/components/auth";
import { auth } from "../../../auth";
import { LOCALE_COOKIE, localizePath, pickLocale } from "@/i18n/routing";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function page() {
  const cookieStore = await cookies();
  const locale = pickLocale(cookieStore.get(LOCALE_COOKIE)?.value);
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
