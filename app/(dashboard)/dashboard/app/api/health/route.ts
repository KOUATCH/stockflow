import { NextResponse } from "next/server"
import { checkDBHealth } from "@/lib/db-utils"

export async function GET() {
  try {
    const dbHealth = await checkDBHealth()

    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: dbHealth,
      version: "1.0.0",
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
