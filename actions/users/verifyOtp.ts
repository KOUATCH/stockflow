"use server";
import { db } from "@/prisma/db";

// import { generateNumericToken } from "@/lib/token";
// 

 const verifyOTP= async (userId:string,  otp:string)=>{
  try {
       const user= await db.user.findUnique({
      where:{
        id:userId
      }
     
    })
console.log({user})
    if(user?.token!==otp){
 return{
status:403
 }}
  await db.user.update({
  where:{
    id:userId
  },
  data:{
    isVerified:true
  }
 })
    
    return{
      status:200
    }
  } catch (error) {
     return{
status:403
 }  
  }
}
export default verifyOTP