# Vercel Deployment Guide - Civilabs LMS

Quick guide to deploy your Civilabs LMS to Vercel with Neon PostgreSQL.

## Why Vercel + Neon?

- ✅ **Zero Configuration** - Vercel automatically detects Next.js
- ✅ **Instant Deployments** - Deploy in under 2 minutes
- ✅ **Auto-Deploy on Push** - Every GitHub commit auto-deploys
- ✅ **Free SSL/HTTPS** - Automatic certificates
- ✅ **Global CDN** - Fast worldwide
- ✅ **Perfect for Next.js** - Built by the Next.js team
- ✅ **Generous Free Tier** - Hobby plan is free forever

---

## Prerequisites Checklist

- ✅ Neon PostgreSQL database created
- ✅ DATABASE_URL connection string saved
- ✅ JWT_SECRET generated: `36f9e8d4000261b012cd5522f677a85c3ca7dedff178c927dbbfa4b2a3288334`
- ✅ GitHub repository: `https://github.com/stephenfgarcia/Civilabs.git`
- ✅ Code pushed to `main` branch

---

## Part 1: Create Vercel Account (2 minutes)

### Step 1.1: Sign Up with GitHub

1. Go to: **https://vercel.com**
2. Click **"Start Deploying"** or **"Sign Up"**
3. Click **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub account
5. You'll be redirected to Vercel dashboard

**Why GitHub sign-up?**
- Automatic repository access
- One-click deployments
- Auto-deploy on Git push

---

## Part 2: Import Your Project (3 minutes)

### Step 2.1: Import Git Repository

1. On Vercel dashboard, click **"Add New..."** button (top right)
2. Select **"Project"**
3. You'll see "Import Git Repository" screen
4. Look for your repository: **`stephenfgarcia/Civilabs`**
5. Click **"Import"** button next to it

**If you don't see your repository:**
- Click "Adjust GitHub App Permissions"
- Grant Vercel access to the repository
- Refresh the page

### Step 2.2: Configure Project Settings

You'll see the "Configure Project" screen:

**Project Name:**
- Vercel will suggest: `civilabs` or `civilabs-lms`
- You can change it or keep the default
- This becomes your subdomain: `civilabs-lms.vercel.app`

**Framework Preset:**
- Should auto-detect: **Next.js** ✓
- If not, select "Next.js" from dropdown

**Root Directory:**
- Leave as: **`./`** (root of repository)

**Build and Output Settings:**
- Leave default (Vercel auto-configures for Next.js)
- Build Command: `next build` (auto-detected)
- Output Directory: `.next` (auto-detected)
- Install Command: `npm install` (auto-detected)

**⚠️ IMPORTANT: Don't click "Deploy" yet!** We need to add environment variables first.

---

## Part 3: Configure Environment Variables (5 minutes)

### Step 3.1: Expand Environment Variables Section

1. On the "Configure Project" screen, scroll down
2. Find **"Environment Variables"** section
3. Click to expand it

### Step 3.2: Add Each Variable

Add these variables **one by one**:

#### Variable 1: DATABASE_URL
- **Key:** `DATABASE_URL`
- **Value:** `[paste your Neon connection string]`
  - Example: `postgresql://user:pass@ep-xyz.region.aws.neon.tech/civilabs_lms?sslmode=require`
- **Environment:** Select all (Production, Preview, Development)
- Click **"Add"**

#### Variable 2: JWT_SECRET
- **Key:** `JWT_SECRET`
- **Value:** `36f9e8d4000261b012cd5522f677a85c3ca7dedff178c927dbbfa4b2a3288334`
- **Environment:** Select all
- Click **"Add"**

#### Variable 3: NODE_ENV
- **Key:** `NODE_ENV`
- **Value:** `production`
- **Environment:** Production only
- Click **"Add"**

#### Variable 4: NEXT_PUBLIC_APP_URL
- **Key:** `NEXT_PUBLIC_APP_URL`
- **Value:** `https://civilabs-lms.vercel.app` (or your custom domain)
- **Environment:** Select all
- Click **"Add"**

**Note:** Replace `civilabs-lms` with your actual Vercel project name

#### Variable 5: NEXT_PUBLIC_SUPPORT_EMAIL
- **Key:** `NEXT_PUBLIC_SUPPORT_EMAIL`
- **Value:** `support@civilabs.com`
- **Environment:** Select all
- Click **"Add"**

#### Variable 6: NEXT_PUBLIC_SUPPORT_PHONE (Optional)
- **Key:** `NEXT_PUBLIC_SUPPORT_PHONE`
- **Value:** `+1 (555) 123-4567`
- **Environment:** Select all
- Click **"Add"**

#### Variable 7: NEXT_PUBLIC_SUPPORT_HOURS (Optional)
- **Key:** `NEXT_PUBLIC_SUPPORT_HOURS`
- **Value:** `Available Mon-Fri 9am-5pm`
- **Environment:** Select all
- Click **"Add"**

### Step 3.3: Verify All Variables

Your environment variables should show:
```
DATABASE_URL = postgresql://...
JWT_SECRET = 36f9e8d4...
NODE_ENV = production
NEXT_PUBLIC_APP_URL = https://civilabs-lms.vercel.app
NEXT_PUBLIC_SUPPORT_EMAIL = support@civilabs.com
NEXT_PUBLIC_SUPPORT_PHONE = +1 (555) 123-4567
NEXT_PUBLIC_SUPPORT_HOURS = Available Mon-Fri 9am-5pm
```

**✅ Checkpoint:** All environment variables configured.

---

## Part 4: Deploy Application (3-5 minutes)

### Step 4.1: Start Deployment

1. After adding all environment variables, scroll to bottom
2. Click **"Deploy"** button
3. Vercel will start building your application

### Step 4.2: Monitor Build Progress

You'll see real-time build logs:

**Expected Stages:**

1. **Cloning Repository** (~10 seconds)
   ```
   Cloning github.com/stephenfgarcia/Civilabs (Branch: main)
   Cloning completed in 5s
   ```

2. **Installing Dependencies** (~1-2 minutes)
   ```
   Running "npm install"
   added 500+ packages in 45s
   ```

3. **Running Build** (~1-2 minutes)
   ```
   Running "npm run build"
   Creating an optimized production build
   ✓ Compiled successfully
   ✓ Generating static pages (93/93)
   ```

4. **Deployment** (~30 seconds)
   ```
   Uploading build outputs
   Deployment Ready!
   ```

### Step 4.3: Deployment Success

When deployment completes, you'll see:
- 🎉 **Congratulations!** screen
- Your deployment URL: `https://civilabs-lms.vercel.app`
- **Visit** button to open your site

**✅ Checkpoint:** Application deployed successfully!

---

## Part 5: Initialize Production Database (5 minutes)

Your app is live, but the database is empty. Let's populate it.

### Step 5.1: Update Local .env Temporarily

1. Open your local `.env` file
2. **Make a backup copy** of current content
3. Update `DATABASE_URL` to production:
   ```env
   DATABASE_URL="postgresql://[your-neon-production-connection-string]"
   ```

### Step 5.2: Push Database Schema

Run in your terminal:
```bash
npx prisma db push
```

You'll see:
```
✔ Generated Prisma Client
✔ The database is now in sync with your Prisma schema
```

### Step 5.3: Seed Initial Data

Run:
```bash
npm run db:seed
```

You'll see:
```
✅ Seeding completed successfully
Created users, departments, courses, and FAQs
```

**Seed creates:**
- Admin: `admin@civilabs.com` / `admin123`
- Instructor: `instructor@civilabs.com` / `instructor123`
- Learner: `learner@civilabs.com` / `learner123`
- Sample departments and courses

### Step 5.4: Restore Local .env

**IMPORTANT:** Change your `.env` back to local database:
```env
DATABASE_URL="postgresql://stephen@localhost:5432/civilabs_lms?schema=public"
```

**✅ Checkpoint:** Production database initialized with schema and data.

---

## Part 6: Verify Deployment (5 minutes)

### Step 6.1: Test Health Check

1. Visit: `https://civilabs-lms.vercel.app/api/health`
2. Should show:
   ```json
   {
     "status": "healthy",
     "database": "connected",
     "timestamp": "2025-12-23T...",
     "environment": "production"
   }
   ```

**If you see this:** ✅ App and database working!

### Step 6.2: Test Homepage

1. Visit: `https://civilabs-lms.vercel.app`
2. Should see Civilabs LMS homepage
3. Check navigation, styles, no errors

### Step 6.3: Test Login

1. Click **"Login"**
2. Enter admin credentials:
   - Email: `admin@civilabs.com`
   - Password: `admin123`
3. Should redirect to admin dashboard

**If login works:** ✅ Full authentication working!

### Step 6.4: Quick Feature Checks

- [ ] Browse courses
- [ ] View course details
- [ ] Admin panel accessible
- [ ] No console errors (F12)

**✅ Checkpoint:** All core features working!

---

## Part 7: Configure Custom Domain (Optional)

If you want to use your own domain instead of `*.vercel.app`:

### Step 7.1: Add Domain in Vercel

1. In Vercel project settings, go to **"Domains"**
2. Click **"Add"**
3. Enter your domain: `lms.civilabs.com`
4. Click **"Add"**

### Step 7.2: Configure DNS

Vercel will show DNS instructions:

**For subdomain (e.g., lms.civilabs.com):**
- Add CNAME record: `lms` → `cname.vercel-dns.com`

**For root domain (e.g., civilabs.com):**
- Add A record: `@` → `76.76.21.21`
- Or use Vercel nameservers

### Step 7.3: Update Environment Variable

1. In Vercel project settings, go to **"Environment Variables"**
2. Edit `NEXT_PUBLIC_APP_URL`
3. Change to: `https://lms.civilabs.com` (your custom domain)
4. Redeploy the application

**✅ Custom domain configured!**

---

## Part 8: Automatic Deployments

### How It Works

From now on, every time you push to GitHub:
1. Vercel detects the push
2. Automatically builds and deploys
3. Updates your live site in ~2 minutes

### Try It Now

1. Make a small change locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Test auto-deploy"
   git push origin main
   ```
3. Watch Vercel dashboard - deployment starts automatically!

---

## 🎉 Deployment Complete!

Your Civilabs LMS is now live on Vercel!

### Your URLs

- **Production:** `https://civilabs-lms.vercel.app` (or your custom domain)
- **Admin Dashboard:** `https://civilabs-lms.vercel.app/admin`
- **Health Check:** `https://civilabs-lms.vercel.app/api/health`

### Test Accounts

- **Admin:** admin@civilabs.com / admin123
- **Instructor:** instructor@civilabs.com / instructor123
- **Learner:** learner@civilabs.com / learner123

### What's Configured

✅ Next.js 16 application on Vercel
✅ PostgreSQL database (Neon) connected
✅ Automatic SSL/HTTPS
✅ Environment variables configured
✅ Production optimizations active
✅ Auto-deploy on Git push
✅ Global CDN enabled

---

## Vercel Dashboard Features

### Useful Sections

**Deployments:**
- View all deployments
- Rollback to previous versions
- Preview URLs for each commit

**Analytics:**
- Page views
- Performance metrics
- Visitor insights

**Logs:**
- Real-time function logs
- Error tracking
- Performance monitoring

**Settings:**
- Environment variables
- Custom domains
- Build settings
- Team management

---

## Troubleshooting

### Issue: Build Failed
**Check:**
- Build logs in Vercel dashboard
- Ensure all dependencies in package.json
- Verify no TypeScript errors locally

### Issue: Database Connection Failed
**Check:**
- DATABASE_URL is correct
- Neon database is active
- Connection string includes `?sslmode=require`
- No extra spaces in environment variable

### Issue: Environment Variables Not Loading
**Check:**
- Variables are set for correct environment (Production/Preview/Development)
- Redeploy after adding new variables
- No typos in variable names

### Issue: Custom Domain Not Working
**Check:**
- DNS records propagated (can take up to 48 hours)
- CNAME points to `cname.vercel-dns.com`
- SSL certificate issued (automatic, takes ~5 minutes)

---

## Cost Summary

### Current Setup (Free)

- **Vercel Hobby Plan:** $0/month
  - Unlimited deployments
  - 100GB bandwidth
  - Automatic SSL
  - Global CDN

- **Neon Free Tier:** $0/month
  - 3GB storage
  - Unlimited compute hours
  - Automatic backups (7 days)

**Total: $0/month**

### When to Upgrade

**Vercel Pro ($20/month):**
- Team collaboration
- Password protection
- More bandwidth (1TB)
- Advanced analytics

**Neon Pro ($19/month):**
- More storage (unlimited)
- No auto-suspend
- Point-in-time recovery
- Better performance

---

## Next Steps

1. **Change Default Passwords** - Update seeded user passwords
2. **Add Real Content** - Create actual courses and users
3. **Configure Email** - Setup SMTP for password resets (optional)
4. **Monitor Performance** - Check Vercel Analytics
5. **Setup Monitoring** - Consider Sentry for error tracking
6. **Optimize Images** - Use Next.js Image component
7. **Add Custom Domain** - If not already done

---

## Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Vercel Support:** https://vercel.com/support
- **Neon Documentation:** https://neon.tech/docs
- **Next.js Deployment:** https://nextjs.org/docs/deployment

---

## Comparison: Vercel vs Hostinger

| Feature | Vercel | Hostinger |
|---------|--------|-----------|
| Next.js Support | ✅ Native | ⚠️ Manual |
| Setup Time | 5 minutes | 30-60 minutes |
| Auto-Deploy | ✅ Yes | ❌ No |
| SSL/HTTPS | ✅ Automatic | ⚠️ Manual |
| CDN | ✅ Included | ❌ Not included |
| Rollbacks | ✅ One-click | ⚠️ Manual |
| Free Tier | ✅ Generous | ❌ Paid only |
| Best For | Next.js apps | Traditional hosting |

**Verdict:** Vercel is the better choice for Next.js applications! 🚀

---

**Ready to deploy?** Follow the steps above and your app will be live in under 15 minutes!
