/**
 * Instructor Dashboard E2E Tests
 * Tests for the instructor dashboard page functionality
 */

import { test, expect, TEST_USERS } from '../fixtures/auth.fixture'

test.describe('Instructor Dashboard', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should display the instructor dashboard with correct heading', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await expect(page.getByText('INSTRUCTOR DASHBOARD')).toBeVisible()
    await expect(page.getByText("Here's what's happening with your courses")).toBeVisible()
  })

  test('should display stats cards with correct labels', async ({ page }) => {
    await page.goto('/instructor/dashboard')

    // Check all stat cards are visible
    await expect(page.getByText('Active Courses')).toBeVisible()
    await expect(page.getByText('Total Students')).toBeVisible()
    await expect(page.getByText('Avg. Rating')).toBeVisible()
    await expect(page.getByText('Completion Rate')).toBeVisible()
  })

  test('should display pending tasks section', async ({ page }) => {
    await page.goto('/instructor/dashboard')

    await expect(page.getByText('PENDING TASKS')).toBeVisible()
  })

  test('should display top courses section', async ({ page }) => {
    await page.goto('/instructor/dashboard')

    await expect(page.getByText('TOP COURSES')).toBeVisible()
  })

  test('should display recent activity section', async ({ page }) => {
    await page.goto('/instructor/dashboard')

    await expect(page.getByText('RECENT ACTIVITY')).toBeVisible()
  })

  test('should have working navigation to request course', async ({ page }) => {
    await page.goto('/instructor/dashboard')

    await page.click('text=REQUEST COURSE')
    await expect(page).toHaveURL(/\/instructor\/my-courses\/request/)
  })

  test('should have working navigation to view all courses', async ({ page }) => {
    await page.goto('/instructor/dashboard')

    await page.click('text=VIEW ALL COURSES')
    await expect(page).toHaveURL(/\/instructor\/my-courses/)
  })

  test('should have working navigation to view all students', async ({ page }) => {
    await page.goto('/instructor/dashboard')

    await page.click('text=VIEW ALL STUDENTS')
    await expect(page).toHaveURL(/\/instructor\/students/)
  })

  test('should show loading state initially', async ({ page }) => {
    // Intercept API call to delay response
    await page.route('**/api/instructor/stats', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      await route.continue()
    })

    await page.goto('/instructor/dashboard')
    await expect(page.getByText('Loading dashboard...')).toBeVisible()
  })

  test('should handle API errors gracefully', async ({ page }) => {
    // Intercept API call to return error
    await page.route('**/api/instructor/stats', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ success: false, error: 'Server error' }),
      })
    })

    await page.goto('/instructor/dashboard')
    await expect(page.getByText('Failed to Load')).toBeVisible()
    await expect(page.getByText('TRY AGAIN')).toBeVisible()
  })

  test('should retry loading on error', async ({ page }) => {
    let callCount = 0

    // First call fails, second succeeds
    await page.route('**/api/instructor/stats', (route) => {
      callCount++
      if (callCount === 1) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ success: false, error: 'Server error' }),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('/instructor/dashboard')
    await expect(page.getByText('Failed to Load')).toBeVisible()

    await page.click('text=TRY AGAIN')
    await expect(page.getByText('INSTRUCTOR DASHBOARD')).toBeVisible()
  })

  test('should display course ratings correctly for each top course', async ({ page }) => {
    await page.goto('/instructor/dashboard')

    // Wait for top courses to load
    await page.waitForSelector('text=TOP COURSES')

    // Each course card should have its own rating
    const courseCards = page.locator('.rounded-lg').filter({ hasText: 'lessons' })
    const count = await courseCards.count()

    if (count > 0) {
      // Check that ratings are displayed (could be 0 for courses without reviews)
      for (let i = 0; i < count; i++) {
        const card = courseCards.nth(i)
        // Rating should be a number
        await expect(card.locator('text=/\\d+\\.?\\d*/')).toBeVisible()
      }
    }
  })
})

test.describe('Instructor Dashboard - Accessibility', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/instructor/dashboard')

    // Main heading
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()

    // Section headings
    const h2s = page.locator('h2')
    expect(await h2s.count()).toBeGreaterThan(0)
  })

  test('should be keyboard navigable', async ({ page }) => {
    await page.goto('/instructor/dashboard')

    // Tab through interactive elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Some element should be focused
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})
