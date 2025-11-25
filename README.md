# 🏗️ Civilabs LMS - Construction Industry Learning Management System

[![TypeScript](https://img.shields.io/badge/TypeScript-100%25-blue)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-16.0.3-black)](https://nextjs.org/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success)](https://github.com/stephenfgarcia/Civilabs)

A comprehensive, production-ready Learning Management System built specifically for the construction industry, featuring a unique construction-themed design, complete admin capabilities, and full API integration.

---

## 🎯 Project Status

**Version:** 1.0.0
**Status:** ✅ Production Ready
**Completion:** 100% (34/34 pages complete)
**API Integration:** 100% (16 services, 100+ endpoints)

---

## ✨ Key Features

### 🎓 Student Portal (14 Pages)
- Interactive dashboard with progress tracking
- Course catalog with search and filters
- Video lesson player with completion tracking
- Assignment submission system
- Discussion forums
- Certificate viewing and download
- Achievements and badges
- Calendar integration
- Profile management

### 👨‍🏫 Instructor Portal (7 Pages)
- Analytics dashboard
- Course creation and management (CRUD)
- Student progress monitoring
- Assignment grading system
- Performance analytics
- Content library

### 🛠️ Admin Portal (11 Pages)
- System-wide dashboard
- User management (CRUD with role assignment)
- Complete course management
- Enrollment tracking
- Certificate issuance
- Department hierarchy management
- System-wide notifications
- Discussion moderation
- Media upload and management
- **Reports & Analytics with CSV/PDF export**
- Platform settings

### 🔐 Security & Authentication
- JWT-based authentication
- Role-based access control (Admin, Instructor, Student)
- Secure password hashing
- Protected API routes

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 16.0.3 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, Custom Construction Theme
- **Icons**: Lucide React
- **State Management**: React Hooks
- **Forms**: Controlled components with validation

### Backend
- **API**: Next.js API Routes
- **Database ORM**: Prisma
- **Database**: PostgreSQL
- **Authentication**: JWT
- **Password Hashing**: bcrypt
- **File Upload**: Custom media service

### Architecture
- Service layer pattern for API calls
- Type-safe API responses
- Comprehensive error handling
- Loading states throughout
- Toast notifications for user feedback

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

```bash
# 1. Clone repository
git clone https://github.com/stephenfgarcia/Civilabs.git
cd civilabs-lms

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# 4. Set up database
createdb civilabs_lms
npx prisma migrate dev
npx prisma db seed

# 5. Run development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

---

## 🔑 Default Accounts

After seeding:

**Admin:**
- Email: admin@civilabs.com
- Password: admin123

**Instructor:**
- Email: instructor@civilabs.com
- Password: instructor123

**Student:**
- Email: learner@civilabs.com
- Password: learner123

---

## 📁 Project Structure

```
civilabs-lms/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Student portal (14 pages)
│   │   ├── dashboard/
│   │   ├── courses/
│   │   ├── my-learning/
│   │   ├── lessons/
│   │   ├── assignments/
│   │   ├── discussions/
│   │   ├── certificates/
│   │   ├── progress/
│   │   ├── calendar/
│   │   ├── achievements/
│   │   ├── help/
│   │   ├── profile/
│   │   ├── settings/
│   │   └── notifications/
│   ├── (instructor)/        # Instructor portal (7 pages)
│   │   └── instructor/
│   │       ├── dashboard/
│   │       ├── courses/
│   │       ├── students/
│   │       ├── assignments/
│   │       ├── analytics/
│   │       ├── schedule/
│   │       └── content/
│   ├── (admin)/             # Admin portal (11 pages)
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── users/
│   │       ├── courses/
│   │       ├── enrollments/
│   │       ├── certificates/
│   │       ├── departments/
│   │       ├── notifications/
│   │       ├── discussions/
│   │       ├── content/
│   │       ├── reports/
│   │       └── settings/
│   └── api/                 # API routes (100+ endpoints)
│       ├── auth/
│       ├── courses/
│       ├── users/
│       ├── admin/
│       └── ...
├── components/              # Reusable components (200+)
│   ├── ui/                 # Base UI components
│   ├── charts/             # Chart components
│   └── forms/              # Form components
├── lib/                     # Core utilities
│   ├── services/           # API service layer (16 services)
│   │   ├── api-client.ts
│   │   ├── users.service.ts
│   │   ├── courses.service.ts
│   │   ├── admin.service.ts
│   │   ├── admin-enrollments.service.ts
│   │   └── ...
│   ├── utils/              # Helper functions
│   └── types/              # TypeScript types
├── hooks/                   # Custom React hooks
├── prisma/
│   └── schema.prisma       # Database schema
└── public/                  # Static assets
```

---

## 📊 Service Layer Architecture

The application uses a comprehensive service layer for all API interactions:

```typescript
// Example: Using the service layer
import { usersService, coursesService } from '@/lib/services'

// Fetch users
const response = await usersService.getUsers()
const users = response.data

// Create course
await coursesService.createCourse({
  title: 'Safety Training',
  category: 'Safety'
})
```

### Available Services
- `usersService` - User management
- `coursesService` - Course operations
- `adminService` - Admin operations
- `adminEnrollmentsService` - Enrollment management
- `instructorService` - Instructor features
- `discussionsService` - Forum/discussions
- `notificationsService` - Notifications
- `certificatesService` - Certificates
- `departmentsService` - Departments
- `mediaService` - File uploads
- `reviewsService` - Reviews
- `bookmarksService` - Bookmarks
- `messagesService` - Messaging
- `searchService` - Search
- `questionsService` - Q&A
- `authService` - Authentication

---

## 🎨 Construction Theme

The application features a unique construction-themed design:

- **Bold Typography**: Font-black weights for headings
- **Industrial Colors**: Gradients with construction colors
- **Concrete Textures**: Textured backgrounds
- **Blueprint Grids**: Grid patterns throughout
- **Glass Morphism**: Modern glass effects
- **Magnetic Buttons**: Interactive button components
- **CSS-Only Animations**: Optimized for performance

---

## 📚 Documentation

- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Current project status and metrics
- **[DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md)** - Development guidelines and standards
- **[SETUP.md](SETUP.md)** - Detailed setup instructions
- **[QUICK_START.md](QUICK_START.md)** - Quick start guide
- **[DOCUMENTATION.md](DOCUMENTATION.md)** - Complete API documentation

---

## 🔧 Development

### Available Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server

# Database
npx prisma studio    # Open Prisma Studio
npx prisma migrate dev  # Run migrations
npx prisma generate  # Generate Prisma client
npm run db:seed      # Seed database

# Code Quality
npx tsc --noEmit    # Type check
npm run lint         # Lint code
```

### Development Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and test thoroughly
3. Commit with descriptive message
4. Push and create pull request
5. Merge after review
6. Clean up feature branch

See [DEVELOPMENT_WORKFLOW.md](DEVELOPMENT_WORKFLOW.md) for detailed guidelines.

---

## 🧪 Testing

### Manual Testing Checklist
- [ ] TypeScript compilation passes
- [ ] Production build succeeds
- [ ] All features work as expected
- [ ] Responsive on mobile/tablet/desktop
- [ ] Error handling works correctly
- [ ] Loading states are present
- [ ] Toast notifications provide feedback

### Test Accounts
Use the default seeded accounts for testing all role-based features.

---

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Environment Variables
Required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth.js secret
- `JWT_SECRET` - JWT signing secret

---

## 📈 Features Highlights

### Admin Reports & Analytics
- 5 report types: Users, Courses, Enrollments, Certificates, Revenue
- CSV export with proper formatting
- PDF export via browser print
- Real-time data from APIs
- Date range filtering
- Interactive charts

### Media Management
- Multi-file upload support
- Support for videos, images, documents
- Storage usage tracking
- File management interface

### Discussion Moderation
- Pin/unpin discussions
- Lock/unlock threads
- Mark as solved
- Delete moderation
- Category management

---

## 🏆 Code Quality

- ✅ **100% TypeScript** - Full type safety
- ✅ **Zero TS Errors** - Clean compilation
- ✅ **Service Layer** - Organized API calls
- ✅ **Error Handling** - Comprehensive try-catch blocks
- ✅ **Loading States** - User feedback everywhere
- ✅ **Responsive Design** - Mobile-first approach
- ✅ **Performance** - Optimized for low-end devices

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📝 License

This project is licensed under the MIT License.

---

## 📞 Support

For support or questions:
- **Email**: support@civilabs.com
- **Issues**: [GitHub Issues](https://github.com/stephenfgarcia/Civilabs/issues)
- **Documentation**: See [DOCUMENTATION.md](DOCUMENTATION.md)

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Radix UI](https://www.radix-ui.com/)

---

**Status**: ✅ Production Ready | **Build**: ✅ Passing | **TypeScript**: ✅ No Errors

Made with ❤️ for the construction industry
