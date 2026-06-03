import { AuthLayout, ForgotPasswordForm } from "@/components/auth";
import { auth } from "@/auth";
import { LOCALE_COOKIE, localizePath, pickLocale } from "@/i18n/routing";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

export default async function page() {
  const cookieStore = await cookies();
  const locale = pickLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const session = await auth();
  if (session) {
    redirect(localizePath("/dashboard", locale));
  }
  return (
    <AuthLayout variant="forgot">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
