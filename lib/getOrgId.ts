import { getAuthenticatedUser } from "@/config/useAuth";

export const getOrganizationId=async()=>{

  const user= await getAuthenticatedUser()
  const userOrgId= user.organizationId
  return userOrgId
}