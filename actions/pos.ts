"use server";

import { db } from "@/prisma/db";
import { revalidatePath } from "next/cache";

// Get POS sessions
export async function getPOSSessions(filters?: {
  locationId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}) {
  try {

    const whereClause: any = {};

    if (filters?.locationId) {
      whereClause.locationId = filters.locationId;
    }

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    if (filters?.startDate || filters?.endDate) {
      whereClause.createdAt = {};
      if (filters.startDate) {
        whereClause.createdAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.createdAt.lte = new Date(filters.endDate);
      }
    }

    const sessions = await db.posSession.findMany({
      where: whereClause,
      include: {
        location: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        transactions: {
          select: {
            id: true,
            total: true,
            status: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return {
      success: true,
      data: sessions,
    };
  } catch (error) {
    console.error("Error fetching POS sessions:", error);
    return {
      success: false,
      error: "Failed to fetch POS sessions",
    };
  }
}

// Get POS session by ID
export async function getPOSSessionById(sessionId: string) {
  try {

    const posSession = await db.posSession.findUnique({
      where: { id: sessionId },
      include: {
        location: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        transactions: {
          include: {
            items: {
              include: {
                item: true,
              }
            },
            payments: true,
          }
        }
      }
    });

    if (!posSession) {
      return {
        success: false,
        error: "POS session not found",
      };
    }

    return {
      success: true,
      data: posSession,
    };
  } catch (error) {
    console.error("Error fetching POS session:", error);
    return {
      success: false,
      error: "Failed to fetch POS session",
    };
  }
}

// Start POS session
export async function startPOSSession(data: {
  locationId: string;
  initialCash: number;
  notes?: string;
  userId: string;
}) {
  try {

    // Check if there's already an active session for this location
    const activeSession = await db.posSession.findFirst({
      where: {
        locationId: data.locationId,
        status: "ACTIVE",
      }
    });

    if (activeSession) {
      return {
        success: false,
        error: "There is already an active POS session for this location",
      };
    }

    const newSession = await db.posSession.create({
      data: {
        locationId: data.locationId,
        userId: data.userId,
        initialCash: data.initialCash,
        currentCash: data.initialCash,
        status: "ACTIVE",
        startTime: new Date(),
        notes: data.notes,
      },
      include: {
        location: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    revalidatePath("/dashboard/pos");

    return {
      success: true,
      data: newSession,
    };
  } catch (error) {
    console.error("Error starting POS session:", error);
    return {
      success: false,
      error: "Failed to start POS session",
    };
  }
}

// Close POS session
export async function closePOSSession(data: {
  sessionId: string;
  finalCash: number;
  notes?: string;
}) {
  try {

    const posSession = await db.posSession.findUnique({
      where: { id: data.sessionId },
      include: {
        transactions: {
          select: {
            total: true,
            status: true,
          }
        }
      }
    });

    if (!posSession) {
      return {
        success: false,
        error: "POS session not found",
      };
    }

    if (posSession.status !== "ACTIVE") {
      return {
        success: false,
        error: "POS session is not active",
      };
    }

    // Calculate totals
    const totalSales = posSession.transactions
      .filter(t => t.status === "COMPLETED")
      .reduce((sum, t) => sum + t.total, 0);

    const expectedCash = posSession.initialCash + totalSales;
    const cashDifference = data.finalCash - expectedCash;

    const updatedSession = await db.posSession.update({
      where: { id: data.sessionId },
      data: {
        status: "CLOSED",
        endTime: new Date(),
        finalCash: data.finalCash,
        totalSales,
        cashDifference,
        notes: data.notes ? `${posSession.notes || ""}\n${data.notes}` : posSession.notes,
      },
      include: {
        location: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    revalidatePath("/dashboard/pos");

    return {
      success: true,
      data: updatedSession,
    };
  } catch (error) {
    console.error("Error closing POS session:", error);
    return {
      success: false,
      error: "Failed to close POS session",
    };
  }
}

// Get POS terminals
export async function getPOSTerminals(filters?: {
  locationId?: string;
  status?: string;
}) {
  try {

    const whereClause: any = {};

    if (filters?.locationId) {
      whereClause.locationId = filters.locationId;
    }

    if (filters?.status) {
      whereClause.status = filters.status;
    }

    const terminals = await db.posTerminal.findMany({
      where: whereClause,
      include: {
        location: true,
        currentSession: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        }
      },
      orderBy: { name: "asc" }
    });

    return {
      success: true,
      data: terminals,
    };
  } catch (error) {
    console.error("Error fetching POS terminals:", error);
    return {
      success: false,
      error: "Failed to fetch POS terminals",
    };
  }
}

// Get POS terminal by ID
export async function getPOSTerminalById(terminalId: string) {
  try {

    const terminal = await db.posTerminal.findUnique({
      where: { id: terminalId },
      include: {
        location: true,
        currentSession: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            },
            transactions: {
              select: {
                id: true,
                total: true,
                status: true,
              }
            }
          }
        }
      }
    });

    if (!terminal) {
      return {
        success: false,
        error: "POS terminal not found",
      };
    }

    return {
      success: true,
      data: terminal,
    };
  } catch (error) {
    console.error("Error fetching POS terminal:", error);
    return {
      success: false,
      error: "Failed to fetch POS terminal",
    };
  }
}

// Cash drawer operations
export async function getCashDrawer(locationId: string) {
  try {

    const activeSession = await db.posSession.findFirst({
      where: {
        locationId,
        status: "ACTIVE",
      },
      include: {
        location: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    });

    return {
      success: true,
      data: activeSession,
    };
  } catch (error) {
    console.error("Error fetching cash drawer:", error);
    return {
      success: false,
      error: "Failed to fetch cash drawer information",
    };
  }
}

// Process cash drawer operation
export async function processCashDrawerOperation(data: {
  sessionId: string;
  type: "CASH_IN" | "CASH_OUT";
  amount: number;
  reason: string;
  notes?: string;
  userId: string;
}) {
  try {

    const posSession = await db.posSession.findUnique({
      where: { id: data.sessionId }
    });

    if (!posSession) {
      return {
        success: false,
        error: "POS session not found",
      };
    }

    if (posSession.status !== "ACTIVE") {
      return {
        success: false,
        error: "POS session is not active",
      };
    }

    // Create cash drawer transaction
    const transaction = await db.cashDrawerTransaction.create({
      data: {
        sessionId: data.sessionId,
        type: data.type,
        amount: data.amount,
        reason: data.reason,
        notes: data.notes,
        performedBy: data.userId,
      }
    });

    // Update session cash amount
    const newCashAmount = data.type === "CASH_IN"
      ? posSession.currentCash + data.amount
      : posSession.currentCash - data.amount;

    await db.posSession.update({
      where: { id: data.sessionId },
      data: {
        currentCash: newCashAmount,
      }
    });

    revalidatePath("/dashboard/pos/cash-drawer");

    return {
      success: true,
      data: transaction,
    };
  } catch (error) {
    console.error("Error processing cash drawer operation:", error);
    return {
      success: false,
      error: "Failed to process cash drawer operation",
    };
  }
}

// Process payment
export async function processPayment(data: {
  salesOrderId: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  userId: string;
}) {
  try {

    const payment = await db.payment.create({
      data: {
        salesOrderId: data.salesOrderId,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        processedBy: data.userId,
        status: "COMPLETED",
      }
    });

    revalidatePath("/dashboard/pos");

    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    console.error("Error processing payment:", error);
    return {
      success: false,
      error: "Failed to process payment",
    };
  }
}

// Get payments for a sales order
export async function getPayments(salesOrderId: string) {
  try {

    const payments = await db.payment.findMany({
      where: { salesOrderId },
      include: {
        processedByUser: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return {
      success: true,
      data: payments,
    };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return {
      success: false,
      error: "Failed to fetch payments",
    };
  }
}

// Get POS summary
export async function getPOSSummary(organizationId: string, locationId?: string) {
  try {

    const whereClause: any = {
      location: {
        organizationId: organizationId
      }
    };

    if (locationId) {
      whereClause.locationId = locationId;
    }

    // Get active sessions
    const activeSessions = await db.posSession.count({
      where: {
        ...whereClause,
        status: "ACTIVE"
      }
    });

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Get today's transactions
    const todayTransactions = await db.transaction.findMany({
      where: {
        ...whereClause,
        createdAt: {
          gte: today,
          lt: tomorrow
        },
        status: "COMPLETED"
      },
      include: {
        items: {
          include: {
            item: true
          }
        }
      }
    });

    const totalSalesToday = todayTransactions.reduce((sum, t) => sum + t.total, 0);
    const transactionsToday = todayTransactions.length;
    const averageTransactionValue = transactionsToday > 0 ? totalSalesToday / transactionsToday : 0;

    // Get cash in drawer (from active sessions)
    const activeSessionsData = await db.posSession.findMany({
      where: {
        ...whereClause,
        status: "ACTIVE"
      }
    });

    const cashInDrawer = activeSessionsData.reduce((sum, session) => sum + session.currentCash, 0);

    return {
      success: true,
      data: {
        activeSessions,
        totalSalesToday,
        transactionsToday,
        averageTransactionValue,
        cashInDrawer,
        topSellingItems: [], // TODO: Implement top selling items logic
        paymentMethodBreakdown: {}, // TODO: Implement payment method breakdown
        hourlyStats: [], // TODO: Implement hourly stats
      },
    };
  } catch (error) {
    console.error("Error fetching POS summary:", error);
    return {
      success: false,
      error: "Failed to fetch POS summary",
    };
  }
}

// Generate daily report
export async function generateDailyReport(locationId: string, date: string, userId: string) {
  try {

    const reportDate = new Date(date);
    const nextDay = new Date(reportDate);
    nextDay.setDate(nextDay.getDate() + 1);

    // Get sessions for the day
    const sessions = await db.posSession.findMany({
      where: {
        locationId,
        createdAt: {
          gte: reportDate,
          lt: nextDay
        }
      },
      include: {
        transactions: {
          where: { status: "COMPLETED" },
          include: {
            items: {
              include: {
                item: true
              }
            },
            payments: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    const report = {
      date: reportDate,
      locationId,
      sessions: sessions.length,
      totalSales: sessions.reduce((sum, s) => sum + (s.totalSales || 0), 0),
      totalTransactions: sessions.reduce((sum, s) => sum + s.transactions.length, 0),
      generatedAt: new Date(),
      generatedBy: userId,
    };

    // Save report to database (assuming you have a DailyReport model)
    const savedReport = await db.dailyReport.create({
      data: report
    });

    revalidatePath("/dashboard/pos/reports");

    return {
      success: true,
      data: savedReport,
    };
  } catch (error) {
    console.error("Error generating daily report:", error);
    return {
      success: false,
      error: "Failed to generate daily report",
    };
  }
}

// Get daily reports
export async function getDailyReports(
  organizationId: string,
  locationId?: string,
  dateFrom?: string,
  dateTo?: string
) {
  try {

    const whereClause: any = {
      location: {
        organizationId: organizationId
      }
    };

    if (locationId) {
      whereClause.locationId = locationId;
    }

    if (dateFrom || dateTo) {
      whereClause.date = {};
      if (dateFrom) {
        whereClause.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        whereClause.date.lte = new Date(dateTo);
      }
    }

    const reports = await db.dailyReport.findMany({
      where: whereClause,
      include: {
        location: true,
        generatedByUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: { date: "desc" }
    });

    return {
      success: true,
      data: reports,
    };
  } catch (error) {
    console.error("Error fetching daily reports:", error);
    return {
      success: false,
      error: "Failed to fetch daily reports",
    };
  }
}