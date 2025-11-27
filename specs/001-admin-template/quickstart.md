# Quickstart: Lightweight React SPA Admin Template

**Feature**: 001-admin-template  
**Date**: 2025-11-26  
**Audience**: Developers setting up and running the admin template

## Prerequisites

- **Node.js**: v18.0.0 or higher (LTS recommended)
- **Package Manager**: npm v9+ or pnpm v8+ (pnpm preferred for speed)
- **Editor**: VS Code with recommended extensions

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "formulahendry.auto-rename-tag",
    "ms-playwright.playwright"
  ]
}
```

## Installation

### 1. Clone and Install

```bash
# Clone the repository
git clone <repository-url> admin-template
cd admin-template

# Install dependencies (pnpm recommended)
pnpm install
# or: npm install
```

### 2. Start Development Server

```bash
pnpm dev
# or: npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Verify Setup

You should see:
- ✅ Dashboard with 4 metric cards
- ✅ Line/bar chart with sample data
- ✅ Activity feed with recent events
- ✅ Collapsible sidebar navigation
- ✅ Theme toggle (top-right corner)

## Project Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server with HMR |
| `pnpm build` | Build for production (output: `dist/`) |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Run ESLint on all files |
| `pnpm format` | Format code with Prettier |
| `pnpm test` | Run unit tests with Vitest |
| `pnpm test:e2e` | Run Playwright E2E tests |
| `pnpm type-check` | Run TypeScript type checking |

## Directory Structure

```text
src/
├── app/                  # App root, router, providers
├── features/             # Feature modules (constitution-compliant)
│   ├── dashboard/        # Dashboard page & widgets
│   ├── users/            # User management & data table
│   ├── navigation/       # Sidebar & routing
│   ├── forms/            # Form components & validation
│   ├── theme/            # Theme switching
│   └── notifications/    # Toast system
├── shared/               # Shared components & utilities
├── data/                 # Sample data seeding
└── main.tsx              # Entry point
```

## Key Files

| File | Purpose |
|------|---------|
| `src/app/App.tsx` | Root component with layout |
| `src/app/router.tsx` | Route definitions |
| `src/app/providers.tsx` | Context providers |
| `src/data/seed.ts` | Sample data generator |
| `tailwind.config.js` | Tailwind configuration |
| `vite.config.ts` | Vite build configuration |

## Common Tasks

### Add a New Page

1. Create feature folder: `src/features/your-feature/`
2. Add components: `src/features/your-feature/components/YourPage.tsx`
3. Register route in `src/app/router.tsx`
4. Add navigation item in `src/data/seed.ts` (navigationItems)

### Add a New Form Field

1. Create component in `src/features/forms/components/`
2. Follow the pattern from `TextField.tsx`
3. Register with React Hook Form via `Controller` or `register`
4. Add Zod validation in form schema

### Customize Theme Colors

Edit CSS variables in `src/features/theme/styles/theme.css`:

```css
:root {
  --color-primary: 59 130 246;    /* blue-500 */
  --color-background: 255 255 255; /* white */
  /* ... */
}

.dark {
  --color-primary: 96 165 250;    /* blue-400 */
  --color-background: 17 24 39;   /* gray-900 */
  /* ... */
}
```

### Add Sample Data

Edit `src/data/seed.ts` to modify initial data:

```typescript
export const seedUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', ... },
  // Add more users
];
```

### Export Table Data as CSV

The data table includes a built-in export button. To customize:

```typescript
// src/features/users/utils/exportCsv.ts
export function exportUsersAsCsv(users: User[]) {
  const headers = ['id', 'name', 'email', 'role', 'status', 'createdAt'];
  // ... CSV generation logic
}
```

## Development Tips

### Hot Module Replacement (HMR)

Vite provides instant updates. If HMR fails:
1. Check console for errors
2. Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)

### TypeScript Errors

Run type checking separately for faster feedback:

```bash
pnpm type-check --watch
```

### Tailwind IntelliSense

Ensure the Tailwind CSS extension is installed for autocomplete. If not working:
1. Restart VS Code
2. Check `tailwind.config.js` is at project root

### State Debugging

Zustand devtools are enabled in development:
1. Install Redux DevTools browser extension
2. Open DevTools → Redux tab
3. See state tree and actions

## Deployment

### Static Hosting (Vercel, Netlify, Cloudflare Pages)

```bash
pnpm build
# Upload `dist/` folder to your hosting provider
```

### Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Environment Variables

No environment variables required for this template (no backend).

For future extensions, use `.env` files:

```bash
# .env.local (ignored by git)
VITE_API_URL=https://api.example.com
```

Access in code: `import.meta.env.VITE_API_URL`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5173 in use | Run `pnpm dev -- --port 3000` |
| Module not found | Delete `node_modules`, run `pnpm install` |
| Types not recognized | Restart TypeScript server in VS Code |
| Styles not applying | Check Tailwind content paths in config |
| Tests failing | Ensure test files match `*.test.tsx` pattern |

## Next Steps

1. **Customize branding**: Update colors in theme.css, add logo
2. **Add real data source**: Replace Zustand seed with API calls
3. **Implement authentication**: Add auth feature folder
4. **Extend forms**: Add more field types as needed
5. **Deploy**: Push to your preferred hosting platform

---

**Need help?** Check the [spec.md](./spec.md) for requirements or [plan.md](./plan.md) for
architecture decisions.

