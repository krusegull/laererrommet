#!/bin/bash
set -euo pipefail

cd "$CLAUDE_PROJECT_DIR"

npm install
npm run setup
