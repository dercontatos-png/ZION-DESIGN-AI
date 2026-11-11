#!/bin/sh
set -e
npm install --legacy-peer-deps
npm run build
exit 0
