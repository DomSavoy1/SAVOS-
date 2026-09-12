#!/usr/bin/env bash
set -euo pipefail

cd /var/www/savos
npm ci
npm run build
pm2 startOrReload ecosystem.config.cjs --update-env
pm2 save

echo "Savoy Ventures OS is running on http://127.0.0.1:3000 behind Nginx."
