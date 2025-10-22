import { AuthLayout, EnhancedLoginForm } from "@/components/auth";
import { auth } from "../../../auth";
import { redirect } from "next/navigation";

export default async function page() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <AuthLayout variant="login">
      <EnhancedLoginForm />
    </AuthLayout>
  );
}
