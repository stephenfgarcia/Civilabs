# 📋 Instructor Side - Complete Manual Test Plan

## 🎯 Test Plan Overview

**Application:** Civilabs LMS - Instructor Portal
**Version:** 1.0.0
**Test Type:** Manual Functional Testing
**Tested By:** _____________
**Test Date:** _____________
**Test Environment:** _____________

---

## 📑 Table of Contents

1. [Test Environment Setup](#test-environment-setup)
2. [Authentication & Access Control](#authentication--access-control)
3. [Instructor Dashboard](#instructor-dashboard)
4. [Course Management](#course-management)
5. [Lesson Management](#lesson-management)
6. [Quiz & Assessment Management](#quiz--assessment-management)
7. [Student Management](#student-management)
8. [Assignment Management](#assignment-management)
9. [Discussion Management](#discussion-management)
10. [Analytics & Reporting](#analytics--reporting)
11. [Certificate Management](#certificate-management)
12. [Bulk Operations](#bulk-operations)
13. [Bug Report Template](#bug-report-template)

---

## Test Environment Setup

### Prerequisites
Before starting tests, ensure the following test data exists:

**Test Accounts:**
- [ ] Instructor account: `instructor@civilabs.com` / password
- [ ] 5+ Student accounts with enrollments
- [ ] Admin account for verification

**Test Data:**
- [ ] At least 3 courses (Published, Draft, Archived)
- [ ] Courses with 5+ lessons each
- [ ] Courses with enrolled students
- [ ] Sample quiz questions
- [ ] Assignments with submissions
- [ ] Active discussion threads

**Browser Requirements:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

---

## 1. Authentication & Access Control

### TC-AUTH-001: Instructor Login
**Priority:** P0 - Critical
**Objective:** Verify instructor can log in successfully

**Test Steps:**
1. Navigate to login page
2. Enter valid instructor credentials
3. Click "Login" button

**Expected Results:**
- [ ] Redirects to instructor dashboard
- [ ] Displays instructor name in header
- [ ] Shows "Instructor" role indicator
- [ ] No error messages displayed

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-AUTH-001-login-success.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-AUTH-002: Instructor Role Verification
**Priority:** P0 - Critical
**Objective:** Verify instructor can only access instructor features

**Test Steps:**
1. Log in as instructor
2. Attempt to access `/admin` routes
3. Attempt to access student-only features
4. Verify sidebar menu shows instructor options only

**Expected Results:**
- [ ] Cannot access admin pages (403 or redirect)
- [ ] Cannot access student-only pages
- [ ] Sidebar shows: Dashboard, Courses, Students, Assignments, Discussions, Analytics, Certificates
- [ ] No admin menu items visible

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-AUTH-002-role-verification.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-AUTH-003: Session Management
**Priority:** P1 - High
**Objective:** Verify session timeout works correctly

**Test Steps:**
1. Log in as instructor
2. Leave browser idle for configured timeout period (check settings)
3. Attempt to perform an action

**Expected Results:**
- [ ] Session expires after timeout
- [ ] Redirects to login page
- [ ] Shows session expired message
- [ ] Previous page loads after re-login

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-AUTH-003-session-timeout.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 2. Instructor Dashboard

### TC-DASH-001: Dashboard Overview Load
**Priority:** P0 - Critical
**Objective:** Verify instructor dashboard loads with correct data

**Test Steps:**
1. Log in as instructor
2. Navigate to instructor dashboard
3. Verify all dashboard sections load

**Expected Results:**
- [ ] Page loads within 3 seconds
- [ ] Stats cards display: Total Students, Active Courses, Avg Completion Rate, Certificates Issued
- [ ] Recent activity feed shows latest student actions
- [ ] Course performance chart displays
- [ ] Quick actions menu visible
- [ ] No loading errors

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-DASH-001-dashboard-overview.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-DASH-002: Dashboard Statistics Accuracy
**Priority:** P1 - High
**Objective:** Verify dashboard statistics match actual data

**Test Steps:**
1. Note down expected values:
   - Total students enrolled in instructor's courses
   - Number of active courses
   - Average completion rate
   - Certificates issued
2. Compare with dashboard display

**Expected Results:**
- [ ] Total Students count is accurate
- [ ] Active Courses count is accurate
- [ ] Completion rate calculation is correct
- [ ] Certificates count matches issued certificates

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-DASH-002-stats-accuracy.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-DASH-003: Recent Activity Feed
**Priority:** P2 - Medium
**Objective:** Verify recent activity shows relevant instructor events

**Test Steps:**
1. View recent activity section
2. Have a student complete a lesson (or use existing data)
3. Refresh dashboard
4. Check activity feed

**Expected Results:**
- [ ] Shows recent student enrollments
- [ ] Shows lesson completions
- [ ] Shows quiz attempts
- [ ] Shows assignment submissions
- [ ] Events are chronologically ordered (newest first)
- [ ] Shows timestamps (e.g., "2 hours ago")

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-DASH-003-activity-feed.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 3. Course Management

### TC-COURSE-001: View All Courses
**Priority:** P0 - Critical
**Objective:** Verify instructor can view their courses

**Test Steps:**
1. Navigate to Courses page
2. View course list

**Expected Results:**
- [ ] All instructor's courses display
- [ ] Shows course thumbnail
- [ ] Shows course title, description
- [ ] Shows enrollment count
- [ ] Shows course status (Published/Draft/Archived)
- [ ] Shows last updated date
- [ ] Filter by status works (Published, Draft, Archived)
- [ ] Search functionality works

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-COURSE-001-view-courses.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-COURSE-002: Create New Course - Valid Data
**Priority:** P0 - Critical
**Objective:** Verify instructor can create a new course

**Test Steps:**
1. Click "Create Course" button
2. Fill in required fields:
   - Title: "Test Course - Manual QA"
   - Description: "This is a test course"
   - Category: "Safety"
   - Difficulty: "Beginner"
   - Duration: "60" minutes
   - Tags: "test, qa"
3. Upload thumbnail (optional)
4. Click "Save as Draft"

**Expected Results:**
- [ ] Form validation passes
- [ ] Course created successfully
- [ ] Success toast notification appears
- [ ] Redirects to course list or course detail page
- [ ] New course appears in course list with "Draft" status
- [ ] Course shows instructor as creator

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-COURSE-002-create-course.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-COURSE-003: Create Course - Validation Errors
**Priority:** P1 - High
**Objective:** Verify form validation prevents invalid course creation

**Test Steps:**
1. Click "Create Course"
2. Leave required fields empty
3. Click "Save"
4. Observe validation errors

**Test Cases:**
- [ ] Empty title shows error: "Title is required"
- [ ] Empty description shows warning (if required)
- [ ] Invalid duration (negative number) shows error
- [ ] Cannot save without required fields

**Expected Results:**
- [ ] Form does not submit
- [ ] Validation errors display in red
- [ ] Focus moves to first error field
- [ ] Error messages are clear and helpful

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-COURSE-003-validation-errors.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-COURSE-004: Edit Course
**Priority:** P0 - Critical
**Objective:** Verify instructor can edit existing course

**Test Steps:**
1. Select an existing course
2. Click "Edit" button
3. Modify course details:
   - Change title
   - Update description
   - Change category
4. Click "Save Changes"

**Expected Results:**
- [ ] Edit form pre-fills with existing data
- [ ] All fields are editable
- [ ] Changes save successfully
- [ ] Success toast notification
- [ ] Updated data displays in course list
- [ ] "Last Updated" timestamp updates

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-COURSE-004-edit-course.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-COURSE-005: Delete Course - With Enrollments
**Priority:** P0 - Critical
**Objective:** Verify course deletion behavior when students are enrolled

**Test Steps:**
1. Select a course with enrolled students
2. Click "Delete" button
3. Observe confirmation dialog

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Warning message shows: "This course has X enrolled students"
- [ ] Asks for explicit confirmation
- [ ] Option to archive instead of delete
- [ ] If confirmed, course is deleted
- [ ] Students receive notification (if applicable)

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-COURSE-005-delete-with-enrollments.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-COURSE-006: Publish Course
**Priority:** P0 - Critical
**Objective:** Verify draft course can be published

**Test Steps:**
1. Select a draft course
2. Click "Publish" button
3. Confirm publication

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Shows course details preview
- [ ] On confirmation, course status changes to "Published"
- [ ] Course becomes visible to students
- [ ] Published date/time is recorded
- [ ] Cannot unpublish if students are enrolled (or shows warning)

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-COURSE-006-publish-course.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-COURSE-007: Archive Course
**Priority:** P1 - High
**Objective:** Verify course can be archived

**Test Steps:**
1. Select a published course
2. Click "Archive" option
3. Confirm archival

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Course status changes to "Archived"
- [ ] Course no longer visible to new students
- [ ] Enrolled students can still access (if allowed by settings)
- [ ] Can be restored from archive

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-COURSE-007-archive-course.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-COURSE-008: Course Search Functionality
**Priority:** P2 - Medium
**Objective:** Verify course search works correctly

**Test Steps:**
1. Navigate to Courses page
2. Enter search term in search box
3. Verify results update in real-time

**Test Cases:**
- [ ] Search by course title
- [ ] Search by partial title
- [ ] Search by description keywords
- [ ] Search by tags
- [ ] Search is case-insensitive
- [ ] Clear search shows all courses

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-COURSE-008-search-functionality.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-COURSE-009: Course Filtering
**Priority:** P2 - Medium
**Objective:** Verify course filters work correctly

**Test Steps:**
1. Apply each filter:
   - Status: Published
   - Status: Draft
   - Status: Archived
   - Category: Safety, Equipment, etc.
   - Difficulty: Beginner, Intermediate, Advanced
2. Verify filtered results

**Expected Results:**
- [ ] Published filter shows only published courses
- [ ] Draft filter shows only draft courses
- [ ] Archived filter shows only archived courses
- [ ] Category filters work correctly
- [ ] Difficulty filters work correctly
- [ ] Multiple filters can be applied simultaneously
- [ ] Filter count displays (e.g., "Showing 5 of 20 courses")

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-COURSE-009-filtering.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-COURSE-010: View Course Details
**Priority:** P1 - High
**Objective:** Verify course detail page shows complete information

**Test Steps:**
1. Click on a course to view details
2. Review all displayed information

**Expected Results:**
- [ ] Course title and description display
- [ ] Thumbnail/banner image displays
- [ ] Shows enrollment count
- [ ] Shows completion rate
- [ ] Shows average rating (if reviews enabled)
- [ ] Lists all lessons in order
- [ ] Shows course metadata (duration, difficulty, category)
- [ ] Edit/Delete buttons visible (if instructor owns course)
- [ ] "Add Lesson" button visible

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-COURSE-010-course-details.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 4. Lesson Management

### TC-LESSON-001: Add New Lesson - Video Type
**Priority:** P0 - Critical
**Objective:** Verify instructor can add a video lesson

**Test Steps:**
1. Navigate to course details
2. Click "Add Lesson"
3. Fill in lesson details:
   - Title: "Introduction to Safety"
   - Description: "Overview of safety procedures"
   - Content Type: "Video"
   - Video URL: (valid URL or upload)
   - Duration: "15" minutes
   - Order: "1"
   - Is Required: ✓
4. Click "Save Lesson"

**Expected Results:**
- [ ] Lesson form validates correctly
- [ ] Video URL/upload works
- [ ] Lesson saves successfully
- [ ] Lesson appears in course lesson list
- [ ] Lesson order is correct
- [ ] "Required" badge shows if marked required
- [ ] Can preview video

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-LESSON-001-add-video-lesson.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-LESSON-002: Add Lesson - Document Type
**Priority:** P0 - Critical
**Objective:** Verify instructor can add a document lesson

**Test Steps:**
1. Click "Add Lesson"
2. Select Content Type: "Document"
3. Upload PDF/DOC file or provide URL
4. Fill in other required fields
5. Click "Save"

**Expected Results:**
- [ ] File upload works correctly
- [ ] Supported formats: PDF, DOC, DOCX, PPT, PPTX
- [ ] File size validation (check max size)
- [ ] Preview available for uploaded documents
- [ ] Download option available
- [ ] "Allow Download" toggle works

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-LESSON-002-add-document-lesson.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-LESSON-003: Add Lesson - Quiz Type
**Priority:** P0 - Critical
**Objective:** Verify instructor can add a quiz lesson

**Test Steps:**
1. Click "Add Lesson"
2. Select Content Type: "Quiz"
3. Configure quiz settings:
   - Passing score: 70%
   - Time limit: 30 minutes
   - Attempts allowed: 3
   - Show correct answers: Yes
4. Add questions (see Quiz Management section)
5. Save lesson

**Expected Results:**
- [ ] Quiz settings save correctly
- [ ] Can add multiple questions
- [ ] Question types supported: Multiple Choice, True/False, Short Answer
- [ ] Point values can be set per question
- [ ] Quiz preview available
- [ ] Quiz links to lesson properly

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-LESSON-003-add-quiz-lesson.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-LESSON-004: Edit Lesson
**Priority:** P0 - Critical
**Objective:** Verify lesson can be edited

**Test Steps:**
1. Select existing lesson
2. Click "Edit"
3. Modify lesson details
4. Save changes

**Expected Results:**
- [ ] Form pre-populates with existing data
- [ ] All fields editable
- [ ] Can change content type (with warning if data loss)
- [ ] Changes save successfully
- [ ] Updated lesson displays in course
- [ ] Student progress not affected (if lesson already started)

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-LESSON-004-edit-lesson.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-LESSON-005: Delete Lesson
**Priority:** P1 - High
**Objective:** Verify lesson can be deleted

**Test Steps:**
1. Select a lesson
2. Click "Delete"
3. Confirm deletion

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Warning if students have progress on this lesson
- [ ] Lesson deleted from database
- [ ] Lesson removed from course list
- [ ] Lesson order recalculates for remaining lessons
- [ ] Student progress records updated/archived

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-LESSON-005-delete-lesson.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-LESSON-006: Reorder Lessons
**Priority:** P1 - High
**Objective:** Verify lesson order can be changed

**Test Steps:**
1. View course lessons
2. Drag and drop to reorder (or use up/down buttons)
3. Save new order

**Expected Results:**
- [ ] Drag and drop works smoothly
- [ ] Visual feedback during drag
- [ ] Order saves on drop
- [ ] Lesson numbers update immediately
- [ ] Students see lessons in new order
- [ ] No impact on student progress

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-LESSON-006-reorder-lessons.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-LESSON-007: Lesson Validation - Missing Required Fields
**Priority:** P1 - High
**Objective:** Verify lesson form validation

**Test Steps:**
1. Click "Add Lesson"
2. Leave required fields empty
3. Attempt to save

**Test Cases:**
- [ ] Empty title shows error
- [ ] Missing content type shows error
- [ ] No content/URL shows error
- [ ] Invalid duration shows error
- [ ] Form does not submit

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-LESSON-007-validation-errors.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-LESSON-008: Bulk Lesson Upload
**Priority:** P2 - Medium
**Objective:** Verify multiple lessons can be added at once

**Test Steps:**
1. Click "Bulk Upload" or "Import Lessons"
2. Select CSV/JSON file with lesson data
3. Review preview
4. Confirm import

**Expected Results:**
- [ ] File format validation
- [ ] Preview shows lessons to be imported
- [ ] Can review and edit before import
- [ ] All lessons import successfully
- [ ] Error handling for invalid data
- [ ] Shows import progress
- [ ] Summary of imported lessons

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-LESSON-008-bulk-upload.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 5. Quiz & Assessment Management

### TC-QUIZ-001: Create Quiz - Basic Settings
**Priority:** P0 - Critical
**Objective:** Verify quiz can be created with basic settings

**Test Steps:**
1. Navigate to lesson with quiz type or create new quiz
2. Set quiz parameters:
   - Title: "Safety Quiz Module 1"
   - Passing Score: 70%
   - Time Limit: 30 minutes
   - Attempts Allowed: 3
   - Show Correct Answers: After submission
3. Save settings

**Expected Results:**
- [ ] All settings save correctly
- [ ] Settings display on quiz page
- [ ] Time limit enforces during student attempts
- [ ] Attempts counter works
- [ ] Correct answers visibility follows setting

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-QUIZ-001-create-quiz.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-QUIZ-002: Add Multiple Choice Question
**Priority:** P0 - Critical
**Objective:** Verify multiple choice questions can be added

**Test Steps:**
1. In quiz editor, click "Add Question"
2. Select type: "Multiple Choice"
3. Enter question text: "What is the first step in safety protocol?"
4. Add 4 answer options
5. Mark correct answer
6. Set point value: 10
7. Add explanation (optional)
8. Save question

**Expected Results:**
- [ ] Question text field accepts input
- [ ] Can add multiple answer options (minimum 2)
- [ ] Can designate one correct answer
- [ ] Point value can be set
- [ ] Explanation field optional
- [ ] Question saves and displays in quiz
- [ ] Can reorder questions

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-QUIZ-002-multiple-choice.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-QUIZ-003: Add True/False Question
**Priority:** P1 - High
**Objective:** Verify true/false questions work correctly

**Test Steps:**
1. Add question, select type: "True/False"
2. Enter question text
3. Set correct answer (True or False)
4. Set points
5. Save

**Expected Results:**
- [ ] Only two options: True/False
- [ ] Can select correct answer
- [ ] Displays correctly to students
- [ ] Scoring works correctly

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-QUIZ-003-true-false.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-QUIZ-004: Add Short Answer Question
**Priority:** P1 - High
**Objective:** Verify short answer questions can be created

**Test Steps:**
1. Add question, select type: "Short Answer"
2. Enter question text
3. Optionally set accepted answer patterns
4. Set points
5. Mark as "Requires Manual Grading" if needed
6. Save

**Expected Results:**
- [ ] Question saves correctly
- [ ] Students see text input field
- [ ] Answer patterns work (if implemented)
- [ ] Manual grading flag works
- [ ] Instructor can grade short answers

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-QUIZ-004-short-answer.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-QUIZ-005: Edit Quiz Question
**Priority:** P1 - High
**Objective:** Verify quiz questions can be edited

**Test Steps:**
1. Select existing question
2. Click "Edit"
3. Modify question text, answers, or settings
4. Save changes

**Expected Results:**
- [ ] Form pre-fills with existing data
- [ ] All fields editable
- [ ] Changes save successfully
- [ ] Warning shows if quiz already has student attempts
- [ ] Option to keep or discard student answers
- [ ] Updated question displays correctly

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-QUIZ-005-edit-question.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-QUIZ-006: Delete Quiz Question
**Priority:** P1 - High
**Objective:** Verify questions can be deleted from quiz

**Test Steps:**
1. Select a question
2. Click "Delete"
3. Confirm deletion

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Warning if students have answered this question
- [ ] Question deleted successfully
- [ ] Question order recalculates
- [ ] Quiz total points update
- [ ] Student attempts updated/invalidated

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-QUIZ-006-delete-question.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-QUIZ-007: Randomize Questions
**Priority:** P2 - Medium
**Objective:** Verify question randomization setting works

**Test Steps:**
1. Enable "Randomize Questions" in quiz settings
2. Save quiz
3. Preview quiz multiple times or check student views

**Expected Results:**
- [ ] Question order randomizes per attempt
- [ ] All questions still appear
- [ ] Answer options can also be randomized (if enabled)
- [ ] Scoring works correctly regardless of order

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-QUIZ-007-randomize.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-QUIZ-008: View Quiz Attempts
**Priority:** P1 - High
**Objective:** Verify instructor can view all student quiz attempts

**Test Steps:**
1. Navigate to quiz
2. Click "View Attempts" or "Student Results"
3. Review attempt history

**Expected Results:**
- [ ] Shows all student attempts
- [ ] Displays: Student name, Attempt number, Score, Date/Time, Duration
- [ ] Can filter by student
- [ ] Can filter by pass/fail
- [ ] Can view individual attempt details
- [ ] Shows correct/incorrect answers
- [ ] Can reset attempts (with confirmation)

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-QUIZ-008-view-attempts.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-QUIZ-009: Manual Grading of Short Answers
**Priority:** P1 - High
**Objective:** Verify instructor can manually grade short answer questions

**Test Steps:**
1. Find quiz with short answer questions
2. View student submissions
3. Review and grade each short answer
4. Provide feedback
5. Save grades

**Expected Results:**
- [ ] List shows submissions requiring grading
- [ ] Can view student's answer
- [ ] Can assign points (up to max)
- [ ] Can provide feedback/comments
- [ ] Student receives notification of grade
- [ ] Quiz total score updates
- [ ] Shows graded vs ungraded count

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-QUIZ-009-manual-grading.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-QUIZ-010: Export Quiz Results
**Priority:** P2 - Medium
**Objective:** Verify quiz results can be exported

**Test Steps:**
1. Navigate to quiz results
2. Click "Export" button
3. Select format (CSV, Excel, PDF)
4. Download file

**Expected Results:**
- [ ] Export includes all attempts
- [ ] Shows student names, scores, dates
- [ ] Includes question-level details
- [ ] File downloads successfully
- [ ] Data is formatted correctly
- [ ] Can filter before exporting

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-QUIZ-010-export-results.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 6. Student Management

### TC-STUDENT-001: View All Students
**Priority:** P0 - Critical
**Objective:** Verify instructor can view all their students

**Test Steps:**
1. Navigate to "Students" page
2. View student list

**Expected Results:**
- [ ] Shows all students enrolled in instructor's courses
- [ ] Displays: Student name, Email, Enrolled courses count, Progress %
- [ ] Shows enrollment date
- [ ] Shows last activity date
- [ ] List is paginated if many students
- [ ] Loading indicator shows while fetching

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-STUDENT-001-view-students.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-STUDENT-002: Search Students
**Priority:** P1 - High
**Objective:** Verify student search functionality

**Test Steps:**
1. Use search box to find students
2. Test search by:
   - Student name
   - Email
   - Enrollment status

**Expected Results:**
- [ ] Search is case-insensitive
- [ ] Results update in real-time
- [ ] Partial matches work
- [ ] Shows "No results" if none found
- [ ] Clear search resets to all students

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-STUDENT-002-search-students.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-STUDENT-003: Filter Students
**Priority:** P2 - Medium
**Objective:** Verify student filtering works

**Test Steps:**
1. Apply filters:
   - By course
   - By enrollment status (Active, Completed, Withdrawn)
   - By progress range
2. Observe filtered results

**Expected Results:**
- [ ] Course filter shows students in selected course
- [ ] Status filter works correctly
- [ ] Progress filter shows students in range
- [ ] Multiple filters can be combined
- [ ] Filter count displays
- [ ] "Clear Filters" button works

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-STUDENT-003-filter-students.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-STUDENT-004: View Student Profile
**Priority:** P1 - High
**Objective:** Verify instructor can view individual student details

**Test Steps:**
1. Click on a student from list
2. View student profile page

**Expected Results:**
- [ ] Shows student basic info: Name, Email, Avatar
- [ ] Shows enrollment date
- [ ] Lists all courses student is enrolled in (for this instructor)
- [ ] Shows overall progress percentage
- [ ] Shows completed lessons/total lessons
- [ ] Shows quiz scores
- [ ] Shows certificates earned
- [ ] Shows activity history
- [ ] Cannot edit student personal information

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-STUDENT-004-student-profile.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-STUDENT-005: View Student Course Progress
**Priority:** P1 - High
**Objective:** Verify detailed student progress in specific course

**Test Steps:**
1. From student profile, select a course
2. View detailed progress

**Expected Results:**
- [ ] Shows lesson-by-lesson progress
- [ ] Indicates completed vs incomplete lessons
- [ ] Shows quiz scores and attempts
- [ ] Shows assignment submissions and grades
- [ ] Shows time spent per lesson
- [ ] Shows last activity timestamp
- [ ] Progress bar is accurate

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-STUDENT-005-course-progress.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-STUDENT-006: Send Email to Student
**Priority:** P2 - Medium
**Objective:** Verify instructor can send individual email to student

**Test Steps:**
1. From student profile, click "Send Email" or "Message"
2. Compose email:
   - Subject: "Regarding your progress"
   - Message: "Great work on Module 1!"
3. Send email

**Expected Results:**
- [ ] Email compose modal opens
- [ ] Subject and message fields work
- [ ] Can attach files (if supported)
- [ ] Send button triggers email
- [ ] Success notification shows
- [ ] Email logs in student's activity
- [ ] Student receives email

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-STUDENT-006-send-email.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-STUDENT-007: Bulk Email to Students
**Priority:** P1 - High
**Objective:** Verify instructor can send bulk emails

**Test Steps:**
1. Select multiple students (checkboxes)
2. Click "Send Bulk Email"
3. Compose message
4. Select recipients:
   - All selected students
   - Students in specific course
   - Students with specific progress level
5. Send

**Expected Results:**
- [ ] Can select multiple students
- [ ] "Select All" checkbox works
- [ ] Bulk email compose opens
- [ ] Can filter recipients
- [ ] Shows recipient count
- [ ] Can preview email
- [ ] Sends to all selected students
- [ ] Progress indicator shows
- [ ] Success message shows count sent

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-STUDENT-007-bulk-email.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-STUDENT-008: Export Student Data
**Priority:** P2 - Medium
**Objective:** Verify student data can be exported

**Test Steps:**
1. Navigate to Students page
2. Click "Export" button
3. Select format (CSV, Excel)
4. Select data to include:
   - Basic info
   - Progress data
   - Quiz scores
   - Enrollment dates
5. Download file

**Expected Results:**
- [ ] Export options dialog appears
- [ ] Can select export format
- [ ] Can choose data fields
- [ ] File downloads successfully
- [ ] Data is accurate and complete
- [ ] Formatting is correct (headers, data types)

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-STUDENT-008-export-data.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-STUDENT-009: View Student Quiz Attempts
**Priority:** P1 - High
**Objective:** Verify instructor can view all quiz attempts for a student

**Test Steps:**
1. View student profile
2. Navigate to "Quiz Attempts" section
3. Review attempt history

**Expected Results:**
- [ ] Shows all quiz attempts across all courses
- [ ] Displays: Quiz name, Course, Attempt number, Score, Date
- [ ] Can filter by course
- [ ] Can filter by pass/fail
- [ ] Can view detailed attempt (questions/answers)
- [ ] Can reset attempt (with confirmation)

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-STUDENT-009-quiz-attempts.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-STUDENT-010: Manually Enroll Student
**Priority:** P2 - Medium
**Objective:** Verify instructor can manually enroll a student in their course

**Test Steps:**
1. Navigate to Course details
2. Click "Enroll Student" or "Add Student"
3. Search/select student
4. Set enrollment type (Self-enrolled, Assigned, Mandatory)
5. Set due date (optional)
6. Confirm enrollment

**Expected Results:**
- [ ] Can search for student by name/email
- [ ] Shows students not yet enrolled
- [ ] Enrollment type options available
- [ ] Due date picker works (optional)
- [ ] Student enrolls successfully
- [ ] Student receives notification
- [ ] Student appears in course student list
- [ ] Student can access course immediately

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-STUDENT-010-manual-enrollment.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 7. Assignment Management

### TC-ASSIGN-001: Create Assignment
**Priority:** P0 - Critical
**Objective:** Verify instructor can create a new assignment

**Test Steps:**
1. Navigate to Assignments page or Course page
2. Click "Create Assignment"
3. Fill in details:
   - Title: "Safety Protocol Assignment"
   - Description: "Submit a report on safety protocols"
   - Course: Select course
   - Due Date: Set future date
   - Max Points: 100
   - Allow Late Submission: Yes/No
4. Upload instructions file (optional)
5. Save assignment

**Expected Results:**
- [ ] All fields save correctly
- [ ] Assignment appears in assignment list
- [ ] Shows as "Draft" or "Published" based on status
- [ ] Due date displays correctly
- [ ] Students can see assignment (if published)
- [ ] Attachment uploads successfully

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ASSIGN-001-create-assignment.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ASSIGN-002: Edit Assignment
**Priority:** P1 - High
**Objective:** Verify assignment can be edited

**Test Steps:**
1. Select existing assignment
2. Click "Edit"
3. Modify fields
4. Save changes

**Expected Results:**
- [ ] Form pre-fills with existing data
- [ ] Can change all fields
- [ ] Warning shows if students have submitted
- [ ] Option to notify students of changes
- [ ] Changes save successfully
- [ ] Updated details display to students

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ASSIGN-002-edit-assignment.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ASSIGN-003: Delete Assignment
**Priority:** P1 - High
**Objective:** Verify assignment can be deleted

**Test Steps:**
1. Select assignment
2. Click "Delete"
3. Confirm deletion

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Warning if submissions exist
- [ ] Option to archive instead of delete
- [ ] Assignment deletes successfully
- [ ] Removed from assignment list
- [ ] Students notified (if applicable)
- [ ] Submission data archived/deleted

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ASSIGN-003-delete-assignment.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ASSIGN-004: Publish Assignment
**Priority:** P0 - Critical
**Objective:** Verify draft assignment can be published

**Test Steps:**
1. Select draft assignment
2. Click "Publish"
3. Set publish date (now or scheduled)
4. Confirm

**Expected Results:**
- [ ] Status changes to "Published"
- [ ] Students can see assignment
- [ ] Due date countdown starts
- [ ] Notification sent to enrolled students
- [ ] Published date records

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ASSIGN-004-publish-assignment.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ASSIGN-005: View All Submissions
**Priority:** P0 - Critical
**Objective:** Verify instructor can view all student submissions

**Test Steps:**
1. Navigate to assignment
2. Click "View Submissions" or "Submissions" tab
3. Review submission list

**Expected Results:**
- [ ] Shows all enrolled students
- [ ] Indicates submitted vs not submitted
- [ ] Shows submission date/time
- [ ] Shows late submissions (if applicable)
- [ ] Shows graded vs ungraded
- [ ] Shows grade for graded submissions
- [ ] Can filter by status
- [ ] Can sort by student name, date, grade

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ASSIGN-005-view-submissions.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ASSIGN-006: Grade Submission
**Priority:** P0 - Critical
**Objective:** Verify instructor can grade a student submission

**Test Steps:**
1. Select a submission
2. Click "Grade" or "Review"
3. View submission content/files
4. Enter grade (out of max points)
5. Provide feedback/comments
6. Change status to "Graded"
7. Save

**Expected Results:**
- [ ] Can view submitted content (text, files)
- [ ] Can download submitted files
- [ ] Grade field validates (0 to max points)
- [ ] Feedback text box works
- [ ] Can attach feedback files
- [ ] Grade saves successfully
- [ ] Student receives notification
- [ ] Submission status changes to "Graded"
- [ ] Grade appears in student's grade book

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ASSIGN-006-grade-submission.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ASSIGN-007: Provide Inline Feedback
**Priority:** P2 - Medium
**Objective:** Verify instructor can provide detailed inline feedback

**Test Steps:**
1. Open submission for grading
2. Use annotation tools (if available):
   - Highlight text
   - Add comments
   - Mark sections
3. Save feedback

**Expected Results:**
- [ ] Annotation tools work smoothly
- [ ] Comments attach to specific locations
- [ ] Student can see annotations
- [ ] Annotations persist on save
- [ ] Can edit/delete annotations

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ASSIGN-007-inline-feedback.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ASSIGN-008: Return Submission to Student
**Priority:** P1 - High
**Objective:** Verify graded submission can be returned to student

**Test Steps:**
1. Grade submission
2. Click "Return to Student" or "Publish Grade"
3. Confirm

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Grade becomes visible to student
- [ ] Student receives notification
- [ ] Feedback becomes visible to student
- [ ] Submission status shows "Returned"
- [ ] Cannot resubmit (unless allowed)

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ASSIGN-008-return-submission.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ASSIGN-009: Late Submission Handling
**Priority:** P1 - High
**Objective:** Verify late submissions are handled correctly

**Test Steps:**
1. Set assignment due date in past
2. Have student submit late (or use test data)
3. View submission

**Expected Results:**
- [ ] Submission marked as "Late"
- [ ] Shows days/hours late
- [ ] Late badge/indicator visible
- [ ] Can still grade (if late submission allowed)
- [ ] Can apply late penalty (if configured)
- [ ] Rejection option available (if late not allowed)

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ASSIGN-009-late-submission.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ASSIGN-010: Bulk Grade Download
**Priority:** P2 - Medium
**Objective:** Verify all submissions can be downloaded at once

**Test Steps:**
1. Navigate to assignment submissions
2. Click "Download All Submissions"
3. Select format (ZIP)
4. Download

**Expected Results:**
- [ ] ZIP file downloads
- [ ] Contains all student submissions
- [ ] Files organized by student name/ID
- [ ] Includes submission metadata (CSV)
- [ ] File names are clear and consistent

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ASSIGN-010-bulk-download.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ASSIGN-011: Assignment Analytics
**Priority:** P2 - Medium
**Objective:** Verify assignment statistics are available

**Test Steps:**
1. View assignment details
2. Navigate to "Analytics" or "Stats" tab

**Expected Results:**
- [ ] Shows submission rate (X of Y submitted)
- [ ] Shows average grade
- [ ] Shows grade distribution (chart)
- [ ] Shows on-time vs late submissions
- [ ] Shows time to complete statistics
- [ ] Can export analytics

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ASSIGN-011-analytics.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ASSIGN-012: Assignment Duplication
**Priority:** P2 - Medium
**Objective:** Verify assignment can be duplicated for reuse

**Test Steps:**
1. Select existing assignment
2. Click "Duplicate" or "Copy"
3. Modify title and due date
4. Save

**Expected Results:**
- [ ] Creates exact copy of assignment
- [ ] All settings copied (except dates)
- [ ] Title automatically appends "(Copy)"
- [ ] Attachments copied
- [ ] Can assign to different course
- [ ] No submissions carry over

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ASSIGN-012-duplicate.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 8. Discussion Management

### TC-DISCUSS-001: View All Discussions
**Priority:** P1 - High
**Objective:** Verify instructor can view all discussions in their courses

**Test Steps:**
1. Navigate to Discussions page
2. View discussion list

**Expected Results:**
- [ ] Shows discussions from all instructor's courses
- [ ] Displays: Title, Course, Author, Replies count, Last activity
- [ ] Shows pinned threads at top
- [ ] Shows locked/closed threads
- [ ] Shows flagged threads
- [ ] Filter by course works
- [ ] Search functionality works

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-DISCUSS-001-view-discussions.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-DISCUSS-002: View Discussion Thread
**Priority:** P1 - High
**Objective:** Verify discussion thread displays correctly

**Test Steps:**
1. Click on a discussion thread
2. View full thread

**Expected Results:**
- [ ] Original post displays with author and timestamp
- [ ] All replies display chronologically
- [ ] Nested replies show properly (if threaded)
- [ ] Like/upvote counts display
- [ ] Can see who liked posts
- [ ] Images/attachments display
- [ ] Code blocks format correctly
- [ ] Shows "marked as solved" if applicable

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-DISCUSS-002-view-thread.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-DISCUSS-003: Reply to Discussion
**Priority:** P1 - High
**Objective:** Verify instructor can reply to student discussions

**Test Steps:**
1. Open discussion thread
2. Click "Reply"
3. Write response
4. Add formatting (bold, italic, links, code)
5. Attach file (optional)
6. Submit reply

**Expected Results:**
- [ ] Reply box opens
- [ ] Rich text editor works
- [ ] Can format text (bold, italic, lists, etc.)
- [ ] Can insert links
- [ ] Can add code blocks
- [ ] File attachment works
- [ ] Preview available
- [ ] Reply posts successfully
- [ ] Student receives notification
- [ ] Reply shows "Instructor" badge

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-DISCUSS-003-reply-discussion.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-DISCUSS-004: Pin Discussion Thread
**Priority:** P2 - Medium
**Objective:** Verify instructor can pin important threads

**Test Steps:**
1. Select a discussion thread
2. Click "Pin" or pin icon
3. Confirm

**Expected Results:**
- [ ] Thread moves to top of list
- [ ] Pin icon displays on thread
- [ ] Pinned threads stay at top
- [ ] Can pin multiple threads
- [ ] Can unpin thread
- [ ] Students see pinned threads first

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-DISCUSS-004-pin-thread.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-DISCUSS-005: Lock Discussion Thread
**Priority:** P2 - Medium
**Objective:** Verify instructor can lock threads to prevent further replies

**Test Steps:**
1. Select discussion thread
2. Click "Lock" or lock icon
3. Confirm

**Expected Results:**
- [ ] Thread shows locked status
- [ ] Lock icon displays
- [ ] Students cannot reply
- [ ] Students can still view
- [ ] Instructors can still reply
- [ ] Can unlock thread
- [ ] Shows "Locked by [Instructor]"

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-DISCUSS-005-lock-thread.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-DISCUSS-006: Delete Discussion/Reply
**Priority:** P1 - High
**Objective:** Verify instructor can delete inappropriate content

**Test Steps:**
1. Select discussion or reply
2. Click "Delete"
3. Provide reason (optional)
4. Confirm deletion

**Expected Results:**
- [ ] Confirmation dialog appears
- [ ] Can provide deletion reason
- [ ] Content deletes successfully
- [ ] Shows "[deleted]" placeholder or removes completely
- [ ] Nested replies handle gracefully
- [ ] Author receives notification (optional)
- [ ] Action logs for moderation tracking

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-DISCUSS-006-delete-discussion.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-DISCUSS-007: Mark Discussion as Solved
**Priority:** P2 - Medium
**Objective:** Verify instructor can mark threads as solved

**Test Steps:**
1. Open discussion thread
2. Select best answer reply
3. Click "Mark as Solution" or checkmark
4. Confirm

**Expected Results:**
- [ ] Reply marked with "Solution" badge
- [ ] Thread shows "Solved" status
- [ ] Solved icon displays in list
- [ ] Solution appears at top of thread
- [ ] Can unmark as solution
- [ ] Original poster receives notification

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-DISCUSS-007-mark-solved.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-DISCUSS-008: Flag/Report Management
**Priority:** P1 - High
**Objective:** Verify instructor can review flagged content

**Test Steps:**
1. Navigate to "Flagged Content" or "Reports"
2. View flagged discussions/replies
3. Review flag reason
4. Take action (delete, dismiss, warn user)

**Expected Results:**
- [ ] Shows all flagged content
- [ ] Displays: Content, Flagger, Reason, Date
- [ ] Can view full context
- [ ] Can dismiss flag
- [ ] Can delete content
- [ ] Can warn/message user
- [ ] Actions log properly
- [ ] Reporter receives feedback (optional)

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-DISCUSS-008-flagged-content.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-DISCUSS-009: Create Discussion Thread
**Priority:** P2 - Medium
**Objective:** Verify instructor can create new discussion threads

**Test Steps:**
1. Click "New Discussion" or "Start Thread"
2. Select course
3. Enter title
4. Write content
5. Add tags/categories (if available)
6. Post

**Expected Results:**
- [ ] Form validates required fields
- [ ] Can select course
- [ ] Rich text editor works
- [ ] Can upload images/files
- [ ] Tags/categories work
- [ ] Thread publishes successfully
- [ ] Students receive notification (if subscribed)
- [ ] Thread appears in discussion list

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-DISCUSS-009-create-thread.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-DISCUSS-010: Discussion Analytics
**Priority:** P2 - Medium
**Objective:** Verify discussion engagement metrics

**Test Steps:**
1. Navigate to Discussion analytics
2. View metrics

**Expected Results:**
- [ ] Shows total discussions
- [ ] Shows total replies
- [ ] Shows most active students
- [ ] Shows response time averages
- [ ] Shows topics/tags breakdown
- [ ] Can filter by course
- [ ] Can filter by date range
- [ ] Can export data

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-DISCUSS-010-analytics.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 9. Analytics & Reporting

### TC-ANALYTICS-001: Instructor Dashboard Analytics
**Priority:** P1 - High
**Objective:** Verify instructor dashboard shows accurate analytics

**Test Steps:**
1. Navigate to instructor dashboard
2. Review analytics widgets

**Expected Results:**
- [ ] Total students count is accurate
- [ ] Active courses count is accurate
- [ ] Average completion rate displays
- [ ] Certificates issued count is accurate
- [ ] Charts load without errors
- [ ] Data refreshes on page reload

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ANALYTICS-001-dashboard.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ANALYTICS-002: Course Performance Analytics
**Priority:** P1 - High
**Objective:** Verify detailed course analytics

**Test Steps:**
1. Navigate to course details
2. Click "Analytics" tab
3. Review metrics

**Expected Results:**
- [ ] Shows enrollment trend over time (chart)
- [ ] Shows completion rate
- [ ] Shows average time to complete
- [ ] Shows lesson-by-lesson completion rates
- [ ] Shows quiz performance statistics
- [ ] Shows student engagement metrics
- [ ] Shows drop-off points
- [ ] Can export data

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ANALYTICS-002-course-analytics.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ANALYTICS-003: Student Progress Report
**Priority:** P1 - High
**Objective:** Verify individual student progress reports

**Test Steps:**
1. View student profile
2. Navigate to "Progress Report" section
3. Review detailed progress

**Expected Results:**
- [ ] Shows overall progress percentage
- [ ] Shows course-by-course breakdown
- [ ] Shows lesson completion status
- [ ] Shows quiz scores and averages
- [ ] Shows assignment grades
- [ ] Shows time spent learning
- [ ] Shows activity timeline
- [ ] Can download/print report
- [ ] Can export to PDF

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ANALYTICS-003-student-report.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ANALYTICS-004: Quiz Performance Analytics
**Priority:** P1 - High
**Objective:** Verify quiz analytics show detailed statistics

**Test Steps:**
1. Navigate to quiz details
2. View analytics

**Expected Results:**
- [ ] Shows attempt count
- [ ] Shows average score
- [ ] Shows pass/fail rate
- [ ] Shows question-level statistics
- [ ] Identifies difficult questions (low success rate)
- [ ] Shows time spent per question
- [ ] Shows attempt distribution chart
- [ ] Can filter by date range

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ANALYTICS-004-quiz-analytics.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ANALYTICS-005: Assignment Analytics
**Priority:** P2 - Medium
**Objective:** Verify assignment statistics

**Test Steps:**
1. View assignment details
2. Check analytics section

**Expected Results:**
- [ ] Shows submission rate
- [ ] Shows on-time vs late submissions
- [ ] Shows average grade
- [ ] Shows grade distribution (histogram)
- [ ] Shows time to grade metrics
- [ ] Identifies students needing help (low scores)
- [ ] Can compare across assignments

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ANALYTICS-005-assignment-analytics.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ANALYTICS-006: Engagement Metrics
**Priority:** P2 - Medium
**Objective:** Verify student engagement tracking

**Test Steps:**
1. Navigate to Analytics → Engagement
2. Review engagement data

**Expected Results:**
- [ ] Shows active vs inactive students
- [ ] Shows login frequency
- [ ] Shows time spent in courses
- [ ] Shows discussion participation
- [ ] Shows content consumption patterns
- [ ] Can identify at-risk students
- [ ] Shows trends over time
- [ ] Can filter by course

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ANALYTICS-006-engagement.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ANALYTICS-007: Generate Custom Report
**Priority:** P2 - Medium
**Objective:** Verify instructor can create custom reports

**Test Steps:**
1. Navigate to Reports section
2. Click "Create Report"
3. Select report type (Students, Courses, Assessments)
4. Select metrics to include
5. Set date range
6. Generate report

**Expected Results:**
- [ ] Report builder interface loads
- [ ] Can select multiple metrics
- [ ] Date range picker works
- [ ] Can filter by course
- [ ] Preview available before generation
- [ ] Report generates successfully
- [ ] Can export (PDF, CSV, Excel)
- [ ] Can save report template for reuse

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ANALYTICS-007-custom-report.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-ANALYTICS-008: Download Analytics Data
**Priority:** P2 - Medium
**Objective:** Verify analytics data can be exported

**Test Steps:**
1. View any analytics page
2. Click "Export" or "Download"
3. Select format (CSV, Excel, PDF)
4. Download file

**Expected Results:**
- [ ] Export options available
- [ ] File downloads successfully
- [ ] Data is complete and accurate
- [ ] Formatting is clean
- [ ] Charts export as images (in PDF)
- [ ] File name is descriptive with date

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-ANALYTICS-008-export-data.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 10. Certificate Management

### TC-CERT-001: Create Certificate Template
**Priority:** P1 - High
**Objective:** Verify instructor can create certificate templates

**Test Steps:**
1. Navigate to Certificates section
2. Click "Create Template"
3. Design certificate:
   - Add course name
   - Add student name placeholder
   - Add completion date placeholder
   - Add instructor signature
   - Customize styling
4. Save template

**Expected Results:**
- [ ] Template editor loads
- [ ] Can add text fields
- [ ] Can add images (logo, signature)
- [ ] Can customize colors and fonts
- [ ] Placeholders work ({{student}}, {{course}}, etc.)
- [ ] Preview available
- [ ] Template saves successfully
- [ ] Can assign template to course

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-CERT-001-create-template.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-CERT-002: Edit Certificate Template
**Priority:** P2 - Medium
**Objective:** Verify certificate templates can be edited

**Test Steps:**
1. Select existing template
2. Click "Edit"
3. Modify template
4. Save changes

**Expected Results:**
- [ ] Template loads in editor
- [ ] All elements editable
- [ ] Changes save successfully
- [ ] Warning if template is in use
- [ ] Previously issued certificates unchanged
- [ ] New certificates use updated template

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-CERT-002-edit-template.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-CERT-003: Assign Certificate to Course
**Priority:** P1 - High
**Objective:** Verify certificate template can be assigned to course

**Test Steps:**
1. Navigate to course settings
2. Select "Certificate" section
3. Choose certificate template
4. Set issuance criteria:
   - Complete all lessons: Yes
   - Pass all quizzes: Yes
   - Minimum score: 70%
5. Enable automatic issuance
6. Save

**Expected Results:**
- [ ] Can select from available templates
- [ ] Criteria options available
- [ ] Auto-issue toggle works
- [ ] Settings save to course
- [ ] Students notified of certificate availability
- [ ] Certificate issues upon criteria met

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-CERT-003-assign-to-course.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-CERT-004: View Issued Certificates
**Priority:** P1 - High
**Objective:** Verify instructor can view all issued certificates

**Test Steps:**
1. Navigate to Certificates → Issued
2. View certificate list

**Expected Results:**
- [ ] Shows all certificates issued for instructor's courses
- [ ] Displays: Student name, Course, Issue date, Verification code
- [ ] Shows expiry date (if applicable)
- [ ] Can filter by course
- [ ] Can search by student name
- [ ] Can sort by date
- [ ] Can view individual certificate

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-CERT-004-view-certificates.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-CERT-005: Manually Issue Certificate
**Priority:** P1 - High
**Objective:** Verify instructor can manually issue certificate to student

**Test Steps:**
1. Navigate to student profile or course students
2. Select student
3. Click "Issue Certificate"
4. Select template
5. Confirm issuance

**Expected Results:**
- [ ] Can select certificate template
- [ ] Can override issue date (optional)
- [ ] Confirmation dialog appears
- [ ] Certificate generates successfully
- [ ] Student receives notification
- [ ] Certificate appears in issued list
- [ ] Student can download certificate
- [ ] Verification code generated

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-CERT-005-manual-issue.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-CERT-006: Revoke Certificate
**Priority:** P2 - Medium
**Objective:** Verify certificate can be revoked

**Test Steps:**
1. View issued certificates
2. Select a certificate
3. Click "Revoke"
4. Provide reason
5. Confirm revocation

**Expected Results:**
- [ ] Confirmation dialog with reason field
- [ ] Certificate status changes to "Revoked"
- [ ] Student notified
- [ ] Certificate verification shows revoked status
- [ ] Download link disabled for student
- [ ] Can see revocation history
- [ ] Can reissue if needed

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-CERT-006-revoke-certificate.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-CERT-007: Verify Certificate
**Priority:** P1 - High
**Objective:** Verify certificate verification system works

**Test Steps:**
1. Navigate to public certificate verification page
2. Enter verification code from certificate
3. Submit

**Expected Results:**
- [ ] Verification page accessible publicly (no login)
- [ ] Code input validates format
- [ ] Valid code shows certificate details:
   - Student name
   - Course name
   - Issue date
   - Instructor/Organization name
   - Status (Valid/Revoked/Expired)
- [ ] Invalid code shows "Not Found" message
- [ ] Revoked certificates show revoked status

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-CERT-007-verify-certificate.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-CERT-008: Certificate Expiry Handling
**Priority:** P2 - Medium
**Objective:** Verify certificate expiration works correctly

**Test Steps:**
1. Create certificate template with expiry (e.g., 1 year)
2. Issue certificate
3. Check expiry date
4. Test verification after expiry (use test data or modify date)

**Expected Results:**
- [ ] Expiry date calculated correctly from issue date
- [ ] Expiry date shows on certificate
- [ ] Verification shows "Expired" after expiry date
- [ ] Student notified before expiry (if feature exists)
- [ ] Can reissue expired certificate
- [ ] Expired certificates tracked separately

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-CERT-008-expiry-handling.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-CERT-009: Bulk Certificate Issuance
**Priority:** P2 - Medium
**Objective:** Verify multiple certificates can be issued at once

**Test Steps:**
1. Navigate to course students
2. Select multiple students who completed course
3. Click "Issue Certificates" (bulk action)
4. Select template
5. Confirm

**Expected Results:**
- [ ] Can select multiple students
- [ ] Shows preview of students to receive certificates
- [ ] Progress indicator during issuance
- [ ] All certificates generate successfully
- [ ] Students notified
- [ ] Summary shows success/failure count
- [ ] Can download all certificates as ZIP

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-CERT-009-bulk-issue.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-CERT-010: Download Certificate
**Priority:** P1 - High
**Objective:** Verify instructor can download issued certificates

**Test Steps:**
1. View issued certificate
2. Click "Download" or "Preview"
3. Download PDF

**Expected Results:**
- [ ] Certificate preview displays correctly
- [ ] PDF generates successfully
- [ ] PDF quality is high (print-ready)
- [ ] All placeholders filled with correct data
- [ ] Images render properly
- [ ] File name is descriptive
- [ ] Can download multiple certificates (bulk)

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-CERT-010-download.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 11. Bulk Operations

### TC-BULK-001: Bulk Student Email
**Priority:** P1 - High
**Objective:** Test covered in TC-STUDENT-007

---

### TC-BULK-002: Bulk Assignment Grading
**Priority:** P2 - Medium
**Objective:** Verify instructor can grade multiple assignments at once

**Test Steps:**
1. Navigate to assignment submissions
2. Select multiple submissions
3. Click "Bulk Grade" or "Quick Grade"
4. Enter grades for each selected submission
5. Add common feedback (optional)
6. Save all grades

**Expected Results:**
- [ ] Can select multiple submissions
- [ ] Bulk grade interface shows all selected students
- [ ] Can enter grade for each student quickly
- [ ] Can apply same feedback to all
- [ ] Validation works for each grade
- [ ] All grades save successfully
- [ ] Students notified
- [ ] Progress indicator shows during save

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-BULK-002-bulk-grading.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-BULK-003: Bulk Certificate Issuance
**Priority:** P2 - Medium
**Objective:** Test covered in TC-CERT-009

---

### TC-BULK-004: Bulk Student Enrollment
**Priority:** P2 - Medium
**Objective:** Verify multiple students can be enrolled at once

**Test Steps:**
1. Navigate to course
2. Click "Enroll Students" → "Bulk Enroll"
3. Upload CSV file with student emails
   OR paste list of emails
4. Set enrollment options (type, due date)
5. Preview enrollments
6. Confirm

**Expected Results:**
- [ ] CSV upload works
- [ ] Email list paste works
- [ ] Validation checks for existing enrollments
- [ ] Shows preview before confirming
- [ ] All students enroll successfully
- [ ] Students notified
- [ ] Shows success/error summary
- [ ] Failed enrollments can be retried

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-BULK-004-bulk-enrollment.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-BULK-005: Bulk Delete/Archive
**Priority:** P2 - Medium
**Objective:** Verify bulk operations for content management

**Test Steps:**
1. Select multiple items (courses, lessons, assignments, discussions)
2. Click "Delete" or "Archive"
3. Confirm bulk action

**Expected Results:**
- [ ] Can select multiple items with checkboxes
- [ ] "Select All" works
- [ ] Confirmation shows count of items
- [ ] Warning if items have dependencies (enrollments, submissions)
- [ ] Bulk action completes successfully
- [ ] Progress indicator shows
- [ ] Summary of results
- [ ] Can undo if archive (not delete)

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-BULK-005-bulk-delete.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 12. Edge Cases & Error Handling

### TC-EDGE-001: Empty States
**Priority:** P2 - Medium
**Objective:** Verify UI handles empty states gracefully

**Test Scenarios:**
- [ ] No courses created → Shows "Create your first course" prompt
- [ ] No students enrolled → Shows empty state message
- [ ] No assignments → Shows "Add an assignment" CTA
- [ ] No discussions → Shows "No discussions yet"
- [ ] No certificates → Shows template creation prompt
- [ ] Search with no results → Shows "No results found"

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-EDGE-001-empty-states.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-EDGE-002: Max Limits
**Priority:** P2 - Medium
**Objective:** Verify system handles maximum limits

**Test Scenarios:**
- [ ] Course with 1000+ enrolled students loads
- [ ] Assignment with 500+ submissions loads
- [ ] Quiz with 100+ questions works
- [ ] Discussion with 1000+ replies paginated correctly
- [ ] File upload size limit enforced
- [ ] Character limits enforced in text fields

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-EDGE-002-max-limits.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-EDGE-003: Network Error Handling
**Priority:** P1 - High
**Objective:** Verify graceful degradation on network issues

**Test Steps:**
1. Simulate network failure (disconnect internet)
2. Attempt to save course
3. Reconnect
4. Retry

**Expected Results:**
- [ ] Shows "Connection lost" message
- [ ] Data not lost (draft save if available)
- [ ] Retry button available
- [ ] Auto-retry on reconnection
- [ ] Success after reconnection
- [ ] Clear error messages

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-EDGE-003-network-error.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-EDGE-004: Concurrent Editing
**Priority:** P2 - Medium
**Objective:** Verify handling when multiple instructors edit same content

**Test Steps:**
1. Open same course in two browsers (two instructors)
2. Edit same lesson in both
3. Save in both

**Expected Results:**
- [ ] Shows warning if content changed by another user
- [ ] Option to merge or overwrite
- [ ] No data loss
- [ ] Clear conflict resolution
- [ ] Activity logs show both edits

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-EDGE-004-concurrent-edit.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-EDGE-005: Special Characters Handling
**Priority:** P2 - Medium
**Objective:** Verify special characters don't break system

**Test Scenarios:**
- [ ] Course title with emojis 😊 saves correctly
- [ ] Description with HTML/script tags sanitized
- [ ] Student name with accents (José, Müller) displays correctly
- [ ] File names with special chars upload correctly
- [ ] Search with special chars works
- [ ] Export handles special chars

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-EDGE-005-special-chars.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 13. Performance Testing

### TC-PERF-001: Page Load Times
**Priority:** P1 - High
**Objective:** Verify pages load within acceptable time

**Test Measurements:**
- [ ] Dashboard loads < 3 seconds
- [ ] Course list loads < 3 seconds
- [ ] Student list (500 students) loads < 5 seconds
- [ ] Assignment submissions (200 submissions) loads < 5 seconds
- [ ] Analytics charts render < 3 seconds
- [ ] Large file uploads show progress

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-PERF-001-load-times.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-PERF-002: Search Performance
**Priority:** P2 - Medium
**Objective:** Verify search returns results quickly

**Test Measurements:**
- [ ] Course search results < 1 second
- [ ] Student search results < 1 second
- [ ] Discussion search results < 2 seconds
- [ ] Search works with typos (fuzzy search)
- [ ] Auto-complete suggestions fast

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-PERF-002-search-perf.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 14. Cross-Browser Testing

### TC-BROWSER-001: Chrome Compatibility
**Priority:** P1 - High
**Objective:** Verify all features work in Chrome

**Test:** Run all critical test cases (P0) in Chrome
- [ ] Authentication works
- [ ] All pages load correctly
- [ ] Forms submit successfully
- [ ] File uploads work
- [ ] Charts render properly
- [ ] No console errors

**Pass/Fail:** ⬜ Pass ⬜ Fail

---

### TC-BROWSER-002: Firefox Compatibility
**Priority:** P1 - High
**Objective:** Verify all features work in Firefox

**Test:** Run all critical test cases (P0) in Firefox
- [ ] Same as TC-BROWSER-001 checklist

**Pass/Fail:** ⬜ Pass ⬜ Fail

---

### TC-BROWSER-003: Safari Compatibility
**Priority:** P2 - Medium
**Objective:** Verify all features work in Safari

**Test:** Run all critical test cases (P0) in Safari
- [ ] Same as TC-BROWSER-001 checklist

**Pass/Fail:** ⬜ Pass ⬜ Fail

---

### TC-BROWSER-004: Edge Compatibility
**Priority:** P2 - Medium
**Objective:** Verify all features work in Edge

**Test:** Run all critical test cases (P0) in Edge
- [ ] Same as TC-BROWSER-001 checklist

**Pass/Fail:** ⬜ Pass ⬜ Fail

---

## 15. Mobile Responsiveness

### TC-MOBILE-001: Mobile View - Dashboard
**Priority:** P2 - Medium
**Objective:** Verify dashboard is mobile-friendly

**Test Steps:**
1. Open dashboard on mobile (or resize browser to mobile width)
2. Check layout

**Expected Results:**
- [ ] Layout adapts to mobile screen
- [ ] Stats cards stack vertically
- [ ] Charts are scrollable/zoomable
- [ ] Touch interactions work
- [ ] Text is readable without zooming
- [ ] Buttons are tap-friendly (min 44px)

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-MOBILE-001-dashboard.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-MOBILE-002: Mobile View - Course Management
**Priority:** P2 - Medium
**Objective:** Verify course management works on mobile

**Test Scenarios:**
- [ ] Course list displays well
- [ ] Can create course on mobile
- [ ] Can edit course
- [ ] Can add lesson
- [ ] Forms are usable
- [ ] File upload works

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-MOBILE-002-courses.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-MOBILE-003: Mobile View - Grading
**Priority:** P2 - Medium
**Objective:** Verify grading works on mobile

**Test Scenarios:**
- [ ] Can view submissions
- [ ] Can enter grades
- [ ] Can provide feedback
- [ ] Can download submitted files
- [ ] Keyboard doesn't obstruct interface

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-MOBILE-003-grading.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## 16. Security Testing

### TC-SECURITY-001: Authorization - Cannot Access Other Instructor's Data
**Priority:** P0 - Critical
**Objective:** Verify instructor can only see their own data

**Test Steps:**
1. Log in as Instructor A
2. Note course IDs of Instructor B (from database or admin)
3. Attempt to access Instructor B's course URL directly
4. Attempt API calls for Instructor B's data

**Expected Results:**
- [ ] Cannot view other instructor's courses
- [ ] 403 Forbidden or redirect to own dashboard
- [ ] Cannot edit other instructor's content
- [ ] Cannot view other instructor's students
- [ ] Cannot grade other instructor's assignments
- [ ] API returns 403 for unauthorized access

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-SECURITY-001-authorization.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-SECURITY-002: Input Validation - XSS Prevention
**Priority:** P0 - Critical
**Objective:** Verify XSS attacks are prevented

**Test Steps:**
1. Attempt to inject script in various fields:
   - Course title: `<script>alert('XSS')</script>`
   - Description: `<img src=x onerror=alert('XSS')>`
   - Discussion post: `<script>alert('XSS')</script>`
2. Save and view content

**Expected Results:**
- [ ] Script tags sanitized/escaped
- [ ] No JavaScript executes
- [ ] Content displays safely
- [ ] Rich text editor prevents script injection
- [ ] File uploads sanitized

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-SECURITY-002-xss.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-SECURITY-003: SQL Injection Prevention
**Priority:** P0 - Critical
**Objective:** Verify SQL injection attacks don't work

**Test Steps:**
1. Attempt SQL injection in search/filter fields:
   - Search: `' OR '1'='1`
   - Filter: `1' UNION SELECT * FROM users--`
2. Submit forms with SQL patterns

**Expected Results:**
- [ ] Inputs are parameterized/escaped
- [ ] No database errors exposed
- [ ] No unauthorized data returned
- [ ] Application logs suspicious attempts

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-SECURITY-003-sql-injection.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-SECURITY-004: File Upload Security
**Priority:** P1 - High
**Objective:** Verify file uploads are secure

**Test Steps:**
1. Attempt to upload malicious files:
   - .exe file
   - .php file
   - File with double extension (.jpg.php)
   - Very large file (beyond limit)
2. Upload legitimate file and check storage

**Expected Results:**
- [ ] Only allowed file types accepted
- [ ] File extensions validated on server
- [ ] File size limit enforced
- [ ] Files stored outside web root (or with random names)
- [ ] Virus scanning if available
- [ ] Uploaded files not executable

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-SECURITY-004-file-upload.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

### TC-SECURITY-005: Session Security
**Priority:** P1 - High
**Objective:** Verify session management is secure

**Test Steps:**
1. Log in as instructor
2. Copy session cookie
3. Log out
4. Attempt to use old session cookie
5. Test session hijacking prevention

**Expected Results:**
- [ ] Session expires on logout
- [ ] Session timeout works (configured period)
- [ ] HTTPOnly cookies used
- [ ] Secure flag set (HTTPS)
- [ ] Session ID regenerated after login
- [ ] Cannot reuse old session tokens

**Pass/Fail:** ⬜ Pass ⬜ Fail
**Screenshot:** 📸 `TC-SECURITY-005-session.png`

**Notes/Issues:**
```
_________________________________________________________________
_________________________________________________________________
```

---

## Bug Report Template

When a test case fails, please use this template to report the bug:

---

### 🐛 Bug Report

**Bug ID:** BUG-INST-XXX (Auto-increment)
**Reported By:** _______________
**Date:** _______________
**Test Case:** TC-XXXXX-XXX
**Priority:** ⬜ Critical (P0) ⬜ High (P1) ⬜ Medium (P2) ⬜ Low (P3)

---

**Title:**
```
[Brief description of the bug in one line]
```

---

**Environment:**
- Browser: _______________
- OS: _______________
- Screen Resolution: _______________
- Device: ⬜ Desktop ⬜ Mobile ⬜ Tablet

---

**Steps to Reproduce:**
1.
2.
3.

---

**Expected Result:**
```
[What should happen]
```

---

**Actual Result:**
```
[What actually happened]
```

---

**Screenshots/Evidence:**
📸 Attach screenshots here

---

**Console Errors:**
```
[Any errors from browser console]
```

---

**Network Errors:**
```
[Any failed API requests from Network tab]
```

---

**Additional Notes:**
```
[Any other relevant information]
```

---

**Severity:**
- ⬜ Blocker - Cannot proceed with testing
- ⬜ Critical - Major feature broken
- ⬜ Major - Feature partially working
- ⬜ Minor - Cosmetic or minor issue

---

**Reproducibility:**
- ⬜ Always
- ⬜ Sometimes (X out of Y attempts)
- ⬜ Once

---

**Workaround Available:**
- ⬜ Yes: [Describe workaround]
- ⬜ No

---

**Suggested Fix:**
```
[If you have suggestions for fixing]
```

---

## Test Execution Summary

### Overall Statistics

**Test Execution Date:** _______________
**Tested By:** _______________
**Total Test Cases:** 150+
**Test Cases Executed:** ___ / ___
**Test Cases Passed:** ___
**Test Cases Failed:** ___
**Test Cases Blocked:** ___
**Test Cases Skipped:** ___

**Pass Rate:** ____%

---

### Summary by Module

| Module | Total | Passed | Failed | Blocked | Pass Rate |
|--------|-------|--------|--------|---------|-----------|
| Authentication | 3 | ___ | ___ | ___ | ___% |
| Dashboard | 3 | ___ | ___ | ___ | ___% |
| Course Management | 10 | ___ | ___ | ___ | ___% |
| Lesson Management | 8 | ___ | ___ | ___ | ___% |
| Quiz Management | 10 | ___ | ___ | ___ | ___% |
| Student Management | 10 | ___ | ___ | ___ | ___% |
| Assignment Management | 12 | ___ | ___ | ___ | ___% |
| Discussion Management | 10 | ___ | ___ | ___ | ___% |
| Analytics | 8 | ___ | ___ | ___ | ___% |
| Certificate Management | 10 | ___ | ___ | ___ | ___% |
| Bulk Operations | 5 | ___ | ___ | ___ | ___% |
| Edge Cases | 5 | ___ | ___ | ___ | ___% |
| Performance | 2 | ___ | ___ | ___ | ___% |
| Cross-Browser | 4 | ___ | ___ | ___ | ___% |
| Mobile | 3 | ___ | ___ | ___ | ___% |
| Security | 5 | ___ | ___ | ___ | ___% |

---

### Critical Issues (P0)

1. ________________________________________________________________
2. ________________________________________________________________
3. ________________________________________________________________

---

### High Priority Issues (P1)

1. ________________________________________________________________
2. ________________________________________________________________
3. ________________________________________________________________

---

### Recommendations

```
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
```

---

### Sign-off

**Tester:** _______________
**Signature:** _______________
**Date:** _______________

---

**Test Manager:** _______________
**Signature:** _______________
**Date:** _______________

---

## Notes for Testers

### Testing Best Practices

1. **Always start with a clean test environment**
2. **Document everything** - screenshots, errors, steps
3. **Test both positive and negative scenarios**
4. **Check console for JavaScript errors**
5. **Check network tab for failed API requests**
6. **Test with realistic data volumes**
7. **Test edge cases and boundary values**
8. **Clear cache/cookies if behavior is unexpected**
9. **Retest fixed bugs to ensure they're resolved**
10. **Communicate with developers for clarifications**

---

### Priority Levels

- **P0 (Critical):** Test these first - core functionality
- **P1 (High):** Test these second - important features
- **P2 (Medium):** Test if time permits - nice-to-have features
- **P3 (Low):** Test last - cosmetic issues

---

### Test Execution Order

**Recommended order:**
1. Authentication & Access Control (TC-AUTH-XXX)
2. Dashboard (TC-DASH-XXX)
3. Course Management (TC-COURSE-XXX)
4. Lesson & Quiz Management (TC-LESSON/QUIZ-XXX)
5. Student Management (TC-STUDENT-XXX)
6. Assignment & Grading (TC-ASSIGN-XXX)
7. Analytics & Reporting (TC-ANALYTICS-XXX)
8. Discussion & Certificate Management
9. Edge Cases & Error Handling
10. Performance & Cross-browser Testing
11. Security Testing

---

### Common Issues to Watch For

- Loading indicators stuck
- 404 errors on navigation
- Data not saving/persisting
- Broken image links
- Console errors
- Network timeouts
- Validation not working
- Permissions not enforced
- Search/filter not working
- Export/download issues

---

**End of Test Plan**
