# Hostinger Deployment Setup Guide - Step by Step

This guide will walk you through deploying Civilabs LMS to Hostinger Cloud Hosting.

## 📋 Pre-Deployment Checklist

- ✅ Code changes completed (Next.js 16 fix, production config)
- ✅ Production build tested successfully
- ✅ GitHub repository up to date
- ⏳ Neon PostgreSQL database (we'll do this now)
- ⏳ Hostinger configuration (we'll do this now)

---

## Part 1: Setup Neon PostgreSQL Database (5 minutes)

### Step 1.1: Create Neon Account

1. Open your browser and go to: **https://neon.tech**
2. Click **"Sign up"** button
3. Choose sign-up method:
   - **Recommended:** Sign up with GitHub (faster, auto-links your account)
   - Or use email/password
4. Complete the sign-up process

### Step 1.2: Create Your Database Project

1. After signing in, you'll see the Neon dashboard
2. Click **"Create a project"** button
3. Fill in project details:
   - **Project name:** `civilabs-lms`
   - **Database name:** `civilabs_lms` (or leave default)
   - **Region:** Choose closest to your users (e.g., US East, Europe, Asia)
   - **Postgres version:** Leave default (16)
4. Click **"Create project"**

### Step 1.3: Get Your Connection String

1. Once the project is created, you'll see the project dashboard
2. Look for **"Connection string"** section
3. You'll see a connection string that looks like:
   ```
   postgresql://username:password@ep-xyz-123456.us-east-2.aws.neon.tech/civilabs_lms?sslmode=require
   ```
4. **IMPORTANT:** Copy this entire connection string
5. Click the **"Copy"** button or select all and copy
6. Save it in a secure note temporarily (we'll use it in Step 2)

**What to expect:**
- Format: `postgresql://[username]:[password]@[host]/[database]?sslmode=require`
- Username usually looks like: `neondb_owner`
- Password is auto-generated (long random string)
- Host ends with: `.neon.tech`

### Step 1.4: Verify Database is Active

1. In Neon dashboard, look for **"Status"** indicator
2. Should show: 🟢 **Active** or **Idle** (both are fine)
3. Free tier databases auto-suspend after 5 minutes of inactivity (this is normal)
4. They wake up automatically when accessed (takes ~500ms)

**✅ Checkpoint:** You now have a production PostgreSQL database connection string saved.

---

## Part 2: Generate Production Secrets (2 minutes)

We need to generate a secure JWT secret for production authentication.

### Step 2.1: Generate JWT Secret

1. Open your terminal
2. Run this command:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
3. You'll get output like:
   ```
   a3f8d9c2e1b7f6a4c8d9e2b1f7a3c8d9e2b1f7a3c8d9e2b1f7a3c8d9e2b1f7a3
   ```
4. **Copy this entire string**
5. Save it in your secure note with the database connection string

**⚠️ IMPORTANT:**
- This must be different from your development JWT_SECRET
- Keep this secret - anyone with this can forge authentication tokens
- Never commit this to Git

**✅ Checkpoint:** You now have both DATABASE_URL and JWT_SECRET ready.

---

## Part 3: Prepare Your GitHub Repository (5 minutes)

### Step 3.1: Verify .gitignore

1. Open `.gitignore` in your project
2. Verify these lines are present (they should be):
   ```
   .env
   .env.local
   .env.production
   node_modules
   .next
   /public/uploads
   ```
3. This ensures sensitive files won't be committed

### Step 3.2: Commit Latest Changes

1. Open terminal in your project directory
2. Check status:
   ```bash
   git status
   ```
3. You should see modified files:
   - `next.config.js`
   - `app/api/certificates/verify/[code]/route.ts`
   - `app/api/health/route.ts` (new file)

4. Stage and commit changes:
   ```bash
   git add .
   git commit -m "Add production optimizations and health check endpoint for Hostinger deployment"
   git push origin main
   ```

### Step 3.3: Verify Repository is Public or Accessible

1. Go to your GitHub repository in browser
2. Check if repository is:
   - **Public** (easiest for Hostinger) - Anyone can see
   - **Private** (requires GitHub OAuth) - Only you can see

**For Private Repos:** You'll need to connect GitHub to Hostinger (we'll do this in Part 4)

**✅ Checkpoint:** Your code is committed and pushed to GitHub.

---

## Part 4: Configure Hostinger Node.js Application (10 minutes)

### Step 4.1: Access Hostinger Control Panel

1. Go to: **https://hpanel.hostinger.com** (or your Hostinger login page)
2. Log in with your Hostinger credentials
3. You'll see the hPanel dashboard

### Step 4.2: Navigate to Your Website

1. In hPanel, click **"Websites"** in the top menu
2. You should see your domain listed (e.g., `your-domain.com`)
3. Click on your domain to open its control panel

### Step 4.3: Open Node.js Section

1. In the left sidebar, scroll down to find **"Advanced"** section
2. Click **"Node.js"**
   - If you don't see it, look under **"Applications"** or search for "Node.js" in the search bar
3. You'll see the Node.js applications page

### Step 4.4: Create New Node.js Application

1. Click **"Create Node.js Application"** button (big purple/orange button)
2. You'll see a configuration form

### Step 4.5: Configure Application Settings

Fill in the form with these exact values:

**Basic Settings:**
- **Application Mode:** `Production`
- **Application Root:** `/`
  - This is where your code will be deployed
  - Leave as default unless you want a subdirectory

**Node.js Settings:**
- **Node.js Version:** Select `20.x` or `18.x` (latest LTS available)
  - Recommended: `20.x` if available
  - Minimum: `18.x`

**Application Settings:**
- **Application Startup File:** Leave empty or set to `server.js`
  - Next.js will create this with standalone build

**Commands:**
- **Build Command:**
  ```
  npm run build
  ```
  - This runs `next build` to create production build

- **Start Command:**
  ```
  npm start
  ```
  - This runs `next start` to serve the application

**Domain Configuration:**
- **Application URL:** Select your domain from dropdown
  - Example: `your-domain.com`
  - Or subdomain if you prefer: `lms.your-domain.com`

### Step 4.6: Choose Deployment Method

You have two options:

#### Option A: GitHub Deployment (Recommended)

1. Select **"GitHub"** as deployment method
2. Click **"Connect GitHub account"**
3. You'll be redirected to GitHub
4. Click **"Authorize Hostinger"**
5. Select your repository from the dropdown:
   - Repository: `your-username/civilabs-lms`
6. Select branch:
   - Branch: `main` (or `master` if that's your default)

**Benefits:**
- Auto-deploys when you push to GitHub
- Easy rollbacks to previous commits
- Better version control

#### Option B: Manual Upload (Alternative)

1. Select **"Manual Upload"** as deployment method
2. You'll upload code via ZIP file later
3. More manual but works if GitHub connection fails

**For this walkthrough, we'll use Option A (GitHub).**

### Step 4.7: Save Application (Don't Deploy Yet)

1. **IMPORTANT:** Do NOT click "Deploy" yet
2. Click **"Create"** or **"Save"** button at the bottom
3. The application configuration will be saved
4. You'll be taken to the application details page

**✅ Checkpoint:** Hostinger Node.js application is configured but not yet deployed.

---

## Part 5: Configure Environment Variables (5 minutes)

This is crucial - your app won't work without these!

### Step 5.1: Access Environment Variables Section

1. On your Node.js application page, look for **"Environment Variables"** section
2. It might be a tab or a section on the same page
3. Click **"Add Variable"** or **"+"** button

### Step 5.2: Add Each Environment Variable

Add these variables **one by one** (click "Add Variable" for each):

#### Variable 1: DATABASE_URL
- **Key:** `DATABASE_URL`
- **Value:** `[paste your Neon connection string from Part 1]`
  - Should look like: `postgresql://username:password@host.neon.tech/civilabs_lms?sslmode=require`
  - **No quotes around the value in Hostinger**
- Click **"Add"** or **"Save"**

#### Variable 2: JWT_SECRET
- **Key:** `JWT_SECRET`
- **Value:** `[paste the secret you generated in Part 2]`
  - Should be a long hex string: `a3f8d9c2e1b7...`
  - **No quotes around the value**
- Click **"Add"** or **"Save"**

#### Variable 3: NODE_ENV
- **Key:** `NODE_ENV`
- **Value:** `production`
- Click **"Add"** or **"Save"**

#### Variable 4: NEXT_PUBLIC_APP_URL
- **Key:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://your-actual-domain.com`
  - **Replace with your real domain**
  - Example: `https://lms.civilabs.com`
  - Must start with `https://` (not `http://`)
- Click **"Add"** or **"Save"**

#### Variable 5: NEXT_PUBLIC_SUPPORT_EMAIL
- **Key:** `NEXT_PUBLIC_SUPPORT_EMAIL`
- **Value:** `support@civilabs.com` (or your support email)
- Click **"Add"** or **"Save"**

#### Variable 6: NEXT_PUBLIC_SUPPORT_PHONE (Optional)
- **Key:** `NEXT_PUBLIC_SUPPORT_PHONE`
- **Value:** `+1 (555) 123-4567` (or your support phone)
- Click **"Add"** or **"Save"**

#### Variable 7: NEXT_PUBLIC_SUPPORT_HOURS (Optional)
- **Key:** `NEXT_PUBLIC_SUPPORT_HOURS`
- **Value:** `Available Mon-Fri 9am-5pm` (or your hours)
- Click **"Add"** or **"Save"**

### Step 5.3: Verify All Variables

Your environment variables list should show:
```
DATABASE_URL = postgresql://...
JWT_SECRET = a3f8d9c2e1b7...
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://your-domain.com
NEXT_PUBLIC_SUPPORT_EMAIL = support@...
NEXT_PUBLIC_SUPPORT_PHONE = +1 ...
NEXT_PUBLIC_SUPPORT_HOURS = Available...
```

**✅ Checkpoint:** All environment variables configured.

---

## Part 6: Deploy Application (10-15 minutes)

Now we're ready to deploy!

### Step 6.1: Trigger First Deployment

1. On your Node.js application page, find the **"Deploy"** button
2. It might say **"Deploy from GitHub"** or just **"Deploy"**
3. Click the **Deploy** button
4. You'll see a deployment progress screen

### Step 6.2: Monitor Deployment Progress

You'll see logs appearing in real-time. Expected stages:

**Stage 1: Cloning Repository** (30 seconds - 1 minute)
```
Cloning repository from GitHub...
Cloning into '/home/...'
```

**Stage 2: Installing Dependencies** (2-4 minutes)
```
Running npm install...
added 500+ packages in 2m
```
- This installs all packages from `package.json`
- Also runs `postinstall` script (Prisma generate)

**Stage 3: Building Application** (1-3 minutes)
```
Running build command: npm run build
Creating an optimized production build...
✓ Compiled successfully
✓ Generating static pages
```

**Stage 4: Starting Application** (30 seconds)
```
Running start command: npm start
> next start
ready - started server on 0.0.0.0:3000
```

### Step 6.3: Deployment Success Indicators

Look for these success messages:
- ✅ `Deployment successful`
- ✅ `Application is running`
- ✅ Status: 🟢 **Active**
- ✅ URL is now clickable

**If deployment fails:**
- Check the error logs (scroll through deployment output)
- Common issues:
  - Missing environment variables → Go back to Part 5
  - Build errors → Check build logs for specifics
  - GitHub connection failed → Try reconnecting GitHub

### Step 6.4: Get Your Application URL

1. After successful deployment, you'll see your application URL
2. It should be your domain: `https://your-domain.com`
3. Click the URL or copy it

**✅ Checkpoint:** Application deployed successfully!

---

## Part 7: Initialize Production Database (5 minutes)

Your app is deployed, but the database is empty. Let's populate it.

### Step 7.1: Access SSH Terminal (if available)

**Option A: Hostinger SSH Access**
1. In hPanel, look for **"SSH Access"** in Advanced section
2. Click to enable SSH
3. Use terminal to connect:
   ```bash
   ssh your-username@your-domain.com
   ```
4. Navigate to your app directory:
   ```bash
   cd domains/your-domain.com/public_html
   # or wherever your app is deployed
   ```

**Option B: No SSH Access (Use Local Terminal)**
We'll run migrations from your local machine:

### Step 7.2: Initialize Database Schema

**If you have SSH:**
```bash
# On the server
npx prisma db push
```

**If no SSH (run locally):**
1. Open terminal on your local machine
2. Temporarily update your local `.env`:
   ```bash
   # Edit .env
   DATABASE_URL="[paste your Neon production connection string]"
   ```
3. Run migration:
   ```bash
   npx prisma db push
   ```
4. **Important:** Restore your local `.env` to development database after!

### Step 7.3: Seed Initial Data (Optional)

This creates test users and sample courses.

**If you have SSH:**
```bash
# On the server
npm run db:seed
```

**If no SSH (run locally):**
```bash
# With production DATABASE_URL in .env
npm run db:seed
```

**Seed creates:**
- Admin: `admin@civilabs.com` / `admin123`
- Instructor: `instructor@civilabs.com` / `instructor123`
- Learner: `learner@civilabs.com` / `learner123`
- Sample courses and departments

### Step 7.4: Restore Local Database (If you used local terminal)

```bash
# Edit .env back to local database
DATABASE_URL="postgresql://stephen@localhost:5432/civilabs_lms?schema=public"
```

**✅ Checkpoint:** Production database initialized with schema and data.

---

## Part 8: Enable SSL/HTTPS (5 minutes)

Ensure your site uses HTTPS for security.

### Step 8.1: Access SSL Section

1. In hPanel, go back to your domain overview
2. Look for **"SSL"** in the left sidebar or under Security
3. Click **"SSL"**

### Step 8.2: Install SSL Certificate

1. You should see **"Let's Encrypt SSL"** option (free)
2. Select your domain: `your-domain.com`
3. Click **"Install SSL"** button
4. Wait 1-2 minutes for certificate installation

### Step 8.3: Force HTTPS Redirect

1. After SSL is installed, look for **"Force HTTPS"** toggle
2. Enable **"Force HTTPS redirect"**
3. This ensures all HTTP traffic redirects to HTTPS

### Step 8.4: Verify SSL is Working

1. Open your browser
2. Visit: `http://your-domain.com` (without 's')
3. Should auto-redirect to: `https://your-domain.com` (with 's')
4. Look for 🔒 padlock icon in browser address bar

**✅ Checkpoint:** SSL/HTTPS enabled and working.

---

## Part 9: Verify Deployment (10 minutes)

Let's test that everything is working!

### Step 9.1: Test Health Check Endpoint

1. Open browser
2. Visit: `https://your-domain.com/api/health`
3. You should see JSON response:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "timestamp": "2025-12-23T...",
     "environment": "production"
   }
   ```

**If you see this:** ✅ App is running and database connected!

**If you see error:**
- Check DATABASE_URL environment variable
- Check Neon database is active
- Review application logs in Hostinger

### Step 9.2: Test Homepage

1. Visit: `https://your-domain.com`
2. You should see the Civilabs LMS homepage
3. Check for:
   - ✅ Page loads without errors
   - ✅ Styles load correctly (Tailwind CSS)
   - ✅ Navigation menu appears
   - ✅ No 404 or 500 errors

### Step 9.3: Test Login

1. Click **"Login"** button
2. Enter seeded admin credentials:
   - Email: `admin@civilabs.com`
   - Password: `admin123`
3. Click **"Sign In"**
4. Should redirect to: `/admin/dashboard`
5. You should see the admin dashboard

**If login works:** ✅ Authentication, database, and JWT are working!

### Step 9.4: Test Core Features

**Quick feature checks:**
- [ ] Navigate to "Courses" → Should show course listings
- [ ] Click a course → Should show course details
- [ ] Go to "Users" (admin) → Should show user list
- [ ] Check browser console (F12) → No errors

### Step 9.5: Test File Upload (Optional)

1. Go to your profile
2. Try uploading an avatar image
3. **Expected:** Upload works OR shows error about directory permissions

**If upload fails:**
- We'll need to configure persistent storage (see troubleshooting below)

**✅ Checkpoint:** Core application features working!

---

## Part 10: Post-Deployment Configuration (Optional)

### Configure Persistent File Uploads

If file uploads fail, you need persistent storage:

**Option A: SSH Access Required**
```bash
# Connect via SSH
ssh your-username@your-domain.com

# Navigate to public_html
cd domains/your-domain.com/public_html

# Create uploads directory
mkdir -p uploads
chmod 755 uploads
```

Then tell your app to use this directory for uploads.

**Option B: Use Cloud Storage (Better long-term)**
- Migrate to Cloudinary, AWS S3, or Backblaze B2
- Requires updating `app/api/upload/route.ts`
- Can be done later as enhancement

---

## 🎉 Deployment Complete!

Your Civilabs LMS is now live on Hostinger!

### Access Your Application

- **Public URL:** `https://your-domain.com`
- **Admin Dashboard:** `https://your-domain.com/admin`
- **Health Check:** `https://your-domain.com/api/health`

### Test Accounts (from seed data)

- **Admin:** admin@civilabs.com / admin123
- **Instructor:** instructor@civilabs.com / instructor123
- **Learner:** learner@civilabs.com / learner123

### What's Configured

✅ Next.js 16 application running on Node.js
✅ PostgreSQL database (Neon) connected
✅ SSL/HTTPS enabled
✅ Environment variables configured
✅ Production optimizations active
✅ Health monitoring endpoint

---

## Troubleshooting Common Issues

### Issue: "Application failed to start"
**Check:**
1. Review deployment logs in Hostinger
2. Verify all environment variables are set correctly
3. Check Node.js version is 18.x or 20.x
4. Ensure build command completed successfully

### Issue: "Database connection failed"
**Check:**
1. DATABASE_URL is correct (no typos)
2. Neon database is active (check Neon dashboard)
3. Connection string includes `?sslmode=require`
4. No extra quotes around DATABASE_URL

### Issue: "Login doesn't work"
**Check:**
1. JWT_SECRET environment variable is set
2. Database was seeded (users exist)
3. Check browser console for errors
4. Verify cookies are enabled in browser

### Issue: "Page shows 404 errors"
**Check:**
1. Application root is set to `/`
2. Build completed successfully
3. Start command is running
4. Check if app is actually running in Hostinger panel

### Issue: "Images don't load"
**Check:**
1. SSL/HTTPS is enabled
2. Mixed content warnings in browser console
3. Image paths are correct
4. Next.js image optimization working

---

## Support Resources

- **Hostinger Support:** Live chat 24/7 in hPanel
- **Neon Documentation:** https://neon.tech/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment
- **Deployment Plan:** Check `/Users/stephen/.claude/plans/agile-spinning-marshmallow.md`

---

## Next Steps After Deployment

1. **Change Default Passwords** - Update seeded user passwords
2. **Configure Email** - Setup SMTP for password resets
3. **Add Real Content** - Create actual courses and users
4. **Setup Monitoring** - Add error tracking (Sentry)
5. **Configure Backups** - Neon has automatic backups
6. **Add Custom Domain** - If using subdomain, configure DNS
7. **Optimize Performance** - Add Cloudflare CDN

---

**Need help?** Refer back to this guide or the detailed plan at:
`/Users/stephen/.claude/plans/agile-spinning-marshmallow.md`
