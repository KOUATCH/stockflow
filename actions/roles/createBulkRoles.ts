import { RoleProps } from "@/types/types";
import createRole from "./createRole";


const createBulkRoles=async(roles: RoleProps[])=> {
  try {
    for (const role of roles) {
      await createRole(role);
    }
     return {
        error: null,
        status: 200,
        data: roles,
      };
  } catch (error) {
    console.log(error);
  }
}
export default createBulkRoles