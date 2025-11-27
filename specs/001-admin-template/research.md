# Research: Lightweight React SPA Admin Template

**Feature**: 001-admin-template  
**Date**: 2025-11-26  
**Purpose**: Resolve technology choices and document decisions with rationale

## Technology Decisions

### 1. Build Tool: Vite

**Decision**: Use Vite 5.x as the build tool and dev server.

**Rationale**:
- Native ES modules for instant dev server startup
- Lightning-fast HMR (Hot Module Replacement)
- Built-in TypeScript support without additional config
- Tree-shaking and code splitting out of the box
- Aligns with constitution's "Vite recommended" guideline

**Alternatives Considered**:
- **Create React App**: Deprecated, slow builds, ejection complexity
- **Next.js**: Overkill for SPA with no SSR/SSG requirements; adds routing complexity
- **Parcel**: Good zero-config, but Vite has better React ecosystem support

### 2. State Management: Zustand

**Decision**: Use Zustand for global client state (theme, sample data store).

**Rationale**:
- Minimal boilerplate compared to Redux
- No providers required (works outside React tree)
- Built-in devtools support
- TypeScript-first design
- Constitution allows "Zustand (sparingly)" for global client state

**Alternatives Considered**:
- **Redux Toolkit**: Excessive boilerplate for this scope; designed for complex state
- **Jotai/Recoil**: Atomic model adds mental overhead for simple global state
- **React Context only**: Leads to performance issues with frequent updates (causes tree re-renders)
- **TanStack Query**: Designed for server state; this project has no server

**Usage Scope**:
- Theme preference (light/dark) — synced with localStorage
- Sample data store (users, activities) — in-memory CRUD
- Sidebar collapse state — persist across navigation

### 3. Data Table: TanStack Table v8

**Decision**: Use TanStack Table (formerly React Table) for data table functionality.

**Rationale**:
- Headless UI approach aligns with Constitution Principle V (Logic Extraction)
- Full control over rendering with Tailwind
- Built-in sorting, filtering, pagination primitives
- TypeScript-first with excellent type inference
- No runtime CSS — works perfectly with Tailwind

**Alternatives Considered**:
- **AG Grid**: Powerful but heavy (~200KB), overkill for demo template
- **MUI DataGrid**: Tied to MUI ecosystem, adds runtime CSS overhead
- **Custom implementation**: Reinventing sorting/pagination logic is error-prone

### 4. Charts: Recharts

**Decision**: Use Recharts for dashboard data visualization.

**Rationale**:
- React-native (components, not imperative API)
- Declarative and composable
- Responsive by default
- Good TypeScript support
- Reasonable bundle size (~40KB gzipped)

**Alternatives Considered**:
- **Chart.js + react-chartjs-2**: Imperative API feels un-React-like
- **Victory**: Verbose API for simple charts
- **D3 directly**: Too low-level for this use case; would need wrapper
- **Nivo**: Beautiful but heavier bundle

### 5. Forms: React Hook Form + Zod

**Decision**: Use React Hook Form for form state, Zod for schema validation.

**Rationale**:
- React Hook Form: Uncontrolled inputs for performance, minimal re-renders
- Zod: TypeScript-first schema validation, excellent inference
- Native integration via `@hookform/resolvers/zod`
- Aligns with Constitution Principle V (logic in hooks, UI separate)

**Alternatives Considered**:
- **Formik**: More re-renders, larger bundle, older API patterns
- **Native controlled inputs**: Performance issues at scale, no validation abstraction
- **Yup**: Less TypeScript-native than Zod, similar functionality

### 6. Icons: Lucide React

**Decision**: Use Lucide React for iconography.

**Rationale**:
- Tree-shakeable (only import used icons)
- Consistent stroke-based design
- TypeScript types for all icons
- Drop-in replacement for Feather icons with more options

**Alternatives Considered**:
- **Heroicons**: Good but fewer icons available
- **React Icons**: Bundle includes all icon sets, tree-shaking less effective
- **FontAwesome**: Requires account for Pro icons, heavier

### 7. Routing: React Router v6

**Decision**: Use React Router v6 for client-side routing.

**Rationale**:
- De facto standard for React SPAs
- Nested routes and layouts built-in
- Data router patterns available (though not needed here)
- Active link styling with `NavLink`

**Alternatives Considered**:
- **TanStack Router**: Excellent but newer, less ecosystem support for templates
- **Wouter**: Minimal but lacks nested route support needed for admin layout

### 8. CSS: Tailwind CSS v3

**Decision**: Use Tailwind CSS with PostCSS.

**Rationale**:
- Constitution requires "Tailwind CSS or zero-runtime CSS solution"
- Utility-first enables rapid prototyping
- No runtime overhead (compiled at build time)
- Dark mode support via `dark:` variants
- Responsive utilities built-in (`sm:`, `md:`, `lg:`)

**Tailwind Plugins**:
- `@tailwindcss/forms`: Reset form element styles
- `tailwind-merge`: Safe class merging for component props

### 9. Testing Strategy

**Decision**: Vitest (unit/integration) + React Testing Library + Playwright (E2E)

**Rationale**:
- **Vitest**: Vite-native, shares config, fastest for this stack
- **React Testing Library**: Tests user behavior, not implementation
- **Playwright**: Cross-browser E2E, better than Cypress for modern apps

**Test Coverage Targets**:
- Unit: Hooks (useUserTable, useTheme, useNotifications)
- Integration: Feature flows (CRUD on table, form submission)
- E2E: Critical paths (dashboard load, search, theme switch)

## Dependency Summary

| Package | Version | Purpose | Bundle Impact |
|---------|---------|---------|---------------|
| react | ^18.2.0 | UI framework | ~42KB |
| react-router-dom | ^6.20.0 | Routing | ~14KB |
| zustand | ^4.4.0 | State management | ~3KB |
| @tanstack/react-table | ^8.10.0 | Data tables | ~15KB |
| recharts | ^2.10.0 | Charts | ~40KB |
| react-hook-form | ^7.48.0 | Forms | ~9KB |
| zod | ^3.22.0 | Validation | ~12KB |
| lucide-react | ^0.294.0 | Icons (tree-shaken) | ~2KB (used) |
| tailwindcss | ^3.3.0 | Styling | 0KB runtime |

**Estimated Total**: ~137KB gzipped (well under 500KB target)

## Open Questions Resolved

| Question | Resolution |
|----------|------------|
| CSV export library? | Native Blob + download attribute; no library needed |
| Date picker library? | Custom component with native `<input type="date">` + Tailwind styling |
| Animation library? | Tailwind transitions + CSS animations; no Framer Motion needed |
| Modal implementation? | Headless UI Dialog or custom with portal; keep it simple |

## Not Included (Out of Scope)

- Server-side rendering (Vite SPA mode only)
- Authentication/authorization (template assumes authorized access)
- Internationalization (English hardcoded per clarification)
- Backend API mocking (in-memory Zustand store is sufficient)
- PWA features (service worker, offline support)

