import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";
import { ErrorBoundary } from "@/config/error-boundary";
import { Toaster } from "sonner";

const inter = Rethink_Sans({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "StockFlow - Retail Management System",
  description: "Comprehensive retail and inventory management solution",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ErrorBoundary>
          <Providers>
            <Toaster richColors />
            {children}
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
