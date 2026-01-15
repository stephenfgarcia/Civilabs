import { test as base, expect, Page } from '@playwright/test'

// Test credentials from seed data
export const TEST_USERS = {
  admin: {
    email: 'admin@civilabs.com',
    password: 'admin123',
    role: 'SUPER_ADMIN',
  },
  instructor: {
    email: 'instructor@civilabs.com',
    password: 'instructor123',
    role: 'INSTRUCTOR',
  },
  learner: {
    email: 'learner@civilabs.com',
    password: 'learner123',
    role: 'LEARNER',
  },
}

export type TestUser = keyof typeof TEST_USERS

// Extended test fixture with authentication helper
export const test = base.extend<{
  loginAs: (role: TestUser) => Promise<void>
  authenticatedPage: Page
}>({
  loginAs: async ({ page }, use) => {
    const login = async (role: TestUser) => {
      const user = TEST_USERS[role]
      await page.goto('/login')
      await page.fill('input[name="email"], input[type="email"]', user.email)
      await page.fill('input[name="password"], input[type="password"]', user.password)
      await page.click('button[type="submit"]')
      // Wait for navigation after login
      await page.waitForURL(/\/(admin|instructor|learner|dashboard)/, { timeout: 10000 })
    }
    await use(login)
  },
  authenticatedPage: async ({ page, loginAs }, use) => {
    await loginAs('admin')
    await use(page)
  },
})

export { expect }
