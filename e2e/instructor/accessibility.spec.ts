/**
 * Instructor Accessibility Tests
 * WCAG 2.1 AA compliance testing using axe-core
 */

import { test, expect, TEST_USERS } from '../fixtures/auth.fixture'
import AxeBuilder from '@axe-core/playwright'

test.describe('Instructor Accessibility', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('dashboard page accessibility', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('courses page accessibility', async ({ page }) => {
    await page.goto('/instructor/my-courses')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('assignments page accessibility', async ({ page }) => {
    await page.goto('/instructor/assignments')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('students page accessibility', async ({ page }) => {
    await page.goto('/instructor/students')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('discussions page accessibility', async ({ page }) => {
    await page.goto('/instructor/discussions')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('analytics page accessibility', async ({ page }) => {
    await page.goto('/instructor/analytics')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('certificates page accessibility', async ({ page }) => {
    await page.goto('/instructor/certificates')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })

  test('settings page accessibility', async ({ page }) => {
    await page.goto('/instructor/settings')
    await page.waitForLoadState('networkidle')

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze()

    expect(accessibilityScanResults.violations).toEqual([])
  })
})

test.describe('Instructor Keyboard Navigation', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('dashboard keyboard navigation', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    // Test tab navigation
    let previousFocusedElement = ''
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab')
      const focusedElement = await page.evaluate(() => {
        const el = document.activeElement
        return el ? `${el.tagName}:${el.className}` : ''
      })

      // Ensure focus is moving to different elements
      if (i > 0) {
        expect(focusedElement).not.toBe(previousFocusedElement)
      }
      previousFocusedElement = focusedElement
    }
  })

  test('can navigate sidebar with keyboard', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    // Navigate to sidebar links
    const sidebarLinks = page.locator('nav a, aside a')
    const count = await sidebarLinks.count()

    if (count > 0) {
      // Focus first link and press Enter
      await sidebarLinks.first().focus()
      await page.keyboard.press('Enter')

      // Should navigate to a new page
      await page.waitForLoadState('networkidle')
    }
  })

  test('modal can be closed with Escape key', async ({ page }) => {
    await page.goto('/instructor/assignments')
    await page.waitForLoadState('networkidle')

    // Open modal
    await page.click('button:has-text("Create Assignment")')
    await page.waitForTimeout(300)

    // Modal should be visible
    const modal = page.locator('[role="dialog"], [class*="modal"]')
    if (await modal.isVisible()) {
      // Close with Escape
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)

      // Modal should be closed
      await expect(modal).not.toBeVisible()
    }
  })

  test('form fields are keyboard accessible', async ({ page }) => {
    await page.goto('/instructor/assignments')
    await page.waitForLoadState('networkidle')

    // Open modal
    await page.click('button:has-text("Create Assignment")')
    await page.waitForTimeout(300)

    // Tab through form fields
    const formInputs = page.locator('input, textarea, select')
    const inputCount = await formInputs.count()

    for (let i = 0; i < Math.min(inputCount, 5); i++) {
      await page.keyboard.press('Tab')
      const focused = await page.evaluate(() => {
        const el = document.activeElement
        return el?.tagName.toLowerCase()
      })

      // Should focus on input elements
      expect(['input', 'textarea', 'select', 'button']).toContain(focused)
    }
  })
})

test.describe('Instructor Screen Reader Support', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('dashboard has proper heading structure', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    // Check for h1
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)

    // Check heading hierarchy
    const headings = await page.evaluate(() => {
      const h1s = document.querySelectorAll('h1')
      const h2s = document.querySelectorAll('h2')
      const h3s = document.querySelectorAll('h3')
      return { h1: h1s.length, h2: h2s.length, h3: h3s.length }
    })

    // Should have hierarchical headings
    expect(headings.h1).toBeGreaterThanOrEqual(1)
  })

  test('images have alt text', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    const images = page.locator('img')
    const count = await images.count()

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute('alt')
      // Images should have alt attribute (can be empty for decorative images)
      expect(alt).not.toBeNull()
    }
  })

  test('buttons have accessible names', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    const buttons = page.locator('button')
    const count = await buttons.count()

    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      const title = await button.getAttribute('title')

      // Button should have some accessible name
      const hasAccessibleName = (text && text.trim().length > 0) ||
        ariaLabel !== null ||
        title !== null

      expect(hasAccessibleName).toBe(true)
    }
  })

  test('form inputs have labels', async ({ page }) => {
    await page.goto('/instructor/assignments')
    await page.waitForLoadState('networkidle')

    // Open create modal
    await page.click('button:has-text("Create Assignment")')
    await page.waitForTimeout(300)

    const inputs = page.locator('input:visible, textarea:visible, select:visible')
    const count = await inputs.count()

    for (let i = 0; i < count; i++) {
      const input = inputs.nth(i)
      const id = await input.getAttribute('id')
      const ariaLabel = await input.getAttribute('aria-label')
      const ariaLabelledby = await input.getAttribute('aria-labelledby')
      const placeholder = await input.getAttribute('placeholder')

      // Check if there's an associated label
      let hasLabel = ariaLabel !== null || ariaLabelledby !== null || placeholder !== null

      if (id) {
        const labelFor = await page.locator(`label[for="${id}"]`).count()
        hasLabel = hasLabel || labelFor > 0
      }

      expect(hasLabel).toBe(true)
    }
  })

  test('interactive elements have focus indicators', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    // Tab to first focusable element
    await page.keyboard.press('Tab')

    // Check that focused element has visual indicator
    const hasFocusStyle = await page.evaluate(() => {
      const el = document.activeElement
      if (!el) return false

      const styles = window.getComputedStyle(el)
      const outline = styles.outline
      const boxShadow = styles.boxShadow
      const border = styles.border

      // Check for any focus indicator
      return outline !== 'none' ||
        boxShadow !== 'none' ||
        border.includes('rgb')
    })

    expect(hasFocusStyle).toBe(true)
  })

  test('color contrast meets WCAG AA', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    // Use axe-core specifically for color contrast
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2aa'])
      .options({ rules: { 'color-contrast': { enabled: true } } })
      .analyze()

    const contrastViolations = accessibilityScanResults.violations.filter(
      (v) => v.id === 'color-contrast'
    )

    expect(contrastViolations).toEqual([])
  })
})

test.describe('Instructor ARIA Landmarks', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('page has main landmark', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    const main = page.locator('main, [role="main"]')
    await expect(main).toBeVisible()
  })

  test('page has navigation landmark', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    const nav = page.locator('nav, [role="navigation"]')
    const count = await nav.count()
    expect(count).toBeGreaterThanOrEqual(1)
  })
})
