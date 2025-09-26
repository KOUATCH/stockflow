import { authOptions } from "@/config/auth"
import { checkPermission } from "@/config/useAuth"
import type { Session } from "next-auth"
import { getServerSession } from "next-auth/next"; // Updated import path
import { redirect } from "next/navigation"
// import { authOptions } from "@/app/api/auth/[...nextauth]/route" // Import auth options

export interface AuthResult {
  session: Session | null
  user: Session["user"] | null
  hasPermission: boolean
}

export async function validateAuth(permission: string): Promise<AuthResult> {
  try {
    // Pass authOptions to getServerSession
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      redirect("/auth/signin")
    }

    const hasPermission = await checkPermission(permission)

    if (!hasPermission) {
      redirect("/unauthorized")
    }

    return {
      session,
      user: session.user,
      hasPermission,
    }
  } catch (error) {
    console.error("Auth validation failed:", error)
    redirect("/error")
  }
}
