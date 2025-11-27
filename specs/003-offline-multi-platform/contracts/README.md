# API Contracts: Offline Multi-Platform Support

**Feature**: 003-offline-multi-platform  
**Date**: 2025-01-27

## Overview

This feature is client-side only with no server-side API. However, it interacts with browser APIs and defines contracts for local storage operations.

## Browser API Contracts

### Service Worker API

**Purpose**: Enable offline functionality through resource caching.

**Contract**:
- Service Worker registration via `navigator.serviceWorker.register()`
- Cache API for storing application resources
- Fetch event interception for offline requests

**Implementation**: Handled by Workbox library via vite-plugin-pwa

---

### Web App Manifest API

**Purpose**: Enable application installation and standalone mode.

**Contract**:
- Manifest file at `/manifest.json`
- Parsed by browser for installation metadata
- Defines app name, icons, display mode, theme colors

**Implementation**: Static JSON file in `public/` directory

---

### IndexedDB API

**Purpose**: Store plan data locally for offline access.

**Contract**:
- Database: `planVisualizerDB`
- Object Store: `plans`
- Operations: Create, Read, Update, Delete (CRUD)

**Operations**:

#### Create Plan
```typescript
interface CreatePlanParams {
  planText: string
  visualizationData: ExcalidrawScene
}

interface CreatePlanResult {
  id: string
  createdAt: Date
}
```

#### Read Plan
```typescript
interface ReadPlanParams {
  id: string
}

interface ReadPlanResult {
  id: string
  planText: string
  visualizationData: ExcalidrawScene
  createdAt: Date
  updatedAt: Date
}
```

#### List Plans
```typescript
interface ListPlansParams {
  limit?: number
  offset?: number
  sortBy?: 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
}

interface ListPlansResult {
  plans: PlanData[]
  total: number
}
```

#### Delete Plan
```typescript
interface DeletePlanParams {
  id: string
}

interface DeletePlanResult {
  success: boolean
}
```

---

### StorageManager API

**Purpose**: Check storage quota and usage.

**Contract**:
- `navigator.storage.estimate()` returns quota information
- Used for quota warnings and management

**Response Structure**:
```typescript
interface StorageEstimate {
  quota: number | null        // Total quota in bytes
  usage: number | null         // Current usage in bytes
  usageDetails?: {
    indexedDB?: number
    caches?: number
    // ... other storage types
  }
}
```

---

### Install Prompt API

**Purpose**: Detect and trigger application installation.

**Contract**:
- `beforeinstallprompt` event fired when app is installable
- `prompt()` method shows installation dialog
- `userChoice` promise resolves with user's choice

**Event Structure**:
```typescript
interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
}
```

---

## Local Storage Contracts

### User Preferences Storage

**Storage**: localStorage

**Keys**:
- `admin-template-theme`: Theme preference (existing)
- `admin-template-sidebar-collapsed`: Sidebar state (existing)
- `plan-visualizer-installation-state`: InstallationState JSON

**Contract**:
```typescript
interface InstallationStateStorage {
  isInstalled: boolean
  installedAt: number | null
  installPromptDismissed: boolean
  installPromptDismissedAt: number | null
  platform: 'desktop' | 'mobile' | null
}
```

---

## React Hook Contracts

### useServiceWorker Hook

**Purpose**: Manage Service Worker registration and lifecycle.

**Returns**:
```typescript
interface UseServiceWorkerReturn {
  isRegistered: boolean
  isUpdateAvailable: boolean
  registration: ServiceWorkerRegistration | null
  error: Error | null
  update: () => Promise<void>
}
```

---

### useOffline Hook

**Purpose**: Track network connectivity status.

**Returns**:
```typescript
interface UseOfflineReturn {
  isOnline: boolean
  isOffline: boolean
  lastOnlineAt: Date | null
  lastOfflineAt: Date | null
}
```

---

### useInstallPrompt Hook

**Purpose**: Detect installability and trigger installation.

**Returns**:
```typescript
interface UseInstallPromptReturn {
  canInstall: boolean
  isInstalled: boolean
  prompt: () => Promise<InstallPromptResult>
  dismiss: () => void
}

interface InstallPromptResult {
  outcome: 'accepted' | 'dismissed'
  platform: string
}
```

---

### useStorageQuota Hook

**Purpose**: Monitor storage quota and usage.

**Returns**:
```typescript
interface UseStorageQuotaReturn {
  quota: number | null
  usage: number | null
  usagePercent: number | null
  isNearQuota: boolean        // true if usage > 80%
  refresh: () => Promise<void>
}
```

---

## Error Handling

### Storage Errors

**QuotaExceededError**: Thrown when storage quota is exceeded
- **Handling**: Show user-friendly error, offer to clear old data
- **Recovery**: User can delete old plans or clear cache

### Service Worker Errors

**RegistrationError**: Thrown when Service Worker registration fails
- **Handling**: Log error, continue with online-only mode
- **Recovery**: Application still works, just without offline capability

### IndexedDB Errors

**DatabaseError**: Thrown when IndexedDB operations fail
- **Handling**: Show error message, fall back to in-memory storage
- **Recovery**: Data lost for current session, but app continues to work

---

## Testing Contracts

### Mock Implementations

For testing, mock browser APIs:
- `navigator.serviceWorker`: Mock registration and events
- `navigator.storage`: Mock quota estimates
- `window.indexedDB`: Mock database operations
- `beforeinstallprompt`: Mock install prompt event

### Test Data

- Sample plan data for IndexedDB operations
- Mock Service Worker registration states
- Mock storage quota scenarios (low, medium, high usage)

