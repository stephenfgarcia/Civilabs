/**
 * Instructor Visual Regression Tests
 * Screenshot comparisons to detect unintended UI changes
 */

import { test, expect, TEST_USERS } from '../fixtures/auth.fixture'

test.describe('Instructor Visual Regression', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('dashboard page visual snapshot', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    // Wait for animations to complete
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('instructor-dashboard.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('courses page visual snapshot', async ({ page }) => {
    await page.goto('/instructor/my-courses')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('instructor-courses.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('assignments page visual snapshot', async ({ page }) => {
    await page.goto('/instructor/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('instructor-assignments.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('students page visual snapshot', async ({ page }) => {
    await page.goto('/instructor/students')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('instructor-students.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('discussions page visual snapshot', async ({ page }) => {
    await page.goto('/instructor/discussions')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('instructor-discussions.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('analytics page visual snapshot', async ({ page }) => {
    await page.goto('/instructor/analytics')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('instructor-analytics.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('certificates page visual snapshot', async ({ page }) => {
    await page.goto('/instructor/certificates')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('instructor-certificates.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('settings page visual snapshot', async ({ page }) => {
    await page.goto('/instructor/settings')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('instructor-settings.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })
})

test.describe('Instructor Component Visual Regression', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('stats cards visual snapshot', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    // Target stats cards area
    const statsSection = page.locator('[class*="stats"], [class*="grid"]').first()
    if (await statsSection.isVisible()) {
      await expect(statsSection).toHaveScreenshot('instructor-stats-cards.png')
    }
  })

  test('sidebar navigation visual snapshot', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    // Target sidebar
    const sidebar = page.locator('nav, aside').first()
    if (await sidebar.isVisible()) {
      await expect(sidebar).toHaveScreenshot('instructor-sidebar.png')
    }
  })

  test('create assignment modal visual snapshot', async ({ page }) => {
    await page.goto('/instructor/assignments')
    await page.waitForLoadState('networkidle')

    // Open modal
    await page.click('button:has-text("Create Assignment")')
    await page.waitForTimeout(300)

    // Screenshot the modal
    const modal = page.locator('[role="dialog"], [class*="modal"]')
    if (await modal.isVisible()) {
      await expect(modal).toHaveScreenshot('create-assignment-modal.png')
    }
  })
})

test.describe('Instructor Responsive Visual Regression', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('dashboard mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 }) // iPhone X
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('instructor-dashboard-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('dashboard tablet view', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 }) // iPad
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('instructor-dashboard-tablet.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })

  test('assignments mobile view', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto('/instructor/assignments')
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(500)

    await expect(page).toHaveScreenshot('instructor-assignments-mobile.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    })
  })
})
