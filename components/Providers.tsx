"use client";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { QueryProvider } from "@/lib/providers/query-provider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes';
import { extractRouterConfig } from "uploadthing/server";

export default function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <NotificationProvider>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <NextThemesProvider {...props}>
            {/* <ShadToaster richColors /> */}
            {children}
          </NextThemesProvider>
        </NotificationProvider>
      </AuthProvider>
    </QueryProvider>
  );
}
