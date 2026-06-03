import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { TooltipProvider } from '@/components/ui/tooltip'

// Mock notification context
const MockNotificationProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

// All the providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockNotificationProvider>
      <TooltipProvider>
        {children}
      </TooltipProvider>
    </MockNotificationProvider>
  )
}

// Custom render function
const customRender = (ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }