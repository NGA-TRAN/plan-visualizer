# Quick Start: Offline Multi-Platform Support

**Feature**: 003-offline-multi-platform  
**Date**: 2025-01-27

## Overview

This guide provides a quick start for implementing offline capability, desktop installation, and mobile platform support for the Plan Visualizer application.

## Prerequisites

- Existing React SPA with Vite build system
- TypeScript 5.9+
- React 18.3+
- Tailwind CSS 4.1+

## Installation Steps

### 1. Install Dependencies

```bash
npm install vite-plugin-pwa workbox-precaching workbox-window
npm install -D @types/workbox-precaching @types/workbox-window
```

Optional (for better IndexedDB DX):
```bash
npm install idb
```

### 2. Configure Vite PWA Plugin

Update `vite.config.ts`:

```typescript
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Plan Visualizer',
        short_name: 'PlanViz',
        description: 'Visualize DataFusion execution plans',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: []
      }
    })
  ]
})
```

### 3. Create Web App Manifest

Create `public/manifest.json`:

```json
{
  "name": "Plan Visualizer",
  "short_name": "PlanViz",
  "description": "Visualize DataFusion execution plans",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#3b82f6",
  "orientation": "any",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

### 4. Add PWA Meta Tags to HTML

Update `index.html`:

```html
<head>
  <!-- Existing meta tags -->
  
  <!-- PWA Meta Tags -->
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#3b82f6" />
  
  <!-- iOS PWA Support -->
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="default" />
  <meta name="apple-mobile-web-app-title" content="Plan Visualizer" />
  <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
</head>
```

### 5. Create PWA Icons

Generate and place icons in `public/icons/`:
- `icon-192x192.png` (192x192 pixels)
- `icon-512x512.png` (512x512 pixels)
- `apple-touch-icon.png` (180x180 pixels for iOS)

### 6. Create Offline Feature Structure

```text
src/features/offline/
├── components/
│   ├── OfflineIndicator.tsx
│   ├── InstallPrompt.tsx
│   └── StorageQuotaWarning.tsx
├── hooks/
│   ├── useServiceWorker.ts
│   ├── useOffline.ts
│   ├── useInstallPrompt.ts
│   └── useStorageQuota.ts
├── services/
│   ├── cacheManager.ts
│   └── storageManager.ts
└── types/
    └── index.ts
```

### 7. Implement Core Hooks

#### useOffline Hook

```typescript
// src/features/offline/hooks/useOffline.ts
import { useState, useEffect } from 'react'

export function useOffline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])
  
  return { isOnline, isOffline: !isOnline }
}
```

#### useInstallPrompt Hook

```typescript
// src/features/offline/hooks/useInstallPrompt.ts
import { useState, useEffect } from 'react'

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstalled, setIsInstalled] = useState(false)
  
  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
    }
    
    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])
  
  const prompt = async () => {
    if (!deferredPrompt) return null
    
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    setDeferredPrompt(null)
    
    return { outcome }
  }
  
  return {
    canInstall: !!deferredPrompt && !isInstalled,
    isInstalled,
    prompt
  }
}
```

### 8. Add Offline Indicator Component

```typescript
// src/features/offline/components/OfflineIndicator.tsx
import { useOffline } from '../hooks/useOffline'

export function OfflineIndicator() {
  const { isOffline } = useOffline()
  
  if (!isOffline) return null
  
  return (
    <div className="fixed top-0 left-0 right-0 bg-amber-500 text-white px-4 py-2 text-center text-sm z-50">
      You are currently offline. Some features may be limited.
    </div>
  )
}
```

### 9. Add Install Prompt Component

```typescript
// src/features/offline/components/InstallPrompt.tsx
import { useInstallPrompt } from '../hooks/useInstallPrompt'
import { useState } from 'react'

export function InstallPrompt() {
  const { canInstall, prompt } = useInstallPrompt()
  const [dismissed, setDismissed] = useState(false)
  
  if (!canInstall || dismissed) return null
  
  const handleInstall = async () => {
    await prompt()
    setDismissed(true)
  }
  
  return (
    <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg max-w-sm">
      <h3 className="font-semibold mb-2">Install Plan Visualizer</h3>
      <p className="text-sm mb-3">Install for quick access and offline use</p>
      <div className="flex gap-2">
        <button onClick={handleInstall} className="px-4 py-2 bg-white text-blue-600 rounded">
          Install
        </button>
        <button onClick={() => setDismissed(true)} className="px-4 py-2 text-white">
          Not now
        </button>
      </div>
    </div>
  )
}
```

### 10. Integrate into App

Update `src/app/App.tsx` or root component:

```typescript
import { OfflineIndicator } from '@/features/offline/components/OfflineIndicator'
import { InstallPrompt } from '@/features/offline/components/InstallPrompt'

export function App() {
  return (
    <>
      <OfflineIndicator />
      {/* Existing app content */}
      <InstallPrompt />
    </>
  )
}
```

## Testing

### Test Offline Mode

1. Build application: `npm run build`
2. Serve with HTTPS (required for Service Worker):
   ```bash
   npm run preview
   ```
3. Open browser DevTools → Network tab
4. Check "Offline" checkbox
5. Refresh page - application should load from cache
6. Test plan visualization - should work offline

### Test Installation

1. Build and serve application
2. Look for install prompt or browser install button
3. Install application
4. Launch installed app - should open in standalone mode
5. Verify app icon appears in system menu

### Test Mobile Responsiveness

1. Open browser DevTools → Device Toolbar
2. Test various screen sizes (320px, 768px, 1024px, 1920px)
3. Verify layout adapts correctly
4. Test touch interactions on mobile viewport

## Next Steps

1. Implement IndexedDB storage for plan data
2. Add storage quota monitoring
3. Enhance mobile UI optimizations
4. Add offline-first data persistence
5. Test on actual mobile devices

## Troubleshooting

### Service Worker Not Registering

- Ensure application is served over HTTPS (or localhost)
- Check browser console for registration errors
- Verify `vite.config.ts` PWA plugin configuration

### Installation Not Available

- Check browser support (Chrome/Edge best support)
- Verify manifest.json is accessible
- Ensure all required manifest fields are present
- Check that icons are properly sized and accessible

### Offline Mode Not Working

- Verify Service Worker is registered (check DevTools → Application → Service Workers)
- Check cache is populated (DevTools → Application → Cache Storage)
- Ensure resources are being cached (check Workbox logs)

## Resources

- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Web App Manifest](https://web.dev/add-manifest/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [PWA Checklist](https://web.dev/pwa-checklist/)

