#!/bin/bash
# Applies Expo SDK 57 Xcode 26.3 compatibility patches after npm install.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

apply_patch() {
  local file="$1"
  if patch -p1 --dry-run -s -i "$file" >/dev/null 2>&1; then
    patch -p1 -i "$file"
    echo "Applied $(basename "$file")"
  else
    echo "Already applied: $(basename "$file")"
  fi
}

apply_patch patches/expo-modules-jsi+57.1.0.patch
apply_patch patches/expo-modules-core+57.0.17.patch
