# 🎓 QA AUDIT REPORT: Course Management System
**Project:** Civilabs LMS
**Date:** 2025-11-24
**Auditor:** Senior QA Engineer
**Scope:** Course CRUD, Enrollment, Progress Tracking, Course Discovery

---

## ✅ EXECUTIVE SUMMARY

**Overall Grade: B (82/100)**

The course management system is **generally well-implemented** with good authorization controls and proper Prisma ORM usage preventing SQL injection. However, there are **4 CRITICAL security/data integrity issues** and several medium-priority bugs that need attention.

### Quick Stats:
- ✅ **Security:** 7/10 - Good authorization, critical issues found
- ⚠️ **Data Integrity:** 6/10 - N+1 query issue, status field mismatch
- ✅ **User Experience:** 8/10 - Good error handling and feedback
- ⚠️ **Code Quality:** 7/10 - Type safety issues, field inconsistencies

---

## 🚨 CRITICAL ISSUES (Must Fix Immediately)

### 1. **SECURITY: Course Status Field Mismatch - Potential Unauthorized Enrollment**
**Severity:** 🔴 CRITICAL SECURITY
**Location:** `app/api/enrollments/route.ts:162`

**Issue:**
```typescript
// Line 162: Checking WRONG field!
if (course.status !== 'PUBLISHED') {
  return NextResponse.json({ error: 'Cannot enroll in unpublished course' }, { status: 403 })
}
```

**Problem:** The Course model uses `publishedAt` field (DateTime), not `status` field. The `status` field is `CourseStatus` enum ('DRAFT', 'PUBLISHED', 'ARCHIVED').

**Database Schema:**
```prisma
model Course {
  status CourseStatus @default(DRAFT)  // This is DRAFT/PUBLISHED/ARCHIVED
  publishedAt DateTime?                 // This determines if published!
}
```

**Risk:**
- **CRITICAL:** This check is checking the WRONG field!
- If `course.status` is `DRAFT` but `publishedAt` is set, enrollment would be blocked (false negative)
- If `course.status` is `PUBLISHED` but `publishedAt` is null, enrollment would be allowed (false positive - SECURITY ISSUE!)
- Users could enroll in unpublished courses!

**Fix Required:**
```typescript
// CORRECT check:
if (!course.publishedAt) {
  return NextResponse.json(
    { error: 'Cannot enroll in unpublished course' },
    { status: 403 }
  )
}
```

---

### 2. **PERFORMANCE: N+1 Query Problem in Enrollment List**
**Severity:** 🔴 CRITICAL PERFORMANCE
**Location:** `app/api/enrollments/route.ts:87-106`

**Issue:**
```typescript
const enrichedEnrollments = await Promise.all(
  enrollments.map(async (enrollment) => {
    // ❌ This runs a separate query for EACH enrollment!
    const totalLessons = await prisma.lesson.count({
      where: { courseId: enrollment.courseId },
    })
    // ...
  })
)
```

**Problem:** Classic N+1 query problem. If a user has 50 enrollments, this makes 50 separate database queries.

**Impact:**
- Slow response times (especially for active learners)
- High database load
- Poor scalability

**Fix Required:**
```typescript
// Get all unique course IDs
const courseIds = [...new Set(enrollments.map(e => e.courseId))]

// Single query to get lesson counts for all courses
const lessonCounts = await prisma.lesson.groupBy({
  by: ['courseId'],
  where: { courseId: { in: courseIds } },
  _count: { id: true },
})

// Create lookup map
const lessonCountMap = Object.fromEntries(
  lessonCounts.map(lc => [lc.courseId, lc._count.id])
)

// Enrich without additional queries
const enrichedEnrollments = enrollments.map((enrollment) => {
  const totalLessons = lessonCountMap[enrollment.courseId] || 0
  const completedCount = enrollment.lessonProgress.length
  const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0

  return {
    ...enrollment,
    totalLessons,
    completedLessonsCount: completedCount,
    calculatedProgress: progress,
  }
})
```

---

### 3. **AUTHORIZATION: Ownership Check Has Incorrect Role Check**
**Severity:** 🟠 HIGH SECURITY
**Location:** `app/api/courses/[id]/route.ts:157`

**Issue:**
```typescript
// Line 157: Role check is case-sensitive and lowercase!
if (user.role !== 'admin' && existingCourse.instructorId !== user.userId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}
```

**Problem:**
- The role enum is UPPERCASE: 'ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR'
- This check uses lowercase `'admin'`
- **RESULT:** Admins with 'ADMIN' or 'SUPER_ADMIN' roles will be blocked from editing courses they don't own!
- Only users with literally `role === 'admin'` (which doesn't exist in enum) can bypass ownership check

**Risk:** Admins cannot edit courses, breaking admin functionality

**Fix Required:**
```typescript
const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
if (!isAdmin && existingCourse.instructorId !== user.userId) {
  return NextResponse.json({ error: 'Forbidden', message: 'You can only edit your own courses' }, { status: 403 })
}
```

---

### 4. **DATA BUG: Category Field Type Mismatch in Update**
**Severity:** 🟡 MEDIUM BUG
**Location:** `app/api/courses/[id]/route.ts:172`

**Issue:**
```typescript
if (body.category) updateData.category = body.category
```

**Problem:**
- The Course model has `categoryId` (string), not `category` (object)
- This will try to set the `category` relation instead of `categoryId` field
- Prisma will throw an error or ignore the field

**Fix Required:**
```typescript
if (body.categoryId) updateData.categoryId = body.categoryId
```

---

## ⚠️ MEDIUM PRIORITY ISSUES

### 5. **Missing Slug Uniqueness Validation**
**Severity:** 🟡 MEDIUM DATA INTEGRITY
**Location:** `app/api/courses/route.ts:106-110`

**Issue:** Course creation generates slug from title but doesn't check for uniqueness

**Risk:**
```typescript
// Two courses with same title:
// "Safety Training" → slug: "safety-training"
// "Safety Training" → slug: "safety-training"  // ❌ Duplicate!
```

**Impact:** Duplicate slugs will cause Prisma unique constraint error (if slug has @unique)

**Recommendation:**
```typescript
// Generate unique slug
let slug = body.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// Check if slug exists
const existingCourse = await prisma.course.findUnique({ where: { slug } })

if (existingCourse) {
  // Append random suffix
  slug = `${slug}-${Date.now().toString(36)}`
}
```

---

### 6. **Missing Validation on Course Update**
**Severity:** 🟡 MEDIUM DATA INTEGRITY
**Location:** `app/api/courses/[id]/route.ts:168-184`

**Issue:** Course update accepts any fields without validation

**Risk:**
```typescript
// Malicious request:
PUT /api/courses/123
{
  "title": "",  // Empty title allowed!
  "duration": -1000,  // Negative duration!
  "thumbnail": "javascript:alert('XSS')"  // Potential XSS
}
```

**Recommendation:** Add validation similar to POST route

---

### 7. **Enrollment: Missing Course Visibility Check**
**Severity:** 🟡 MEDIUM BUSINESS LOGIC
**Location:** `app/api/enrollments/route.ts:162-171`

**Issue:** Only checks if course is published, doesn't check `visibility` field

**Database Schema:**
```prisma
model Course {
  visibility CourseVisibility @default(PUBLIC)  // PUBLIC, PRIVATE, RESTRICTED
}
```

**Risk:** Users might be able to enroll in PRIVATE or RESTRICTED courses without authorization

**Recommendation:**
```typescript
// Check visibility
if (course.visibility === 'PRIVATE') {
  return NextResponse.json({ error: 'This is a private course' }, { status: 403 })
}

if (course.visibility === 'RESTRICTED') {
  // Check if user is in allowed list (requires additional logic)
  return NextResponse.json({ error: 'This course has restricted access' }, { status: 403 })
}
```

---

### 8. **Course List: No Published Filter by Default**
**Severity:** 🟡 MEDIUM SECURITY
**Location:** `app/api/courses/route.ts:23-39`

**Issue:** GET /api/courses returns ALL courses by default, including unpublished ones

**Risk:**
- Students can see draft courses
- Unpublished course data is exposed

**Current Behavior:**
```typescript
// Returns ALL courses (draft, published, archived)
GET /api/courses
```

**Recommendation:**
```typescript
// Default to published only for non-admins
const user = authenticateRequest(request)
const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')

const courses = await prisma.course.findMany({
  where: {
    ...whereClause,
    // Default filter for non-admins
    ...(!isAdmin && { publishedAt: { not: null } }),
  },
  // ...
})
```

---

### 9. **TypeScript: Using `any` Type**
**Severity:** 🟡 MEDIUM CODE QUALITY
**Locations:** Multiple files

**Issue:** Widespread use of `any` type defeats TypeScript's purpose

**Examples:**
```typescript
// app/(dashboard)/courses/[id]/page.tsx:60
const [course, setCourse] = useState<any>(null)  // ❌

// app/api/courses/[id]/route.ts:168
const updateData: any = {}  // ❌
```

**Recommendation:** Define proper interfaces

---

### 10. **Frontend: Field Name Inconsistencies**
**Severity:** 🟡 MEDIUM UX BUG
**Location:** `app/(dashboard)/courses/page.tsx:388`

**Issue:** Course page already fixed to use `durationMinutes` and `_count.enrollments`, but might have similar issues elsewhere

**Verification Needed:** Check all course-related pages for field consistency

---

## ✅ STRENGTHS (Well Implemented)

### Security
1. ✅ **SQL Injection Protection:** Prisma ORM with parameterized queries
2. ✅ **Authorization Middleware:** `withInstructor`, `withAdmin` properly used
3. ✅ **Ownership Checks:** Instructors can only edit their own courses (when role check works)
4. ✅ **Enrollment Validation:** Checks for existing enrollments (prevents duplicates)
5. ✅ **Deletion Protection:** Cannot delete courses with active enrollments

### User Experience
1. ✅ **Good Error Messages:** User-friendly, specific error messages
2. ✅ **Loading States:** Proper loading indicators
3. ✅ **Progress Calculation:** Enrollment progress correctly calculated
4. ✅ **Notifications:** Creates notification on enrollment

### Code Quality
1. ✅ **Consistent Pattern:** All APIs follow same structure
2. ✅ **Error Handling:** Try-catch blocks throughout
3. ✅ **Transaction Safety:** Proper async/await usage
4. ✅ **Include Optimization:** Selective includes to reduce data

---

## 🧪 TEST CASES PERFORMED

### ✅ Passed Tests
| Test Case | Status | Notes |
|-----------|--------|-------|
| List all courses | ✅ PASS | Returns courses with proper structure |
| Get course by ID | ✅ PASS | Returns detailed course info |
| Check enrollment status | ✅ PASS | Correctly identifies if user enrolled |
| Delete course without enrollments | ✅ PASS | Admin can delete empty courses |
| Prevent double enrollment | ✅ PASS | Returns 409 Conflict |
| Authorization on course creation | ✅ PASS | Only instructors/admins can create |
| Authorization on course deletion | ✅ PASS | Only admins can delete |
| Progress calculation | ✅ PASS | Correctly calculates percentage |
| Course search | ✅ PASS | Search works case-insensitive |
| Category filtering | ✅ PASS | Filters by categoryId correctly |

### ❌ Failed/Warning Tests
| Test Case | Status | Issue |
|-----------|--------|-------|
| Enroll in unpublished course | ⚠️ **CRITICAL BUG** | Wrong field check (`status` vs `publishedAt`) |
| Admin edit any course | ❌ **FAIL** | Role check is lowercase, blocks admins |
| List 100 enrollments | ⚠️ **SLOW** | N+1 query makes 100+ database calls |
| Update course category | ❌ **FAIL** | Uses wrong field name (`category` vs `categoryId`) |
| Create duplicate course slug | ⚠️ **WARNING** | No uniqueness check |
| Enroll in PRIVATE course | ⚠️ **WARNING** | Visibility not checked |
| List courses as student | ⚠️ **WARNING** | Shows unpublished courses |

---

## 📊 DETAILED FINDINGS

### API Consistency Check

| Endpoint | Method | Auth | Input Validation | Error Handling | Grade |
|----------|--------|------|------------------|----------------|-------|
| `/api/courses` | GET | ❌ None | N/A | ✅ Good | B- |
| `/api/courses` | POST | ✅ Instructor | ⚠️ Basic | ✅ Good | B+ |
| `/api/courses/[id]` | GET | ⚠️ Optional | N/A | ✅ Good | A- |
| `/api/courses/[id]` | PUT | ✅ Instructor | ❌ Missing | ✅ Good | C+ |
| `/api/courses/[id]` | DELETE | ✅ Admin | ✅ Good | ✅ Good | A |
| `/api/enrollments` | GET | ✅ Auth | N/A | ✅ Good | B |
| `/api/enrollments` | POST | ✅ Auth | ⚠️ Basic | ✅ Good | B- |

---

## 🔧 RECOMMENDED FIXES (Priority Order)

### Immediate (This Sprint)
1. ✅ Fix enrollment `status` field check → use `publishedAt` **CRITICAL**
2. ✅ Fix admin role check in course update **HIGH**
3. ✅ Fix N+1 query in enrollments list **CRITICAL PERFORMANCE**
4. ✅ Fix category field name in course update **MEDIUM**
5. ✅ Add published filter by default for non-admins **MEDIUM**

### Next Sprint
6. ⚠️ Add slug uniqueness validation
7. ⚠️ Add course visibility checks on enrollment
8. ⚠️ Add input validation on course update
9. ⚠️ Replace `any` types with proper interfaces
10. ⚠️ Add rate limiting to course creation

### Future Enhancements
11. 📋 Add course preview functionality
12. 📋 Implement course versioning
13. 📋 Add course prerequisites validation
14. 📋 Add enrollment waitlist for full courses
15. 📋 Add course rating/review validation

---

## 📈 SECURITY IMPROVEMENTS SUMMARY

| Metric | Before Audit | Issues Found | Priority |
|--------|-------------|--------------|----------|
| Authorization Bugs | Unknown | 1 Critical | 🔴 **FIX NOW** |
| Data Integrity Issues | Unknown | 1 Critical, 3 Medium | 🟠 **HIGH** |
| Performance Issues | Unknown | 1 Critical (N+1) | 🔴 **FIX NOW** |
| Input Validation Gaps | Unknown | 2 Medium | 🟡 **MEDIUM** |

---

## 🎯 FINAL VERDICT

### Before Fixes:
**Grade: C+ (75/100)** - Functional but critical bugs present

### After Fixes (Estimated):
**Grade: A- (90/100)** - Production-ready with recommended improvements

### Production Readiness:
❌ **NOT READY** until critical issues are fixed:
1. Enrollment published check (SECURITY)
2. Admin role check (FUNCTIONALITY)
3. N+1 query (PERFORMANCE)

---

## 📝 CODE EXAMPLES

### Issue #1 Fix: Enrollment Published Check
**File:** `app/api/enrollments/route.ts`

```typescript
// ❌ BEFORE (WRONG):
if (course.status !== 'PUBLISHED') {
  return NextResponse.json({ error: 'Cannot enroll' }, { status: 403 })
}

// ✅ AFTER (CORRECT):
if (!course.publishedAt) {
  return NextResponse.json(
    { error: 'Cannot enroll in unpublished course' },
    { status: 403 }
  )
}
```

### Issue #2 Fix: N+1 Query
**File:** `app/api/enrollments/route.ts`

```typescript
// ❌ BEFORE (N+1 QUERIES):
const enrichedEnrollments = await Promise.all(
  enrollments.map(async (enrollment) => {
    const totalLessons = await prisma.lesson.count({
      where: { courseId: enrollment.courseId },
    })
    // ...
  })
)

// ✅ AFTER (SINGLE QUERY):
// 1. Get unique course IDs
const courseIds = [...new Set(enrollments.map(e => e.courseId))]

// 2. Single grouped query
const lessonCounts = await prisma.lesson.groupBy({
  by: ['courseId'],
  where: { courseId: { in: courseIds } },
  _count: { id: true },
})

// 3. Create lookup
const lessonCountMap = Object.fromEntries(
  lessonCounts.map(lc => [lc.courseId, lc._count.id])
)

// 4. Map without queries
const enrichedEnrollments = enrollments.map((enrollment) => {
  const totalLessons = lessonCountMap[enrollment.courseId] || 0
  // ...
})
```

### Issue #3 Fix: Admin Role Check
**File:** `app/api/courses/[id]/route.ts`

```typescript
// ❌ BEFORE (BROKEN):
if (user.role !== 'admin' && existingCourse.instructorId !== user.userId) {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
}

// ✅ AFTER (CORRECT):
const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
if (!isAdmin && existingCourse.instructorId !== user.userId) {
  return NextResponse.json(
    { error: 'Forbidden', message: 'You can only edit your own courses' },
    { status: 403 }
  )
}
```

---

**Report Generated:** 2025-11-24
**Next Audit:** Quiz & Assessment System
**Estimated Fix Time:** 2-4 hours for critical issues
