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

### 📋 Existing Placeholder Pages
These pages exist but need full implementation:
- [ ] Dashboard home (/dashboard)
- [ ] Courses page (/courses)
- [ ] My Learning page (/my-learning)
- [ ] Profile page (/profile)
- [ ] Leaderboard page (/leaderboard)
- [ ] Certificates page (/certificates)
- [ ] Help page (/help)
- [ ] Admin dashboard (/admin)

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

## Stage 5: API Routes

### Authentication APIs - **COMPLETED** ✅
- [x] POST /api/auth/login
- [x] POST /api/auth/register

### User APIs
- [ ] GET /api/user/profile
- [ ] PUT /api/user/profile
- [ ] GET /api/user/stats
- [ ] GET /api/user/enrollments
- [ ] GET /api/user/certificates
- [ ] GET /api/user/progress/:courseId

### Course APIs
- [ ] GET /api/courses
- [ ] GET /api/courses/:id
- [ ] POST /api/enrollments
- [ ] GET /api/enrollments/:id
- [ ] PUT /api/progress/:enrollmentId

### Admin APIs
- [ ] GET /api/admin/users
- [ ] POST /api/admin/users
- [ ] PUT /api/admin/users/:id
- [ ] DELETE /api/admin/users/:id
- [ ] GET /api/admin/courses
- [ ] POST /api/admin/courses
- [ ] PUT /api/admin/courses/:id
- [ ] DELETE /api/admin/courses/:id
- [ ] GET /api/admin/departments
- [ ] GET /api/admin/analytics

---

## Stage 6: Middleware & Route Protection

### Auth Middleware
- [ ] JWT verification middleware
- [ ] Role-based access control (RBAC)
- [ ] Route protection HOC
- [ ] Session management

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
