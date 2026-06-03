import { type NextRequest, NextResponse } from "next/server"
import { getAvailableProducts } from "@/actions/items/itemActions"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get("active") === "true"

    const items = await getAvailableProducts(activeOnly)

    return NextResponse.json({
      success: true,
      items: items,
      total: items.length,
      page: 1,
      totalPages: 1
    })
  } catch (error) {
    console.error("API Error:", error)
    return NextResponse.json({
      error: "Internal server error",
      success: false,
      items: [],
      total: 0
    }, { status: 500 })
  }
}

// POST method removed - use server actions instead
// Use @/actions/items/itemActions for mutations
