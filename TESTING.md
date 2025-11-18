# Testing Guide - Civilabs LMS

This document outlines all testing procedures and checklists for the Civilabs Learning Management System.

## Table of Contents
1. [Testing Setup](#testing-setup)
2. [Authentication Testing](#authentication-testing)
3. [Role-Based Access Control (RBAC) Testing](#rbac-testing)
4. [Admin Operations Testing](#admin-operations-testing)
5. [Learner Workflows Testing](#learner-workflows-testing)
6. [Instructor Workflows Testing](#instructor-workflows-testing)
7. [Cross-Browser Compatibility](#cross-browser-compatibility)
8. [Mobile Responsiveness](#mobile-responsiveness)
9. [Performance Testing](#performance-testing)
10. [Security Testing](#security-testing)

---

## Testing Setup

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- All dependencies installed (`npm install`)
- Database seeded (`npm run db:seed`)

### Test Accounts
Use these accounts for testing different roles:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@civilabs.com | admin123 |
| Instructor | instructor@civilabs.com | instructor123 |
| Learner | learner@civilabs.com | learner123 |

### Running the Application
```bash
# Start development server
npm run dev

# Open Prisma Studio (database viewer)
npm run db:studio

# Reset and reseed database (if needed)
npm run db:push
npm run db:seed
```

---

## Authentication Testing

### Test Cases

#### 1. User Registration
**Objective**: Verify new user can register successfully

**Steps**:
1. Navigate to `/register`
2. Fill in registration form:
   - First Name: Test
   - Last Name: User
   - Email: testuser@example.com
   - Password: Test123!
   - Confirm Password: Test123!
   - Department: Engineering
3. Click "CREATE ACCOUNT"

**Expected Results**:
- ✅ Form validates all fields
- ✅ Password strength is checked (uppercase, lowercase, number)
- ✅ Passwords match validation
- ✅ User is created in database
- ✅ User is redirected to dashboard
- ✅ JWT token is stored
- ✅ User session is established

**Edge Cases to Test**:
- Empty fields
- Invalid email format
- Passwords don't match
- Password too weak
- Duplicate email address
- SQL injection attempts in fields

---

#### 2. User Login
**Objective**: Verify existing user can login successfully

**Steps**:
1. Navigate to `/login`
2. Enter credentials:
   - Email: learner@civilabs.com
   - Password: learner123
3. Click "SIGN IN"

**Expected Results**:
- ✅ Credentials are validated
- ✅ JWT token is generated and stored
- ✅ User is redirected to appropriate dashboard based on role
- ✅ Session persists across page refreshes
- ✅ User information is displayed in sidebar

**Edge Cases to Test**:
- Invalid email
- Wrong password
- Non-existent user
- SQL injection attempts
- XSS attempts in fields
- Session expiration handling

---

#### 3. Password Security
**Objective**: Verify password hashing and security

**Steps**:
1. Register a new user
2. Check database using Prisma Studio
3. Verify password is hashed (bcrypt)

**Expected Results**:
- ✅ Passwords are never stored in plain text
- ✅ Password hashes are unique even for same password
- ✅ Bcrypt is used with appropriate salt rounds

---

#### 4. Session Management
**Objective**: Verify JWT tokens work correctly

**Steps**:
1. Login as any user
2. Open browser DevTools > Application > Local Storage
3. Verify `authToken` exists
4. Refresh the page
5. Verify user remains logged in
6. Clear local storage
7. Refresh the page

**Expected Results**:
- ✅ JWT token is stored in localStorage
- ✅ Token persists across refreshes
- ✅ Clearing token logs user out
- ✅ Token contains user ID and role
- ✅ Token expiration is handled gracefully

---

#### 5. Logout
**Objective**: Verify user can logout successfully

**Steps**:
1. Login as any user
2. Click "Logout" button in sidebar
3. Verify redirection to login page
4. Try to access protected routes

**Expected Results**:
- ✅ Token is removed from localStorage
- ✅ User is redirected to login
- ✅ Cannot access protected routes without logging in again

---

## RBAC Testing

### Test Cases

#### 1. Admin Role Access
**Objective**: Verify admin has access to all admin routes

**Steps**:
1. Login as admin@civilabs.com
2. Navigate to each admin route:
   - `/admin/dashboard`
   - `/admin/users`
   - `/admin/courses`
   - `/admin/departments`
   - `/admin/content`
   - `/admin/enrollments`
   - `/admin/certificates`
   - `/admin/discussions`
   - `/admin/notifications`
   - `/admin/settings`
   - `/admin/reports`

**Expected Results**:
- ✅ All pages load successfully
- ✅ No permission errors
- ✅ Full CRUD capabilities visible
- ✅ Sensitive actions are available

---

#### 2. Instructor Role Access
**Objective**: Verify instructor has correct permissions

**Steps**:
1. Login as instructor@civilabs.com
2. Navigate to instructor routes:
   - `/instructor/dashboard`
   - `/instructor/my-courses`
   - `/instructor/students`
   - `/instructor/analytics`
3. Try to access admin routes (should fail):
   - `/admin/dashboard`
   - `/admin/users`

**Expected Results**:
- ✅ Can access instructor pages
- ✅ Cannot access admin pages
- ✅ Redirected to appropriate page when accessing forbidden routes
- ✅ Can only see/edit their own courses
- ✅ Can view enrolled students
- ✅ Cannot modify system settings

---

#### 3. Learner Role Access
**Objective**: Verify learner has limited access

**Steps**:
1. Login as learner@civilabs.com
2. Navigate to learner routes:
   - `/dashboard`
   - `/courses`
   - `/my-learning`
   - `/profile`
   - `/certificates`
3. Try to access admin routes:
   - `/admin/dashboard` (should fail)
4. Try to access instructor routes:
   - `/instructor/dashboard` (should fail)

**Expected Results**:
- ✅ Can access learner pages
- ✅ Cannot access admin pages
- ✅ Cannot access instructor pages
- ✅ Can only enroll in courses
- ✅ Can view own progress
- ✅ Cannot create or edit courses

---

#### 4. Unauthenticated Access
**Objective**: Verify protected routes require authentication

**Steps**:
1. Clear localStorage (logout)
2. Try to access:
   - `/dashboard`
   - `/admin/dashboard`
   - `/instructor/dashboard`

**Expected Results**:
- ✅ Redirected to `/login`
- ✅ Original URL saved for redirect after login
- ✅ Cannot access any protected routes
- ✅ Public routes (`/`, `/login`, `/register`) remain accessible

---

#### 5. Route Protection Bypass Attempts
**Objective**: Test security of route protection

**Steps**:
1. Login as learner
2. Manually modify JWT token in localStorage
3. Change role to "admin"
4. Try to access admin routes
5. Try direct URL access to admin pages

**Expected Results**:
- ✅ Modified tokens are rejected
- ✅ Server validates token signature
- ✅ Invalid tokens trigger logout
- ✅ Direct URL access is protected

---

## Admin Operations Testing

### User Management

#### Create User
**Steps**:
1. Login as admin
2. Navigate to `/admin/users`
3. Click "ADD USER"
4. Fill in form and submit

**Expected Results**:
- ✅ User is created in database
- ✅ User appears in user list
- ✅ User can login with credentials
- ✅ Validation prevents duplicate emails

#### Edit User
**Steps**:
1. Navigate to `/admin/users`
2. Click edit on any user
3. Modify details
4. Save changes

**Expected Results**:
- ✅ Changes are saved to database
- ✅ User details update in list
- ✅ Validation still applies

#### Delete User
**Steps**:
1. Navigate to `/admin/users`
2. Click delete on a user
3. Confirm deletion

**Expected Results**:
- ✅ User is removed from database
- ✅ User cannot login anymore
- ✅ Associated data is handled (cascade or preserve)

---

### Course Management

#### Create Course
**Steps**:
1. Navigate to `/admin/courses`
2. Click "CREATE COURSE"
3. Fill in course details
4. Add modules and lessons
5. Save course

**Expected Results**:
- ✅ Course is created in database
- ✅ Course appears in catalog
- ✅ Lessons are properly linked
- ✅ Course can be enrolled in

#### Publish/Unpublish Course
**Steps**:
1. Navigate to course in admin panel
2. Toggle publish status

**Expected Results**:
- ✅ Published courses appear in catalog
- ✅ Unpublished courses are hidden from learners
- ✅ Instructors can still edit unpublished courses

---

### Department Management
**Steps**:
1. Navigate to `/admin/departments`
2. Create, edit, delete departments

**Expected Results**:
- ✅ CRUD operations work correctly
- ✅ Users can be assigned to departments
- ✅ Department filtering works

---

### Enrollment Management
**Steps**:
1. Navigate to `/admin/enrollments`
2. View all enrollments
3. Manually enroll users
4. Unenroll users

**Expected Results**:
- ✅ Enrollments are tracked correctly
- ✅ Progress is visible
- ✅ Completion status updates

---

## Learner Workflows Testing

### Course Enrollment Flow

**Steps**:
1. Login as learner
2. Navigate to `/courses`
3. Find a course
4. Click "ENROLL NOW"
5. Verify enrollment
6. Navigate to `/my-learning`

**Expected Results**:
- ✅ Course appears in "My Learning"
- ✅ Progress tracking starts
- ✅ Can access course content
- ✅ Cannot enroll twice in same course

---

### Lesson Completion Flow

**Steps**:
1. Enroll in a course
2. Navigate to first lesson
3. Complete lesson content
4. Mark as complete
5. Move to next lesson

**Expected Results**:
- ✅ Lesson is marked complete in database
- ✅ Progress bar updates
- ✅ Next lesson unlocks (if sequential)
- ✅ Points are awarded

---

### Quiz Taking Flow

**Steps**:
1. Navigate to course quiz
2. Start quiz
3. Answer questions
4. Submit quiz
5. View results

**Expected Results**:
- ✅ Timer works correctly
- ✅ Answers are saved
- ✅ Scoring is accurate
- ✅ Results are displayed
- ✅ Certificate is issued if passed

---

### Certificate Viewing

**Steps**:
1. Complete a course
2. Navigate to `/certificates`
3. View earned certificate
4. Download certificate

**Expected Results**:
- ✅ Certificate appears after course completion
- ✅ Certificate details are correct
- ✅ Download functionality works
- ✅ Certificate can be shared

---

### Discussion Participation

**Steps**:
1. Navigate to `/discussions`
2. Create new discussion
3. Reply to existing discussion
4. Like a post
5. Mark as solution

**Expected Results**:
- ✅ Discussions are created
- ✅ Replies are threaded
- ✅ Likes increment
- ✅ Solutions can be marked

---

## Instructor Workflows Testing

### Course Creation

**Steps**:
1. Login as instructor
2. Navigate to `/instructor/my-courses`
3. Click "CREATE COURSE"
4. Fill in course details
5. Add lessons
6. Publish course

**Expected Results**:
- ✅ Course is created
- ✅ Instructor owns the course
- ✅ Course appears in catalog
- ✅ Students can enroll

---

### Student Analytics

**Steps**:
1. Navigate to `/instructor/analytics`
2. View performance metrics
3. Filter by course
4. Export reports

**Expected Results**:
- ✅ Stats are accurate
- ✅ Charts display correctly
- ✅ Filtering works
- ✅ Export functionality works

---

### Grading Assignments

**Steps**:
1. Navigate to pending tasks
2. Grade student submissions
3. Provide feedback
4. Submit grades

**Expected Results**:
- ✅ Grades are saved
- ✅ Students receive notifications
- ✅ Feedback is visible to student

---

## Cross-Browser Compatibility

Test all critical flows in:

### Desktop Browsers
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Critical Paths to Test
1. Login/Registration
2. Course enrollment
3. Lesson viewing
4. Quiz taking
5. Admin operations

**Expected Results**:
- ✅ Consistent UI across browsers
- ✅ No console errors
- ✅ All functionality works
- ✅ Animations work smoothly

---

## Mobile Responsiveness

Test on multiple screen sizes:

### Devices to Test
- [ ] iPhone SE (375px)
- [ ] iPhone 14 Pro (393px)
- [ ] iPad (768px)
- [ ] Desktop (1920px)

### Pages to Test
- [ ] Login/Register
- [ ] Dashboard
- [ ] Course catalog
- [ ] Course detail
- [ ] Lesson viewer
- [ ] Quiz page
- [ ] Profile
- [ ] Admin dashboard
- [ ] Instructor dashboard

**Expected Results**:
- ✅ Sidebar becomes hamburger menu on mobile
- ✅ Cards stack vertically
- ✅ Tables scroll horizontally
- ✅ Forms are easy to use on mobile
- ✅ Touch targets are large enough (44px min)
- ✅ Text is readable (16px min)

---

## Performance Testing

### Page Load Times
**Test**:
1. Use Chrome DevTools > Network
2. Load each major page
3. Record load time

**Expected Results**:
- ✅ Initial page load < 3s
- ✅ Subsequent navigations < 1s
- ✅ No blocking resources
- ✅ Images are optimized

### Database Query Performance
**Test**:
1. Open Prisma Studio
2. Execute queries
3. Monitor response times

**Expected Results**:
- ✅ Queries complete < 100ms
- ✅ Proper indexes on frequently queried fields
- ✅ No N+1 queries

---

## Security Testing

### Common Vulnerabilities

#### XSS (Cross-Site Scripting)
**Test**:
1. Try entering `<script>alert('XSS')</script>` in form fields
2. Submit and verify output

**Expected Results**:
- ✅ Scripts are sanitized
- ✅ HTML is escaped in outputs
- ✅ No script execution

#### SQL Injection
**Test**:
1. Try entering `' OR '1'='1` in login
2. Try `'; DROP TABLE users; --` in forms

**Expected Results**:
- ✅ Queries are parameterized
- ✅ No SQL errors exposed
- ✅ Invalid input is rejected

#### CSRF (Cross-Site Request Forgery)
**Test**:
1. Make API calls from external site
2. Try to perform actions without proper tokens

**Expected Results**:
- ✅ CSRF tokens are validated
- ✅ Same-origin policy enforced
- ✅ Unauthorized requests blocked

---

## Test Automation

### Future Enhancements

Consider adding:
- Jest for unit tests
- React Testing Library for component tests
- Cypress or Playwright for E2E tests
- GitHub Actions for CI/CD

---

## Reporting Issues

When reporting bugs:
1. Describe expected vs actual behavior
2. Steps to reproduce
3. Screenshots/videos if applicable
4. Browser and device info
5. Console errors
6. User role and test account used

---

## Test Checklist Summary

### Pre-Release Checklist
- [ ] All authentication flows work
- [ ] All roles have correct access
- [ ] Admin CRUD operations functional
- [ ] Learner can enroll and complete courses
- [ ] Instructor can create and manage courses
- [ ] Cross-browser tested
- [ ] Mobile responsive
- [ ] No security vulnerabilities
- [ ] Performance meets benchmarks
- [ ] Database seeded with test data
- [ ] Error handling works correctly
- [ ] All forms validate properly
- [ ] Navigation works on all pages
- [ ] No broken links
- [ ] Images load correctly

---

**Last Updated**: 2024
**Version**: 1.0
**Status**: Active Testing Phase
