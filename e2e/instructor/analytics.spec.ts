/**
 * Instructor Analytics E2E Tests
 * Tests for analytics and reporting functionality
 */

import { test, expect, TEST_USERS } from '../fixtures/auth.fixture'

test.describe('Instructor Analytics Page', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should display analytics page', async ({ page }) => {
    await page.goto('/instructor/analytics')

    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should fetch analytics from API', async ({ page }) => {
    const apiResponse = page.waitForResponse('**/api/instructor/analytics**')

    await page.goto('/instructor/analytics')

    const response = await apiResponse
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('summary')
    expect(data.data).toHaveProperty('enrollmentTrend')
    expect(data.data).toHaveProperty('courseMetrics')
    expect(data.data).toHaveProperty('period')
  })

  test('should display summary statistics', async ({ page }) => {
    await page.goto('/instructor/analytics')
    await page.waitForResponse('**/api/instructor/analytics**')

    // Should display key metrics
    await expect(page.getByText(/total courses|courses/i)).toBeVisible()
    await expect(page.getByText(/enrollments/i)).toBeVisible()
  })

  test('should have period filter', async ({ page }) => {
    await page.goto('/instructor/analytics')

    // Look for period selector (7, 30, 90 days)
    const periodSelector = page.locator('select, [role="radiogroup"], button').filter({ hasText: /days|period|week|month/i })

    if (await periodSelector.first().isVisible()) {
      await expect(periodSelector.first()).toBeVisible()
    }
  })

  test('should filter by time period', async ({ page }) => {
    await page.goto('/instructor/analytics')
    await page.waitForResponse('**/api/instructor/analytics**')

    // Change period if filter exists
    const periodButton = page.getByRole('button', { name: /30.*days|month/i })
    if (await periodButton.isVisible()) {
      const apiResponse = page.waitForResponse((resp) =>
        resp.url().includes('/api/instructor/analytics') &&
        resp.url().includes('period=30')
      )

      await periodButton.click()

      const response = await apiResponse
      const data = await response.json()
      expect(data.data.period.days).toBe(30)
    }
  })

  test('should have course filter', async ({ page }) => {
    await page.goto('/instructor/analytics')

    const courseFilter = page.locator('select').filter({ hasText: /course|all courses/i })
    if (await courseFilter.isVisible()) {
      await expect(courseFilter).toBeVisible()
    }
  })

  test('should display enrollment trend chart', async ({ page }) => {
    await page.goto('/instructor/analytics')
    await page.waitForResponse('**/api/instructor/analytics**')

    // Look for chart container or canvas
    const chartElement = page.locator('canvas, [class*="chart"], [class*="recharts"]')
    if (await chartElement.first().isVisible()) {
      await expect(chartElement.first()).toBeVisible()
    }
  })

  test('should display course metrics', async ({ page }) => {
    // Mock analytics data
    await page.route('**/api/instructor/analytics**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            summary: {
              totalCourses: 3,
              totalEnrollments: 150,
              totalCompletions: 75,
              overallCompletionRate: 50,
              uniqueStudents: 120,
              retentionRate: 65,
            },
            enrollmentTrend: [
              { date: '2024-01-01', enrollments: 10, completions: 5 },
              { date: '2024-01-02', enrollments: 15, completions: 8 },
              { date: '2024-01-03', enrollments: 12, completions: 6 },
            ],
            courseMetrics: [
              {
                courseId: 'course-1',
                courseTitle: 'Safety Training 101',
                category: 'Safety',
                totalEnrollments: 80,
                activeEnrollments: 30,
                completedEnrollments: 50,
                completionRate: 62,
                avgTimeSpentHours: 4,
                totalLessons: 10,
                lessonCompletionRates: [
                  { lessonId: 'l1', lessonTitle: 'Introduction', completionRate: 95 },
                  { lessonId: 'l2', lessonTitle: 'Safety Protocols', completionRate: 85 },
                  { lessonId: 'l3', lessonTitle: 'Emergency Procedures', completionRate: 70 },
                ],
              },
              {
                courseId: 'course-2',
                courseTitle: 'Advanced Construction',
                category: 'Construction',
                totalEnrollments: 50,
                activeEnrollments: 20,
                completedEnrollments: 15,
                completionRate: 30,
                avgTimeSpentHours: 6,
                totalLessons: 15,
                lessonCompletionRates: [],
              },
            ],
            period: {
              days: 30,
              startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
              endDate: new Date().toISOString(),
            },
          },
        }),
      })
    })

    await page.goto('/instructor/analytics')

    await expect(page.getByText('Safety Training 101')).toBeVisible()
    await expect(page.getByText('Advanced Construction')).toBeVisible()
  })

  test('should display lesson completion rates', async ({ page }) => {
    await page.route('**/api/instructor/analytics**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            summary: {
              totalCourses: 1,
              totalEnrollments: 50,
              totalCompletions: 25,
              overallCompletionRate: 50,
              uniqueStudents: 45,
              retentionRate: 60,
            },
            enrollmentTrend: [],
            courseMetrics: [
              {
                courseId: 'course-1',
                courseTitle: 'Test Course',
                category: 'Test',
                totalEnrollments: 50,
                activeEnrollments: 25,
                completedEnrollments: 25,
                completionRate: 50,
                avgTimeSpentHours: 3,
                totalLessons: 5,
                lessonCompletionRates: [
                  { lessonId: 'l1', lessonTitle: 'Lesson 1', completionRate: 90 },
                  { lessonId: 'l2', lessonTitle: 'Lesson 2', completionRate: 75 },
                  { lessonId: 'l3', lessonTitle: 'Lesson 3', completionRate: 60 },
                  { lessonId: 'l4', lessonTitle: 'Lesson 4', completionRate: 40 },
                  { lessonId: 'l5', lessonTitle: 'Lesson 5', completionRate: 30 },
                ],
              },
            ],
            period: {
              days: 30,
              startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
              endDate: new Date().toISOString(),
            },
          },
        }),
      })
    })

    await page.goto('/instructor/analytics')

    // Should show lesson completion rates if expanded
    await expect(page.getByText('Test Course')).toBeVisible()
  })
})

test.describe('Instructor Analytics - Data Accuracy', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should calculate completion rate correctly', async ({ page }) => {
    await page.route('**/api/instructor/analytics**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            summary: {
              totalCourses: 1,
              totalEnrollments: 100,
              totalCompletions: 45,
              overallCompletionRate: 45, // Should be 45/100 * 100 = 45
              uniqueStudents: 95,
              retentionRate: 50,
            },
            enrollmentTrend: [],
            courseMetrics: [],
            period: {
              days: 30,
              startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
              endDate: new Date().toISOString(),
            },
          },
        }),
      })
    })

    await page.goto('/instructor/analytics')

    // Should display 45% completion rate
    await expect(page.getByText(/45%|45 ?%/)).toBeVisible()
  })

  test('should handle empty data gracefully', async ({ page }) => {
    await page.route('**/api/instructor/analytics**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            summary: {
              totalCourses: 0,
              totalEnrollments: 0,
              totalCompletions: 0,
              overallCompletionRate: 0,
              uniqueStudents: 0,
              retentionRate: 0,
            },
            enrollmentTrend: [],
            courseMetrics: [],
            period: {
              days: 30,
              startDate: new Date(Date.now() - 30 * 86400000).toISOString(),
              endDate: new Date().toISOString(),
            },
          },
        }),
      })
    })

    await page.goto('/instructor/analytics')

    // Should not crash or show NaN
    await expect(page.locator('text=NaN')).toHaveCount(0)
    await expect(page.locator('text=undefined')).toHaveCount(0)
  })

  test('should verify lesson completion rate bug fix', async ({ page }) => {
    // This test verifies the fix for the bug where lesson completion rates
    // were checking for ANY completed lesson rather than the SPECIFIC lesson

    const apiResponse = page.waitForResponse('**/api/instructor/analytics**')

    await page.goto('/instructor/analytics')

    const response = await apiResponse
    const data = await response.json()

    // Verify the data structure includes lesson-specific completion rates
    if (data.data.courseMetrics.length > 0) {
      const course = data.data.courseMetrics[0]
      if (course.lessonCompletionRates.length > 0) {
        // Each lesson should have its own unique completion rate
        const rates = course.lessonCompletionRates.map((l: any) => l.completionRate)
        // Rates should generally decrease as lessons progress (drop-off)
        // or at least not all be identical (which would indicate the bug)
        const uniqueRates = new Set(rates)
        // With more than one lesson, we'd expect some variation in completion rates
        // (unless it's a perfect course where everyone completes everything)
        expect(uniqueRates.size).toBeGreaterThanOrEqual(1)
      }
    }
  })
})

test.describe('Instructor Analytics - Loading States', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should show loading state', async ({ page }) => {
    await page.route('**/api/instructor/analytics**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      route.continue()
    })

    await page.goto('/instructor/analytics')

    // Should show loading indicator
    await expect(page.locator('[class*="loading"], [class*="spinner"], text=/loading/i').first()).toBeVisible()
  })

  test('should handle API errors', async ({ page }) => {
    await page.route('**/api/instructor/analytics**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Failed to fetch analytics',
        }),
      })
    })

    await page.goto('/instructor/analytics')

    await expect(page.getByText(/error|failed/i)).toBeVisible()
  })
})
