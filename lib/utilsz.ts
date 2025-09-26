import { Prisma } from "@prisma/client"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Placeholder for buildSearchFilter function
// This function needs to be implemented based on your specific search logic
export function buildSearchFilter(searchQuery: string): Prisma.PurchaseOrderWhereInput[] {
  // Example: Search by poNumber or notes
  return [
    { poNumber: { contains: searchQuery, mode: "insensitive" } },
    { notes: { contains: searchQuery, mode: "insensitive" } },
    // Add other fields you want to search here
    { supplier: { name: { contains: searchQuery, mode: "insensitive" } } },
    { lines: { some: { item: { name: { contains: searchQuery, mode: "insensitive" } } } } },
  ]
}