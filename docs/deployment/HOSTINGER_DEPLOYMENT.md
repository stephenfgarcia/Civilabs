# Hostinger VPS Deployment Guide

Complete step-by-step guide for deploying Civilabs LMS to Hostinger VPS.

## Prerequisites

- Hostinger VPS account (minimum 2GB RAM recommended)
- Domain name (optional but recommended)
- SSH client
- Basic Linux command knowledge

---

## Part 1: Initial VPS Setup

### Step 1: Access Your VPS

```bash
# SSH into your VPS (Hostinger provides these credentials)
ssh root@your-vps-ip

# Update system packages
apt update && apt upgrade -y
```

### Step 2: Create Non-Root User (Recommended)

```bash
# Create deployment user
adduser deploy
usermod -aG sudo deploy

# Switch to deploy user
su - deploy
```

### Step 3: Install Required Software

```bash
# Install Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should be v18.x.x
npm --version

# Install PostgreSQL 15
sudo apt install -y postgresql postgresql-contrib

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Install build essentials (for native modules)
sudo apt install -y build-essential
```

---

## Part 2: Database Setup

### Step 1: Configure PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt, run these commands:
CREATE DATABASE civilabs_lms;
CREATE USER civilabs_user WITH PASSWORD 'YOUR_SECURE_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON DATABASE civilabs_lms TO civilabs_user;

# Grant schema privileges (PostgreSQL 15+)
\c civilabs_lms
GRANT ALL ON SCHEMA public TO civilabs_user;
\q
```

### Step 2: Test Database Connection

```bash
# Test connection
psql -U civilabs_user -d civilabs_lms -h localhost

# If it works, type \q to exit
```

---

## Part 3: Application Deployment

### Step 1: Clone Repository

```bash
# Create application directory
sudo mkdir -p /var/www/civilabs-lms
sudo chown deploy:deploy /var/www/civilabs-lms
cd /var/www/civilabs-lms

# Clone your repository
git clone https://github.com/YOUR_USERNAME/civilabs-lms.git .

# Install dependencies
npm install
```

### Step 2: Configure Environment

```bash
# Create .env file
nano .env
```

Paste this content (replace with your values):

```env
# Database
DATABASE_URL="postgresql://civilabs_user:YOUR_SECURE_PASSWORD_HERE@localhost:5432/civilabs_lms?schema=public"

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET="your-64-character-hex-string-here"

# Environment
NODE_ENV=production

# App URL (use your domain or VPS IP)
NEXT_PUBLIC_APP_URL=https://yourdomain.com
```

Save and exit (Ctrl+X, Y, Enter)

### Step 3: Generate JWT Secret

```bash
# Generate secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and update JWT_SECRET in .env
```

### Step 4: Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

### Step 5: Build Application

```bash
# Build Next.js app
npm run build

# Test the build
npm start
# Should say "Ready on http://localhost:3000"
# Press Ctrl+C to stop
```

---

## Part 4: Process Management with PM2

### Step 1: Start Application

```bash
# Start app with PM2
pm2 start npm --name "civilabs-lms" -- start

# Check status
pm2 status

# View logs
pm2 logs civilabs-lms
```

### Step 2: Configure PM2 for Auto-Start

```bash
# Save PM2 configuration
pm2 save

# Generate startup script
pm2 startup systemd

# Copy and run the command it outputs (something like):
# sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy

# Verify it works
pm2 list
```

---

## Part 5: Nginx Configuration

### Step 1: Create Nginx Config

```bash
# Create site configuration
sudo nano /etc/nginx/sites-available/civilabs-lms
```

Paste this configuration:

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;  # Replace with your domain

    # Increase client body size for file uploads
    client_max_body_size 50M;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files (Next.js serves these)
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, immutable";
    }

    # API routes
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 2: Enable Site

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/civilabs-lms /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx on boot
sudo systemctl enable nginx
```

---

## Part 6: Firewall Configuration

```bash
# Allow HTTP, HTTPS, and SSH
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS (for SSL)

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Part 7: SSL Certificate (Let's Encrypt)

### Step 1: Install Certbot

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2: Get SSL Certificate

```bash
# Get certificate (replace with your domain)
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Follow the prompts:
# 1. Enter email address
# 2. Agree to terms
# 3. Choose whether to redirect HTTP to HTTPS (choose 2 for redirect)
```

### Step 3: Test Auto-Renewal

```bash
# Test certificate renewal
sudo certbot renew --dry-run
```

---

## Part 8: Domain Configuration

### In Hostinger Control Panel:

1. Go to **Domains** → **DNS/Name Servers**
2. Add these DNS records:

```
Type: A
Name: @
Value: YOUR_VPS_IP
TTL: 14400

Type: A  
Name: www
Value: YOUR_VPS_IP
TTL: 14400
```

3. Wait for DNS propagation (up to 48 hours, usually 10-30 minutes)

---

## Part 9: Verification

### Test Your Deployment

```bash
# Check PM2 status
pm2 status

# Check logs
pm2 logs civilabs-lms --lines 50

# Check Nginx
sudo systemctl status nginx

# Test database connection
psql -U civilabs_user -d civilabs_lms -c "SELECT COUNT(*) FROM \"User\";"
```

### Access Your Application

- **HTTP**: `http://yourdomain.com`
- **HTTPS**: `https://yourdomain.com`

### Test Login

Use seeded credentials:
- Admin: `admin@civilabs.com` / `admin123`
- Instructor: `instructor@civilabs.com` / `instructor123`
- Learner: `learner@civilabs.com` / `learner123`

---

## Maintenance Commands

### Update Application

```bash
cd /var/www/civilabs-lms

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Run migrations (if any)
npx prisma migrate deploy

# Rebuild
npm run build

# Restart PM2
pm2 restart civilabs-lms

# Check logs
pm2 logs civilabs-lms
```

### Database Backup

```bash
# Create backup directory
mkdir -p ~/backups

# Backup database
pg_dump -U civilabs_user civilabs_lms > ~/backups/civilabs_$(date +%Y%m%d_%H%M%S).sql

# Restore from backup
psql -U civilabs_user civilabs_lms < ~/backups/civilabs_20250118_120000.sql
```

### View Logs

```bash
# PM2 logs
pm2 logs civilabs-lms
pm2 logs civilabs-lms --lines 100
pm2 logs civilabs-lms --err  # Only errors

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# PostgreSQL logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### Monitor Resources

```bash
# Check disk space
df -h

# Check memory
free -h

# Monitor processes
htop  # (install with: sudo apt install htop)

# PM2 monitoring
pm2 monit
```

---

## Troubleshooting

### Issue: Application won't start

```bash
# Check PM2 logs
pm2 logs civilabs-lms

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart PM2
pm2 restart civilabs-lms
pm2 delete civilabs-lms
pm2 start npm --name "civilabs-lms" -- start
```

### Issue: Database connection fails

```bash
# Test PostgreSQL
sudo systemctl status postgresql

# Check if user can connect
psql -U civilabs_user -d civilabs_lms

# Verify DATABASE_URL in .env
cat .env | grep DATABASE_URL
```

### Issue: Nginx 502 Bad Gateway

```bash
# Check if app is running
pm2 status

# Check Nginx configuration
sudo nginx -t

# Restart services
pm2 restart civilabs-lms
sudo systemctl restart nginx
```

### Issue: SSL certificate fails

```bash
# Check if port 80 is accessible
curl http://yourdomain.com

# Verify DNS
nslookup yourdomain.com

# Try manual certificate
sudo certbot --nginx --manual -d yourdomain.com
```

---

## Security Hardening (Optional)

### 1. Configure SSH Key Authentication

```bash
# On your local machine, generate SSH key
ssh-keygen -t rsa -b 4096

# Copy to VPS
ssh-copy-id deploy@your-vps-ip

# Disable password authentication (on VPS)
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

### 2. Install Fail2Ban

```bash
# Install
sudo apt install -y fail2ban

# Configure
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Set Up PostgreSQL Authentication

```bash
# Edit pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf

# Ensure local connections use md5:
# local   all   all   md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

---

## Monitoring Setup (Optional)

### Install PM2 Plus for Monitoring

```bash
# Register at pm2.io
pm2 link <secret_key> <public_key>

# Or use standalone monitoring
pm2 install pm2-logrotate
```

---

## Cost Estimation

### Hostinger VPS Pricing

- **VPS 1**: ~$4-6/month (2GB RAM) - Suitable for development/small production
- **VPS 2**: ~$8-10/month (4GB RAM) - Better for production
- **VPS 3**: ~$12-15/month (8GB RAM) - High traffic

### Additional Costs

- Domain: ~$10-15/year
- SSL Certificate: Free (Let's Encrypt)
- Backups: Included with VPS

---

## Next Steps After Deployment

1. ✅ Set up automated backups
2. ✅ Configure monitoring
3. ✅ Set up email notifications
4. ✅ Implement CDN (optional)
5. ✅ Set up staging environment
6. ✅ Configure error tracking (Sentry, etc.)

---

## Support

For issues:
1. Check logs: `pm2 logs civilabs-lms`
2. Review Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Test database: `psql -U civilabs_user -d civilabs_lms`
4. Restart services: `pm2 restart civilabs-lms && sudo systemctl restart nginx`
