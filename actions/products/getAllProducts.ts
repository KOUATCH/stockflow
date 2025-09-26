"use server";
import { db } from "@/prisma/db";
import { Resend } from "resend";

// import { generateNumericToken } from "@/lib/token";
const resend = new Resend(process.env.RESEND_API_KEY);
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;


export async function getAllUnits() {
  try {
    const units = await db.unit.findMany({
      orderBy: {
        createdAt: "desc",
      },
      
    });
    return units;
  } catch (error) {
    console.error("Error fetching the count:", error);
    return 0;
  }
}
