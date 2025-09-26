"use client"

import { QueryClient, QueryClientProvider, HydrationBoundary } from "@tanstack/react-query"
import { type ReactNode, useState } from "react"

export default function QueryProvider({ children, state }: { children: ReactNode; state?: unknown }) {
  const [client] = useState(() => new QueryClient())
  return (
    <QueryClientProvider client={client}>
      <HydrationBoundary state={state as any}>{children}</HydrationBoundary>
    </QueryClientProvider>
  )
}
