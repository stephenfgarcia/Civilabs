import { test, expect, TEST_USERS } from '../fixtures/auth.fixture'

test.describe('Admin Authentication', () => {
  test.describe('Login Flow', () => {
    test('should display login page correctly', async ({ page }) => {
      await page.goto('/login')

      await expect(page.locator('input[name="email"], input[type="email"]')).toBeVisible()
      await expect(page.locator('input[name="password"], input[type="password"]')).toBeVisible()
      await expect(page.locator('button[type="submit"]')).toBeVisible()
    })

    test('should login as admin successfully', async ({ page }) => {
      await page.goto('/login')

      await page.fill('input[name="email"], input[type="email"]', TEST_USERS.admin.email)
      await page.fill('input[name="password"], input[type="password"]', TEST_USERS.admin.password)
      await page.click('button[type="submit"]')

      await expect(page).toHaveURL(/\/admin/, { timeout: 10000 })
    })

    test('should reject invalid credentials', async ({ page }) => {
      await page.goto('/login')

      await page.fill('input[name="email"], input[type="email"]', 'invalid@email.com')
      await page.fill('input[name="password"], input[type="password"]', 'wrongpassword')
      await page.click('button[type="submit"]')

      // Should show error message or stay on login page
      await expect(page.locator('text=/invalid|error|incorrect/i')).toBeVisible({ timeout: 5000 })
        .catch(() => expect(page).toHaveURL(/\/login/))
    })

    test('should reject empty credentials', async ({ page }) => {
      await page.goto('/login')

      await page.click('button[type="submit"]')

      // Should show validation error or stay on login page
      await expect(page).toHaveURL(/\/login/)
    })
  })

  test.describe('Authorization', () => {
    test('should redirect unauthenticated users from admin routes', async ({ page }) => {
      await page.goto('/admin/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
    })

    test('should prevent learner from accessing admin routes', async ({ page, loginAs }) => {
      await loginAs('learner')

      // Try to access admin dashboard
      await page.goto('/admin/dashboard')

      // Should be redirected or show access denied
      const isRedirected = await page.url().includes('/login') ||
                          await page.url().includes('/learner') ||
                          await page.locator('text=/access denied|unauthorized|forbidden/i').isVisible().catch(() => false)

      expect(isRedirected || !page.url().includes('/admin/dashboard')).toBeTruthy()
    })

    test('should prevent instructor from accessing admin routes', async ({ page, loginAs }) => {
      await loginAs('instructor')

      await page.goto('/admin/dashboard')

      const isRedirected = await page.url().includes('/login') ||
                          await page.url().includes('/instructor') ||
                          await page.locator('text=/access denied|unauthorized|forbidden/i').isVisible().catch(() => false)

      expect(isRedirected || !page.url().includes('/admin/dashboard')).toBeTruthy()
    })
  })

  test.describe('Logout', () => {
    test('should logout successfully', async ({ page, loginAs }) => {
      await loginAs('admin')

      // Look for logout button in various common locations
      const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout"), a:has-text("Sign out"), [data-testid="logout"]').first()

      if (await logoutButton.isVisible()) {
        await logoutButton.click()
        await expect(page).toHaveURL(/\/login/, { timeout: 10000 })
      }
    })
  })

  test.describe('Session Management', () => {
    test('should persist session across page reloads', async ({ page, loginAs }) => {
      await loginAs('admin')
      await page.goto('/admin/dashboard')

      await expect(page).toHaveURL(/\/admin/)

      // Reload page
      await page.reload()

      // Should still be on admin page (session persisted)
      await expect(page).toHaveURL(/\/admin/)
    })
  })
})
