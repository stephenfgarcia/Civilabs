# Civilabs - Learning Management System

A comprehensive Learning Management System built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## Features

### Core Functionality
- ✅ User Authentication (Login/Register)
- ✅ Role-based Access Control (Super Admin, Admin, Instructor, Learner)
- ✅ Course Creation & Management
- ✅ Multi-format Lesson Support (Video, PDF, Text, Quiz, SCORM)
- ✅ Quiz Builder with Multiple Question Types
- ✅ Progress Tracking
- ✅ Certificate Generation
- ✅ Learning Paths
- ✅ Gamification (Badges, Points, Leaderboard)
- ✅ Reporting & Analytics
- ✅ Department Management
- ✅ Responsive Design

## Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Radix UI Components
- Zustand (State Management)
- React Query
- Lucide Icons

**Backend:**
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- JWT Authentication
- bcrypt

## Getting Started

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd civilabs-lms
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Edit `.env` with your database credentials and secrets:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/civilabs_lms"
NEXTAUTH_SECRET="your-secret-key"
JWT_SECRET="your-jwt-secret"
```

4. Set up the database
```bash
# Create database
createdb civilabs_lms

# Run migrations
npx prisma migrate dev --name init

# Seed database (optional)
npx prisma db seed
```

5. Generate Prisma Client
```bash
npx prisma generate
```

6. Run the development server
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Default Accounts

After seeding, you can login with:

**Super Admin:**
- Email: admin@civilabs.com
- Password: admin123

**Instructor:**
- Email: instructor@civilabs.com
- Password: instructor123

**Learner:**
- Email: learner@civilabs.com
- Password: learner123

## Project Structure

```
civilabs-lms/
├── app/
│   ├── (auth)/           # Authentication pages
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/      # Learner dashboard
│   │   ├── dashboard/
│   │   ├── courses/
│   │   ├── my-learning/
│   │   ├── certificates/
│   │   └── profile/
│   ├── (admin)/          # Admin panel
│   │   └── admin/
│   │       ├── dashboard/
│   │       ├── users/
│   │       ├── courses/
│   │       └── reports/
│   ├── api/              # API routes
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── enrollments/
│   │   └── quizzes/
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   ├── courses/          # Course-related components
│   ├── quizzes/          # Quiz components
│   └── admin/            # Admin components
├── lib/
│   ├── api/              # API client functions
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   └── validations/      # Zod schemas
├── prisma/
│   └── schema.prisma     # Database schema
├── public/
│   ├── templates/        # Certificate templates
│   └── images/
└── types/                # TypeScript types
```

## Database Schema

The application uses a comprehensive database schema with the following main entities:

- **Users**: User accounts with roles and permissions
- **Departments**: Organizational structure
- **Categories**: Course categorization
- **Courses**: Course information and metadata
- **Lessons**: Individual learning units
- **Quizzes**: Assessments with questions
- **Enrollments**: User-course relationships
- **Progress Tracking**: Lesson completion and time tracking
- **Certificates**: Course completion certificates
- **Learning Paths**: Structured learning journeys
- **Gamification**: Badges and points system

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Courses
- `GET /api/courses` - List courses
- `GET /api/courses/:id` - Get course details
- `POST /api/courses` - Create course (Admin)
- `PUT /api/courses/:id` - Update course (Admin)
- `DELETE /api/courses/:id` - Delete course (Admin)

### Enrollments
- `POST /api/enrollments` - Enroll in course
- `GET /api/enrollments/:id/progress` - Get progress
- `POST /api/enrollments/:id/lessons/:lessonId/complete` - Mark lesson complete

### Quizzes
- `POST /api/quizzes/:id/attempts` - Start quiz attempt
- `PUT /api/quizzes/:id/attempts/:attemptId` - Submit quiz

See full API documentation in `/docs/api.md`

## Development

### Running Prisma Studio
```bash
npx prisma studio
```

### Database Migrations
```bash
npx prisma migrate dev
```

### Building for Production
```bash
npm run build
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For support, email support@civilabs.com or open an issue in the repository.
