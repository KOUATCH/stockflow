"use client";
import { ourFileRouter } from "@/app/api/uploadthing/core";
import { NotificationProvider } from "@/components/notifications/NotificationProvider";
import { QueryProvider } from "@/lib/providers/query-provider";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { SessionProvider } from "next-auth/react";
import {
  ThemeProvider as NextThemesProvider,
  type ThemeProviderProps,
} from 'next-themes';
import { Toaster } from "react-hot-toast";
import { extractRouterConfig } from "uploadthing/server";

export default function Providers({ children, ...props }: ThemeProviderProps) {
  return (
    <SessionProvider>
      <QueryProvider>
        <NotificationProvider>
          <NextSSRPlugin routerConfig={extractRouterConfig(ourFileRouter)} />
          <NextThemesProvider {...props}>
            <Toaster position="top-center" reverseOrder={false} />
            {/* <ShadToaster richColors /> */}
            {children}
          </NextThemesProvider>
        </NotificationProvider>
      </QueryProvider>
    </SessionProvider>
  );
}
