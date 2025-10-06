import type React from "react"

// This is a nested layout - should NOT have html/body tags
// The root layout already provides those
export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div className="app-section">
      {children}
    </div>
  )
}
