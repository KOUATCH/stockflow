import { AuthLayout, ForgotPasswordForm } from "@/components/auth";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

export default async function page() {
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }
  return (
    <AuthLayout variant="forgot">
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
