"use client";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
  variant?: "login" | "register" | "forgot" | "verify";
  className?: string;
}

// Simple clean layout matching purchaseOrder/new page design
export default function AuthLayout({
  children,
  variant = "login",
  className
}: AuthLayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 p-6 transition-colors duration-300",
      className
    )}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}

// Auth form wrapper with consistent styling
export function AuthFormCard({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn(
      "shadow-2xl border-0 bg-white/80 backdrop-blur-xl",
      "animate-in slide-in-from-bottom-4 fade-in duration-700",
      className
    )}>
      <CardContent className="p-6 sm:p-8">
        {children}
      </CardContent>
    </Card>
  );
}

// Loading overlay for forms
export function AuthLoadingOverlay({ show, message }: { show: boolean; message?: string }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
      <Card className="bg-white/90 backdrop-blur-xl border-0 shadow-2xl">
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-700 font-medium">
            {message || "Processing your request..."}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}