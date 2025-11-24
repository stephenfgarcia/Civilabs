# Quick Start: Deploy to Vercel in 10 Minutes

## Step-by-Step Checklist

### ☐ Step 1: Set Up Database (5 minutes)

1. Go to [neon.tech](https://neon.tech)
2. Sign up with GitHub
3. Create project: `civilabs-lms`
4. Copy the connection string (starts with `postgresql://`)

**Your DATABASE_URL will look like:**
```
postgresql://user:pass@ep-xxxxx.region.neon.tech/dbname?sslmode=require
```

---

### ☐ Step 2: Generate JWT Secret (1 minute)

Run this command locally:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Save the output** - you'll need it in Step 4

---

### ☐ Step 3: Push Code to GitHub (if not done)

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

---

### ☐ Step 4: Deploy to Vercel (2 minutes)

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click **"Add New Project"**
4. Import your `civilabs-lms` repository
5. Configure:
   - Framework: Next.js (auto-detected)
   - Leave build settings as default

6. **Add Environment Variables**:
   Click "Environment Variables" and add:

   ```
   DATABASE_URL=<paste your Neon connection string>
   JWT_SECRET=<paste the hex string from Step 2>
   NODE_ENV=production
   ```

7. Click **Deploy**

**Wait 2-3 minutes** for deployment to complete

---

### ☐ Step 5: Run Database Migrations (2 minutes)

After deployment succeeds:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.local

# Run migrations
npx prisma migrate deploy

# Seed database
npx prisma db seed
```

---

### ☐ Step 6: Test Your App

Your app is now live at: `https://your-project.vercel.app`

**Test login with:**
- Admin: `admin@civilabs.com` / `admin123`
- Instructor: `instructor@civilabs.com` / `instructor123`
- Learner: `learner@civilabs.com` / `learner123`

---

## What You Just Built

- ✅ Full-stack LMS application
- ✅ PostgreSQL database (hosted on Neon)
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN deployment
- ✅ Automatic deployments from Git

---

## Optional: Add Custom Domain

1. In Vercel dashboard → **Settings** → **Domains**
2. Add your domain (e.g., `lms.yourdomain.com`)
3. Update DNS records as shown
4. SSL certificate is automatic

---

## Troubleshooting

### Build Fails

**Error: "Prisma Client not generated"**
- Already fixed! `package.json` has `postinstall` script

**Error: "Cannot connect to database"**
- Check DATABASE_URL includes `?sslmode=require`
- Verify Neon project is active

### Migrations Fail

```bash
# Reset and retry
npx prisma migrate reset
npx prisma migrate deploy
npx prisma db seed
```

### Can't Login

- Ensure migrations ran: `npx prisma migrate deploy`
- Ensure seeding completed: `npx prisma db seed`
- Check browser console for errors

---

## Next Steps

After successful deployment:

1. ✅ **Customize branding** - Update logo, colors
2. ✅ **Add courses** - Create your first course
3. ✅ **Invite users** - Add real users
4. ✅ **Configure email** - Set up email notifications
5. ✅ **Monitor usage** - Set up Vercel Analytics

---

## Cost

### Free Tier Limits (Perfect for testing/small deployments)

**Vercel:**
- 100GB bandwidth/month
- Unlimited deployments
- Automatic HTTPS
- **Cost: $0/month**

**Neon (Database):**
- 0.5GB storage
- Unlimited compute hours
- **Cost: $0/month**

### When to Upgrade

Upgrade when you exceed:
- 100GB bandwidth (Vercel)
- 0.5GB database storage (Neon)
- Need custom domain features

---

## Support

**Having issues?** Check:
1. [DEPLOYMENT.md](./DEPLOYMENT.md) - Full deployment guide
2. [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md) - VPS alternative
3. Vercel logs: `vercel logs`
4. Database: `npx prisma studio`

---

## Deployment Script

Or use the automated script:

```bash
chmod +x scripts/deploy-vercel.sh
./scripts/deploy-vercel.sh
```

This will guide you through all steps automatically.
