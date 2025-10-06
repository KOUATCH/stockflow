
"use server";
import UserInvitation from "@/components/email-templates/user-invite";
import { InviteData } from "@/components/Forms/users/userInvitationForm";
import { getAuthenticatedUser } from "@/lib/auth-server";
import { db } from "@/prisma/db";
import { Resend } from "resend";

// import { generateNumericToken } from "@/lib/token";
const resend = new Resend(process.env.RESEND_API_KEY);

export const  sendInvite= async(data:InviteData) =>{
  const { email, roleId,name} = data;

  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => { 
      const  authUser= getAuthenticatedUser()
      // Check for existing users
      const existingUserByEmail = await tx.user.findUnique({
        where: { email },
      });

     console.log({authUser})

      if (existingUserByEmail) {
        return {
          error: `This email ${email} is already in use, another invitation cannot be sent`,
          status: 409,
          data: null,
        };
      }

      // if user already invited
        const existingInvite = await tx.invite.findUnique({
        where: { email },
      });
      
      
      if (existingInvite) {
        return {
          error: `This email ${email} is already invited, Another invitation cannot be sent`,
          status: 409,
          data: null,
        };
      }
  const organizationId=(await authUser).organizationId

await tx.invite.create({
  data:{
    email, organizationId
  }
})

  const baseUrl=process.env.NEXT_PUBLIC_BASE_URL
  const linkUrl=`${baseUrl}/user-invite/${(await authUser).organizationId}?roleId=${roleId}&&email=${email}&&organizationName=${(await authUser).organizationName}`
// const linkUrl=`${baseUrl}/user-invite/${organizationId}?roleId=${roleId} && email=${email}&& organizationName=${organizationName}`
console.log( {authUser})
const companyName= (await authUser).organizationName
const {data, error}= await resend.emails.send({
  // from:"PosInvent <kouatch@posinvent.com>",
  from:"onboarding@resend.dev", 
  to:email,
  subject:`Welcome to ${(await authUser).organizationName} - ${name} role`,
  react:UserInvitation({companyName,linkUrl,name})  
})
if(error){
  console.log({error})
}
console.log({data})
      return {
        error: null,
        status: 200,
        data,
        // data: {id:data?.id, email:email},
      };
    });
  } catch (error) {
    console.error("Error inviting user:", error);
    return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
  }
}