import type { Metadata } from "next"
import { ThemeProvider } from "next-themes"
import { Open_Sans, Work_Sans } from "next/font/google"
import type React from "react"
import { Toaster } from "sonner"
import "../../../globals.css"
// import { ThemeProvider } from "@/components/theme-provider"
// import { Toaster } from "@/components/ui/toaster"

const workSans = Work_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-work-sans",
  weight: ["400", "500", "600", "700"],
})

const openSans = Open_Sans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-open-sans",
  weight: ["400", "500", "600"],
})

export const metadata: Metadata = {
  title: "InventoryPro - Modern POS & Inventory Management",
  description: "Professional inventory and point-of-sale management system",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${workSans.variable} ${openSans.variable}`}>
      <head>
        <style>{`
          html {
            font-family: ${openSans.style.fontFamily};
            --font-sans: ${openSans.variable};
            --font-heading: ${workSans.variable};
          }
        `}</style>
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
