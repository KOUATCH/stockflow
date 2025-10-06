'use client'

import { useState, useEffect } from 'react';
import { InventoryLevel, InventoryTransaction } from '@/types/inventory';
import { getInventoryLevelsClientSafe, getInventoryTransactionsClientSafe, getLowStockItemsClientSafe } from '@/actions/inventory/clientSafeInventoryData';

export function useInventoryLevels(locationId?: string) {
  const [levels, setLevels] = useState<InventoryLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLevels = async () => {
    setLoading(true);
    try {
      const result = await getInventoryLevelsClientSafe(undefined, locationId);
      if (result.success && result.data) {
        setLevels(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch inventory levels');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLevels();
  }, [locationId]);

  return {
    levels,
    loading,
    error,
    refetch: fetchLevels,
  };
}

export function useInventoryTransactions(itemId?: string, locationId?: string) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const result = await getInventoryTransactionsClientSafe(undefined, itemId, locationId);
      if (result.success && result.data) {
        setTransactions(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch transactions');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [itemId, locationId]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
  };
}

export function useLowStockItems(threshold: number = 10) {
  const [lowStockItems, setLowStockItems] = useState<InventoryLevel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLowStockItems = async () => {
    setLoading(true);
    try {
      const result = await getLowStockItemsClientSafe(undefined, threshold);
      if (result.success && result.data) {
        setLowStockItems(result.data);
        setError(null);
      } else {
        setError(result.error || 'Failed to fetch low stock items');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLowStockItems();
  }, [threshold]);

  return {
    lowStockItems,
    loading,
    error,
    refetch: fetchLowStockItems,
  };
}
