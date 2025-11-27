# Data Model: Lightweight React SPA Admin Template

**Feature**: 001-admin-template  
**Date**: 2025-11-26  
**Source**: Entities from [spec.md](./spec.md) Key Entities section

## Overview

This template uses **in-memory state** only. There is no database or API persistence. All entities
are TypeScript interfaces representing the shape of data stored in Zustand stores. Data is seeded
on application load and lost on page refresh.

**Storage Strategy**:
- Sample data (Users, Activities): Zustand store, seeded at app init
- User preferences (Theme): localStorage, synced via Zustand
- UI state (Sidebar collapse, Modal open): Local component state or Zustand

## Entity Definitions

### User

Represents a sample user record for the data table demonstration.

```typescript
interface User {
  id: string;              // UUID, unique identifier
  name: string;            // Full name, required
  email: string;           // Email address, must be valid format
  role: UserRole;          // Enum: admin | editor | viewer
  status: UserStatus;      // Enum: active | inactive | pending
  createdAt: Date;         // Account creation timestamp
  avatar: string;          // URL to avatar image (placeholder service)
}

type UserRole = 'admin' | 'editor' | 'viewer';
type UserStatus = 'active' | 'inactive' | 'pending';
```

**Validation Rules**:
- `name`: Required, min 2 characters, max 100 characters
- `email`: Required, valid email format (RFC 5322)
- `role`: Required, must be one of defined roles
- `status`: Required, must be one of defined statuses
- `createdAt`: Auto-generated on creation

**CRUD Operations**:
- Create: Generate UUID, set createdAt, add to store
- Read: Filter, sort, paginate from store
- Update: Merge partial User into existing record by id
- Delete: Remove by id with confirmation

**Seed Data**: 100 sample users generated with Faker-like patterns

---

### MetricCard

Represents a dashboard KPI summary widget.

```typescript
interface MetricCard {
  id: string;              // Unique identifier
  title: string;           // Display label (e.g., "Total Users")
  value: string | number;  // Current metric value
  trend: 'up' | 'down' | 'neutral'; // Direction indicator
  changePercent: number;   // Percentage change (positive or negative)
  icon: string;            // Lucide icon name (e.g., "users", "activity")
}
```

**Validation Rules**:
- `title`: Required, max 50 characters
- `value`: Required, displayed as-is (string) or formatted (number)
- `changePercent`: Number, can be negative

**Seed Data**: 4 default metric cards (Users, Sessions, Revenue, Growth)

---

### NavigationItem

Represents a sidebar menu entry supporting nested groups.

```typescript
interface NavigationItem {
  id: string;              // Unique identifier
  label: string;           // Display text
  icon: string;            // Lucide icon name
  route?: string;          // URL path (undefined for groups)
  children?: NavigationItem[]; // Nested items (for accordion groups)
  badge?: number;          // Optional notification count
}
```

**Validation Rules**:
- `label`: Required, max 30 characters
- `route`: Required if no children, undefined if has children
- `children`: Optional array, max 2 levels deep

**Structure**:
```
Dashboard (/)
Management
  ├── Users (/users)
  └── Products (/products)
Settings
  ├── Profile (/settings/profile)
  └── Preferences (/settings/preferences)
```

---

### Notification (Toast)

Represents a toast notification message.

```typescript
interface Notification {
  id: string;              // UUID, unique identifier
  type: NotificationType;  // success | error | warning | info
  message: string;         // Display text
  duration: number;        // Auto-dismiss time in ms (default: 5000)
  dismissible: boolean;    // Show close button (default: true)
  createdAt: number;       // Timestamp for ordering
}

type NotificationType = 'success' | 'error' | 'warning' | 'info';
```

**Behavior Rules**:
- Auto-dismiss after `duration` ms unless hovered
- Stack vertically in top-right corner
- Max visible: 5 (older ones dismissed)
- Animation: slide-in from right, fade-out on dismiss

---

### Activity

Represents an entry in the dashboard activity feed.

```typescript
interface Activity {
  id: string;              // UUID
  type: ActivityType;      // user_created | user_updated | user_deleted | login | settings_changed
  description: string;     // Human-readable description
  timestamp: Date;         // When the activity occurred
  userId?: string;         // Related user ID (if applicable)
  metadata?: Record<string, unknown>; // Additional context
}

type ActivityType = 
  | 'user_created'
  | 'user_updated'
  | 'user_deleted'
  | 'login'
  | 'settings_changed';
```

**Seed Data**: 20 recent activities for dashboard feed

---

### ThemePreference

Represents the user's theme selection.

```typescript
interface ThemePreference {
  mode: 'light' | 'dark' | 'system';  // User selection
  resolved: 'light' | 'dark';          // Computed from system if mode=system
}
```

**Persistence**: localStorage key `admin-template-theme`

**Behavior**:
- On first load: Check localStorage → fall back to system preference
- On toggle: Update localStorage, apply immediately via CSS class on `<html>`

## State Store Schema

```typescript
// Zustand store structure
interface AppStore {
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;

  // Activities
  activities: Activity[];
  addActivity: (activity: Omit<Activity, 'id' | 'timestamp'>) => void;

  // Metrics
  metrics: MetricCard[];

  // Navigation
  navigationItems: NavigationItem[];
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;

  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  dismissNotification: (id: string) => void;

  // Theme
  theme: ThemePreference;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
}
```

## Relationships

```
┌─────────────┐     references     ┌─────────────┐
│  Activity   │ ─────────────────▶ │    User     │
│  (userId)   │                    │             │
└─────────────┘                    └─────────────┘

┌─────────────┐     self-reference (children)
│ NavItem     │ ─────────────────▶ │ NavItem[]   │
└─────────────┘                    └─────────────┘
```

## Data Lifecycle

| Event | Users | Activities | Metrics | Notifications |
|-------|-------|------------|---------|---------------|
| App Init | Seed 100 | Seed 20 | Seed 4 | Empty |
| CRUD Action | Mutate | Log new | Recalculate | Show toast |
| Page Refresh | Reset to seed | Reset to seed | Reset to seed | Clear |
| Theme Change | — | — | — | — (persists in localStorage) |

## CSV Export Format

When exporting users to CSV:

```csv
id,name,email,role,status,createdAt
uuid-1,John Doe,john@example.com,admin,active,2025-01-15T10:30:00Z
uuid-2,Jane Smith,jane@example.com,editor,active,2025-02-20T14:45:00Z
```

**Export Rules**:
- Headers: lowercase, snake_case
- Dates: ISO 8601 format
- Includes all visible columns based on current filter/sort
- Filename: `users-export-{YYYY-MM-DD}.csv`

