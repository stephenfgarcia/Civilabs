# Civilabs LMS - Build Plan

## Current Status

### ✅ Completed (Stage 1)
- [x] Landing page (/)
- [x] Login page (/login)
- [x] Register page (/register)
- [x] User settings page (/settings)
- [x] Admin settings page (/admin/settings)
- [x] Performance optimizations (low-end devices)
- [x] Construction theme implementation
- [x] Error handling and validation
- [x] PR-based development workflow

### 📋 Frontend Pages Status
All pages created, **COMPLETE LEARNER API INTEGRATION** ✅:
- [x] Dashboard home (/dashboard) - **✨ Connected to Real APIs**
- [x] Courses page (/courses) - **✨ Connected to Real APIs**
- [x] My Learning page (/my-learning) - **✨ Connected to Real APIs**
- [x] Course Detail page (/courses/[id]) - **✨ Connected to Real APIs with Enrollment**
- [x] Certificates page (/certificates) - **✨ Connected to Real APIs**
- [x] Notifications page (/notifications) - **✨ Connected to Real APIs with Mark as Read**
- [x] Profile page (/profile) - **✨ Connected to Real APIs with Update**
- [x] Leaderboard page (/leaderboard) - UI complete
- [x] Help page (/help) - UI complete
- [x] Admin dashboard (/admin) - **✨ Connected to Real Stats APIs**

---

## Stage 2: Dashboard Pages Implementation

### Priority Order for Dashboard Pages:

#### 1. Dashboard Home (`/dashboard`) - **HIGH PRIORITY**
**Purpose:** Main landing page after login, overview of user's learning progress

**Features:**
- Welcome message with user's name and role
- Quick stats cards (courses enrolled, completed, in progress, certificates)
- Recent courses widget
- Upcoming deadlines/assignments
- Progress overview chart
- Quick action buttons (Browse courses, Continue learning)

**API Needs:**
- GET /api/user/stats
- GET /api/user/recent-activity
- GET /api/enrollments

---

#### 2. Courses Page (`/courses`) - **HIGH PRIORITY**
**Purpose:** Browse and search available courses

**Features:**
- Course grid/list view toggle
- Search functionality
- Filter by category, level, instructor
- Sort by (newest, popular, rating)
- Course cards with: thumbnail, title, description, duration, enrollment count
- Enroll button
- Pagination

**API Needs:**
- GET /api/courses (with query params for search/filter)
- POST /api/enrollments (enroll in course)
- GET /api/categories

---

#### 3. My Learning Page (`/my-learning`) - **HIGH PRIORITY**
**Purpose:** View enrolled courses and track progress

**Features:**
- List of enrolled courses
- Progress bars for each course
- Filter by status (in progress, completed, not started)
- Continue learning button
- Completion badges
- Time tracking

**API Needs:**
- GET /api/user/enrollments
- GET /api/user/progress/:courseId

---

#### 4. Profile Page (`/profile`) - **MEDIUM PRIORITY**
**Purpose:** View and edit user profile

**Features:**
- User avatar upload
- Display name, email, role, department
- Bio/description field
- Joined date
- Total learning hours
- Achievements/badges display
- Edit profile modal/form

**API Needs:**
- GET /api/user/profile
- PUT /api/user/profile
- POST /api/user/avatar (file upload)

---

#### 5. Certificates Page (`/certificates`) - **MEDIUM PRIORITY**
**Purpose:** View and download earned certificates

**Features:**
- Grid of certificate cards
- Certificate preview
- Download PDF button
- Share to LinkedIn button
- Filter by date, course
- Print functionality

**API Needs:**
- GET /api/user/certificates
- GET /api/certificates/:id/download

---

#### 6. Leaderboard Page (`/leaderboard`) - **LOW PRIORITY**
**Purpose:** Gamification - show top learners

**Features:**
- Top 10/25/50 learners table
- Ranking by points, courses completed, learning time
- User's current rank highlight
- Time period filter (weekly, monthly, all-time)
- Department filter
- Achievement badges display

**API Needs:**
- GET /api/leaderboard (with filters)
- GET /api/user/rank

---

#### 7. Help Page (`/help`) - **LOW PRIORITY**
**Purpose:** Help resources and support

**Features:**
- FAQ accordion
- Search functionality
- Category sections (getting started, courses, certificates, etc.)
- Contact support form
- Tutorial videos
- System status

**API Needs:**
- GET /api/help/faqs
- POST /api/support/ticket

---

## Stage 3: Admin Pages Implementation

### Priority Order for Admin Pages:

#### 1. Admin Dashboard (`/admin`) - **HIGH PRIORITY**
**Purpose:** Overview of system metrics and management tools

**Features:**
- Total users, courses, enrollments stats
- Recent activity feed
- Quick actions panel
- System health indicators
- Charts (user growth, course popularity, completion rates)
- Notifications/alerts

**API Needs:**
- GET /api/admin/stats
- GET /api/admin/activity
- GET /api/admin/notifications

---

#### 2. User Management (`/admin/users`) - **HIGH PRIORITY**
**Purpose:** Manage all users in the system

**Features:**
- User list table with search/filter
- Add new user button
- Edit user modal
- Delete/deactivate user
- Role management (assign roles)
- Bulk actions
- Export users CSV
- Password reset

**API Needs:**
- GET /api/admin/users
- POST /api/admin/users
- PUT /api/admin/users/:id
- DELETE /api/admin/users/:id
- POST /api/admin/users/bulk

---

#### 3. Course Management (`/admin/courses`) - **HIGH PRIORITY**
**Purpose:** Create, edit, and manage courses

**Features:**
- Course list with status indicators
- Create course wizard
- Edit course content
- Add lessons/modules
- Upload course materials
- Publish/unpublish toggle
- Course analytics
- Duplicate course

**API Needs:**
- GET /api/admin/courses
- POST /api/admin/courses
- PUT /api/admin/courses/:id
- DELETE /api/admin/courses/:id
- POST /api/admin/courses/:id/content

---

#### 4. Department Management (`/admin/departments`) - **MEDIUM PRIORITY**
**Purpose:** Manage organizational departments

**Features:**
- Department list
- Add/edit/delete departments
- Assign users to departments
- Department-specific course access
- View department stats

**API Needs:**
- GET /api/admin/departments
- POST /api/admin/departments
- PUT /api/admin/departments/:id
- DELETE /api/admin/departments/:id

---

#### 5. Analytics & Reports (`/admin/analytics`) - **MEDIUM PRIORITY**
**Purpose:** Detailed analytics and reporting

**Features:**
- Course completion charts
- User engagement metrics
- Time-based analytics
- Export reports (PDF/CSV)
- Custom date ranges
- Department comparisons
- Learner progress tracking

**API Needs:**
- GET /api/admin/analytics/overview
- GET /api/admin/analytics/courses
- GET /api/admin/analytics/users
- GET /api/admin/reports/export

---

#### 6. System Settings (`/admin/settings`) - **COMPLETED** ✅
Already implemented with tabs for Profile, Security, System, Notifications

---

## Stage 4: Course Viewing & Learning Experience

#### 1. Course Details Page (`/courses/:id`)
**Purpose:** View course information before enrolling

**Features:**
- Course overview
- Curriculum/syllabus
- Instructor info
- Reviews/ratings
- Prerequisites
- Enroll button
- Preview lessons

---

#### 2. Course Player (`/learn/:courseId`)
**Purpose:** Main learning interface

**Features:**
- Lesson navigation sidebar
- Video player with controls
- Progress tracking
- Next/previous lesson buttons
- Bookmark/notes feature
- Quiz/assessment integration
- Download course materials
- Mark as complete

---

## Stage 5: API Routes - **COMPLETED** ✅

### Authentication APIs - **COMPLETED** ✅
- [x] POST /api/auth/login
- [x] POST /api/auth/register

### User APIs - **COMPLETED** ✅
- [x] GET /api/users/me (user profile)
- [x] PUT /api/users/me (update profile)
- [x] PUT /api/users/me/password (change password)
- [x] GET /api/enrollments (user enrollments with progress)
- [x] GET /api/certificates (user certificates)

### Course APIs - **COMPLETED** ✅
- [x] GET /api/courses (list with search/filter)
- [x] POST /api/courses (create - admin only)
- [x] GET /api/courses/:id (course details)
- [x] PUT /api/courses/:id (update - admin only)
- [x] DELETE /api/courses/:id (delete - admin only)
- [x] POST /api/enrollments (enroll in course)
- [x] DELETE /api/enrollments/:id (unenroll)
- [x] POST /api/progress (mark lesson complete)

### Quiz APIs - **COMPLETED** ✅
- [x] GET /api/courses/[id]/lessons/[lessonId]/quiz (get lesson quiz)
- [x] POST /api/courses/[id]/lessons/[lessonId]/quiz (submit quiz)
- [x] Quiz functionality 100% production-ready through lesson-based flow
- [x] Full quiz UI with timer, attempt tracking, results, and retry
- [x] Points system and notifications integration
- [x] See [QUIZ_FUNCTIONALITY_STATUS.md](QUIZ_FUNCTIONALITY_STATUS.md) for details

### Certificate APIs - **COMPLETED** ✅
- [x] GET /api/certificates (user certificates)
- [x] POST /api/certificates (issue certificate - admin only)

### Discussion APIs - **COMPLETED** ✅
- [x] GET /api/discussions (list discussions)
- [x] POST /api/discussions (create discussion)
- [x] POST /api/discussions/replies (add reply)
- [x] POST /api/discussions/likes (like discussion/reply)

### Notification APIs - **COMPLETED** ✅
- [x] GET /api/notifications (user notifications)
- [x] POST /api/notifications (create - admin only)
- [x] PUT /api/notifications/:id (mark as read)
- [x] DELETE /api/notifications/:id (delete)

### Admin APIs - **BASIC STRUCTURE COMPLETE**
- [x] User CRUD via /api/users (admin access)
- [x] Course CRUD via /api/courses (admin access)
- [x] GET /api/admin/stats (comprehensive dashboard statistics)
- [ ] Department management (planned)
- [ ] Analytics endpoints (planned)

---

## Stage 6: Middleware & Route Protection - **COMPLETED** ✅

### Auth Middleware - **COMPLETED** ✅
- [x] JWT verification middleware
- [x] Role-based access control (RBAC)
- [x] Route protection with withAuth, withAdmin, withInstructor
- [x] Session management with localStorage tokens
- [x] API authentication helpers
- [x] Server-side auth helpers

### Example Protected Routes:
```typescript
// Dashboard routes - require authentication
'/dashboard/*' -> requireAuth

// Admin routes - require ADMIN or SUPER_ADMIN role
'/admin/*' -> requireAuth + requireRole(['ADMIN', 'SUPER_ADMIN'])

// Course player - require authentication + enrollment
'/learn/:courseId' -> requireAuth + requireEnrollment
```

---

## Development Approach

### For Each Page:
1. Create feature branch (`feature/dashboard-home`)
2. Build page with construction theme
3. Add mock data initially
4. Implement API routes
5. Connect frontend to APIs
6. Add comprehensive error handling
7. Test on low-end devices
8. Create pull request
9. Review and merge

### Coding Standards:
- **Theme:** Construction theme with warning colors, blueprint grids
- **Performance:** CSS-only animations, 3-6 particles max
- **Validation:** Client-side + server-side for all forms
- **Errors:** Specific error messages
- **Types:** Full TypeScript typing
- **Responsive:** Mobile-first approach

---

## Recommended Build Order

### Week 1: Core Dashboard
1. Dashboard home page
2. Courses page
3. My Learning page
4. User profile API
5. Course listing API

### Week 2: Admin Foundation
6. Admin dashboard
7. User management page
8. Course management (basic)
9. Admin user APIs
10. Admin course APIs

### Week 3: Learning Experience
11. Course details page
12. Course player/viewer
13. Progress tracking
14. Enrollment APIs
15. Progress APIs

### Week 4: Enhancement & Polish
16. Certificates page
17. Leaderboard page
18. Help page
19. Analytics dashboard
20. Final testing and optimization

---

## Next Immediate Steps

1. **Create feature branch** for dashboard home
2. **Build dashboard home page** with:
   - Welcome section
   - Stats cards
   - Recent courses widget
   - Quick actions
3. **Add mock data** for testing
4. **Create PR** for review
5. **Repeat** for next page

Ready to start building! 🚧
