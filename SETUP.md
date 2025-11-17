# Absorb LMS - Setup Guide

## Quick Start (5 minutes)

### 1. Install PostgreSQL

**macOS (using Homebrew):**
```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Windows:**
Download from https://www.postgresql.org/download/windows/

### 2. Create Database

```bash
# Create database
createdb absorb_lms

# Or using psql
psql postgres
CREATE DATABASE absorb_lms;
\q
```

### 3. Configure Environment

```bash
# Copy environment template
cp .env.example .env

# Edit .env with your database URL
# Example: DATABASE_URL="postgresql://username:password@localhost:5432/absorb_lms"
```

### 4. Setup Database Schema

```bash
# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

### 5. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Default Login Credentials

After seeding, you can login with:

**Super Admin:**
- Email: admin@absorblms.com
- Password: admin123

**Instructor:**
- Email: instructor@absorblms.com
- Password: instructor123

**Learner:**
- Email: learner@absorblms.com
- Password: learner123

## Troubleshooting

### Database Connection Issues

If you get database connection errors:

1. Check PostgreSQL is running:
```bash
# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql
```

2. Verify database exists:
```bash
psql -l | grep absorb_lms
```

3. Test connection:
```bash
psql absorb_lms
```

4. Check .env DATABASE_URL format:
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"
```

### Prisma Issues

If Prisma client is not generated:
```bash
npx prisma generate
```

If migrations fail:
```bash
npx prisma db push --force-reset
npm run db:seed
```

### Port Already in Use

If port 3000 is busy:
```bash
# Run on different port
PORT=3001 npm run dev
```

## Development Tools

### Prisma Studio (Database GUI)
```bash
npm run db:studio
```

### View Logs
```bash
# Development mode shows all logs
npm run dev
```

### Reset Database
```bash
npx prisma db push --force-reset
npm run db:seed
```

## Next Steps

1. ✅ Login with test accounts
2. ✅ Explore the learner dashboard
3. ✅ Browse sample course
4. ✅ Try enrolling in a course
5. ✅ Access admin panel (use admin account)
6. ✅ Create your first course

## Production Deployment

### Build for Production
```bash
npm run build
npm start
```

### Environment Variables for Production

Update `.env` with production values:
```env
DATABASE_URL="your-production-db-url"
NEXTAUTH_SECRET="generate-random-secret"
JWT_SECRET="generate-random-secret"
NEXTAUTH_URL="https://yourdomain.com"
```

### Deploy Options

- **Vercel** (Recommended for Next.js)
- **Docker** (see Dockerfile)
- **Cloud platforms** (AWS, GCP, Azure)

## Support

- Documentation: `/docs`
- Issues: GitHub Issues
- Email: support@absorblms.com

## License

MIT
