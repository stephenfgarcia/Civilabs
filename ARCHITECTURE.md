# CiviLabs LMS - System Architecture & Design

## 🎯 Project Vision

**CiviLabs LMS** is a comprehensive Learning Management System designed specifically for the construction and civil engineering industry, providing safety training, equipment operation courses, and professional development for construction workers, engineers, and supervisors.

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Learner    │  │  Instructor  │  │    Admin     │          │
│  │  Dashboard   │  │  Dashboard   │  │  Dashboard   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│           Next.js 15 App Router + React Server Components        │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    MIDDLEWARE LAYER                              │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Authentication & Authorization (JWT + Role-Based)     │     │
│  │  Route Protection | Session Management | RBAC          │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      API LAYER (REST)                            │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │   Auth   │ │  Courses │ │   Users  │ │  Quizzes │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Progress │ │  Certs   │ │ Notifs   │ │ Analytics│          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
│                Next.js API Routes (/app/api)                     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                                 │
│  ┌────────────────────────────────────────────────────────┐     │
│  │  Business Logic | Validation | Error Handling          │     │
│  │  Data Transformation | Authorization Checks            │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATA ACCESS LAYER                             │
│  ┌────────────────────────────────────────────────────────┐     │
│  │              Prisma ORM (Type-Safe)                    │     │
│  │  Models | Queries | Transactions | Migrations          │     │
│  └────────────────────────────────────────────────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASE LAYER                                │
│                   PostgreSQL (Production)                        │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐        │
│  │ Users│ │Course│ │Enroll│ │Lessons│ │Quizzes│ │ Certs│        │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Database Schema (Prisma)

### Core Entities

#### **User Management**
- **User**: Core user entity with roles (LEARNER, INSTRUCTOR, ADMIN, SUPER_ADMIN)
- **Department**: Organizational hierarchy with parent-child relationships
- **UserPoints**: Gamification points system
- **UserBadge**: Achievement badges

#### **Course Management**
- **Course**: Main course entity with status, visibility, difficulty
- **Lesson**: Individual lessons with content types (VIDEO, DOCUMENT, QUIZ, etc.)
- **Category**: Hierarchical course categorization
- **LearningPath**: Curated course sequences

#### **Learning Progress**
- **Enrollment**: User course enrollments with status tracking
- **LessonProgress**: Individual lesson completion tracking
- **Quiz**: Lesson quizzes with questions
- **QuizAttempt**: Quiz attempt history with scores

#### **Certification**
- **Certificate**: Certificate templates
- **UserCertificate**: Issued certificates with verification codes

#### **Engagement**
- **Notification**: System notifications
- **ActivityLog**: User activity tracking
- **Bookmark**: Saved courses/lessons

#### **Future Entities**
- Discussion forums (planned)
- Reviews/Ratings (planned)
- File uploads/Content library (planned)

---

## 🎨 Frontend Architecture

### Technology Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with construction theme
- **State Management**: React Server Components + Client Components
- **Forms**: React Hook Form + Zod validation
- **Data Fetching**: Custom hooks + API client service

### Design System

#### **Theme: Construction Industry**
- **Colors**: Warning yellow/orange (#FFA500), Safety red, Blueprint blue
- **Typography**: Bold, industrial fonts
- **Effects**: Glass morphism, blueprint grid backgrounds
- **Animations**: CSS-only (performance optimized)
- **Icons**: Lucide React

#### **Component Library**
```
components/
├── ui/
│   ├── button.tsx              # Base button component
│   ├── card.tsx                # Card container
│   ├── input.tsx               # Form inputs
│   ├── magnetic-button.tsx     # Interactive button with hover effect
│   ├── data-table.tsx          # Reusable sortable table
│   ├── paginated-table.tsx     # Table with pagination
│   └── ...
├── layout/
│   ├── sidebar.tsx             # Navigation sidebar
│   ├── header.tsx              # Top navigation
│   └── footer.tsx              # Footer
└── features/
    ├── course-card.tsx         # Course display card
    ├── progress-bar.tsx        # Progress visualization
    └── ...
```

---

## 🔐 Authentication & Authorization

### Authentication Flow
```
1. User Login → POST /api/auth/login
2. Verify credentials (email + password hash)
3. Generate JWT token with payload:
   {
     userId: string
     email: string
     role: UserRole
     departmentId?: string
   }
4. Store token in:
   - httpOnly cookie (secure, SSR-friendly)
   - localStorage (client-side API calls)
5. Return user profile + token
```

### Authorization Levels

| Role | Access |
|------|--------|
| **LEARNER** | Dashboard, Courses, My Learning, Profile, Certificates |
| **INSTRUCTOR** | + Instructor Dashboard, Student Management, Course Creation |
| **ADMIN** | + Admin Dashboard, User Management, System Settings |
| **SUPER_ADMIN** | + Full system access, Department Management |

### Route Protection (Middleware)

```typescript
// Public routes (no auth required)
/, /login, /register, /forgot-password

// Protected routes (auth required)
/dashboard/*, /courses/*, /profile, etc.

// Role-restricted routes
/admin/*      → ADMIN, SUPER_ADMIN only
/instructor/* → INSTRUCTOR, ADMIN, SUPER_ADMIN
```

---

## 🔄 Data Flow

### Example: Course Enrollment Flow

```
1. USER ACTION
   └─> Click "Enroll" button on course card

2. CLIENT COMPONENT
   └─> Call enrollInCourse() from useCourses hook

3. REACT HOOK
   └─> Send POST request via apiClient

4. API CLIENT
   └─> Add auth headers (Bearer token)
   └─> POST /api/enrollments

5. API ROUTE
   └─> Extract user from JWT token
   └─> Validate request body (Zod schema)
   └─> Check business rules (already enrolled?)

6. PRISMA ORM
   └─> Create enrollment record
   └─> Create initial lesson progress records
   └─> Send notification to user

7. RESPONSE
   └─> Return enrollment data
   └─> Hook updates local state
   └─> UI shows enrolled status
```

---

## 📱 User Interfaces

### 1. **Learner Dashboard** (`/dashboard`)
- Welcome banner with personalized greeting
- Quick stats: enrolled courses, completed, certificates earned
- Continue learning section
- Recommended courses
- Recent notifications
- Upcoming deadlines

### 2. **Courses Page** (`/courses`)
- Search bar with live filtering
- Category filters (dropdown/pills)
- Difficulty level filters
- Sort options (newest, popular, rating)
- Grid/list view toggle
- Course cards with:
  - Thumbnail image
  - Title & description
  - Instructor name
  - Duration & difficulty
  - Enroll button

### 3. **Course Detail** (`/courses/[id]`)
- Hero section with course info
- Tab navigation:
  - Overview (description, learning objectives)
  - Curriculum (lesson list with duration)
  - Instructor bio
  - Reviews (future)
- Enroll button (if not enrolled)
- "Continue Learning" button (if enrolled)
- Progress indicator (if in progress)

### 4. **Course Player** (`/courses/[id]/lessons/[lessonId]`)
- Video/content player (main area)
- Lesson sidebar navigation
- Progress checkboxes
- Next/Previous buttons
- Quiz integration
- Bookmark feature
- Download materials (if allowed)

### 5. **My Learning** (`/my-learning`)
- Tabs: In Progress | Completed | Not Started
- Course cards with progress bars
- Filter by category
- Sort by recent, progress, due date
- "Continue" button for each course

### 6. **Profile** (`/profile`)
- Avatar upload
- Personal info form (name, email, bio)
- Department & role display
- Learning stats (total hours, courses completed)
- Achievements/badges section
- Edit mode toggle

### 7. **Certificates** (`/certificates`)
- Grid of certificate cards
- Certificate preview modal
- Download PDF button
- Share to LinkedIn integration
- Filter by date/course
- Print functionality

### 8. **Leaderboard** (`/leaderboard`)
- Top learners table (rank, avatar, name, points)
- Current user highlight
- Time period filter (week, month, all-time)
- Department filter
- Sortable columns

---

## 🛠️ Admin Interface

### 1. **Admin Dashboard** (`/admin`)
- System health overview
- Key metrics cards:
  - Total users
  - Active courses
  - Total enrollments
  - Certificates issued
- Charts:
  - User growth over time
  - Course popularity
  - Completion rates
- Recent activity feed
- Quick actions panel

### 2. **User Management** (`/admin/users`)
- Searchable, sortable user table
- Filters: role, department, status
- Actions per user:
  - View profile
  - Edit details
  - Change role
  - Deactivate/activate
  - Reset password
- Bulk actions
- Add new user button
- Export to CSV

### 3. **Course Management** (`/admin/courses`)
- Course list table with status badges
- Create course wizard:
  - Basic info
  - Add lessons
  - Upload materials
  - Set visibility
  - Publish
- Edit course button
- Duplicate course
- Analytics per course
- Delete/archive

### 4. **Enrollments** (`/admin/enrollments`)
- All enrollments table
- Filter by: user, course, status, date
- Manually enroll users
- Bulk enrollment (CSV upload)
- Track progress
- Unenroll users
- Export reports

### 5. **Certificates** (`/admin/certificates`)
- Issued certificates list
- Filter by: user, course, status, date
- Issue certificate manually
- View certificate preview
- Verification code lookup
- Revoke certificate
- Download records
- Expiry tracking

### 6. **Notifications** (`/admin/notifications`)
- Notification list (sent, scheduled, draft)
- Create notification:
  - Title & message
  - Type (info, warning, success, urgent)
  - Recipients (all, role-based, individual)
  - Schedule date (optional)
- Send immediately or schedule
- View delivery stats (sent, read counts)
- Edit draft notifications

### 7. **Discussions** (`/admin/discussions`)
- Moderation dashboard
- Reported posts
- Delete/hide discussions
- Ban users
- Pin important threads

### 8. **Departments** (`/admin/departments`)
- Department hierarchy tree
- Add/edit/delete departments
- Assign users to departments
- Department-specific course access
- View department stats

### 9. **Reports** (`/admin/reports`)
- Report builder:
  - Select metrics
  - Date range picker
  - Department filter
  - User/course filter
- Pre-built reports:
  - Course completion
  - User engagement
  - Certificate issuance
  - Quiz performance
- Export to PDF/CSV
- Schedule automated reports

### 10. **Content Library** (`/admin/content`)
- File upload manager
- Organize by: videos, documents, images
- Storage usage tracker
- File metadata
- Download/delete files
- Bulk operations

### 11. **Settings** (`/admin/settings`)
- Tabs:
  - System settings
  - Email templates
  - Notification preferences
  - Security settings
  - Appearance/branding

---

## 🧩 API Endpoints

### **Authentication**
```
POST   /api/auth/login          # User login
POST   /api/auth/register       # User registration
POST   /api/auth/logout         # User logout
POST   /api/auth/refresh        # Refresh token (future)
```

### **Users**
```
GET    /api/users/me            # Get current user profile
PUT    /api/users/me            # Update current user profile
PUT    /api/users/me/password   # Change password
POST   /api/users/avatar        # Upload avatar
GET    /api/users               # List all users (admin)
GET    /api/users/:id           # Get user by ID (admin)
PUT    /api/users/:id           # Update user (admin)
DELETE /api/users/:id           # Delete user (admin)
```

### **Courses**
```
GET    /api/courses             # List courses (with filters)
POST   /api/courses             # Create course (instructor/admin)
GET    /api/courses/:id         # Get course details
PUT    /api/courses/:id         # Update course (instructor/admin)
DELETE /api/courses/:id         # Delete course (admin)
GET    /api/courses/:id/lessons/:lessonId  # Get lesson details
```

### **Enrollments**
```
GET    /api/enrollments         # Get user's enrollments
POST   /api/enrollments         # Enroll in course
DELETE /api/enrollments/:id     # Unenroll from course
```

### **Progress**
```
POST   /api/progress            # Mark lesson complete
GET    /api/progress/:courseId  # Get course progress (future)
```

### **Quizzes**
```
GET    /api/courses/:id/lessons/:lessonId/quiz  # Get quiz
POST   /api/courses/:id/lessons/:lessonId/quiz  # Submit quiz
GET    /api/quizzes/:id/attempts                # Get quiz attempts
```

### **Certificates**
```
GET    /api/certificates        # Get user certificates
POST   /api/certificates        # Issue certificate (admin)
GET    /api/certificates/:id    # Get certificate details
GET    /api/certificates/:id/download  # Download PDF
```

### **Notifications**
```
GET    /api/notifications       # Get user notifications
POST   /api/notifications       # Create notification (admin)
PUT    /api/notifications/:id   # Mark as read
DELETE /api/notifications/:id   # Delete notification
PUT    /api/notifications/mark-all-read  # Mark all as read
```

### **Discussions**
```
GET    /api/discussions         # List discussions
POST   /api/discussions         # Create discussion
GET    /api/discussions/:id     # Get discussion details
POST   /api/discussions/:id/replies  # Add reply
POST   /api/discussions/:id/like     # Like discussion
```

### **Admin**
```
GET    /api/admin/stats         # Dashboard statistics
GET    /api/departments         # List departments
POST   /api/departments         # Create department (admin)
GET    /api/leaderboard         # Get leaderboard
GET    /api/search              # Global search
```

---

## 🔧 Technical Implementation

### Frontend Services

```typescript
// lib/services/api-client.ts
// Centralized HTTP client with auth, error handling, retry logic

class ApiClient {
  - buildHeaders()           // Add auth token
  - request()                // Generic request method
  - get/post/put/delete()    // HTTP verbs
  - handleError()            // Centralized error handling
}
```

### React Hooks Pattern

```typescript
// lib/hooks/use-courses.ts
export function useCourses(filters?) {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const fetchCourses = async () => {
    // Call coursesService.getCourses()
  }

  const enrollInCourse = async (courseId) => {
    // Call coursesService.enroll()
  }

  return { courses, loading, error, enrollInCourse, refetch }
}
```

### Validation Layer (Zod)

```typescript
// lib/validation/schemas.ts
export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

// lib/validation/validators.ts
export function validate(schema, data) {
  // Run validation, return errors or data
}
```

---

## 🚀 Performance Optimizations

### Implemented
- ✅ CSS-only animations (no JS libraries)
- ✅ Limited particle effects (3-6 max)
- ✅ Image optimization with Next.js Image
- ✅ Route-based code splitting
- ✅ React Server Components for static content
- ✅ Memoization for expensive computations

### Planned
- [ ] API response caching (Redis)
- [ ] Database query optimization (indexes)
- [ ] Lazy loading for heavy components
- [ ] Virtual scrolling for large lists
- [ ] CDN for static assets
- [ ] Incremental Static Regeneration (ISR)

---

## 🧪 Testing Strategy

### Current State
- ❌ No tests implemented yet

### Planned Testing
```
tests/
├── unit/
│   ├── services/         # Service layer tests
│   ├── hooks/            # React hook tests
│   ├── validation/       # Schema validation tests
│   └── utils/            # Utility function tests
├── integration/
│   ├── api/              # API route tests
│   └── flows/            # User flow tests
└── e2e/
    ├── auth.spec.ts      # Authentication flows
    ├── courses.spec.ts   # Course enrollment flows
    └── admin.spec.ts     # Admin workflows
```

---

## 🔒 Security Measures

### Implemented
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Input validation (Zod schemas)
- ✅ SQL injection prevention (Prisma ORM)
- ✅ XSS protection (React escaping)
- ✅ CSRF protection (Next.js built-in)

### ⚠️ Security Issues (NEEDS FIXING)
- 🔴 JWT not cryptographically verified (middleware.ts)
- 🔴 Token stored in localStorage (XSS vulnerable)
- 🔴 Missing error logging for auth failures

### Planned Enhancements
- [ ] Rate limiting on API routes
- [ ] Two-factor authentication (2FA)
- [ ] Password strength requirements
- [ ] Session timeout
- [ ] Audit logging
- [ ] Content Security Policy (CSP)

---

## 📈 Scalability Considerations

### Current Architecture
- Single Next.js monolith (suitable for MVP)
- PostgreSQL database (vertically scalable)
- File storage: local filesystem (needs migration)

### Future Scalability
```
┌─────────────────────────────────────────────────────┐
│  CDN (Static Assets)                                 │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  Load Balancer                                       │
└─────────────────────────────────────────────────────┘
        ↓                    ↓                   ↓
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│  Next.js 1   │    │  Next.js 2   │    │  Next.js N   │
└──────────────┘    └──────────────┘    └──────────────┘
        ↓                    ↓                   ↓
┌─────────────────────────────────────────────────────┐
│  Redis Cache (Session + API responses)               │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  PostgreSQL (Primary/Replica)                        │
└─────────────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────────────┐
│  S3-compatible storage (Videos, Documents, Images)   │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 Future Enhancements

### Phase 2 Features
- [ ] Real-time collaboration (WebSockets)
- [ ] Video conferencing integration
- [ ] Mobile app (React Native)
- [ ] Offline mode (PWA)
- [ ] Advanced analytics dashboard
- [ ] AI-powered course recommendations
- [ ] Automated certificate generation
- [ ] Multi-language support (i18n)

### Integration Possibilities
- [ ] Single Sign-On (SSO) with enterprise systems
- [ ] SCORM compliance for third-party content
- [ ] Zapier/Make.com integrations
- [ ] Slack/Teams notifications
- [ ] Calendar sync (Google/Outlook)
- [ ] Payment gateway (for paid courses)

---

## 📝 Coding Standards

### File Naming
- Components: PascalCase (`CourseCard.tsx`)
- Utilities: camelCase (`formatDate.ts`)
- Hooks: camelCase with `use` prefix (`useCourses.ts`)
- API routes: kebab-case directories (`/api/auth/login/route.ts`)

### Code Organization
```
src/
├── app/                    # Next.js app router
│   ├── (auth)/            # Auth group routes
│   ├── (dashboard)/       # Dashboard group routes
│   ├── (admin)/           # Admin group routes
│   └── api/               # API routes
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── layout/           # Layout components
│   └── features/         # Feature-specific components
├── lib/                   # Utilities and services
│   ├── services/         # API service layer
│   ├── hooks/            # React hooks
│   ├── validation/       # Zod schemas
│   ├── auth/             # Auth utilities
│   └── utils/            # Helper functions
└── prisma/               # Database schema and migrations
```

### TypeScript Guidelines
- Use strict mode
- Avoid `any` types
- Export types alongside functions
- Use interfaces for objects, types for unions
- Leverage type inference when obvious

---

This architecture document serves as the blueprint for the entire CiviLabs LMS system. Refer to [IMPLEMENTATION_PROGRESS.md](IMPLEMENTATION_PROGRESS.md) for current implementation status.
