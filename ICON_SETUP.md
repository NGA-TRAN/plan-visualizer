# App Icon Setup Guide

## Quick Setup

If you have your source image file ready, run:

```bash
./scripts/generate-icons.sh <path-to-your-image.png>
```

Example:
```bash
./scripts/generate-icons.sh ~/Downloads/app-icon.png
```

## Manual Setup

If you prefer to create the icons manually or don't have the conversion tools:

1. **Prepare your source image** - Should be square (1:1 aspect ratio) and at least 512x512 pixels for best quality

2. **Create three icon sizes:**
   - `public/icons/icon-192x192.png` - 192x192 pixels
   - `public/icons/icon-512x512.png` - 512x512 pixels  
   - `public/icons/apple-touch-icon.png` - 180x180 pixels (for iOS)

3. **Recommended tools:**
   - **Online**: [Favicon.io](https://favicon.io/favicon-converter/), [RealFaviconGenerator](https://realfavicongenerator.net/)
   - **macOS**: Preview app (Tools → Adjust Size)
   - **Windows**: Paint, GIMP, Photoshop
   - **Linux**: GIMP, ImageMagick

4. **Icon requirements:**
   - Format: PNG
   - Square aspect ratio (1:1)
   - Transparent background recommended
   - For maskable icons: Keep important content within the center 80% of the image

## Current Icon Configuration

Icons are configured in:
- `public/manifest.json` - Web App Manifest
- `index.html` - iOS meta tags
- `vite.config.ts` - PWA plugin configuration

After adding your icons, rebuild the app:
```bash
npm run build
npm run preview
```

Then test the icons by:
1. Installing the app (desktop or mobile)
2. Checking the app icon in the system menu/home screen
3. Verifying the favicon in the browser tab

