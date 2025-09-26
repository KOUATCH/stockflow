"use server"
import { useSession } from "next-auth/react"

const getUserOrgID=async()=>{

  const { data: session } =await  useSession()
  const user = session?.user
  const orgId = user?.organizationId || ""
  return orgId
}
export default getUserOrgID