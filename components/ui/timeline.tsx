"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export function Timeline({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative space-y-4", className)} {...props} />
}

export function TimelineItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("relative flex gap-3", className)} {...props} />
}

export function TimelineConnector({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("absolute left-4 top-8 h-[calc(100%-2rem)] w-px bg-border", className)} {...props} />
}

export function TimelineHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />
}

export function TimelineTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h4 className={cn("text-sm font-medium leading-none", className)} {...props} />
}

export function TimelineIcon({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background", className)}
      {...props}
    />
  )
}

export function TimelineDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-sm text-muted-foreground", className)} {...props} />
}

export function TimelineContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("min-w-0 flex-1 space-y-2 pb-4", className)} {...props} />
}
