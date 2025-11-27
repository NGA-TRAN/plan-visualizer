#!/bin/bash
# Generate PWA icons from a source image
# Usage: ./scripts/generate-icons.sh <source-image.png>

set -e

SOURCE_IMAGE="$1"

if [ -z "$SOURCE_IMAGE" ]; then
  echo "Usage: $0 <source-image.png>"
  echo "Example: $0 ~/Downloads/app-icon.png"
  exit 1
fi

if [ ! -f "$SOURCE_IMAGE" ]; then
  echo "Error: Source image not found: $SOURCE_IMAGE"
  exit 1
fi

ICON_DIR="public/icons"
mkdir -p "$ICON_DIR"

echo "Generating PWA icons from: $SOURCE_IMAGE"

# Check for available image conversion tools
if command -v sips &> /dev/null; then
  # macOS built-in tool
  echo "Using sips (macOS)..."
  sips -z 192 192 "$SOURCE_IMAGE" --out "$ICON_DIR/icon-192x192.png"
  sips -z 512 512 "$SOURCE_IMAGE" --out "$ICON_DIR/icon-512x512.png"
  sips -z 180 180 "$SOURCE_IMAGE" --out "$ICON_DIR/apple-touch-icon.png"
  echo "✓ Icons generated successfully!"
elif command -v convert &> /dev/null; then
  # ImageMagick
  echo "Using ImageMagick..."
  convert "$SOURCE_IMAGE" -resize 192x192 "$ICON_DIR/icon-192x192.png"
  convert "$SOURCE_IMAGE" -resize 512x512 "$ICON_DIR/icon-512x512.png"
  convert "$SOURCE_IMAGE" -resize 180x180 "$ICON_DIR/apple-touch-icon.png"
  echo "✓ Icons generated successfully!"
elif command -v magick &> /dev/null; then
  # ImageMagick (newer version)
  echo "Using ImageMagick (magick)..."
  magick "$SOURCE_IMAGE" -resize 192x192 "$ICON_DIR/icon-192x192.png"
  magick "$SOURCE_IMAGE" -resize 512x512 "$ICON_DIR/icon-512x512.png"
  magick "$SOURCE_IMAGE" -resize 180x180 "$ICON_DIR/apple-touch-icon.png"
  echo "✓ Icons generated successfully!"
else
  echo "Error: No image conversion tool found."
  echo "Please install one of the following:"
  echo "  - macOS: sips (built-in)"
  echo "  - ImageMagick: brew install imagemagick"
  echo ""
  echo "Or manually resize your image to:"
  echo "  - $ICON_DIR/icon-192x192.png (192x192)"
  echo "  - $ICON_DIR/icon-512x512.png (512x512)"
  echo "  - $ICON_DIR/apple-touch-icon.png (180x180)"
  exit 1
fi

echo ""
echo "Icons created in $ICON_DIR/:"
ls -lh "$ICON_DIR"/*.png

