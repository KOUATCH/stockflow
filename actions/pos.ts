"use server";

import { revalidatePath } from "next/cache";
import {
  CashDrawerTransactionType,
  PaymentMethod,
  PaymentStatus,
  POSSessionStatus,
  Prisma,
  SalesOrderStatus,
} from "@prisma/client";

import { db } from "@/prisma/db";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

const userSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
} satisfies Prisma.UserSelect;

function toNumber(value: Prisma.Decimal | number | null | undefined): number {
  if (value == null) {
    return 0;
  }

  return typeof value === "number" ? value : value.toNumber();
}

function displayName(user?: {
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
}) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();
  return name || user?.email || "";
}

function mapUser<T extends { firstName?: string | null; lastName?: string | null; email?: string | null }>(
  user: T,
) {
  return {
    ...user,
    name: displayName(user),
  };
}

function mapSession(session: any) {
  return {
    ...session,
    stationId: session.terminalId,
    initialCash: toNumber(session.openingBalance),
    currentCash: toNumber(session.openingBalance) + toNumber(session.cashTotal),
    finalCash: toNumber(session.closingBalance),
    openingBalance: toNumber(session.openingBalance),
    closingBalance: session.closingBalance == null ? null : toNumber(session.closingBalance),
    expectedBalance: session.expectedBalance == null ? null : toNumber(session.expectedBalance),
    variance: session.variance == null ? null : toNumber(session.variance),
    totalSales: toNumber(session.totalSales),
    totalTax: toNumber(session.totalTax),
    totalDiscount: toNumber(session.totalDiscount),
    cashTotal: toNumber(session.cashTotal),
    cardTotal: toNumber(session.cardTotal),
    digitalTotal: toNumber(session.mobileMoneyTotal) + toNumber(session.bankTransferTotal),
    mobileMoneyTotal: toNumber(session.mobileMoneyTotal),
    bankTransferTotal: toNumber(session.bankTransferTotal),
    creditTotal: toNumber(session.creditTotal),
    user: session.user ? mapUser(session.user) : session.user,
    terminal: session.terminal
      ? {
          ...session.terminal,
          stationNumber: session.terminal.terminalNumber,
        }
      : session.terminal,
    transactions: (session.salesOrders ?? []).map((order: any) => ({
      ...order,
      total: toNumber(order.total),
      items: order.lines ?? [],
    })),
  };
}

function mapTerminal(terminal: any) {
  return {
    ...terminal,
    stationNumber: terminal.terminalNumber,
    status: terminal.isActive ? "ACTIVE" : "INACTIVE",
    currentSession: terminal.currentSession ? mapSession(terminal.currentSession) : terminal.currentSession,
  };
}

function mapPayment(payment: any) {
  return {
    ...payment,
    amount: toNumber(payment.amount),
    cashTendered: payment.cashTendered == null ? null : toNumber(payment.cashTendered),
    changeGiven: payment.changeGiven == null ? null : toNumber(payment.changeGiven),
    refundedAmount: toNumber(payment.refundedAmount),
    paymentMethod: payment.method,
    paymentStatus: payment.status,
    processedByUser: payment.processedBy ? mapUser(payment.processedBy) : payment.processedBy,
    processedBy: payment.processedBy ? mapUser(payment.processedBy) : payment.processedBy,
  };
}

function normalizePaymentMethod(method: string): PaymentMethod {
  switch (method) {
    case "CREDIT_CARD":
    case "DEBIT_CARD":
      return PaymentMethod.CARD;
    case "DIGITAL_WALLET":
      return PaymentMethod.MOBILE_MONEY;
    case "CHECK":
      return PaymentMethod.CHEQUE;
    case "GIFT_CARD":
      return PaymentMethod.STORE_CREDIT;
    case "LAYAWAY":
      return PaymentMethod.CREDIT;
    default:
      return Object.values(PaymentMethod).includes(method as PaymentMethod)
        ? (method as PaymentMethod)
        : PaymentMethod.CASH;
  }
}

function makeSequence(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

// Legacy POS facade retained for old hooks while the canonical POS lives in actions/pos/*.actions.ts.
export async function getPOSSessions(filters?: {
  locationId?: string;
  status?: string | string[];
  startDate?: string;
  endDate?: string;
  dateFrom?: string;
  dateTo?: string;
}): Promise<ActionResult<unknown[]>> {
  try {
    const where: Prisma.POSSessionWhereInput = {};

    if (filters?.locationId) {
      where.locationId = filters.locationId;
    }

    if (filters?.status) {
      const statuses = Array.isArray(filters.status) ? filters.status : [filters.status];
      where.status = { in: statuses as POSSessionStatus[] };
    }

    const from = filters?.startDate ?? filters?.dateFrom;
    const to = filters?.endDate ?? filters?.dateTo;
    if (from || to) {
      where.createdAt = {};
      if (from) {
        where.createdAt.gte = new Date(from);
      }
      if (to) {
        where.createdAt.lte = new Date(to);
      }
    }

    const sessions = await db.pOSSession.findMany({
      where,
      include: {
        location: true,
        terminal: true,
        user: { select: userSelect },
        salesOrders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: sessions.map(mapSession) };
  } catch (error) {
    console.error("Error fetching POS sessions:", error);
    return { success: false, error: "Failed to fetch POS sessions" };
  }
}

export async function getPOSSessionById(sessionId: string): Promise<ActionResult<unknown>> {
  try {
    const posSession = await db.pOSSession.findUnique({
      where: { id: sessionId },
      include: {
        location: true,
        terminal: true,
        user: { select: userSelect },
        salesOrders: {
          include: {
            lines: { include: { item: true } },
            payments: true,
          },
        },
        cashDrawerTransactions: {
          include: {
            cashDrawer: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!posSession) {
      return { success: false, error: "POS session not found" };
    }

    return { success: true, data: mapSession(posSession) };
  } catch (error) {
    console.error("Error fetching POS session:", error);
    return { success: false, error: "Failed to fetch POS session" };
  }
}

export async function startPOSSession(data: {
  locationId?: string;
  stationId?: string;
  terminalId?: string;
  initialCash?: number;
  openingBalance?: number;
  notes?: string;
  userId?: string;
}): Promise<ActionResult<unknown>> {
  try {
    const terminalId = data.terminalId ?? data.stationId;
    const openingBalance = data.openingBalance ?? data.initialCash ?? 0;
    const terminal = terminalId
      ? await db.pOSStation.findUnique({ where: { id: terminalId } })
      : await db.pOSStation.findFirst({
          where: {
            locationId: data.locationId,
            isActive: true,
          },
          orderBy: { createdAt: "asc" },
        });

    if (!terminal) {
      return { success: false, error: "POS terminal not found" };
    }

    if (!data.userId) {
      return { success: false, error: "User is required to start a POS session" };
    }
    const userId = data.userId;

    const activeSession = await db.pOSSession.findFirst({
      where: {
        terminalId: terminal.id,
        status: POSSessionStatus.ACTIVE,
      },
    });

    if (activeSession) {
      return { success: false, error: "There is already an active POS session for this terminal" };
    }

    const newSession = await db.$transaction(async (tx) => {
      const session = await tx.pOSSession.create({
        data: {
          sessionNumber: makeSequence("SHIFT"),
          locationId: terminal.locationId,
          terminalId: terminal.id,
          organizationId: terminal.organizationId,
          userId,
          openingBalance,
          status: POSSessionStatus.ACTIVE,
          startTime: new Date(),
          notes: data.notes,
        },
        include: {
          location: true,
          terminal: true,
          user: { select: userSelect },
          salesOrders: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              status: true,
            },
          },
        },
      });

      await tx.pOSStation.update({
        where: { id: terminal.id },
        data: { currentSessionId: session.id },
      });

      return session;
    });

    revalidatePath("/dashboard/pos");
    revalidatePath("/dashboard/pos/cash-drawer");

    return { success: true, data: mapSession(newSession) };
  } catch (error) {
    console.error("Error starting POS session:", error);
    return { success: false, error: "Failed to start POS session" };
  }
}

export async function closePOSSession(data: {
  sessionId: string;
  finalCash?: number;
  closingBalance?: number;
  notes?: string;
}): Promise<ActionResult<unknown>> {
  try {
    const closingBalance = data.closingBalance ?? data.finalCash ?? 0;
    const posSession = await db.pOSSession.findUnique({
      where: { id: data.sessionId },
      include: {
        salesOrders: {
          select: {
            total: true,
            status: true,
          },
        },
      },
    });

    if (!posSession) {
      return { success: false, error: "POS session not found" };
    }

    if (posSession.status !== POSSessionStatus.ACTIVE) {
      return { success: false, error: "POS session is not active" };
    }

    const totalSales = posSession.salesOrders
      .filter((order) => order.status === SalesOrderStatus.COMPLETED)
      .reduce((sum, order) => sum + toNumber(order.total), 0);
    const expectedBalance = toNumber(posSession.openingBalance) + toNumber(posSession.cashTotal);
    const variance = closingBalance - expectedBalance;

    const updatedSession = await db.$transaction(async (tx) => {
      const session = await tx.pOSSession.update({
        where: { id: data.sessionId },
        data: {
          status: POSSessionStatus.CLOSED,
          endTime: new Date(),
          closingBalance,
          expectedBalance,
          variance,
          totalSales,
          notes: data.notes ? `${posSession.notes || ""}\n${data.notes}`.trim() : posSession.notes,
        },
        include: {
          location: true,
          terminal: true,
          user: { select: userSelect },
          salesOrders: {
            select: {
              id: true,
              orderNumber: true,
              total: true,
              status: true,
            },
          },
        },
      });

      await tx.pOSStation.updateMany({
        where: {
          id: posSession.terminalId,
          currentSessionId: posSession.id,
        },
        data: { currentSessionId: null },
      });

      return session;
    });

    revalidatePath("/dashboard/pos");
    revalidatePath("/dashboard/pos/cash-drawer");

    return { success: true, data: mapSession(updatedSession) };
  } catch (error) {
    console.error("Error closing POS session:", error);
    return { success: false, error: "Failed to close POS session" };
  }
}

export async function getPOSTerminals(filters?: {
  locationId?: string;
  status?: string;
}): Promise<ActionResult<unknown[]>> {
  try {
    const where: Prisma.POSStationWhereInput = {};

    if (filters?.locationId) {
      where.locationId = filters.locationId;
    }

    if (filters?.status) {
      where.isActive = filters.status === "ACTIVE";
    }

    const terminals = await db.pOSStation.findMany({
      where,
      include: {
        location: true,
        currentSession: {
          include: {
            location: true,
            terminal: true,
            user: { select: userSelect },
            salesOrders: {
              select: {
                id: true,
                orderNumber: true,
                total: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return { success: true, data: terminals.map(mapTerminal) };
  } catch (error) {
    console.error("Error fetching POS terminals:", error);
    return { success: false, error: "Failed to fetch POS terminals" };
  }
}

export async function getPOSTerminalById(terminalId: string): Promise<ActionResult<unknown>> {
  try {
    const terminal = await db.pOSStation.findUnique({
      where: { id: terminalId },
      include: {
        location: true,
        currentSession: {
          include: {
            location: true,
            terminal: true,
            user: { select: userSelect },
            salesOrders: {
              select: {
                id: true,
                orderNumber: true,
                total: true,
                status: true,
              },
            },
          },
        },
      },
    });

    if (!terminal) {
      return { success: false, error: "POS terminal not found" };
    }

    return { success: true, data: mapTerminal(terminal) };
  } catch (error) {
    console.error("Error fetching POS terminal:", error);
    return { success: false, error: "Failed to fetch POS terminal" };
  }
}

export async function getCashDrawer(locationId: string): Promise<ActionResult<unknown>> {
  try {
    const activeSession = await db.pOSSession.findFirst({
      where: {
        locationId,
        status: POSSessionStatus.ACTIVE,
      },
      include: {
        location: true,
        terminal: true,
        user: { select: userSelect },
        salesOrders: {
          select: {
            id: true,
            orderNumber: true,
            total: true,
            status: true,
          },
        },
      },
      orderBy: { startTime: "desc" },
    });

    return { success: true, data: activeSession ? mapSession(activeSession) : null };
  } catch (error) {
    console.error("Error fetching cash drawer:", error);
    return { success: false, error: "Failed to fetch cash drawer information" };
  }
}

export async function processCashDrawerOperation(data: {
  sessionId?: string;
  type: CashDrawerTransactionType | "CASH_IN" | "CASH_OUT";
  amount: number;
  reason?: string;
  notes?: string;
  userId?: string;
}): Promise<ActionResult<unknown>> {
  try {
    if (!data.sessionId) {
      return { success: false, error: "POS session is required" };
    }

    if (!data.userId) {
      return { success: false, error: "User is required for cash drawer operations" };
    }
    const sessionId = data.sessionId;
    const userId = data.userId;

    const posSession = await db.pOSSession.findUnique({
      where: { id: sessionId },
    });

    if (!posSession) {
      return { success: false, error: "POS session not found" };
    }

    if (posSession.status !== POSSessionStatus.ACTIVE) {
      return { success: false, error: "POS session is not active" };
    }

    const cashDrawer = await db.cashDrawer.findFirst({
      where: {
        terminalId: posSession.terminalId,
        isOpen: true,
      },
      orderBy: { createdAt: "desc" },
    });

    if (!cashDrawer) {
      return { success: false, error: "No open cash drawer found for this POS session" };
    }

    const balanceBefore = toNumber(cashDrawer.currentBalance);
    const isAddition = data.type === CashDrawerTransactionType.CASH_IN;
    const balanceAfter = isAddition ? balanceBefore + data.amount : balanceBefore - data.amount;

    const transaction = await db.$transaction(async (tx) => {
      await tx.cashDrawer.update({
        where: { id: cashDrawer.id },
        data: {
          currentBalance: balanceAfter,
          expectedBalance: balanceAfter,
        },
      });

      return tx.cashDrawerTransaction.create({
        data: {
          sessionId,
          cashDrawerId: cashDrawer.id,
          type: isAddition ? CashDrawerTransactionType.CASH_IN : CashDrawerTransactionType.CASH_OUT,
          amount: data.amount,
          reason: data.reason,
          notes: data.notes,
          userId,
          balanceBefore,
          balanceAfter,
        },
        include: {
          cashDrawer: true,
          user: { select: userSelect },
        },
      });
    });

    revalidatePath("/dashboard/pos/cash-drawer");

    return {
      success: true,
      data: {
        ...transaction,
        amount: toNumber(transaction.amount),
        balanceBefore: toNumber(transaction.balanceBefore),
        balanceAfter: toNumber(transaction.balanceAfter),
        user: mapUser(transaction.user),
      },
    };
  } catch (error) {
    console.error("Error processing cash drawer operation:", error);
    return { success: false, error: "Failed to process cash drawer operation" };
  }
}

export async function processPayment(data: {
  salesOrderId: string;
  amount: number;
  paymentMethod: string;
  notes?: string;
  userId?: string;
}): Promise<ActionResult<unknown>> {
  try {
    const salesOrder = await db.salesOrder.findUnique({
      where: { id: data.salesOrderId },
      select: { id: true, organizationId: true },
    });

    if (!salesOrder) {
      return { success: false, error: "Sales order not found" };
    }

    const payment = await db.payment.create({
      data: {
        paymentNumber: makeSequence("PAY"),
        organizationId: salesOrder.organizationId,
        salesOrderId: data.salesOrderId,
        amount: data.amount,
        method: normalizePaymentMethod(data.paymentMethod),
        notes: data.notes,
        processedById: data.userId,
        processedAt: new Date(),
        status: PaymentStatus.PAID,
      },
      include: {
        processedBy: { select: userSelect },
      },
    });

    revalidatePath("/dashboard/pos");

    return { success: true, data: mapPayment(payment) };
  } catch (error) {
    console.error("Error processing payment:", error);
    return { success: false, error: "Failed to process payment" };
  }
}

export async function getPayments(salesOrderId: string): Promise<ActionResult<unknown[]>> {
  try {
    const payments = await db.payment.findMany({
      where: { salesOrderId },
      include: {
        processedBy: { select: userSelect },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: payments.map(mapPayment) };
  } catch (error) {
    console.error("Error fetching payments:", error);
    return { success: false, error: "Failed to fetch payments" };
  }
}

export async function getPOSSummary(
  organizationId: string,
  locationId?: string,
): Promise<ActionResult<Record<string, unknown>>> {
  try {
    const sessionWhere: Prisma.POSSessionWhereInput = {
      organizationId,
      ...(locationId ? { locationId } : {}),
    };
    const orderWhere: Prisma.SalesOrderWhereInput = {
      organizationId,
      ...(locationId ? { locationId } : {}),
    };

    const activeSessions = await db.pOSSession.count({
      where: {
        ...sessionWhere,
        status: POSSessionStatus.ACTIVE,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayOrders = await db.salesOrder.findMany({
      where: {
        ...orderWhere,
        orderDate: {
          gte: today,
          lt: tomorrow,
        },
        status: SalesOrderStatus.COMPLETED,
      },
      select: {
        id: true,
        total: true,
      },
    });

    const totalSalesToday = todayOrders.reduce((sum, order) => sum + toNumber(order.total), 0);
    const transactionsToday = todayOrders.length;
    const averageTransactionValue = transactionsToday > 0 ? totalSalesToday / transactionsToday : 0;

    const openDrawers = await db.cashDrawer.findMany({
      where: {
        isOpen: true,
        location: {
          organizationId,
        },
        ...(locationId ? { locationId } : {}),
      },
      select: {
        currentBalance: true,
      },
    });
    const cashInDrawer = openDrawers.reduce((sum, drawer) => sum + toNumber(drawer.currentBalance), 0);

    return {
      success: true,
      data: {
        activeSessions,
        totalSalesToday,
        transactionsToday,
        averageTransactionValue,
        cashInDrawer,
        topSellingItems: [],
        paymentMethodBreakdown: {
          cash: 0,
          card: 0,
          digital: 0,
          other: 0,
        },
        hourlyStats: [],
      },
    };
  } catch (error) {
    console.error("Error fetching POS summary:", error);
    return { success: false, error: "Failed to fetch POS summary" };
  }
}

export async function generateDailyReport(
  locationId: string,
  date: string,
  userId?: string,
): Promise<ActionResult<unknown>> {
  try {
    const location = await db.location.findUnique({
      where: { id: locationId },
      select: { organizationId: true },
    });

    if (!location) {
      return { success: false, error: "Location not found" };
    }

    const reportDate = new Date(date);
    reportDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(reportDate);
    nextDay.setDate(nextDay.getDate() + 1);

    const completedOrders = await db.salesOrder.findMany({
      where: {
        locationId,
        organizationId: location.organizationId,
        status: SalesOrderStatus.COMPLETED,
        orderDate: {
          gte: reportDate,
          lt: nextDay,
        },
      },
      select: {
        total: true,
        lines: {
          select: {
            quantity: true,
            lineTotal: true,
          },
        },
        payments: {
          select: {
            method: true,
            amount: true,
          },
        },
      },
    });

    const totalRevenue = completedOrders.reduce((sum, order) => sum + toNumber(order.total), 0);
    const totalQuantitySold = completedOrders.reduce(
      (sum, order) => sum + order.lines.reduce((lineSum, line) => lineSum + toNumber(line.quantity), 0),
      0,
    );
    const itemsSold = completedOrders.reduce((sum, order) => sum + order.lines.length, 0);
    const totalTransactions = completedOrders.length;
    const averageTransactionValue = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const paymentTotal = (method: PaymentMethod) =>
      completedOrders.reduce(
        (sum, order) =>
          sum +
          order.payments
            .filter((payment) => payment.method === method)
            .reduce((paymentSum, payment) => paymentSum + toNumber(payment.amount), 0),
        0,
      );
    const cashSales = paymentTotal(PaymentMethod.CASH);
    const cardSales = paymentTotal(PaymentMethod.CARD);
    const mobileMoneySales = paymentTotal(PaymentMethod.MOBILE_MONEY);
    const bankTransferSales = paymentTotal(PaymentMethod.BANK_TRANSFER);
    const creditSales = paymentTotal(PaymentMethod.CREDIT);

    const report = await db.dailySalesReport.upsert({
      where: {
        date_locationId_organizationId: {
          date: reportDate,
          locationId,
          organizationId: location.organizationId,
        },
      },
      create: {
        date: reportDate,
        locationId,
        organizationId: location.organizationId,
        totalRevenue,
        totalCost: 0,
        grossProfit: totalRevenue,
        grossMargin: totalRevenue > 0 ? 100 : 0,
        totalQuantitySold,
        totalTransactions,
        averageTransactionValue,
        itemsSold,
        cashSales,
        cardSales,
        mobileMoneySales,
        bankTransferSales,
        creditSales,
        totalExpenses: 0,
        netProfit: totalRevenue,
        openingBalance: 0,
        closingBalance: 0,
        cashIn: 0,
        cashOut: 0,
        variance: 0,
        reportGeneratedById: userId,
      },
      update: {
        totalRevenue,
        grossProfit: totalRevenue,
        grossMargin: totalRevenue > 0 ? 100 : 0,
        totalQuantitySold,
        totalTransactions,
        averageTransactionValue,
        itemsSold,
        cashSales,
        cardSales,
        mobileMoneySales,
        bankTransferSales,
        creditSales,
        netProfit: totalRevenue,
        reportGeneratedAt: new Date(),
        reportGeneratedById: userId,
      },
    });

    revalidatePath("/dashboard/pos/reports");

    return { success: true, data: report };
  } catch (error) {
    console.error("Error generating daily report:", error);
    return { success: false, error: "Failed to generate daily report" };
  }
}

export async function getDailyReports(
  organizationId: string,
  locationId?: string,
  dateFrom?: string,
  dateTo?: string,
): Promise<ActionResult<unknown[]>> {
  try {
    const where: Prisma.DailySalesReportWhereInput = {
      organizationId,
      ...(locationId ? { locationId } : {}),
    };

    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) {
        where.date.gte = new Date(dateFrom);
      }
      if (dateTo) {
        where.date.lte = new Date(dateTo);
      }
    }

    const reports = await db.dailySalesReport.findMany({
      where,
      include: {
        location: true,
        reportGeneratedBy: { select: userSelect },
      },
      orderBy: { date: "desc" },
    });

    return {
      success: true,
      data: reports.map((report) => ({
        ...report,
        totalSales: toNumber(report.totalRevenue),
        totalRevenue: toNumber(report.totalRevenue),
        totalTax: 0,
        totalDiscount: 0,
        netSales: toNumber(report.totalRevenue),
        transactionCount: report.totalTransactions,
        cashSales: toNumber(report.cashSales),
        cardSales: toNumber(report.cardSales),
        digitalSales: toNumber(report.mobileMoneySales) + toNumber(report.bankTransferSales),
        otherSales: toNumber(report.creditSales),
        totalReturns: 0,
        totalRefunds: 0,
        costOfGoodsSold: toNumber(report.totalCost),
        grossProfit: toNumber(report.grossProfit),
        grossMargin: toNumber(report.grossMargin),
        generatedAt: report.reportGeneratedAt,
        generatedById: report.reportGeneratedById,
        generatedBy: report.reportGeneratedBy ? mapUser(report.reportGeneratedBy) : null,
      })),
    };
  } catch (error) {
    console.error("Error fetching daily reports:", error);
    return { success: false, error: "Failed to fetch daily reports" };
  }
}
