#!/bin/bash
# ============================================
# ROOM Art — Production Deploy Script
# Server: Hetzner CX23 (Ubuntu)
# Domain: roomgallery.art
# ============================================

set -e

echo "=== 1. System update ==="
apt update && apt upgrade -y

echo "=== 2. Install Node.js 20 LTS ==="
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

echo "=== 3. Install build tools (for better-sqlite3 native) ==="
apt install -y build-essential python3 git

echo "=== 4. Install Nginx ==="
apt install -y nginx

echo "=== 5. Install PM2 ==="
npm install -g pm2

echo "=== 6. Clone repository ==="
mkdir -p /var/www
cd /var/www
if [ -d "roomart" ]; then
  cd roomart
  git pull origin master
else
  git clone https://github.com/SeymurKh/Room_art.git roomart
  cd roomart
fi

echo "=== 7. Create .env.production ==="
cat > .env.production << 'ENVEOF'
ADMIN_PASSWORD=RO0M9alleryBaky
ADMIN_SECRET=4473af8dce22aea1722c6f585b030c23013c273a7409ad4927dbb7e0b8e05381
DATABASE_URL=./data/room.db
RESEND_API_KEY=re_YjqBauW8_EtmQvdke84qAmFYchMUzUJ2P
# Uncomment after verifying roomgallery.art domain in Resend:
# RESEND_FROM_EMAIL=ROOM Contact Form <noreply@roomgallery.art>
ENVEOF

echo "=== 8. Install dependencies ==="
npm ci

echo "=== 9. Build ==="
npm run build

echo "=== 10. Seed database ==="
npm run db:seed

echo "=== 11. Start with PM2 ==="
pm2 delete roomart 2>/dev/null || true
pm2 start npm --name roomart -- start
pm2 save
pm2 startup systemd -u root --hp /root

echo "=== 12. Configure Nginx ==="
cat > /etc/nginx/sites-available/roomart << 'NGINXEOF'
server {
    listen 80;
    server_name roomgallery.art www.roomgallery.art;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name roomgallery.art www.roomgallery.art;

    # SSL — Cloudflare Origin Certificate
    # Place your cert files at these paths:
    ssl_certificate /etc/ssl/cloudflare/roomgallery.art.pem;
    ssl_certificate_key /etc/ssl/cloudflare/roomgallery.art-key.pem;

    # Or use Let's Encrypt (if not using Cloudflare proxy):
    # ssl_certificate /etc/letsencrypt/live/roomgallery.art/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/roomgallery.art/privkey.pem;

    client_max_body_size 200M;

    # Static assets — long cache
    location /_next/static/ {
        alias /var/www/roomart/.next/static/;
        expires 365d;
        access_log off;
    }

    location /assets/ {
        alias /var/www/roomart/public/assets/;
        expires 30d;
        access_log off;
    }

    location /uploads/ {
        alias /var/www/roomart/public/uploads/;
        expires 30d;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/roomart /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "=== 13. Firewall ==="
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

echo ""
echo "=========================================="
echo "  DEPLOY COMPLETE!"
echo "  Site: https://roomgallery.art"
echo "  Admin: https://roomgallery.art/admin"
echo "=========================================="
