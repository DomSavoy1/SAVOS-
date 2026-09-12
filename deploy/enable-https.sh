#!/usr/bin/env bash
set -euo pipefail

if [[ -f /etc/letsencrypt/live/savoyventures.org/fullchain.pem ]]; then
  exit 0
fi

certbot --nginx --non-interactive --agree-tos --register-unsafely-without-email \
  --redirect -d savoyventures.org -d www.savoyventures.org
