#!/bin/bash
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1; then
  echo "CERTUS needs Node.js once, then it opens as a desktop window."
  echo "Install it from https://nodejs.org and run this file again."
  open "https://nodejs.org" 2>/dev/null || true
  read -r -p "Press Return to close..."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installing CERTUS. First run only..."
  npm install || { read -r -p "Install failed. Press Return..."; exit 1; }
fi

npm run desktop
status=$?
if [ $status -ne 0 ]; then
  read -r -p "CERTUS exited with an error. Press Return..."
fi
exit $status
