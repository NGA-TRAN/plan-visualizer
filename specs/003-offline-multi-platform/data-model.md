# Data Model: Offline Multi-Platform Support

**Feature**: 003-offline-multi-platform  
**Date**: 2025-01-27

## Overview

This feature extends the existing application with offline capabilities and multi-platform support. The data model focuses on local storage entities for offline functionality, installation state, and connectivity status.

## Entities

### 1. CachedApplicationResource

**Purpose**: Represents application resources cached by Service Worker for offline access.

**Storage**: Cache API (via Service Worker)

**Attributes**:
- **url**: string - Resource URL/path
- **version**: string - Cache version (managed by Workbox)
- **cachedAt**: timestamp - When resource was cached
- **size**: number - Resource size in bytes

**Relationships**: None (managed by Service Worker cache)

**Validation Rules**:
- URL must be valid and same-origin
- Version must match current application version

**State Transitions**:
- **Uncached** → **Cached**: When Service Worker caches resource
- **Cached** → **Stale**: When new version deployed
- **Stale** → **Cached**: When cache updated to new version

---

### 2. UserPreferences

**Purpose**: User interface preferences persisted locally across sessions.

**Storage**: localStorage

**Attributes**:
- **theme**: 'light' | 'dark' | 'system' - Theme preference
- **sidebarCollapsed**: boolean - Sidebar state
- **lastVisited**: timestamp - Last application access time

**Relationships**: None (standalone preferences)

**Validation Rules**:
- Theme must be one of: 'light', 'dark', 'system'
- sidebarCollapsed must be boolean

**State Transitions**: None (simple key-value storage)

**Existing Integration**: Already implemented in Zustand store, will persist to localStorage

---

### 3. PlanData

**Purpose**: User-entered plan text and generated visualization data stored locally for offline access.

**Storage**: IndexedDB

**Attributes**:
- **id**: string - Unique identifier (auto-generated)
- **planText**: string - Original DataFusion execution plan text
- **visualizationData**: object - Generated Excalidraw scene data
- **createdAt**: timestamp - When plan was created/visualized
- **updatedAt**: timestamp - Last modification time

**Relationships**: None (standalone plan entries)

**Validation Rules**:
- planText must be non-empty string
- visualizationData must be valid Excalidraw scene object
- createdAt must be valid timestamp

**State Transitions**:
- **Created**: When user visualizes a plan
- **Updated**: When user re-visualizes same plan (optional, may create new entry)

**Indexes**:
- **createdAt**: For sorting by creation date
- **updatedAt**: For finding recently used plans

---

### 4. InstallationState

**Purpose**: Tracks whether application is installed and installation-related metadata.

**Storage**: localStorage

**Attributes**:
- **isInstalled**: boolean - Whether app is currently installed
- **installedAt**: timestamp | null - When app was installed
- **installPromptDismissed**: boolean - Whether user dismissed install prompt
- **installPromptDismissedAt**: timestamp | null - When prompt was dismissed
- **platform**: 'desktop' | 'mobile' | null - Platform where installed

**Relationships**: None

**Validation Rules**:
- isInstalled must be boolean
- If isInstalled is true, installedAt must be valid timestamp
- platform must be one of: 'desktop', 'mobile', null

**State Transitions**:
- **Not Installed** → **Installed**: When user installs application
- **Installed** → **Not Installed**: When user uninstalls (rare, but possible)

---

### 5. ConnectivityStatus

**Purpose**: Current network connectivity state (runtime only, not persisted).

**Storage**: Component state (React useState)

**Attributes**:
- **isOnline**: boolean - Current online/offline status
- **lastOnlineAt**: timestamp | null - Last time connection was online
- **lastOfflineAt**: timestamp | null - Last time connection went offline

**Relationships**: None (ephemeral state)

**Validation Rules**:
- isOnline must be boolean
- Timestamps must be valid if not null

**State Transitions**:
- **Online** → **Offline**: When network disconnects
- **Offline** → **Online**: When network reconnects

**Note**: This is runtime state only, not persisted to storage.

---

### 6. StorageQuota

**Purpose**: Storage quota and usage information (runtime only, not persisted).

**Storage**: Component state (React useState)

**Attributes**:
- **quota**: number | null - Total storage quota in bytes
- **usage**: number | null - Current storage usage in bytes
- **usagePercent**: number | null - Usage as percentage of quota
- **lastChecked**: timestamp - When quota was last checked

**Relationships**: None (ephemeral state)

**Validation Rules**:
- quota and usage must be positive numbers if not null
- usagePercent must be between 0 and 100 if not null

**State Transitions**: None (computed from StorageManager API)

**Note**: This is runtime state only, refreshed from StorageManager.estimate() API.

---

## Storage Schema

### IndexedDB Database: `planVisualizerDB`

**Version**: 1

**Object Stores**:

1. **plans**
   - **Key Path**: `id` (string, auto-increment)
   - **Indexes**:
     - `createdAt` (timestamp, unique: false)
     - `updatedAt` (timestamp, unique: false)
   - **Data**: PlanData entities

### localStorage Keys

- `plan-visualizer-theme`: Theme preference
- `plan-visualizer-sidebar-collapsed`: Sidebar state
- `plan-visualizer-installation-state`: InstallationState JSON
- `plan-visualizer-install-prompt-dismissed`: Boolean flag

### Cache API (Service Worker)

- **Cache Name**: `plan-visualizer-v{version}`
- **Contents**: Application resources (HTML, CSS, JS, assets)
- **Managed By**: Workbox precaching

---

## Data Flow

### Plan Visualization Flow

1. User enters plan text → Stored in component state
2. User clicks "Visualize" → Plan converted to visualization
3. Plan data saved to IndexedDB → Persists for offline access
4. Visualization rendered → Uses cached or new data

### Offline Access Flow

1. User goes offline → ConnectivityStatus updates
2. User accesses application → Service Worker serves cached resources
3. User enters plan → Stored in IndexedDB (works offline)
4. User visualizes plan → Uses plan-viz library (works offline)
5. Visualization rendered → Uses IndexedDB data if available

### Installation Flow

1. User visits application → beforeinstallprompt event fired
2. User sees install prompt → InstallationState updated
3. User installs → InstallationState.isInstalled = true
4. User launches installed app → Opens in standalone mode

---

## Migration Considerations

### Existing Data

- **User Preferences**: Already in localStorage, no migration needed
- **Plan Data**: New feature, no existing data to migrate

### Future Migrations

- **IndexedDB Versioning**: Use versioned database schema for future changes
- **Cache Invalidation**: Workbox handles cache versioning automatically
- **Preference Migration**: Add migration logic if preference structure changes

---

## Data Retention

- **Plan Data**: Retained indefinitely (user-controlled, can be cleared manually)
- **Cached Resources**: Managed by Service Worker, updated on app updates
- **User Preferences**: Retained indefinitely
- **Installation State**: Retained indefinitely

---

## Privacy & Security

- **Data Isolation**: All data stored locally, never transmitted to server
- **Origin Scoped**: IndexedDB and Cache API are origin-scoped
- **No Personal Data**: Plan data is user-provided content, no PII collected
- **Storage Quota**: Respects browser storage limits, warns before quota exceeded

