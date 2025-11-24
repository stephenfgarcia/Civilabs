# Test Accounts for Civilabs LMS

## Login Credentials

Use these credentials to test different user roles:

### 1. Admin Account
- **Email**: `admin@civilabs.com`
- **Password**: `admin123`
- **Role**: SUPER_ADMIN
- **Access**: Full system access including /admin dashboard

### 2. Instructor Account
- **Email**: `instructor@civilabs.com`
- **Password**: `instructor123`
- **Role**: INSTRUCTOR
- **Access**: Can create and manage courses

### 3. Learner Account
- **Email**: `learner@civilabs.com`
- **Password**: `learner123`
- **Role**: LEARNER
- **Access**: Can enroll in courses and view learner dashboard

## Important Notes

- These accounts are created automatically by the database seed script ([prisma/seed.ts](prisma/seed.ts))
- Passwords are hashed using bcrypt with 10 rounds
- All accounts have status: ACTIVE
- If login fails, make sure:
  1. You're typing the password exactly (case-sensitive)
  2. The database has been seeded (`npm run db:seed`)
  3. The Next.js dev server is running (`npm run dev`)

## Development Server

Access the application at: **http://localhost:3001** or **http://localhost:3000**

## Troubleshooting

If you can't log in:

1. Check if users exist in database:
   ```bash
   npx prisma studio
   ```
   Then navigate to the User table

2. Reset the database and reseed:
   ```bash
   npx prisma migrate reset
   ```
   This will drop all data and re-run migrations and seed

3. Check server logs for 401 errors - they will show which credential failed
