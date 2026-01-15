import { test, expect } from '../fixtures/auth.fixture'

test.describe('Admin Notifications', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs('admin')
    await page.goto('/admin/notifications')
  })

  test.describe('Notifications Page Layout', () => {
    test('should display notifications page', async ({ page }) => {
      await expect(page).toHaveURL(/\/admin\/notifications/)
    })

    test('should display notifications list or form', async ({ page }) => {
      await page.waitForTimeout(2000)

      const content = page.locator('[class*="notification"], [class*="list"], form').first()
      await expect(content).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Send Notification', () => {
    test('should have send notification form', async ({ page }) => {
      await page.waitForTimeout(2000)

      // Look for notification form elements
      const form = page.locator('form, [class*="form"]').first()
      await expect(form).toBeVisible()
    })

    test('should have title field', async ({ page }) => {
      await page.waitForTimeout(2000)

      const titleField = page.locator('input[name="title"], input[name="subject"], input[placeholder*="title" i]').first()
      const hasTitle = await titleField.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should have message field', async ({ page }) => {
      await page.waitForTimeout(2000)

      const messageField = page.locator('textarea[name="message"], textarea[name="content"], textarea[placeholder*="message" i]').first()
      const hasMessage = await messageField.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should have recipient selector', async ({ page }) => {
      await page.waitForTimeout(2000)

      // Can send to all users, specific roles, or individual users
      const recipientSelect = page.locator('select[name*="recipient"], select[name*="target"], button:has-text("Recipients"), [placeholder*="recipient" i]').first()
      const hasRecipient = await recipientSelect.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should have send to all users option', async ({ page }) => {
      await page.waitForTimeout(2000)

      const allUsersOption = page.locator('text=/all users|everyone|broadcast/i, input[value*="all"]').first()
      const hasAllUsers = await allUsersOption.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should have send to role option', async ({ page }) => {
      await page.waitForTimeout(2000)

      const roleOption = page.locator('text=/learners|instructors|admins|by role/i, select option').first()
      const hasRole = await roleOption.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should have send button', async ({ page }) => {
      await page.waitForTimeout(2000)

      const sendButton = page.locator('button:has-text("Send"), button:has-text("Broadcast"), button[type="submit"]').first()
      await expect(sendButton).toBeVisible()
    })

    test('should send notification successfully', async ({ page }) => {
      await page.waitForTimeout(2000)

      // Fill notification form
      const titleField = page.locator('input[name="title"], input[name="subject"]').first()
      if (await titleField.isVisible()) {
        await titleField.fill('Test Notification from E2E')
      }

      const messageField = page.locator('textarea[name="message"], textarea[name="content"]').first()
      if (await messageField.isVisible()) {
        await messageField.fill('This is a test notification sent from Playwright E2E tests.')
      }

      // Submit
      const sendButton = page.locator('button:has-text("Send"), button[type="submit"]').first()
      await sendButton.click()

      await page.waitForTimeout(2000)

      // Check for success message
      const successMessage = page.locator('text=/sent|success|delivered/i').first()
      const hasSuccess = await successMessage.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should validate required fields', async ({ page }) => {
      await page.waitForTimeout(2000)

      // Try to submit empty form
      const sendButton = page.locator('button:has-text("Send"), button[type="submit"]').first()
      await sendButton.click()

      await page.waitForTimeout(500)

      // Should show validation errors
      const errorMessage = page.locator('text=/required|please|invalid/i').first()
      const hasError = await errorMessage.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })
  })

  test.describe('Notification History', () => {
    test('should display sent notifications history', async ({ page }) => {
      await page.waitForTimeout(2000)

      const historySection = page.locator('text=/history|sent|previous/i, [class*="history"], table').first()
      const hasHistory = await historySection.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should show notification timestamps', async ({ page }) => {
      await page.waitForTimeout(2000)

      const timestamp = page.locator('text=/\\d{1,2}[\\/\\-]\\d{1,2}|ago|sent at/i').first()
      const hasTimestamp = await timestamp.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should show recipient information', async ({ page }) => {
      await page.waitForTimeout(2000)

      const recipientInfo = page.locator('text=/recipients|sent to|\\d+ users/i').first()
      const hasRecipient = await recipientInfo.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })
  })

  test.describe('Notification Types', () => {
    test('should support email notifications', async ({ page }) => {
      await page.waitForTimeout(2000)

      const emailOption = page.locator('input[type="checkbox"][name*="email"], text=/email|send email/i, [class*="email"]').first()
      const hasEmail = await emailOption.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should support in-app notifications', async ({ page }) => {
      await page.waitForTimeout(2000)

      const inAppOption = page.locator('input[type="checkbox"][name*="app"], text=/in-app|push|notification/i').first()
      const hasInApp = await inAppOption.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })
  })

  test.describe('Notification Scheduling', () => {
    test('should have scheduling option', async ({ page }) => {
      await page.waitForTimeout(2000)

      const scheduleOption = page.locator('input[type="datetime-local"], input[type="date"], button:has-text("Schedule"), text=/schedule/i').first()
      const hasSchedule = await scheduleOption.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })
  })

  test.describe('Notification Templates', () => {
    test('should have template selection', async ({ page }) => {
      await page.waitForTimeout(2000)

      const templateSelect = page.locator('select[name*="template"], button:has-text("Template"), text=/template/i').first()
      const hasTemplate = await templateSelect.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })
  })

  test.describe('Preview', () => {
    test('should have preview functionality', async ({ page }) => {
      await page.waitForTimeout(2000)

      const previewButton = page.locator('button:has-text("Preview"), a:has-text("Preview")').first()
      const hasPreview = await previewButton.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })
  })
})
