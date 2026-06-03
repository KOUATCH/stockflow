import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { generateSampleSalesData } from "@/actions/analytics/sample-data-generator"

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const organizationId = session.user.organizationId
    const body = await request.json()

    const config = {
      organizationId,
      locationId: body.locationId,
      numberOfDays: body.numberOfDays || 7,
      salesPerDay: body.salesPerDay || 10,
      itemsPerSale: body.itemsPerSale || 3
    }

    console.log("🚀 Starting sample data generation with config:", config)

    const result = await generateSampleSalesData(config)

    return NextResponse.json({
      success: true,
      message: "Sample data generated successfully",
      data: result.data
    })

  } catch (error) {
    console.error("❌ Sample data generation failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to generate sample data",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Sample data generation endpoint is available",
      usage: {
        method: "POST",
        body: {
          numberOfDays: "number (default: 7)",
          salesPerDay: "number (default: 10)",
          itemsPerSale: "number (default: 3)",
          locationId: "string (optional)"
        }
      }
    })

  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}