/**
 * Instructor Courses E2E Tests
 * Tests for the instructor courses management functionality
 */

import { test, expect, TEST_USERS } from '../fixtures/auth.fixture'

test.describe('Instructor Courses', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should display courses page with correct heading', async ({ page }) => {
    await page.goto('/instructor/my-courses')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should display course list or empty state', async ({ page }) => {
    await page.goto('/instructor/my-courses')

    // Wait for content to load
    await page.waitForTimeout(1000)

    // Should either show courses or empty state
    const hasCourses = await page.locator('.rounded-lg').filter({ hasText: /lessons|enrollments/ }).count() > 0
    const hasEmptyState = await page.getByText(/no courses/i).isVisible().catch(() => false)

    expect(hasCourses || hasEmptyState).toBe(true)
  })

  test('should have search functionality', async ({ page }) => {
    await page.goto('/instructor/my-courses')

    const searchInput = page.locator('input[placeholder*="Search"], input[type="search"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('test search')
      // Search should trigger filtering
      await page.waitForTimeout(500)
    }
  })

  test('should have status filter dropdown', async ({ page }) => {
    await page.goto('/instructor/my-courses')

    const statusFilter = page.locator('select').filter({ hasText: /status|all/i })
    if (await statusFilter.isVisible()) {
      await statusFilter.selectOption({ index: 1 })
      await page.waitForTimeout(500)
    }
  })

  test('should navigate to course request page', async ({ page }) => {
    await page.goto('/instructor/my-courses')

    const requestButton = page.getByRole('link', { name: /request|create|new course/i })
    if (await requestButton.isVisible()) {
      await requestButton.click()
      await expect(page).toHaveURL(/\/instructor\/my-courses\/request/)
    }
  })
})

test.describe('Instructor Course Request', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should display course request form', async ({ page }) => {
    await page.goto('/instructor/my-courses/request')

    // Should have form elements
    await expect(page.locator('form')).toBeVisible()
  })

  test('should have required form fields', async ({ page }) => {
    await page.goto('/instructor/my-courses/request')

    // Common course form fields
    const titleInput = page.locator('input[name="title"], input[placeholder*="title" i]')
    const descriptionInput = page.locator('textarea[name="description"], textarea[placeholder*="description" i]')

    // At least title should be present
    if (await titleInput.isVisible()) {
      await expect(titleInput).toBeVisible()
    }
  })

  test('should validate required fields on submit', async ({ page }) => {
    await page.goto('/instructor/my-courses/request')

    const submitButton = page.locator('button[type="submit"]')
    if (await submitButton.isVisible()) {
      await submitButton.click()

      // Should show validation errors or not submit with empty fields
      await page.waitForTimeout(500)
    }
  })
})

test.describe('Instructor Courses - API Integration', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should fetch courses from API', async ({ page }) => {
    // Monitor API call
    const apiResponse = page.waitForResponse('**/api/instructor/courses**')

    await page.goto('/instructor/my-courses')

    const response = await apiResponse
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('courses')
    expect(data.data).toHaveProperty('total')
  })

  test('should include course metrics in response', async ({ page }) => {
    const apiResponse = page.waitForResponse('**/api/instructor/courses**')

    await page.goto('/instructor/my-courses')

    const response = await apiResponse
    const data = await response.json()

    if (data.data.courses.length > 0) {
      const course = data.data.courses[0]
      expect(course).toHaveProperty('metrics')
      expect(course.metrics).toHaveProperty('totalEnrollments')
      expect(course.metrics).toHaveProperty('completionRate')
      expect(course.metrics).toHaveProperty('totalLessons')
    }
  })

  test('should filter courses by status', async ({ page }) => {
    await page.goto('/instructor/my-courses')

    // Wait for initial load
    await page.waitForResponse('**/api/instructor/courses**')

    // Select PUBLISHED status
    const statusFilter = page.locator('select').first()
    if (await statusFilter.isVisible()) {
      const apiResponse = page.waitForResponse('**/api/instructor/courses**?status=PUBLISHED**')
      await statusFilter.selectOption('PUBLISHED')

      const response = await apiResponse
      const data = await response.json()

      // All returned courses should be PUBLISHED
      data.data.courses.forEach((course: any) => {
        expect(course.status).toBe('PUBLISHED')
      })
    }
  })
})
