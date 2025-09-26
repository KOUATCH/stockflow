import type { Metadata } from "next";
import { Rethink_Sans } from "next/font/google";
import "./globals.css";
// import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";
import { ErrorBoundary } from "@/config/error-boundary";
import { Toaster } from "sonner";
// import FooterBanner from "@/components/Footer";
const inter = Rethink_Sans({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  title: "Ronix Fit Savers",
  description: "Join Ronix Savings Group",
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
