#!/usr/bin/env bash
set -euo pipefail

sudo apt-get update
sudo apt-get install -y ca-certificates curl git nginx
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
sudo npm install --global pm2

sudo install -d -o "$USER" -g "$USER" /var/www/savos
sudo install -d -m 0700 -o "$USER" -g "$USER" /var/lib/savos
sudo install -m 0644 deploy/nginx-savos.conf /etc/nginx/sites-available/savos
sudo ln -sfn /etc/nginx/sites-available/savos /etc/nginx/sites-enabled/savos
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl enable --now nginx
sudo systemctl reload nginx

echo "Server prerequisites installed. Copy the application to /var/www/savos, then run deploy/release.sh."
