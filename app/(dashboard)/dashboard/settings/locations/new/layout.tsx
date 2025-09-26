"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { GeistMono } from "geist/font/mono"
import { GeistSans } from "geist/font/sans"
import type React from "react"
import { useState } from "react"
import { Toaster } from "sonner"
import "./globals.css"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 3,
          },
        },
      }),
  )

  return (
    <html lang="en">
      <head>
        <title>POS Terminal</title>
        <meta name="description" content="Modern Point of Sale System" />
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          {children}
          <Toaster position="top-right" />
        </QueryClientProvider>
      </body>
    </html>
  )
}
