"use client"

import {
  getInventoryStats,
  getInventoryTransactions,
  type InventoryStats,
  type InventoryTransaction
} from "@/actions/inventory/AllInventoryActionsOriginal"
import { createInventoryTransactions } from "@/actions/pos/POSActionFinal"
import { useCallback, useEffect, useState } from "react"

// export function useInventoryDataHooks(organizationId:string,locationId?: string | undefined) {
//  const [inventoryLevels, setInventoryLevels] = useState<InventoryLevel[] | []>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)

//   const fetchInventoryLevels = useCallback(async () => {
//     try {
//       setLoading(true)
//       setError(null)
//       const response = await getInventoryLevels(locationId)
      
//       // Check if response is successful and has data
//       if (response.success && response?.data) {
//         setInventoryLevels(response?.data)
//       } else {
//         setError(response.error || "Failed to fetch inventory levels")
//         setInventoryLevels([])
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch inventory levels")
//       setInventoryLevels([])
//     } finally {
//       setLoading(false)
//     }
//   }, [organizationId, locationId])

//   useEffect(() => {
//     fetchInventoryLevels()
//   }, [fetchInventoryLevels])

//   const updateLevel = useCallback(
//     async (inventoryLevelId: string, updates: Parameters<typeof updateInventoryLevel>[1]) => {
//       try {
//         const updated = await updateInventoryLevel(inventoryLevelId, updates)
//         setInventoryLevels((prev) => prev?.map((level) => (level.id === inventoryLevelId ? updated : level)))
//         return updated
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to update inventory level")
//         throw err
//       }
//     },
//     [],
//   )

//   return {
//     inventoryLevels,
//     loading,
//     error,
//     refetch: fetchInventoryLevels,
//     updateLevel,
//   }
// }

// export function useInventoryStats(organizationId:string) {
//   const [stats, setStats] = useState<InventoryStats>()
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)


//   const fetchStats = useCallback(async () => {
//     try {

//       const {data:session} = useSession()
//       const userOrgId  = session?.user.organizationId
//       setLoading(true)
//       setError(null)
//       const inventoryStats = await getInventoryStats()
//       const inventStatsData= inventoryStats.data
//       setStats(inventStatsData)
//       console.log({stats, inventoryStats})
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch inventory stats")
//     } finally {
//       setLoading(false)
//     }
//   }, [organizationId])

//   useEffect(() => {
//     fetchStats()
//   }, [fetchStats])

//   return {
//     stats,
//     loading,
//     error,
//     refetch: fetchStats,
//   }
// }

export function useInventoryDataHooks(organizationId: string, limit = 15) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getInventoryTransactions(limit)

      // Extract data from ApiResponse
      if (response) {
        setTransactions(response)
      } else {
        setError("Failed to fetch inventory transactions")
        setTransactions([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch inventory transactions")
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [organizationId, limit])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const createTransaction = useCallback(
    async (inventoryLevelId: string, transaction: any) => {
      try {
        const newTransaction = await createInventoryTransactions(inventoryLevelId, transaction)
        setTransactions((prev) => [newTransaction, ...prev.slice(0, limit - 1)])
        return newTransaction
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create inventory transaction")
        throw err
      }
    },
    [limit],
  )

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    createTransaction,
  }
}
export function useInventoryStats(organizationId:string) {
  const [stats, setStats] = useState<InventoryStats>()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const inventoryStats = await getInventoryStats()
      
      // Extract data from ApiResponse
      if (inventoryStats.success && inventoryStats.data) {
        setStats(inventoryStats.data)
      } else {
        setError(inventoryStats.error || "Failed to fetch inventory stats")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch inventory stats")
    } finally {
      setLoading(false)
    }
  }, [organizationId])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  return {
    stats,
    loading,
    error,
    refetch: fetchStats,
  }
}


export function useInventoryTransactions(organizationId: string, limit = 10) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getInventoryTransactions(limit, { limit })

      // Extract data from ApiResponse
      if (response) {
        setTransactions(response)
      } else {
        setError("Failed to fetch inventory transactions")
        setTransactions([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch inventory transactions")
      setTransactions([])
    } finally {
      setLoading(false)
    }
  }, [organizationId, limit])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const createTransaction = useCallback(
    async (inventoryLevelId: string, transaction: any) => {
      try {
        const newTransaction = await createInventoryTransactions(inventoryLevelId, transaction)
        setTransactions((prev) => [newTransaction, ...prev.slice(0, limit - 1)])
        return newTransaction
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create inventory transaction")
        throw err
      }
    },
    [limit],
  )

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    createTransaction,
  }
}

// export function useInventoryTransactions(limit = 10) {
// const [transactions, setTransactions] = useState<InventoryTransaction[]>([])
//   const [loading, setLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
  
  
//   const fetchTransactions = useCallback(async () => {
  
//       try {
//       setLoading(true)
//       setError(null)
     

//       const response = await getInventoryTransactions(limit)
      
//       // Extract data from ApiResponse
//       if (response) {
//         setTransactions(response)
//       } else {
//         setError(response || "Failed to fetch inventory transactions")
//         setTransactions([])
//       }
//     } catch (err) {
//       setError(err instanceof Error ? err.message : "Failed to fetch inventory transactions")
//       setTransactions([])
//     } finally {
//       setLoading(false)
//     }
//   }, [limit])

//   useEffect(() => {
//     fetchTransactions()
//   }, [fetchTransactions])

//   const createTransaction = useCallback(
//     async (inventoryLevelId: string, transaction: Parameters<typeof createInventoryTransaction>[1]) => {
//       try {
//         const newTransaction = await createInventoryTransaction(inventoryLevelId, transaction)
//         setTransactions((prev) => [newTransaction, ...prev.slice(0, limit - 1)])
//         return newTransaction
//       } catch (err) {
//         setError(err instanceof Error ? err.message : "Failed to create inventory transaction")
//         throw err
//       }
//     },
//     [limit],
//   )

//   return {
//     transactions,
//     loading,
//     error,
//     refetch: fetchTransactions,
//     createTransaction,
//   }
// }
