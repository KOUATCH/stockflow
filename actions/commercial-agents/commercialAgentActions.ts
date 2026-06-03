"use server";

import { revalidatePath } from "next/cache";
import prisma from "@/prisma/db";
import {
  CommercialAgentStatus,
  AgentTransactionStatus,
  AgentTransactionType,
} from "@prisma/client";
import type {
  CreateCommercialAgentData,
  UpdateCommercialAgentData,
  CreateAgentTransactionData,
  ReconcileAgentTransactionData,
  CreateAgentSettlementData,
  CommercialAgentFilters,
  AgentTransactionFilters,
} from "@/types/commercialAgent";

// Commercial Agent CRUD Operations
export async function createCommercialAgent(
  data: CreateCommercialAgentData,
  organizationId: string
) {
  try {
    const agent = await prisma.commercialAgent.create({
      data: {
        ...data,
        organizationId,
        status: CommercialAgentStatus.ACTIVE,
      },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/commercial-agents");
    return { success: true, data: agent };
  } catch (error) {
    console.error("Error creating commercial agent:", error);
    return { success: false, error: "Failed to create commercial agent" };
  }
}

export async function updateCommercialAgent(
  id: string,
  data: UpdateCommercialAgentData,
  organizationId: string
) {
  try {
    const agent = await prisma.commercialAgent.update({
      where: { id, organizationId },
      data,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    revalidatePath("/dashboard/commercial-agents");
    return { success: true, data: agent };
  } catch (error) {
    console.error("Error updating commercial agent:", error);
    return { success: false, error: "Failed to update commercial agent" };
  }
}

export async function getCommercialAgents(
  organizationId: string,
  filters?: CommercialAgentFilters
) {
  try {
    const where: any = { organizationId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { agentCode: { contains: filters.search, mode: "insensitive" } },
        { email: { contains: filters.search, mode: "insensitive" } },
        { phone: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const agents = await prisma.commercialAgent.findMany({
      where,
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            transactions: true,
            settlements: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Calculate additional stats for each agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const stats = await prisma.agentTransaction.aggregate({
          where: {
            agentId: agent.id,
            status: AgentTransactionStatus.RECONCILED,
          },
          _sum: {
            totalSalesValue: true,
            commissionAmount: true,
            amountDue: true,
          },
        });

        return {
          ...agent,
          totalSales: stats._sum.totalSalesValue || 0,
          totalCommission: stats._sum.commissionAmount || 0,
          pendingAmount: stats._sum.amountDue || 0,
        };
      })
    );

    return { success: true, data: agentsWithStats };
  } catch (error) {
    console.error("Error fetching commercial agents:", error);
    return { success: false, error: "Failed to fetch commercial agents" };
  }
}

export async function getCommercialAgentById(
  id: string,
  organizationId: string
) {
  try {
    const agent = await prisma.commercialAgent.findFirst({
      where: { id, organizationId },
      include: {
        employee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        transactions: {
          include: {
            transactionLines: {
              include: {
                item: {
                  select: {
                    id: true,
                    name: true,
                    sku: true,
                    costPrice: true,
                    sellingPrice: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!agent) {
      return { success: false, error: "Commercial agent not found" };
    }

    return { success: true, data: agent };
  } catch (error) {
    console.error("Error fetching commercial agent:", error);
    return { success: false, error: "Failed to fetch commercial agent" };
  }
}

// Agent Transaction Operations
export async function createAgentTransaction(
  data: CreateAgentTransactionData,
  organizationId: string,
  createdById: string
) {
  try {
    // Generate transaction number
    const transactionCount = await prisma.agentTransaction.count({
      where: { organizationId },
    });
    const transactionNumber = `AGT-${String(transactionCount + 1).padStart(6, "0")}`;

    // Calculate totals from transaction lines
    let totalDispatchValue = 0;
    let totalQuantityDispatched = 0;

    // Fetch item details and validate
    const items = await prisma.item.findMany({
      where: {
        id: { in: data.transactionLines.map((line) => line.itemId) },
        organizationId,
      },
    });

    if (items.length !== data.transactionLines.length) {
      return { success: false, error: "Some items not found" };
    }

    // Prepare transaction lines with calculations
    const transactionLinesData = data.transactionLines.map((lineData) => {
      const item = items.find((i) => i.id === lineData.itemId)!;
      const dispatchValue = lineData.quantityDispatched * item.costPrice;
      const sellingPrice = lineData.sellingPrice || item.sellingPrice;

      totalDispatchValue += dispatchValue;
      totalQuantityDispatched += lineData.quantityDispatched;

      return {
        itemId: lineData.itemId,
        itemName: item.name,
        itemSku: item.sku,
        costPrice: item.costPrice,
        sellingPrice,
        quantityDispatched: lineData.quantityDispatched,
        dispatchValue,
      };
    });

    const transaction = await prisma.agentTransaction.create({
      data: {
        transactionNumber,
        agentId: data.agentId,
        type: AgentTransactionType.GOODS_DISPATCH,
        status: AgentTransactionStatus.OUT_FOR_SALES,
        expectedReturnDate: data.expectedReturnDate,
        totalDispatchValue,
        totalQuantityDispatched,
        organizationId,
        locationId: data.locationId,
        createdById,
        notes: data.notes,
        transactionLines: {
          create: transactionLinesData,
        },
      },
      include: {
        agent: true,
        transactionLines: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
                costPrice: true,
                sellingPrice: true,
              },
            },
          },
        },
      },
    });

    revalidatePath("/dashboard/commercial-agents");
    return { success: true, data: transaction };
  } catch (error) {
    console.error("Error creating agent transaction:", error);
    return { success: false, error: "Failed to create agent transaction" };
  }
}

export async function reconcileAgentTransaction(
  data: ReconcileAgentTransactionData,
  organizationId: string,
  reconciledById: string
) {
  try {
    const transaction = await prisma.agentTransaction.findFirst({
      where: {
        id: data.transactionId,
        organizationId,
        status: AgentTransactionStatus.OUT_FOR_SALES,
      },
      include: {
        agent: true,
        transactionLines: true,
      },
    });

    if (!transaction) {
      return { success: false, error: "Transaction not found or already reconciled" };
    }

    let totalSalesValue = 0;
    let totalReturnValue = 0;
    let totalQuantitySold = 0;
    let totalQuantityReturned = 0;
    let totalCommissionAmount = 0;

    // Update transaction lines
    const lineUpdates = data.transactionLines.map(async (lineData) => {
      const existingLine = transaction.transactionLines.find(
        (line) => line.id === lineData.lineId
      );

      if (!existingLine) {
        throw new Error(`Transaction line ${lineData.lineId} not found`);
      }

      const sellingPrice = lineData.actualSellingPrice || existingLine.sellingPrice;
      const salesValue = lineData.quantitySold * sellingPrice;
      const returnValue = lineData.quantityReturned * existingLine.costPrice;
      const profit = salesValue - (lineData.quantitySold * existingLine.costPrice);
      const commission = profit * (transaction.agent.commissionRate / 100);

      totalSalesValue += salesValue;
      totalReturnValue += returnValue;
      totalQuantitySold += lineData.quantitySold;
      totalQuantityReturned += lineData.quantityReturned;
      totalCommissionAmount += commission;

      return prisma.agentTransactionLine.update({
        where: { id: lineData.lineId },
        data: {
          quantitySold: lineData.quantitySold,
          quantityReturned: lineData.quantityReturned,
          sellingPrice,
          salesValue,
          returnValue,
          profit,
          commission,
        },
      });
    });

    await Promise.all(lineUpdates);

    // Calculate amount due (sales value minus commission)
    const amountDue = totalSalesValue - totalCommissionAmount;

    // Update main transaction
    const updatedTransaction = await prisma.agentTransaction.update({
      where: { id: data.transactionId },
      data: {
        status: AgentTransactionStatus.RECONCILED,
        actualReturnDate: data.actualReturnDate || new Date(),
        totalSalesValue,
        totalReturnValue,
        totalQuantitySold,
        totalQuantityReturned,
        commissionAmount: totalCommissionAmount,
        amountDue,
        reconciledById,
        reconciledAt: new Date(),
        notes: data.notes,
      },
      include: {
        agent: true,
        transactionLines: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
                costPrice: true,
                sellingPrice: true,
              },
            },
          },
        },
      },
    });

    // Update agent's current balance
    await prisma.commercialAgent.update({
      where: { id: transaction.agentId },
      data: {
        currentBalance: {
          increment: amountDue,
        },
      },
    });

    revalidatePath("/dashboard/commercial-agents");
    return { success: true, data: updatedTransaction };
  } catch (error) {
    console.error("Error reconciling agent transaction:", error);
    return { success: false, error: "Failed to reconcile agent transaction" };
  }
}

export async function createAgentSettlement(
  data: CreateAgentSettlementData,
  organizationId: string,
  processedById: string
) {
  try {
    const transaction = await prisma.agentTransaction.findFirst({
      where: {
        id: data.transactionId,
        organizationId,
        status: AgentTransactionStatus.RECONCILED,
      },
      include: {
        agent: true,
        settlement: true,
      },
    });

    if (!transaction) {
      return { success: false, error: "Transaction not found or not reconciled" };
    }

    if (transaction.settlement) {
      return { success: false, error: "Transaction already settled" };
    }

    // Generate settlement number
    const settlementCount = await prisma.agentSettlement.count({
      where: { organizationId },
    });
    const settlementNumber = `SET-${String(settlementCount + 1).padStart(6, "0")}`;

    const totalAmountDue = transaction.amountDue;
    const discountGiven = data.discountGiven || 0;
    const outstandingAmount = totalAmountDue - data.paidAmount - discountGiven;

    const settlement = await prisma.agentSettlement.create({
      data: {
        settlementNumber,
        agentId: transaction.agentId,
        transactionId: data.transactionId,
        totalAmountDue,
        paidAmount: data.paidAmount,
        outstandingAmount,
        discountGiven,
        paymentMethod: data.paymentMethod,
        paymentReference: data.paymentReference,
        notes: data.notes,
        organizationId,
        processedById,
      },
      include: {
        agent: true,
        transaction: true,
      },
    });

    // Update agent's current balance
    await prisma.commercialAgent.update({
      where: { id: transaction.agentId },
      data: {
        currentBalance: {
          decrement: data.paidAmount + discountGiven,
        },
      },
    });

    revalidatePath("/dashboard/commercial-agents");
    return { success: true, data: settlement };
  } catch (error) {
    console.error("Error creating agent settlement:", error);
    return { success: false, error: "Failed to create agent settlement" };
  }
}

export async function getAgentTransactions(
  organizationId: string,
  filters?: AgentTransactionFilters
) {
  try {
    const where: any = { organizationId };

    if (filters?.agentId) {
      where.agentId = filters.agentId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.locationId) {
      where.locationId = filters.locationId;
    }

    if (filters?.startDate || filters?.endDate) {
      where.dispatchDate = {};
      if (filters.startDate) {
        where.dispatchDate.gte = filters.startDate;
      }
      if (filters.endDate) {
        where.dispatchDate.lte = filters.endDate;
      }
    }

    const transactions = await prisma.agentTransaction.findMany({
      where,
      include: {
        agent: {
          select: {
            id: true,
            agentCode: true,
            name: true,
          },
        },
        transactionLines: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
                costPrice: true,
                sellingPrice: true,
              },
            },
          },
        },
        settlement: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        reconciledBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { dispatchDate: "desc" },
    });

    return { success: true, data: transactions };
  } catch (error) {
    console.error("Error fetching agent transactions:", error);
    return { success: false, error: "Failed to fetch agent transactions" };
  }
}

export async function getAgentTransactionById(
  id: string,
  organizationId: string
) {
  try {
    const transaction = await prisma.agentTransaction.findFirst({
      where: { id, organizationId },
      include: {
        agent: true,
        transactionLines: {
          include: {
            item: {
              select: {
                id: true,
                name: true,
                sku: true,
                costPrice: true,
                sellingPrice: true,
              },
            },
          },
        },
        settlement: true,
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        reconciledBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      return { success: false, error: "Transaction not found" };
    }

    return { success: true, data: transaction };
  } catch (error) {
    console.error("Error fetching agent transaction:", error);
    return { success: false, error: "Failed to fetch agent transaction" };
  }
}