"use server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const getUserOrgID = async () => {
  const session = await auth.api.getSession({
    headers: headers()
  })

  const orgId = session?.user?.organizationId || ""
  return orgId
}
export default getUserOrgID