# Session Management System

This folder contains the unified session management system for the POS application. All session-related functionality has been consolidated here for better maintainability and consistency.

## Files Structure

```
actions/sessions/
├── pos-session-actions.ts  # Core session actions (server-side)
├── types.ts                # TypeScript types and interfaces
├── index.ts               # Main exports
└── README.md              # This documentation

hooks/sessions/
├── useSessionManagement.ts # TanStack Query hooks (client-side)
└── index.ts               # Hook exports
```

## Key Features

### 1. Automatic Session Cleanup
- **Force Close Stale Sessions**: Automatically closes any existing active sessions before creating new ones
- **Organization-scoped Validation**: Ensures sessions are properly scoped to organizations
- **Cash Drawer Management**: Properly handles cash drawer state during session transitions

### 2. Robust Error Handling
- **Comprehensive Validation**: Validates all required fields and relationships
- **Graceful Degradation**: Handles errors without breaking the UI
- **Detailed Logging**: Provides detailed console logs for debugging

### 3. Optimized Performance
- **Smart Query Invalidation**: Only invalidates relevant queries after mutations
- **Reduced Cookie Size**: Optimized session data to prevent cookie overflow
- **Efficient Database Queries**: Uses proper joins and filtering for better performance

### 4. Backward Compatibility
- **Legacy Function Aliases**: Maintains compatibility with existing code
- **Multiple Hook Exports**: Provides legacy hook names for gradual migration

## Usage Examples

### Basic Session Management

```typescript
import { useSessionManagement } from '@/hooks/sessions'

function POSTerminal({ stationId, organizationId }) {
  const {
    currentSession,
    isSessionActive,
    startSession,
    endSession,
    sessionLoading
  } = useSessionManagement({
    stationId,
    organizationId,
    enableAutoRefetch: true
  })

  const handleStartSession = async () => {
    try {
      await startSession(100, userId, locationId, organizationId)
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  const handleEndSession = async () => {
    try {
      await endSession(250) // closing balance
    } catch (error) {
      console.error('Failed to end session:', error)
    }
  }

  return (
    <div>
      {isSessionActive ? (
        <button onClick={handleEndSession}>End Session</button>
      ) : (
        <button onClick={handleStartSession}>Start Session</button>
      )}
    </div>
  )
}
```

### Session History

```typescript
import { useSessionHistory } from '@/hooks/sessions'

function SessionHistory({ organizationId }) {
  const { data: historyResponse } = useSessionHistory(
    { organizationId, status: ['CLOSED'] },
    { skip: 0, take: 20 }
  )

  const sessions = historyResponse?.data?.sessions || []

  return (
    <div>
      {sessions.map(session => (
        <div key={session.id}>
          Session: {session.sessionNumber}
          Duration: {session.endTime - session.startTime}
        </div>
      ))}
    </div>
  )
}
```

### Server Actions

```typescript
import { createPOSSession, getCurrentSession } from '@/actions/sessions'

// Create a new session
const result = await createPOSSession({
  stationId: 'station-123',
  userId: 'user-456',
  locationId: 'location-789',
  organizationId: 'org-abc',
  openingBalance: 100
})

// Get current session
const currentSession = await getCurrentSession('station-123', 'org-abc')
```

## Key Improvements

### Fixed Issues
1. **Session Cookie Overflow**: Reduced session data size to prevent 4096 byte limit
2. **Stale Session Conflicts**: Automatic cleanup prevents "already active" errors
3. **Organization Isolation**: Proper organization scoping prevents cross-org conflicts
4. **Cash Drawer Sync**: Proper synchronization between sessions and cash drawers

### Enhanced Features
1. **Smart Query Management**: Uses proper TanStack Query keys and invalidation
2. **Real-time Updates**: Optional auto-refresh for session status
3. **Comprehensive Error Handling**: User-friendly error messages and recovery
4. **Type Safety**: Full TypeScript support with proper type definitions

## Migration Guide

### From Old Session Actions
```typescript
// Old way
import { openPOSSession } from '@/actions/newPOSSession/pos/session-actions'

// New way
import { createPOSSession } from '@/actions/sessions'
// or use the alias
import { openPOSSession } from '@/actions/sessions'
```

### From Old Hooks
```typescript
// Old way
import { useSessionManagementModern } from '@/hooks/newPOSSession/useSessionManagementModern'

// New way
import { useSessionManagement } from '@/hooks/sessions'
// or use the alias
import { useSessionManagementModern } from '@/hooks/sessions'
```

## Query Keys

All TanStack Query keys are centralized and exported:

```typescript
import { SESSION_QUERY_KEYS } from '@/actions/sessions'

// Available keys:
SESSION_QUERY_KEYS.currentSession(stationId)
SESSION_QUERY_KEYS.sessionHistory(filters)
SESSION_QUERY_KEYS.cashDrawer(stationId)
SESSION_QUERY_KEYS.realTimeBalance(sessionId)
```

## Best Practices

1. **Always provide organizationId** for proper session isolation
2. **Use the unified hooks** instead of direct action calls in components
3. **Handle loading and error states** properly in your UI
4. **Clean up sessions** when switching users or locations
5. **Monitor session duration** to prevent overly long sessions

## Troubleshooting

### Common Issues

1. **"Station already has an active session"**
   - Solution: The new system automatically handles this by force-closing stale sessions

2. **Session not persisting**
   - Check that organizationId is properly set
   - Verify database connection and transaction completion

3. **Cookie size warnings**
   - The new system reduces session data size automatically
   - Consider using server-side session storage for large datasets

### Debug Mode

Enable detailed logging by setting:
```javascript
localStorage.setItem('debug-sessions', 'true')
```