#!/usr/bin/env bash
set -euo pipefail

MASTER=${1:?Usage: generate-branding-assets.sh /absolute/path/to/master-logo.jpg}
ASSETS="$(cd "$(dirname "$0")/../assets" && pwd)"

if [[ ! -f "$MASTER" ]]; then
  printf 'Master artwork not found: %s\n' "$MASTER" >&2
  exit 1
fi

# The supplied master is an opaque JPG with black background and black line art.
# Flood-fill only from a corner so isolated black line work is retained.
clean_mark() {
  convert "$MASTER" -alpha off -fill '#FFFFFF' -draw 'color 0,0 floodfill' \
    -crop 500x500+134+24 +repage -trim +repage "$1"
}

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
clean_mark "$TMP/mark.png"

convert "$TMP/mark.png" -resize 620x620 -gravity center -background '#FFFFFF' -extent 1024x1024 "$ASSETS/icon.png"
convert "$TMP/mark.png" -resize 440x440 -gravity center -background '#FFFFFF' -extent 1280x1280 "$ASSETS/splash-icon.png"
convert "$TMP/mark.png" -resize 432x432 -gravity center -background none -alpha on -extent 1024x1024 "$ASSETS/android-icon-foreground.png"
convert -size 1024x1024 xc:'#FFFFFF' "$ASSETS/android-icon-background.png"
convert "$ASSETS/icon.png" -resize 256x256 "$ASSETS/favicon.png"

identify "$ASSETS/icon.png" "$ASSETS/splash-icon.png" "$ASSETS/android-icon-foreground.png" "$ASSETS/android-icon-background.png" "$ASSETS/favicon.png"
