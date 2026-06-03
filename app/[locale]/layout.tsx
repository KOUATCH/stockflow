// Locale-segment layout. The root layout at app/layout.tsx already provides
// <html>, <body>, NextIntlClientProvider, and all global providers. This file
// only validates the [locale] param and short-circuits to notFound() for
// unsupported locales — it does NOT re-wrap providers (Next.js disallows
// multiple <html> roots).
import { routing } from "@/i18n/routing"
import { NextIntlClientProvider } from "next-intl"
import { notFound } from "next/navigation"
import { setRequestLocale } from "next-intl/server"
import type { Locale } from "@/types/bilingual"

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  if (!routing.locales.includes(locale as Locale)) {
    notFound()
  }

  setRequestLocale(locale)
  const messages = (await import(`@/messages/${locale}.json`)).default

  return <NextIntlClientProvider locale={locale} messages={messages}>{children}</NextIntlClientProvider>
}
