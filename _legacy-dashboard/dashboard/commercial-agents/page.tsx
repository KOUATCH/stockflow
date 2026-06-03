import React from "react";
import { getAuthenticatedUser } from "@/config/useAuth";
import CommercialAgentTransactionPage from "@/components/commercial-agents/CommercialAgentTransactionPage";
import {
  getCommercialAgents,
  getAgentTransactions,
  createAgentTransaction,
  reconcileAgentTransaction,
  createAgentSettlement,
} from "@/actions/commercial-agents/commercialAgentActions";

export default async function CommercialAgentsPage() {
  const user = await getAuthenticatedUser();

  // Fetch commercial agents
  const agentsResult = await getCommercialAgents(user.organizationId);
  const agents = agentsResult.success ? agentsResult.data : [];

  // Fetch recent transactions
  const transactionsResult = await getAgentTransactions(user.organizationId);
  const transactions = transactionsResult.success ? transactionsResult.data : [];

  const handleDispatchGoods = async (data: any) => {
    "use server";
    return await createAgentTransaction(data, user.organizationId, user.id);
  };

  const handleReconcileTransaction = async (data: any) => {
    "use server";
    return await reconcileAgentTransaction(data, user.organizationId, user.id);
  };

  const handleCreateSettlement = async (data: any) => {
    "use server";
    return await createAgentSettlement(data, user.organizationId, user.id);
  };

  return (
    <CommercialAgentTransactionPage
      agents={agents}
      onDispatchGoods={handleDispatchGoods}
      onReconcileTransaction={handleReconcileTransaction}
      onCreateSettlement={handleCreateSettlement}
    />
  );
}