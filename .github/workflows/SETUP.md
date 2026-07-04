# GitHub Actions CI/CD Setup Guide

## Required GitHub Secrets

Go to your GitHub repo → **Settings → Secrets and variables → Actions** and add:

| Secret Name     | Value                                      |
|----------------|--------------------------------------------|
| `VPS_HOST`     | Your VPS IP address (e.g. `157.x.x.x`)    |
| `VPS_USER`     | SSH username (e.g. `ubuntu` or `root`)     |
| `VPS_SSH_KEY`  | Your private SSH key (contents of `~/.ssh/id_rsa`) |
| `VPS_PORT`     | SSH port (default: `22`)                   |

## VPS Initial Setup (Run Once)

SSH into your VPS and run:

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install pnpm
npm install -g pnpm@9

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx
sudo apt install nginx -y

# Clone the repo
sudo mkdir -p /var/www/agent-flow
sudo chown $USER:$USER /var/www/agent-flow
git clone git@github.com:your-org/agent-flow.git /var/www/agent-flow
cd /var/www/agent-flow

# Copy and fill environment variables
cp apps/api/.env.example apps/api/.env
nano apps/api/.env

# Install deps and build
pnpm install --frozen-lockfile
pnpm --filter @agentflow/database prisma migrate deploy
pnpm build

# Start with PM2
pm2 start apps/api/dist/index.js --name agentflow-api
pm2 start pnpm --name agentflow-web -- --filter @agentflow/web start
pm2 save
pm2 startup

# Copy Nginx config
sudo cp nginx.conf /etc/nginx/sites-available/agentflow
sudo ln -s /etc/nginx/sites-available/agentflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Setup SSL with Let's Encrypt
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d agentflow.io -d www.agentflow.io
```

## Workflow Trigger

- **Automatic**: Push to `main` branch triggers build + deploy
- **Manual**: Go to GitHub → Actions → "Deploy to Production" → Run workflow
