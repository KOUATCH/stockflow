import ForgotPasswordForm from "@/components/Forms/ForgotPasswordForm";
import { GridBackground } from "@/components/reusable-ui/grid-background";
import { auth } from "@/auth";
import { localizePath, pickLocale } from "@/i18n/routing";
import { redirect } from "next/navigation";
import React from "react";

export default async function page({
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
    <GridBackground>
      <div className="px-4">
        <ForgotPasswordForm />
      </div>
    </GridBackground>
  );
}
