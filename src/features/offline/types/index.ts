// Offline Feature Types
// Type definitions for offline functionality, PWA support, and local storage

/**
 * Plan data stored in IndexedDB for offline access
 */
export interface PlanData {
  id: string
  planText: string
  visualizationData: any // Excalidraw scene data
  createdAt: Date
  updatedAt: Date
}

/**
 * Installation state persisted in localStorage
 */
export interface InstallationState {
  isInstalled: boolean
  installedAt: number | null // timestamp
  installPromptDismissed: boolean
  installPromptDismissedAt: number | null // timestamp
  platform: 'desktop' | 'mobile' | null
}

/**
 * Connectivity status (runtime only, not persisted)
 */
export interface ConnectivityStatus {
  isOnline: boolean
  lastOnlineAt: Date | null
  lastOfflineAt: Date | null
}

/**
 * Storage quota information (runtime only, from StorageManager API)
 */
export interface StorageQuota {
  quota: number | null // Total quota in bytes
  usage: number | null // Current usage in bytes
  usagePercent: number | null // Usage as percentage (0-100)
  lastChecked: Date
}

