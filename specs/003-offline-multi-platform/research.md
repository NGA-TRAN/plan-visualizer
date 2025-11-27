# Research: Offline Multi-Platform Support

**Feature**: 003-offline-multi-platform  
**Date**: 2025-01-27  
**Purpose**: Resolve technology choices for offline capability, desktop installation, and mobile platform support

## Technology Decisions

### 1. Progressive Web App (PWA) Architecture

**Decision**: Implement as a Progressive Web App (PWA) using Service Workers, Web App Manifest, and modern web APIs.

**Rationale**:
- Single codebase works across desktop and mobile platforms
- Native app-like experience without app store distribution
- Offline-first architecture aligns with requirements
- Standard web technologies (no native code required)
- Installable on desktop (Windows, macOS, Linux) and mobile (iOS, Android)
- Works with existing React SPA architecture

**Alternatives Considered**:
- **Native mobile apps (React Native)**: Rejected - requires separate codebase, app store distribution, and doesn't address desktop
- **Electron/Tauri desktop wrapper**: Rejected - adds significant bundle size, maintenance overhead, and doesn't address mobile
- **Hybrid approach (PWA + native wrappers)**: Rejected - unnecessary complexity when PWA meets all requirements

---

### 2. Service Worker Implementation

**Decision**: Use Workbox library for Service Worker generation and management.

**Rationale**:
- Industry-standard PWA library maintained by Google
- Provides caching strategies out-of-the-box (CacheFirst, NetworkFirst, StaleWhileRevalidate)
- Integrates well with Vite build process via vite-plugin-pwa
- Handles Service Worker registration, updates, and lifecycle automatically
- Reduces boilerplate and common pitfalls
- Supports precaching of application resources

**Alternatives Considered**:
- **Manual Service Worker implementation**: Rejected - requires significant boilerplate, error-prone, harder to maintain
- **sw-precache-webpack-plugin**: Rejected - Webpack-specific, project uses Vite
- **Custom Service Worker**: Rejected - reinventing the wheel, higher maintenance burden

**Implementation Pattern**:
```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

export default {
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        runtimeCaching: [/* strategies */]
      }
    })
  ]
}
```

---

### 3. Local Data Storage

**Decision**: Use IndexedDB for plan data and visualization state, localStorage for user preferences.

**Rationale**:
- IndexedDB supports larger storage quotas than localStorage (can store MBs of data)
- Asynchronous API prevents blocking UI thread
- Structured data storage suitable for plan visualization data
- localStorage sufficient for simple preferences (theme, sidebar state)
- Both persist across browser sessions and work offline

**Alternatives Considered**:
- **localStorage only**: Rejected - 5-10MB quota limit insufficient for larger plans, synchronous API blocks UI
- **WebSQL**: Rejected - Deprecated standard, not supported in modern browsers
- **File System Access API**: Rejected - Limited browser support, overkill for this use case
- **Cloud storage sync**: Rejected - Out of scope per spec (no server-side sync)

**Storage Strategy**:
- **IndexedDB**: Plan text, generated visualization data, cached Excalidraw scenes
- **localStorage**: Theme preferences, sidebar collapsed state, UI preferences
- **Cache API**: Application resources (HTML, CSS, JS, assets) via Service Worker

---

### 4. Offline Caching Strategy

**Decision**: Use CacheFirst strategy for application resources, NetworkFirst for external resources (if any).

**Rationale**:
- CacheFirst ensures instant offline access to application code and assets
- NetworkFirst allows updates when online while falling back to cache
- Application is client-side only (no external API dependencies)
- All processing happens locally (plan-viz conversion is synchronous)

**Caching Patterns**:
- **Application bundle**: CacheFirst (HTML, CSS, JS) - always serve from cache when available
- **Static assets**: CacheFirst (icons, fonts) - rarely change, cache forever
- **User data**: IndexedDB - persists independently of cache

**Cache Invalidation**:
- Service Worker updates automatically when new version deployed
- Workbox handles versioning and cache updates
- User data in IndexedDB persists across updates

---

### 5. Web App Manifest

**Decision**: Create comprehensive Web App Manifest with icons, display mode, and installation metadata.

**Rationale**:
- Required for PWA installation on desktop and mobile
- Enables standalone mode (no browser UI)
- Provides app metadata (name, description, icons)
- Configures display behavior and theme colors

**Manifest Requirements**:
- **display**: "standalone" - removes browser UI when installed
- **start_url**: "/" - home page when launched
- **icons**: Multiple sizes (192x192, 512x512 minimum) for different platforms
- **theme_color**: Matches application theme
- **background_color**: For splash screen
- **orientation**: "any" - supports both portrait and landscape

**Platform-Specific Considerations**:
- **iOS**: Requires additional meta tags in HTML (apple-mobile-web-app-capable)
- **Android**: Uses manifest.json directly
- **Desktop**: Chrome/Edge use manifest.json, Firefox/Safari have varying support

---

### 6. Responsive Design Approach

**Decision**: Enhance existing Tailwind CSS responsive utilities with mobile-first breakpoints and touch optimizations.

**Rationale**:
- Existing Tailwind CSS setup already supports responsive design
- Mobile-first approach aligns with Tailwind's default breakpoints
- Touch interactions handled by Excalidraw (already supports touch)
- No need for separate mobile framework or library

**Breakpoint Strategy**:
- **Mobile**: <640px (sm) - Single column layout, larger touch targets
- **Tablet**: 640px-1024px (sm-md) - Adjusted spacing, optimized for touch
- **Desktop**: >1024px (lg+) - Multi-column layout, keyboard shortcuts

**Touch Optimizations**:
- Minimum touch target size: 44x44px (iOS/Android guidelines)
- Excalidraw handles pinch-to-zoom and pan gestures natively
- Input areas optimized for mobile keyboards
- Sidebar collapses on mobile, accessible via hamburger menu

---

### 7. Installation Prompt Strategy

**Decision**: Implement custom install prompt component that detects installability and shows prompt at appropriate times.

**Rationale**:
- Browser's native install prompt (beforeinstallprompt event) provides best UX
- Custom component allows control over when to show prompt
- Can be dismissed and re-shown based on user behavior
- Works across desktop and mobile platforms

**Implementation Pattern**:
```typescript
// Hook to detect installability
const useInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    })
  }, [])
  
  return { deferredPrompt, canInstall: !!deferredPrompt }
}
```

**UX Considerations**:
- Show prompt after user has engaged with application (not immediately)
- Allow dismissal without being annoying
- Provide manual installation instructions for browsers that don't support automatic prompts
- Detect if already installed and hide prompt

---

### 8. Connectivity Detection

**Decision**: Use Navigator.onLine API combined with network event listeners for accurate connectivity status.

**Rationale**:
- Navigator.onLine provides immediate online/offline status
- Online/offline events detect connectivity changes in real-time
- Simple API, well-supported across browsers
- Can be enhanced with actual network requests if needed (but not required for this use case)

**Implementation Pattern**:
```typescript
const useOffline = () => {
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

---

### 9. Storage Quota Management

**Decision**: Use StorageManager API to check quota usage and warn users before limits are reached.

**Rationale**:
- StorageManager.estimate() provides quota and usage information
- Allows proactive user notification before storage fills up
- Prevents data loss by warning early
- Works with both IndexedDB and Cache API storage

**Quota Handling Strategy**:
- Check quota on application load
- Warn user when usage exceeds 80% of quota
- Provide option to clear cached data if needed
- Gracefully handle quota exceeded errors

---

### 10. Mobile Platform Considerations

**Decision**: Enhance existing responsive design with mobile-specific optimizations and iOS-specific meta tags.

**Rationale**:
- Application already works on mobile browsers
- Need to optimize for smaller screens and touch interactions
- iOS requires additional meta tags for proper PWA behavior
- Android handles PWA installation natively via Chrome

**iOS-Specific Requirements**:
- apple-mobile-web-app-capable meta tag
- apple-mobile-web-app-status-bar-style
- apple-touch-icon for home screen icon
- Proper viewport configuration

**Mobile Optimizations**:
- Collapsible sidebar on mobile (already implemented)
- Touch-friendly input areas
- Optimized Excalidraw canvas for mobile viewport
- Keyboard-aware layout adjustments

---

## Integration Points

### With Existing Architecture

- **Vite Build**: vite-plugin-pwa integrates Service Worker generation into existing build process
- **React Router**: Works seamlessly with PWA (no changes needed)
- **Zustand Store**: Can add offline state management without breaking existing patterns
- **Tailwind CSS**: Responsive utilities already in place, just need mobile optimizations
- **Excalidraw**: Already supports touch interactions, no changes needed

### New Dependencies

- **vite-plugin-pwa**: PWA support for Vite
- **workbox-precaching**: Service Worker caching (included in vite-plugin-pwa)
- **idb** or **Dexie.js**: IndexedDB wrapper (optional, but recommended for better DX)

---

## Browser Support Matrix

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Service Workers | ✅ 40+ | ✅ 44+ | ✅ 11.1+ | ✅ 17+ |
| Web App Manifest | ✅ 73+ | ✅ 90+ | ✅ 16.4+ | ✅ 79+ |
| IndexedDB | ✅ 24+ | ✅ 16+ | ✅ 10+ | ✅ 10+ |
| Install Prompt | ✅ 73+ | ⚠️ Limited | ⚠️ Manual | ✅ 79+ |
| StorageManager API | ✅ 55+ | ✅ 51+ | ❌ | ✅ 79+ |

**Note**: Safari on iOS has limited PWA support compared to Android/Desktop. Installation requires manual "Add to Home Screen" but functionality works.

---

## Performance Considerations

- **Service Worker Registration**: Should happen asynchronously, not block initial render
- **Cache Size**: Monitor bundle size to stay under 50MB limit
- **IndexedDB Operations**: Use transactions and batch operations for performance
- **First Load**: Service Worker adds ~100-200ms overhead on first visit
- **Subsequent Loads**: Offline loads should be faster than online (no network latency)

---

## Security Considerations

- **HTTPS Required**: Service Workers only work over HTTPS (or localhost for development)
- **CORS**: No external API calls, so CORS not a concern
- **Storage Isolation**: IndexedDB is origin-scoped, data isolated per domain
- **Cache Poisoning**: Workbox handles cache versioning to prevent stale content

---

## Testing Strategy

- **Service Worker**: Test registration, updates, and offline behavior
- **Installation**: Test on multiple browsers and platforms
- **Offline Functionality**: Test all features work without network
- **Storage**: Test quota limits and data persistence
- **Responsive Design**: Test across screen sizes and orientations
- **Touch Interactions**: Test on actual mobile devices

---

## Migration Path

1. **Phase 1**: Add Service Worker and manifest (offline capability)
2. **Phase 2**: Add IndexedDB storage for plan data
3. **Phase 3**: Add install prompts and mobile optimizations
4. **Phase 4**: Add storage quota management and monitoring

Each phase can be deployed independently without breaking existing functionality.

