# StockFlow Enterprise Error Handling System

A comprehensive, enterprise-grade error handling foundation layer for the StockFlow retail management system. This system provides centralized error classification, handling, recovery strategies, and seamless integration with the existing notification infrastructure.

## 🚀 Features

- **Comprehensive Error Classification**: Automatic categorization by business domain, severity, and recovery strategy
- **Centralized Error Handling**: Single point of control for all error processing
- **Smart Recovery Strategies**: Automatic retry logic, fallback mechanisms, and user guidance
- **Notification Integration**: Seamless integration with StockFlow's existing notification system
- **Business Context Awareness**: Domain-specific error handling for inventory, sales, POS, and financial operations
- **Developer Experience**: Enhanced error boundaries, hooks, and debugging tools

## 🏗️ Architecture

### Core Components

1. **Error Classification System** (`types.ts`, `categories.ts`)
   - Automatic error categorization based on error types and messages
   - Severity assessment and recovery strategy determination
   - Business domain-specific classification

2. **Centralized ErrorHandler** (`error-handler.ts`)
   - Singleton pattern for consistent error handling
   - Comprehensive logging and metrics collection
   - Notification dispatching and admin alerts

3. **Server Action Integration** (`server-action-wrapper.ts`)
   - Pre-configured wrappers for different business domains
   - Automatic error handling and notification
   - Enhanced return types with structured error information

4. **Client-Side Components** (`client-error-boundary.tsx`, `hooks.ts`)
   - React Error Boundaries with recovery mechanisms
   - Hooks for form handling and action error management
   - Specialized boundaries for different system areas

5. **Notification Integration** (`notification-integration.ts`)
   - Bridge between error system and existing notifications
   - Context-aware notification creation
   - Business operation specific notifications

## 📦 Installation & Setup

### 1. Initialize the Error Handling System

In your root layout or app initialization:

```typescript
// app/layout.tsx or similar
import { initializeErrorHandling } from '@/lib/error-handling'
import { useNotifications } from '@/components/notifications/NotificationProvider'

// Initialize during app startup
const errorHandling = initializeErrorHandling({
  // Custom configuration if needed
  defaultMaxRetries: 3,
  userNotificationThreshold: 'medium',
  adminNotificationThreshold: 'high'
})

// Setup notification integration (in a client component)
function ErrorHandlingSetup() {
  const notifications = useNotifications()

  useEffect(() => {
    errorHandling.setupNotifications(notifications)
  }, [notifications])

  return null
}
```

### 2. Wrap Your App with Error Boundaries

```typescript
// app/layout.tsx
import { ErrorBoundary } from '@/lib/error-handling'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <NotificationProvider>
          <ErrorBoundary component="RootApplication">
            <ErrorHandlingSetup />
            {children}
          </ErrorBoundary>
        </NotificationProvider>
      </body>
    </html>
  )
}
```

## 🎯 Usage Examples

### Server Actions

#### Basic Usage - Updated Server Action

```typescript
// actions/item/createItemAction.ts (already updated)
import { inventoryAction } from '@/lib/error-handling'

export const createItemAction = inventoryAction(
  async (input: unknown): Promise<ServerActionResult<ItemWithRelations>> => {
    // Your action logic here
    const data = createItemSchema.parse(input)
    // ... rest of implementation

    return {
      success: true,
      data: createdItem
    }
  },
  {
    actionName: 'createItem',
    component: 'ItemCreation',
    notifyUser: true,
    businessContext: { domain: 'inventory', operation: 'create' }
  }
)
```

#### Domain-Specific Wrappers

```typescript
// Sales action
import { salesAction } from '@/lib/error-handling'

export const processSaleAction = salesAction(
  async (saleData: SaleInput) => {
    // Sales logic
    return { success: true, data: sale }
  },
  { actionName: 'processSale', notifyAdmin: true }
)

// Financial action (no auto-retry)
import { financialAction } from '@/lib/error-handling'

export const calculateTaxAction = financialAction(
  async (calculation: TaxCalculation) => {
    // Financial calculation
    return { success: true, data: result }
  },
  { actionName: 'calculateTax', includeStackTrace: true }
)

// POS action (auto-retry enabled)
import { posAction } from '@/lib/error-handling'

export const processPOSTransactionAction = posAction(
  async (transaction: POSTransaction) => {
    // POS logic
    return { success: true, data: receipt }
  },
  { actionName: 'processPOSTransaction', autoRetry: true, maxRetries: 3 }
)
```

### Client-Side Usage

#### Form Handling with Error Management

```typescript
// components/forms/CreateItemForm.tsx
import { useServerActionHandler, useFormErrorHandler } from '@/lib/error-handling'
import { createItemAction } from '@/actions/item/createItemAction'

function CreateItemForm() {
  const { handleAction, loading, error } = useServerActionHandler<ItemWithRelations>()
  const { handleFormError, getFieldError, clearFieldErrors } = useFormErrorHandler()

  const handleSubmit = async (formData: CreateItemInput) => {
    clearFieldErrors()

    const result = await handleAction(
      createItemAction,
      formData,
      {
        onSuccess: (item) => {
          console.log('Item created:', item)
          // Navigate or reset form
        },
        onError: (error) => {
          handleFormError(error, {
            'name': 'name',
            'sku': 'sku',
            'duplicateField': 'general'
          })
        },
        showSuccessNotification: true,
        successMessage: 'Item created successfully!',
        loadingMessage: 'Creating item...'
      }
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        className={getFieldError('name') ? 'border-red-500' : ''}
      />
      {getFieldError('name') && (
        <span className="text-red-500 text-sm">{getFieldError('name')}</span>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'Creating...' : 'Create Item'}
      </button>
    </form>
  )
}
```

#### Specialized Error Boundaries

```typescript
// pages/inventory/page.tsx
import { InventoryErrorBoundary } from '@/lib/error-handling'

function InventoryPage() {
  return (
    <InventoryErrorBoundary>
      <InventoryManagement />
      <StockLevels />
      <ItemList />
    </InventoryErrorBoundary>
  )
}

// pages/pos/page.tsx
import { POSErrorBoundary } from '@/lib/error-handling'

function POSPage() {
  return (
    <POSErrorBoundary>
      <POSTerminal />
      <TransactionHistory />
    </POSErrorBoundary>
  )
}
```

#### Error Recovery and Retry

```typescript
// components/DataLoader.tsx
import { useErrorRecovery } from '@/lib/error-handling'

function DataLoader() {
  const { retry, canRetry, retryCount, isRetrying } = useErrorRecovery()
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)

  const loadData = async () => {
    try {
      const result = await fetchDataAction()
      if (result.success) {
        setData(result.data)
        setError(null)
      } else {
        setError(result.error)
      }
    } catch (err) {
      setError(err)
    }
  }

  const handleRetry = async () => {
    if (canRetry(error, 3)) {
      try {
        await retry(fetchDataAction, {}, 3, 1000)
        await loadData()
      } catch (retryError) {
        console.error('Retry failed:', retryError)
      }
    }
  }

  return (
    <div>
      {error && (
        <div className="error-container">
          <p>Failed to load data</p>
          {canRetry(error, 3) && (
            <button onClick={handleRetry} disabled={isRetrying}>
              {isRetrying ? 'Retrying...' : `Try Again (${retryCount}/3)`}
            </button>
          )}
        </div>
      )}
      {data && <DataDisplay data={data} />}
    </div>
  )
}
```

### Error Monitoring and Metrics

```typescript
// components/admin/ErrorDashboard.tsx
import { useErrorMonitoring } from '@/lib/error-handling'
import { stockFlowErrorHandling } from '@/lib/error-handling'

function ErrorDashboard() {
  const { errorHistory, getErrorStats } = useErrorMonitoring()
  const [systemMetrics, setSystemMetrics] = useState(null)

  useEffect(() => {
    const loadMetrics = async () => {
      const metrics = await stockFlowErrorHandling.getMetrics()
      setSystemMetrics(metrics)
    }

    loadMetrics()
    const interval = setInterval(loadMetrics, 30000) // Update every 30s

    return () => clearInterval(interval)
  }, [])

  const stats = getErrorStats()

  return (
    <div className="error-dashboard">
      <div className="metrics-grid">
        <div className="metric-card">
          <h3>Error Rate</h3>
          <p>{stats.errorRate.toFixed(2)} errors/min</p>
        </div>

        <div className="metric-card">
          <h3>Total Errors (Last Hour)</h3>
          <p>{stats.totalErrors}</p>
        </div>

        <div className="metric-card">
          <h3>Recovery Rate</h3>
          <p>{systemMetrics?.recoverySuccess.rate * 100}%</p>
        </div>
      </div>

      <div className="error-breakdown">
        <h3>Errors by Category</h3>
        {Object.entries(stats.byCategory).map(([category, count]) => (
          <div key={category} className="category-stat">
            <span>{category}</span>
            <span>{count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

## 🎨 Customization

### Custom Error Categories

```typescript
// lib/error-handling/custom-categories.ts
import { ErrorCategory, ErrorSeverity, RecoveryStrategy } from './types'

// Extend existing categories
export const CustomErrorCategories = {
  BAKERY_PRODUCTION: 'bakery_production',
  RECIPE_MANAGEMENT: 'recipe_management',
  DELIVERY_TRACKING: 'delivery_tracking'
} as const

// Custom categorization logic
export function customCategorizeError(error: Error) {
  const message = error.message.toLowerCase()

  if (message.includes('recipe') || message.includes('ingredient')) {
    return {
      category: CustomErrorCategories.RECIPE_MANAGEMENT,
      severity: ErrorSeverity.MEDIUM,
      recovery: RecoveryStrategy.USER_ACTION
    }
  }

  if (message.includes('delivery') || message.includes('route')) {
    return {
      category: CustomErrorCategories.DELIVERY_TRACKING,
      severity: ErrorSeverity.LOW,
      recovery: RecoveryStrategy.RETRY
    }
  }

  // Fall back to default categorization
  return categorizeError(error)
}
```

### Custom Notification Messages

```typescript
// Custom notification integration
import { createNotificationCallback } from '@/lib/error-handling'

const customNotificationCallback = createNotificationCallback({
  // Override default messages
  customUserMessages: {
    [ErrorCategory.INVENTORY]: 'Inventory operation failed. Please check stock levels and try again.',
    [ErrorCategory.SALES]: 'Sale processing failed. Customer data and payment information are safe.',
    [CustomErrorCategories.BAKERY_PRODUCTION]: 'Production schedule conflict detected.'
  }
})

errorHandler.setNotificationCallback(customNotificationCallback)
```

## 🛠️ Development Tools

### Error Testing (Development Only)

```typescript
// Development testing utilities
import { stockFlowErrorHandling } from '@/lib/error-handling'

// Test error handling system
if (process.env.NODE_ENV === 'development') {
  // Test the system
  await stockFlowErrorHandling.devUtils?.testErrorHandling()

  // Generate sample errors to test notifications
  await stockFlowErrorHandling.devUtils?.generateSampleErrors()
}
```

### Debug Logging

```typescript
// Enable debug logging in development
const errorHandling = initializeErrorHandling({
  logThreshold: process.env.NODE_ENV === 'development' ? 'debug' : 'warn',
  includeStackTrace: process.env.NODE_ENV === 'development'
})
```

## 📊 Monitoring and Analytics

The error handling system automatically collects metrics including:

- Error frequency by category and severity
- Recovery success rates
- Error trends over time
- Performance impact measurements

Access metrics via:

```typescript
const metrics = await stockFlowErrorHandling.getMetrics()
```

## 🔧 Configuration Options

```typescript
interface ErrorConfig {
  // Global settings
  defaultSeverity: ErrorSeverity
  defaultCategory: ErrorCategory
  defaultRecoveryStrategy: RecoveryStrategy

  // Notification thresholds
  userNotificationThreshold: ErrorSeverity
  adminNotificationThreshold: ErrorSeverity

  // Logging settings
  logThreshold: ErrorSeverity
  maxLogRetention: number // days

  // Recovery settings
  defaultMaxRetries: number
  defaultRetryDelay: number

  // Category-specific configurations
  categoryConfig: Partial<Record<ErrorCategory, {
    defaultSeverity: ErrorSeverity
    autoRetry: boolean
    maxRetries: number
    notifyUser: boolean
    notifyAdmin: boolean
  }>>
}
```

## 🚨 Migration Guide

### Existing Error Handling

If you have existing error handling, you can gradually migrate:

1. **Start with new server actions** - Use the wrapper functions
2. **Add error boundaries** - Wrap components that need enhanced error handling
3. **Update existing actions** - Gradually convert existing server actions
4. **Enhance notification** - Integrate with existing notification system

### Breaking Changes

- Server actions now return `ServerActionResult<T>` instead of `ActionResult<T>`
- Error responses include enhanced error information
- Some error messages may change due to improved categorization

## 📚 API Reference

### Core Functions

- `errorHandler.handle(error, options)` - Handle any error
- `stockFlowAction(action, config)` - Wrap server actions
- `useServerActionHandler()` - Client-side action handling
- `useFormErrorHandler()` - Form-specific error handling
- `initializeErrorHandling(config)` - System initialization

### Error Boundaries

- `<ErrorBoundary>` - General error boundary
- `<InventoryErrorBoundary>` - Inventory-specific boundary
- `<POSErrorBoundary>` - POS system boundary
- `<FinancialErrorBoundary>` - Financial operations boundary

### Specialized Wrappers

- `inventoryAction()` - For inventory operations
- `salesAction()` - For sales operations
- `financialAction()` - For financial operations (no auto-retry)
- `posAction()` - For POS operations (auto-retry enabled)

## 🤝 Contributing

To extend the error handling system:

1. Add new error categories in `types.ts`
2. Update categorization logic in `categories.ts`
3. Add specialized wrappers in `server-action-wrapper.ts`
4. Create domain-specific error boundaries as needed
5. Update notification integration for new categories

## 📄 License

Part of the StockFlow retail management system.