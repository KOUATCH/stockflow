"use server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { authAction } from "@/lib/error-handling"

export default authAction(async function getUserOrgID() {
  const session = await auth.api.getSession({
    headers: headers()
  })

  if (!session?.user) {
    throw new Error("User not authenticated")
  }

  const orgId = session.user.organizationId || ""

  if (!orgId) {
    throw new Error("User organization not found")
  }

  return orgId
})