"use server";
import { db } from "@/prisma/db";
import { InvitedUserProps } from "@/types/types";
import { hashPassword } from "@/lib/argon2-server";
// import { Resend } from "resend";

// // import { generateNumericToken } from "@/lib/token";
// const resend = new Resend(process.env.RESEND_API_KEY);
// // const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;



export async function createInvitedUser(data: InvitedUserProps) {
  const { email, password, firstName, lastName, name, phone, image, organizationId, roleId,organizationName } = data;

  try {
    // Use a transaction for atomic operations
    return await db.$transaction(async (tx) => {
     
      // Hash password
      const hashedPassword = await hashPassword(password);

      // Invited User registers with role
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          organizationId:organizationId,
          organizationName:organizationName,
          name,
          phone,
          isVerified:true,  
          image,
          roles: {
            connect: {
              id:roleId,
            },
          },
        },
        include: {
          roles: true, // Include roles in the response
        },
      });
      
     await tx.invite.update({
        where:{email,status:false},
        data: {status:true}
      })
      
console.log({data})
      return {
        error: null,
        status: 200,
        data: {id:newUser?.id, email:newUser?.email},
      };
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return {
      error: `Something went wrong, Please try again`,
      status: 500,
      data: null,
    };
  }
}


