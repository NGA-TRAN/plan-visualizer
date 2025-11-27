<!--
=============================================================================
SYNC IMPACT REPORT
=============================================================================
Version Change: (none) → 1.0.0

Modified Principles: N/A (initial constitution)

Added Sections:
  - Core Principles (5 principles for Modern React SPAs 2025)
  - Technology Constraints (React/TanStack Query requirements)
  - Code Review Gates (mandatory checklist)
  - Governance (amendment procedures)

Removed Sections: N/A (initial constitution)

Templates Status:
  ✅ .specify/templates/plan-template.md - Compatible (Constitution Check section exists)
  ✅ .specify/templates/spec-template.md - Compatible (no conflicts)
  ✅ .specify/templates/tasks-template.md - Compatible (feature-based structure supported)

Follow-up TODOs: None

Sources: *Advanced React*, *The Conscious React Book*, *A Philosophy of Software Design*
=============================================================================
-->

# Plan Visualizer Constitution

## Core Principles

### I. Deep Module Architecture

Components MUST have a simple interface (props) but provide powerful functionality internally.
AVOID "passthrough" components that merely forward props down the tree.

**Rationale:** From *A Philosophy of Software Design* — shallow modules expose internal complexity
through excessive props, creating tight coupling and cognitive overhead. Deep modules encapsulate
complexity behind a minimal interface.

**Anti-pattern:**

```tsx
<Card title={t} body={b} footer={f} onHover={h} onClick={c} style={s} />
```

**Correct pattern:**

```tsx
<ProductCard id="123" />
```

The deep component handles its own data fetching, formatting, events, and styling internally.

### II. Render-as-You-Fetch Performance

Data fetching MUST be treated as an architectural constraint, not a "fix it later" optimization.
Fetching MUST be moved outside the render lifecycle where possible.

**Rationale:** From *Advanced React* — performance problems are render path problems.
Waterfalls (Component A fetches → renders Component B → fetches) destroy perceived performance.

**Requirements:**

- AVOID: Fetch waterfalls where child components wait for parents to render before fetching
- ADOPT: Parallel fetching via TanStack Query (React Query) or equivalent
- ADOPT: Route-level data loading or prefetching patterns

**Key Insight:** Optimization is not about `useMemo` everywhere; it's about fixing the render path.

### III. State Colocation

State MUST live as close to where it is used as possible.
State categories MUST be respected without exception.

**Rationale:** From *The Conscious React Book* — misplaced state creates unnecessary re-renders,
prop drilling, and debugging complexity.

**State Categories:**

| Type | Location | Examples |
|------|----------|----------|
| **UI State** | `useState` inside component | `isModalOpen`, `inputValue`, `isHovered` |
| **Server State** | TanStack Query / SWR | User data, Products list, API responses |
| **Global Client State** | Context or Zustand (sparingly) | Theme, Auth Token, Feature Flags |

**NEVER** put server state in Redux/Zustand manually. Server state synchronization is the job of
a dedicated library.

### IV. Feature-Based Code Organization

Code MUST be organized by business value (feature), not by technical type.

**Rationale:** When you delete a feature, you delete one folder. Technical-type organization
(components/, hooks/, utils/) forces hunting across multiple directories.

**Required Structure:**

```text
src/
  features/
    auth/
      components/
      hooks/
      api/
    checkout/
      components/
      logic/
    dashboard/
      components/
      hooks/
```

**Prohibited:** Top-level `/components`, `/hooks`, `/utils` folders that mix concerns from
multiple features.

**Exception:** Truly shared utilities (e.g., date formatting, generic UI primitives) MAY live in
`src/shared/` or `src/lib/`.

### V. Headless UI / Logic Extraction

Behavior MUST be separated from rendering when a component exceeds 150 lines.

**Rationale:** Separating logic into custom hooks makes UI "dumb" and logic independently testable
without a browser or React Testing Library overhead.

**Pattern:**

```text
useDragAndDrop.ts  → Handles math, event listeners, state
DraggableItem.tsx  → Handles purely JSX/Tailwind classes
```

**Requirements:**

- Logic hooks MUST be unit-testable without rendering
- Components using logic hooks SHOULD be purely presentational
- Complex state machines MUST be extracted into hooks or dedicated state logic files

## Technology Constraints

**Framework:** React 18+ with functional components only. Class components are PROHIBITED.

**Data Fetching:** TanStack Query (React Query) v5+ is the REQUIRED server state solution.
Direct `useEffect` + `fetch` patterns for server data are PROHIBITED except in TanStack Query
custom query functions.

**Styling:** Tailwind CSS preferred. CSS-in-JS solutions MUST NOT add runtime overhead.

**State Management:**

- Local UI: `useState`, `useReducer`
- Server: TanStack Query
- Global Client: Zustand or React Context (justify usage)

**Bundling:** Vite recommended. Tree-shaking MUST be enabled for production builds.

## Code Review Gates

Every PR MUST pass these constitution checks before merge:

- [ ] **Interface Check:** Does any component require more than 5 props to function?
  If yes → Refactor to be "deeper" (encapsulate complexity internally)

- [ ] **Fetch Check:** Is any component waiting for a parent to finish rendering before it starts
  fetching data? If yes → Lift the fetch, use prefetching, or parallelize with TanStack Query

- [ ] **Colocation Check:** Is any state in global store (Redux/Zustand/Context) "just because we
  might need it later"? If yes → Move it to local state until actually shared

- [ ] **Structure Check:** Are new files placed in the correct feature folder?
  If no → Move to appropriate `src/features/<feature>/` location

- [ ] **Extraction Check:** Does any component exceed 150 lines?
  If yes → Extract logic into a custom hook

## Governance

This constitution supersedes all other development practices for the Plan Visualizer project.

**Amendment Procedure:**

1. Proposed changes MUST be documented with rationale
2. Changes MUST include migration guidance for existing code
3. Version MUST be incremented per semantic versioning:
   - MAJOR: Principle removal or backward-incompatible redefinition
   - MINOR: New principle added or existing principle materially expanded
   - PATCH: Clarifications, wording improvements, typo fixes

**Compliance:**

- All PRs MUST verify compliance with Code Review Gates
- Violations MUST be justified in the PR description with a Complexity Tracking entry
- Recurring violations indicate need for constitution amendment, not exceptions

**Version**: 1.0.0 | **Ratified**: 2025-11-26 | **Last Amended**: 2025-11-26
