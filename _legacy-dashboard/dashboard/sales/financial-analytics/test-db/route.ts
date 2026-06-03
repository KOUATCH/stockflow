import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { db } from "@/prisma/db"

export async function GET(request: NextRequest) {
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

    console.log("🧪 Testing database connection for organization:", organizationId)

    // Test database connection and basic queries
    const tests = await Promise.allSettled([
      // Test 1: Organization exists
      db.organization.findUnique({
        where: { id: organizationId },
        select: { id: true, name: true }
      }),

      // Test 2: Sales orders count
      db.salesOrder.count({
        where: { organizationId }
      }),

      // Test 3: Items count
      db.item.count({
        where: { organizationId, isActive: true }
      }),

      // Test 4: Inventory levels count
      db.inventoryLevel.count({
        where: {
          item: { organizationId }
        }
      }),

      // Test 5: Recent sales sample
      db.salesOrder.findFirst({
        where: {
          organizationId,
          status: { notIn: ["CANCELLED", "DRAFT"] }
        },
        include: {
          lines: {
            take: 1,
            include: {
              item: {
                select: {
                  id: true,
                  name: true,
                  sku: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: "desc" }
      })
    ])

    const results = {
      timestamp: new Date().toISOString(),
      organizationId,
      tests: {
        organization: tests[0].status === "fulfilled" ? tests[0].value : null,
        salesOrdersCount: tests[1].status === "fulfilled" ? tests[1].value : 0,
        itemsCount: tests[2].status === "fulfilled" ? tests[2].value : 0,
        inventoryLevelsCount: tests[3].status === "fulfilled" ? tests[3].value : 0,
        recentSaleSample: tests[4].status === "fulfilled" ? tests[4].value : null
      },
      errors: tests.map((result, index) => ({
        testIndex: index,
        error: result.status === "rejected" ? result.reason?.message : null
      })).filter(t => t.error !== null)
    }

    console.log("✅ Database connection test results:", results)

    return NextResponse.json({
      success: true,
      message: "Database connection test completed",
      data: results
    })

  } catch (error) {
    console.error("❌ Database connection test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Database connection test failed",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}