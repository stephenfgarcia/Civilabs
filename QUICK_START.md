# Absorb LMS - Quick Start Guide

## ✅ Your Application is Ready!

The Absorb LMS application is now fully set up and running at **http://localhost:3000**

## 🔑 Test Accounts

Login with these credentials:

| Role | Email | Password |
|------|-------|----------|
| **Admin** | admin@absorblms.com | admin123 |
| **Instructor** | instructor@absorblms.com | instructor123 |
| **Learner** | learner@absorblms.com | learner123 |

## 📱 Available Pages

### Public Pages
- **Landing Page**: http://localhost:3000
- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register

### Learner Dashboard (After Login)
- **Dashboard**: http://localhost:3000/dashboard
- **My Learning**: http://localhost:3000/my-learning
- **Course Catalog**: http://localhost:3000/courses
- **Certificates**: http://localhost:3000/certificates
- **Leaderboard**: http://localhost:3000/leaderboard
- **Profile**: http://localhost:3000/profile
- **Help**: http://localhost:3000/help

### Admin Panel (Admin Login Required)
- **Admin Dashboard**: http://localhost:3000/admin

## 🎨 Features Implemented

✅ **Authentication System**
- Secure login/registration
- JWT tokens
- Role-based access control
- Password hashing with bcrypt

✅ **User Interface**
- Beautiful gradient design (blue to purple)
- Responsive layout
- Professional navigation
- Card-based components

✅ **Database**
- PostgreSQL with 20+ tables
- Prisma ORM
- Sample data (1 course, 3 users, 2 departments)

✅ **Pages Created**
- Landing page
- Login/Register
- Learner dashboard with 7 pages
- Admin dashboard

## 🚀 How to Use

1. **Visit the Landing Page**: http://localhost:3000
   - Click "Sign In" button

2. **Login**: 
   - Use any test account
   - You'll be redirected to appropriate dashboard

3. **Navigate**:
   - Use the sidebar to explore different pages
   - Click on user avatar (top right) to logout

4. **Admin Access**:
   - Login with admin@absorblms.com
   - Access admin panel at /admin

## 🛠️ Development Commands

```bash
# Run development server
npm run dev

# View database in browser
npm run db:studio

# Reset database
npm run db:push -- --force-reset
npm run db:seed
```

## 📊 Database Management

**Prisma Studio** (Database GUI):
```bash
npm run db:studio
```
Opens at http://localhost:5555

You can:
- View all data
- Edit records
- Create new entries
- Delete records

## 🔄 What's Working

- ✅ User registration and login
- ✅ Protected routes
- ✅ Dashboard navigation
- ✅ Database queries
- ✅ Responsive design
- ✅ Hot reload

## 📝 Sample Data

The database includes:
- 3 test users (Admin, Instructor, Learner)
- 2 departments (IT, HR)
- 1 sample course: "Introduction to Web Development"
  - 3 lessons (HTML, CSS, Quiz)
  - Quiz with 2 questions

## 🎯 Next Steps

Ready to build more features? You can add:
- Course listing page
- Course enrollment
- Video player
- Quiz taking functionality
- Certificate generation
- File uploads
- Admin course builder

Enjoy your LMS! 🚀
