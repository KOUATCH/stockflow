import { auth } from "@/auth"
import { createManagedLocation } from "@/actions/locations/location-management-actions"
import { db } from "@/prisma/db"
import { Prisma } from "@prisma/client"

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

jest.mock("@/auth", () => ({
  auth: jest.fn(),
}))

jest.mock("@/prisma/db", () => ({
  db: {
    $transaction: jest.fn(),
    user: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    organization: {
      findFirst: jest.fn(),
    },
    location: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
    },
    inventoryLevel: {
      groupBy: jest.fn(),
    },
    pOSSession: {
      groupBy: jest.fn(),
    },
  },
}))

const mockAuth = auth as jest.Mock
const mockDb = db as jest.Mocked<typeof db>

function mockAuthenticatedUser(organizationId = "org-1") {
  mockAuth.mockResolvedValue({
    user: {
      id: "user-1",
      organizationId,
      permissions: [],
    },
  })
}

function mockDatabaseUser(organizationId = "org-1") {
  ;(mockDb.user.findFirst as jest.Mock).mockResolvedValue({
    organizationId,
    roles: [],
  })
}

function mockActiveOrganization(id = "org-1") {
  ;(mockDb.organization.findFirst as jest.Mock).mockResolvedValue({ id })
}

describe("location-management-actions", () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    jest.clearAllMocks()
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {})
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  describe("createManagedLocation", () => {
    it("returns a clear error and skips insert when the organization no longer exists", async () => {
      mockAuthenticatedUser()
      mockDatabaseUser()
      ;(mockDb.organization.findFirst as jest.Mock).mockResolvedValue(null)

      const result = await createManagedLocation("org-1", { name: "Main Warehouse" })

      expect(result).toEqual({
        success: false,
        error: "Organization not found or inactive",
      })
      expect(mockDb.$transaction).not.toHaveBeenCalled()
    })

    it("uses the verified organization id for create and reload", async () => {
      const createdLocation = { id: "location-1" }
      const locationRow = {
        id: "location-1",
        name: "Main Warehouse",
        code: "MAIN-WAREHOUSE",
        type: "WAREHOUSE",
        address: null,
        phone: null,
        email: null,
        isActive: true,
        isDefault: false,
        allowNegativeStock: false,
        requiresApproval: false,
        organizationId: "org-1",
        managerId: null,
        createdAt: new Date("2026-01-01T00:00:00.000Z"),
        updatedAt: new Date("2026-01-01T00:00:00.000Z"),
        manager: null,
        organization: { name: "Acme" },
        _count: {
          inventoryLevels: 0,
          inventoryTransactions: 0,
          posTerminals: 0,
          cashDrawers: 0,
          posSessions: 0,
          salesOrders: 0,
          purchaseOrders: 0,
          stockAdjustments: 0,
          stockTransfersFrom: 0,
          stockTransfersTo: 0,
          goodsReceipts: 0,
          productionBatches: 0,
          serialNumbers: 0,
        },
      }
      const updateMany = jest.fn().mockResolvedValue({ count: 0 })
      const create = jest.fn().mockResolvedValue(createdLocation)

      mockAuthenticatedUser()
      mockDatabaseUser()
      mockActiveOrganization()
      ;(mockDb.location.findFirst as jest.Mock).mockResolvedValue(null)
      ;(mockDb.location.findMany as jest.Mock).mockResolvedValue([locationRow])
      ;(mockDb.user.findMany as jest.Mock).mockResolvedValue([])
      ;(mockDb.inventoryLevel.groupBy as jest.Mock).mockResolvedValue([])
      ;(mockDb.pOSSession.groupBy as jest.Mock).mockResolvedValue([])
      ;(mockDb.$transaction as jest.Mock).mockImplementation(async (callback) =>
        callback({
          location: {
            updateMany,
            create,
          },
        })
      )

      const result = await createManagedLocation(" org-1 ", { name: "Main Warehouse" })

      expect(result.success).toBe(true)
      expect(create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            organizationId: "org-1",
          }),
        })
      )
      expect(mockDb.location.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            organizationId: "org-1",
          }),
        })
      )
    })

    it("does not query the organization or insert when the user cannot access the requested organization", async () => {
      mockAuthenticatedUser("org-1")
      mockDatabaseUser("org-1")

      const result = await createManagedLocation("org-2", { name: "Branch Store" })

      expect(result).toEqual({
        success: false,
        error: "You do not have access to this organization",
      })
      expect(mockDb.organization.findFirst).not.toHaveBeenCalled()
      expect(mockDb.$transaction).not.toHaveBeenCalled()
    })

    it("maps location organization foreign-key failures to an actionable message", async () => {
      mockAuthenticatedUser()
      mockDatabaseUser()
      mockActiveOrganization()
      ;(mockDb.location.findFirst as jest.Mock).mockResolvedValue(null)
      ;(mockDb.$transaction as jest.Mock).mockRejectedValue(
        new Prisma.PrismaClientKnownRequestError("Foreign key constraint failed", {
          code: "P2003",
          clientVersion: "6.19.3",
          meta: { field_name: "locations_organizationId_fkey" },
        })
      )

      const result = await createManagedLocation("org-1", { name: "Main Warehouse" })

      expect(result).toEqual({
        success: false,
        error: "Organization not found or inactive",
      })
    })
  })
})
