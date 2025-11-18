# Deployment Guide

## Quick Deploy to Vercel

### 1. Database Setup (Neon)

1. Go to [neon.tech](https://neon.tech) and sign up
2. Create new project: `civilabs-lms`
3. Copy your DATABASE_URL (looks like):
   ```
   postgresql://user:pass@ep-xxxxx.region.neon.tech/dbname?sslmode=require
   ```

### 2. Deploy to Vercel

1. **Go to** [vercel.com](https://vercel.com)
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import your repository** (`civilabs-lms`)
5. **Configure Project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build`
   - Output Directory: `.next` (default)
   - Install Command: `npm install`

6. **Add Environment Variables** (click "Environment Variables"):

   ```env
   DATABASE_URL=your-neon-database-url-here
   JWT_SECRET=generate-random-string-see-below
   NODE_ENV=production
   ```

   **Generate JWT_SECRET**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
   Copy the output and use as JWT_SECRET

7. **Click "Deploy"**

### 3. Run Database Migrations

After first deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
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

### 4. Access Your App

- Your app will be at: `https://your-project-name.vercel.app`
- Test login with seeded users:
  - Admin: `admin@civilabs.com` / `admin123`
  - Instructor: `instructor@civilabs.com` / `instructor123`
  - Learner: `learner@civilabs.com` / `learner123`

---

## Deploy to Hostinger VPS (Later)

See [HOSTINGER_DEPLOYMENT.md](./HOSTINGER_DEPLOYMENT.md) for detailed VPS deployment instructions.

---

## Troubleshooting

### Build fails on Vercel

**Error: Prisma Client not generated**
```bash
# Add to package.json scripts:
"postinstall": "prisma generate"
```

**Error: Environment variables not found**
- Double-check all env vars are set in Vercel dashboard
- Make sure DATABASE_URL includes `?sslmode=require`

### Database connection fails

**Error: Can't reach database**
- Check DATABASE_URL format
- Ensure Neon project is active
- Verify IP allowlist (Neon allows all by default)

### Migrations fail

**Error: Migration failed**
```bash
# Reset and re-run
npx prisma migrate reset
npx prisma migrate deploy
npx prisma db seed
```

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://...` |
| `JWT_SECRET` | Secret for JWT tokens (32+ chars) | Random hex string |
| `NODE_ENV` | Environment | `production` |
| `NEXT_PUBLIC_APP_URL` | Your app URL | `https://app.vercel.app` |

---

## Post-Deployment Checklist

- [ ] Database migrations ran successfully
- [ ] Database seeded with initial data
- [ ] Login works (test all 3 user types)
- [ ] Course enrollment works
- [ ] Certificates can be issued
- [ ] Notifications appear
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active (automatic on Vercel)
