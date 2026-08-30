#!/bin/bash
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "CERTUS needs Node.js once, then it opens as a desktop window."
  echo "Install it from https://nodejs.org and run this file again."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing CERTUS. First run only..."
  npm install || exit 1
fi

exec npm run desktop
