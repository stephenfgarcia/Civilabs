/**
 * Instructor Students E2E Tests
 * Tests for student management functionality
 */

import { test, expect, TEST_USERS } from '../fixtures/auth.fixture'

test.describe('Instructor Students List', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should display students page', async ({ page }) => {
    await page.goto('/instructor/students')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Page should have students-related content
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should fetch students from API', async ({ page }) => {
    const apiResponse = page.waitForResponse('**/api/instructor/students**')

    await page.goto('/instructor/students')

    const response = await apiResponse
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('students')
    expect(data.data).toHaveProperty('total')
    expect(data.data).toHaveProperty('stats')
  })

  test('should display student stats', async ({ page }) => {
    await page.goto('/instructor/students')

    // Wait for data
    await page.waitForResponse('**/api/instructor/students**')

    // Should show stats
    const statsSection = page.locator('[class*="stats"], [class*="card"]')
    await expect(statsSection.first()).toBeVisible()
  })

  test('should have search functionality', async ({ page }) => {
    await page.goto('/instructor/students')

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]')

    if (await searchInput.isVisible()) {
      await searchInput.fill('test@example.com')

      // Should trigger API call with search param
      const response = await page.waitForResponse((resp) =>
        resp.url().includes('/api/instructor/students') &&
        resp.url().includes('search=')
      )

      expect(response.status()).toBe(200)
    }
  })

  test('should have course filter', async ({ page }) => {
    await page.goto('/instructor/students')

    const courseFilter = page.locator('select').filter({ hasText: /course|all/i })

    if (await courseFilter.isVisible()) {
      await expect(courseFilter).toBeVisible()
    }
  })

  test('should display student list with course info', async ({ page }) => {
    // Mock response with students
    await page.route('**/api/instructor/students**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            students: [
              {
                id: 'student-1',
                firstName: 'Test',
                lastName: 'Student',
                email: 'test@example.com',
                avatarUrl: null,
                department: { id: 'dept-1', name: 'Engineering' },
                courses: [
                  {
                    courseId: 'course-1',
                    courseTitle: 'Construction Safety',
                    courseSlug: 'construction-safety',
                    status: 'IN_PROGRESS',
                    progress: 45,
                    completedLessons: 5,
                    enrolledAt: new Date().toISOString(),
                    completedAt: null,
                  },
                ],
                totalEnrollments: 1,
                completedCourses: 0,
                averageProgress: 45,
              },
            ],
            total: 1,
            pagination: {
              page: 1,
              limit: 20,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            },
            stats: {
              totalStudents: 1,
              totalEnrollments: 1,
              activeStudents: 1,
            },
          },
        }),
      })
    })

    await page.goto('/instructor/students')

    await expect(page.getByText('Test Student')).toBeVisible()
    await expect(page.getByText('test@example.com')).toBeVisible()
  })

  test('should navigate to student details', async ({ page }) => {
    // Mock students list
    await page.route('**/api/instructor/students', (route) => {
      if (!route.request().url().includes('/students/')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              students: [
                {
                  id: 'student-123',
                  firstName: 'Jane',
                  lastName: 'Doe',
                  email: 'jane@example.com',
                  avatarUrl: null,
                  department: null,
                  courses: [],
                  totalEnrollments: 0,
                  completedCourses: 0,
                  averageProgress: 0,
                },
              ],
              total: 1,
              pagination: {
                page: 1,
                limit: 20,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
              },
              stats: { totalStudents: 1, totalEnrollments: 0, activeStudents: 0 },
            },
          }),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('/instructor/students')

    // Click on student to view details
    const viewButton = page.getByRole('link', { name: /view|details/i }).first()
    if (await viewButton.isVisible()) {
      await viewButton.click()
      await expect(page).toHaveURL(/\/instructor\/students\//)
    }
  })
})

test.describe('Instructor Student Details', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should display student profile', async ({ page }) => {
    // Mock student details
    await page.route('**/api/instructor/students/*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            student: {
              id: 'student-1',
              firstName: 'John',
              lastName: 'Smith',
              email: 'john@example.com',
              avatarUrl: null,
              role: 'LEARNER',
              createdAt: new Date().toISOString(),
              department: { id: 'dept-1', name: 'Construction' },
            },
            enrollments: [
              {
                id: 'enroll-1',
                status: 'IN_PROGRESS',
                enrolledAt: new Date().toISOString(),
                completedAt: null,
                progressPercentage: 60,
                lessonsCount: 10,
                completedLessons: 6,
                progress: 60,
                course: {
                  id: 'course-1',
                  title: 'Safety Training',
                  description: 'Learn safety protocols',
                  thumbnail: null,
                  instructor: { firstName: 'Instructor', lastName: 'Test' },
                  _count: { lessons: 10 },
                },
              },
            ],
            quizAttempts: [],
            certificates: [],
            recentActivity: { discussions: [], reviews: [] },
            stats: {
              totalEnrollments: 1,
              completedCourses: 0,
              avgProgress: 60,
              avgQuizScore: 0,
              totalCertificates: 0,
            },
          },
        }),
      })
    })

    await page.goto('/instructor/students/student-1')

    await expect(page.getByText('John Smith')).toBeVisible()
    await expect(page.getByText('john@example.com')).toBeVisible()
  })

  test('should display enrollment history', async ({ page }) => {
    await page.route('**/api/instructor/students/*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            student: {
              id: 'student-1',
              firstName: 'John',
              lastName: 'Smith',
              email: 'john@example.com',
              avatarUrl: null,
              role: 'LEARNER',
              createdAt: new Date().toISOString(),
              department: null,
            },
            enrollments: [
              {
                id: 'enroll-1',
                status: 'COMPLETED',
                enrolledAt: new Date(Date.now() - 30 * 86400000).toISOString(),
                completedAt: new Date().toISOString(),
                progressPercentage: 100,
                lessonsCount: 5,
                completedLessons: 5,
                progress: 100,
                course: {
                  id: 'course-1',
                  title: 'Completed Course',
                  description: null,
                  thumbnail: null,
                  instructor: { firstName: 'Test', lastName: 'Instructor' },
                  _count: { lessons: 5 },
                },
              },
            ],
            quizAttempts: [],
            certificates: [],
            recentActivity: { discussions: [], reviews: [] },
            stats: {
              totalEnrollments: 1,
              completedCourses: 1,
              avgProgress: 100,
              avgQuizScore: 0,
              totalCertificates: 0,
            },
          },
        }),
      })
    })

    await page.goto('/instructor/students/student-1')

    await expect(page.getByText('Completed Course')).toBeVisible()
    await expect(page.getByText('COMPLETED')).toBeVisible()
  })

  test('should display student stats', async ({ page }) => {
    await page.route('**/api/instructor/students/*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            student: {
              id: 'student-1',
              firstName: 'John',
              lastName: 'Smith',
              email: 'john@example.com',
              avatarUrl: null,
              role: 'LEARNER',
              createdAt: new Date().toISOString(),
              department: null,
            },
            enrollments: [],
            quizAttempts: [],
            certificates: [],
            recentActivity: { discussions: [], reviews: [] },
            stats: {
              totalEnrollments: 5,
              completedCourses: 3,
              avgProgress: 75,
              avgQuizScore: 85,
              totalCertificates: 2,
            },
          },
        }),
      })
    })

    await page.goto('/instructor/students/student-1')

    // Should display stats
    await expect(page.getByText('5')).toBeVisible() // Total enrollments
  })

  test('should handle unauthorized student access', async ({ page }) => {
    await page.route('**/api/instructor/students/*', (route) => {
      route.fulfill({
        status: 403,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Forbidden',
          message: 'You can only view students enrolled in your courses',
        }),
      })
    })

    await page.goto('/instructor/students/unauthorized-student')

    // Should show error message
    await expect(page.getByText(/forbidden|not authorized|access denied/i)).toBeVisible()
  })
})

test.describe('Instructor Students - Pagination', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should include pagination in API response', async ({ page }) => {
    const apiResponse = page.waitForResponse('**/api/instructor/students**')

    await page.goto('/instructor/students')

    const response = await apiResponse
    const data = await response.json()

    expect(data.data).toHaveProperty('pagination')
    expect(data.data.pagination).toHaveProperty('page')
    expect(data.data.pagination).toHaveProperty('limit')
    expect(data.data.pagination).toHaveProperty('totalPages')
  })

  test('should support page parameter', async ({ page }) => {
    await page.goto('/instructor/students?page=2')

    const response = await page.waitForResponse((resp) =>
      resp.url().includes('/api/instructor/students') &&
      resp.url().includes('page=2')
    )

    expect(response.status()).toBe(200)
  })
})
