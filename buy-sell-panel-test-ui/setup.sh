#!/usr/bin/env bash
#
# First-time setup for the buy/sell panel test UI.
#
# This app lives inside the Katana Perps SDK repo and consumes the SDK from the
# parent directory (..). This script builds the SDK (so its dist/*.d.ts exist for
# type-checking) and installs the app's own dependencies.
#
# Usage:  ./setup.sh      (or: npm run setup)
set -euo pipefail

APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SDK_DIR="$(dirname "$APP_DIR")"

echo "==> SDK directory: $SDK_DIR"

echo "==> Installing and building the SDK (Yarn 4 via corepack)..."
corepack enable >/dev/null 2>&1 || echo "    (could not enable corepack; relying on an existing 'yarn' on PATH)"
( cd "$SDK_DIR" && yarn install && yarn build )

echo "==> Installing the test UI's dependencies..."
( cd "$APP_DIR" && npm install )

echo ""
echo "Setup complete. Start the app with:  npm run dev"
