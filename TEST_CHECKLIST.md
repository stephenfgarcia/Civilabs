# Quick Test Checklist - Civilabs LMS

**Use this checklist to quickly verify all major functionality is working.**

## Setup
- [  ] Development server running: `npm run dev`
- [  ] Database seeded: `npm run db:seed`
- [  ] Browser DevTools open (Console + Network tabs)

---

## ✅ Authentication Tests (10 min)

### Registration
- [  ] Navigate to http://localhost:3001/register
- [  ] Create account with:
  - First Name: Test, Last Name: User
  - Email: test@example.com
  - Password: Test123!
  - Department: Engineering
- [  ] Verify redirected to dashboard
- [  ] Check localStorage has `authToken`

### Login
- [  ] Logout and navigate to http://localhost:3001/login
- [  ] Login with: learner@civilabs.com / learner123
- [  ] Verify redirected to learner dashboard
- [  ] Verify sidebar shows user info

### Session Persistence
- [  ] Refresh page while logged in
- [  ] Verify still logged in
- [  ] Clear localStorage
- [  ] Refresh page
- [  ] Verify redirected to login

---

## ✅ Role-Based Access Control (15 min)

### Admin Access
- [  ] Login as: admin@civilabs.com / admin123
- [  ] Access http://localhost:3001/admin/dashboard
- [  ] Verify can see admin sidebar
- [  ] Navigate to each admin page:
  - [  ] /admin/users
  - [  ] /admin/courses
  - [  ] /admin/departments
  - [  ] /admin/content
  - [  ] /admin/enrollments
  - [  ] /admin/certificates
  - [  ] /admin/discussions
  - [  ] /admin/notifications
  - [  ] /admin/settings
  - [  ] /admin/reports

### Instructor Access
- [  ] Login as: instructor@civilabs.com / instructor123
- [  ] Access http://localhost:3001/instructor/dashboard
- [  ] Verify can see instructor sidebar
- [  ] Navigate to instructor pages:
  - [  ] /instructor/my-courses
  - [  ] /instructor/students
  - [  ] /instructor/analytics
- [  ] Try to access http://localhost:3001/admin/dashboard
- [  ] Verify redirected or blocked

### Learner Access
- [  ] Login as: learner@civilabs.com / learner123
- [  ] Access http://localhost:3001/dashboard
- [  ] Verify can see learner sidebar
- [  ] Try to access http://localhost:3001/admin/dashboard
- [  ] Verify redirected or blocked
- [  ] Try to access http://localhost:3001/instructor/dashboard
- [  ] Verify redirected or blocked

---

## ✅ Learner Workflows (20 min)

### Course Browsing
- [  ] Login as learner
- [  ] Navigate to http://localhost:3001/courses
- [  ] Verify 6 courses displayed
- [  ] Use search to find "Safety"
- [  ] Verify filtering works
- [  ] Click on a course card

### Course Detail
- [  ] On course detail page, verify:
  - [  ] Course info displayed
  - [  ] Modules/lessons listed
  - [  ] "ENROLL NOW" button visible
- [  ] Click "ENROLL NOW"
- [  ] Verify button changes to "CONTINUE LEARNING"

### My Learning
- [  ] Navigate to http://localhost:3001/my-learning
- [  ] Verify enrolled course appears
- [  ] Verify progress bar visible
- [  ] Click "CONTINUE"

### Lesson Viewing
- [  ] On lesson page, verify:
  - [  ] Video player placeholder shown
  - [  ] Lesson content displayed
  - [  ] "MARK AS COMPLETE" button works
  - [  ] Navigation to next lesson works

### Quiz Taking
- [  ] Navigate to a quiz
- [  ] Start quiz
- [  ] Answer questions
- [  ] Verify timer counts down
- [  ] Submit quiz
- [  ] Verify results displayed

### Certificates
- [  ] Navigate to http://localhost:3001/certificates
- [  ] Verify certificates displayed
- [  ] Click "VIEW DETAILS"
- [  ] Verify certificate detail page loads
- [  ] Click "DOWNLOAD" button

### Badges
- [  ] Navigate to http://localhost:3001/badges
- [  ] Verify badges displayed (earned and locked)
- [  ] Verify progress bars show correctly

### Discussions
- [  ] Navigate to http://localhost:3001/discussions
- [  ] Verify discussions list displayed
- [  ] Click on a discussion
- [  ] Verify thread detail page loads
- [  ] Verify can see replies

### Profile
- [  ] Navigate to http://localhost:3001/profile
- [  ] Verify user info displayed
- [  ] Click "EDIT PROFILE"
- [  ] Update information
- [  ] Verify changes saved (mock)

### Search
- [  ] Navigate to http://localhost:3001/search
- [  ] Enter search query: "construction"
- [  ] Verify results displayed
- [  ] Test filtering by type

---

## ✅ Instructor Workflows (15 min)

### Dashboard
- [  ] Login as instructor
- [  ] Navigate to http://localhost:3001/instructor/dashboard
- [  ] Verify stats cards displayed
- [  ] Verify pending tasks listed
- [  ] Verify top courses shown
- [  ] Verify recent activity displayed

### My Courses
- [  ] Navigate to http://localhost:3001/instructor/my-courses
- [  ] Verify course cards displayed
- [  ] Test search functionality
- [  ] Test status filter (All/Published/Drafts)
- [  ] Click "VIEW" on a course
- [  ] Click "EDIT" on a course

### Students
- [  ] Navigate to http://localhost:3001/instructor/students
- [  ] Verify student list displayed
- [  ] Verify stats cards show correct numbers
- [  ] Test search functionality
- [  ] Verify progress bars display

### Analytics
- [  ] Navigate to http://localhost:3001/instructor/analytics
- [  ] Verify overview stats displayed
- [  ] Verify revenue trend chart shown
- [  ] Verify engagement metrics shown
- [  ] Verify course performance table displayed

---

## ✅ Admin Operations (25 min)

### Dashboard
- [  ] Login as admin
- [  ] Navigate to http://localhost:3001/admin/dashboard
- [  ] Verify KPI metrics displayed
- [  ] Verify recent activity shown
- [  ] Verify system alerts visible

### User Management
- [  ] Navigate to http://localhost:3001/admin/users
- [  ] Verify user list displayed
- [  ] Test search functionality
- [  ] Test role filter
- [  ] Click "ADD USER"
- [  ] Verify add user form appears
- [  ] Click "EDIT" on a user
- [  ] Click "DELETE" on a user

### Course Management
- [  ] Navigate to http://localhost:3001/admin/courses
- [  ] Verify course list displayed
- [  ] Test search and filters
- [  ] Click "CREATE COURSE"
- [  ] Click "EDIT" on a course
- [  ] Test publish/unpublish toggle

### Departments
- [  ] Navigate to http://localhost:3001/admin/departments
- [  ] Verify department list displayed
- [  ] Click "ADD DEPARTMENT"
- [  ] Test edit functionality

### Content Management
- [  ] Navigate to http://localhost:3001/admin/content
- [  ] Verify file library displayed
- [  ] Test file type filter
- [  ] Click "UPLOAD FILES"

### Enrollments
- [  ] Navigate to http://localhost:3001/admin/enrollments
- [  ] Verify enrollment list displayed
- [  ] Test filters (course, status)
- [  ] Verify progress tracking visible

### Certificates
- [  ] Navigate to http://localhost:3001/admin/certificates
- [  ] Verify certificate list displayed
- [  ] Test filters
- [  ] Click "ISSUE CERTIFICATE"

### Discussions
- [  ] Navigate to http://localhost:3001/admin/discussions
- [  ] Verify discussions displayed
- [  ] Test moderation features
- [  ] Pin/unpin discussion
- [  ] Lock/unlock discussion

### Notifications
- [  ] Navigate to http://localhost:3001/admin/notifications
- [  ] Verify notifications displayed
- [  ] Click "SEND NOTIFICATION"
- [  ] Test bulk sending

### Settings
- [  ] Navigate to http://localhost:3001/admin/settings
- [  ] Verify all setting tabs work
- [  ] Test toggle switches
- [  ] Update a setting
- [  ] Click "SAVE CHANGES"

### Reports
- [  ] Navigate to http://localhost:3001/admin/reports
- [  ] Verify report types displayed
- [  ] Generate a report
- [  ] Download report

---

## ✅ UI/UX Checks (10 min)

### Navigation
- [  ] Verify sidebar navigation works on all pages
- [  ] Verify active page is highlighted in sidebar
- [  ] Verify all links work (no 404s)

### Forms
- [  ] Verify all form fields have labels
- [  ] Verify validation messages appear
- [  ] Verify required field indicators show
- [  ] Verify submit buttons work

### Cards & Layouts
- [  ] Verify all cards display correctly
- [  ] Verify construction theme is consistent
- [  ] Verify glass effects and gradients render
- [  ] Verify blueprint grids show

### Buttons
- [  ] Verify magnetic button hover effects work
- [  ] Verify button colors match roles (warning for primary actions)
- [  ] Verify all buttons have icons

### Tables
- [  ] Verify tables are sortable
- [  ] Verify search functionality works
- [  ] Verify pagination works
- [  ] Verify tables scroll on mobile

---

## ✅ Responsive Design (Mobile) (15 min)

### Test Screen Sizes
Open Chrome DevTools > Toggle Device Toolbar (Cmd+Shift+M / Ctrl+Shift+M)

#### iPhone SE (375px)
- [  ] Login page
- [  ] Dashboard
- [  ] Course catalog
- [  ] Sidebar becomes mobile menu
- [  ] All text readable

#### iPad (768px)
- [  ] Dashboard
- [  ] Course detail
- [  ] Admin pages
- [  ] Tables scroll horizontally

#### Desktop (1920px)
- [  ] Full layout displays
- [  ] No horizontal scroll
- [  ] Sidebars visible

---

## ✅ Browser Compatibility (20 min)

Test critical flows in:
- [  ] Chrome (latest)
- [  ] Firefox (latest)
- [  ] Safari (latest)
- [  ] Edge (latest)

**For each browser, test:**
1. Login
2. Navigate between pages
3. Fill out a form
4. Check console for errors

---

## ✅ Performance Checks (5 min)

### Page Load
- [  ] Open DevTools > Network tab
- [  ] Load dashboard
- [  ] Verify load time < 3 seconds
- [  ] Verify no failed requests

### Console Errors
- [  ] Open DevTools > Console tab
- [  ] Navigate through all major pages
- [  ] Verify no red errors
- [  ] Yellow warnings are acceptable

---

## ✅ Security Checks (10 min)

### XSS Prevention
- [  ] Try entering `<script>alert('test')</script>` in a form
- [  ] Verify script is not executed
- [  ] Verify HTML is escaped

### Input Validation
- [  ] Submit forms with empty fields
- [  ] Submit forms with invalid data
- [  ] Verify validation messages appear
- [  ] Verify cannot submit invalid data

### Authentication
- [  ] Logout and try accessing /dashboard directly
- [  ] Verify redirected to /login
- [  ] Login and verify redirected back to original URL

---

## 🐛 Issue Tracking

**Found a bug?** Document it:

| Issue # | Page/Feature | Description | Severity | Status |
|---------|-------------|-------------|----------|--------|
| 1 | | | High/Med/Low | Open |
| 2 | | | High/Med/Low | Open |

---

## ✅ Final Checklist

Before marking testing complete:
- [  ] No critical bugs found
- [  ] All user workflows tested
- [  ] All roles have correct access
- [  ] Mobile responsive
- [  ] Cross-browser tested
- [  ] No console errors
- [  ] Performance is acceptable
- [  ] Security checks passed

---

**Testing Duration**: ~2-3 hours for complete checklist
**Tester**: _________________
**Date**: _________________
**Build Version**: _________________
**Status**: ⬜ Not Started | ⬜ In Progress | ⬜ Complete
