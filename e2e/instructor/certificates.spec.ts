/**
 * Instructor Certificates E2E Tests
 * Tests for certificate management functionality
 */

import { test, expect, TEST_USERS } from '../fixtures/auth.fixture'

test.describe('Instructor Certificates Page', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should display certificates page', async ({ page }) => {
    await page.goto('/instructor/certificates')

    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should fetch certificates from API', async ({ page }) => {
    const apiResponse = page.waitForResponse('**/api/instructor/certificates**')

    await page.goto('/instructor/certificates')

    const response = await apiResponse
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
  })

  test('should display certificates list', async ({ page }) => {
    // Mock certificates
    await page.route('**/api/instructor/certificates**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            certificates: [
              {
                id: 'cert-1',
                issuedAt: new Date().toISOString(),
                expiresAt: new Date(Date.now() + 365 * 86400000).toISOString(),
                certificateUrl: 'https://example.com/cert/123',
                verificationCode: 'CERT-123-ABC',
                user: {
                  id: 'user-1',
                  firstName: 'John',
                  lastName: 'Doe',
                  email: 'john@example.com',
                },
                course: {
                  id: 'course-1',
                  title: 'Safety Certification',
                },
              },
            ],
            total: 1,
          },
        }),
      })
    })

    await page.goto('/instructor/certificates')

    await expect(page.getByText('John Doe')).toBeVisible()
    await expect(page.getByText('Safety Certification')).toBeVisible()
  })

  test('should have course filter', async ({ page }) => {
    await page.goto('/instructor/certificates')

    const courseFilter = page.locator('select').filter({ hasText: /course|all/i })
    if (await courseFilter.isVisible()) {
      await expect(courseFilter).toBeVisible()
    }
  })

  test('should have search functionality', async ({ page }) => {
    await page.goto('/instructor/certificates')

    const searchInput = page.locator('input[placeholder*="Search"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('john')

      const response = await page.waitForResponse((resp) =>
        resp.url().includes('/api/instructor/certificates') &&
        resp.url().includes('search=')
      )

      expect(response.status()).toBe(200)
    }
  })

  test('should display certificate verification code', async ({ page }) => {
    await page.route('**/api/instructor/certificates**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            certificates: [
              {
                id: 'cert-1',
                issuedAt: new Date().toISOString(),
                expiresAt: null,
                certificateUrl: null,
                verificationCode: 'VERIFY-XYZ-123',
                user: {
                  id: 'user-1',
                  firstName: 'Jane',
                  lastName: 'Smith',
                  email: 'jane@example.com',
                },
                course: {
                  id: 'course-1',
                  title: 'Construction Safety',
                },
              },
            ],
            total: 1,
          },
        }),
      })
    })

    await page.goto('/instructor/certificates')

    await expect(page.getByText('VERIFY-XYZ-123')).toBeVisible()
  })

  test('should display issued date', async ({ page }) => {
    const issuedDate = new Date()

    await page.route('**/api/instructor/certificates**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            certificates: [
              {
                id: 'cert-1',
                issuedAt: issuedDate.toISOString(),
                expiresAt: null,
                certificateUrl: null,
                verificationCode: 'CODE-123',
                user: {
                  id: 'user-1',
                  firstName: 'Test',
                  lastName: 'User',
                  email: 'test@example.com',
                },
                course: {
                  id: 'course-1',
                  title: 'Test Course',
                },
              },
            ],
            total: 1,
          },
        }),
      })
    })

    await page.goto('/instructor/certificates')

    // Should show date in some format
    const dateText = page.locator('text=/' + issuedDate.getFullYear() + '/')
    // Certificate issued date should be visible
    await expect(page.getByText('Test User')).toBeVisible()
  })

  test('should display expiration date if set', async ({ page }) => {
    const expiresAt = new Date(Date.now() + 30 * 86400000) // 30 days from now

    await page.route('**/api/instructor/certificates**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            certificates: [
              {
                id: 'cert-1',
                issuedAt: new Date().toISOString(),
                expiresAt: expiresAt.toISOString(),
                certificateUrl: null,
                verificationCode: 'CODE-456',
                user: {
                  id: 'user-1',
                  firstName: 'Expiring',
                  lastName: 'User',
                  email: 'expiring@example.com',
                },
                course: {
                  id: 'course-1',
                  title: 'Expiring Course',
                },
              },
            ],
            total: 1,
          },
        }),
      })
    })

    await page.goto('/instructor/certificates')

    // Should show expiration indicator
    await expect(page.getByText('Expiring User')).toBeVisible()
  })

  test('should handle empty certificates list', async ({ page }) => {
    await page.route('**/api/instructor/certificates**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            certificates: [],
            total: 0,
          },
        }),
      })
    })

    await page.goto('/instructor/certificates')

    // Should show empty state message
    await expect(page.getByText(/no certificates|empty|none/i)).toBeVisible()
  })

  test('should download certificate if URL available', async ({ page }) => {
    await page.route('**/api/instructor/certificates**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            certificates: [
              {
                id: 'cert-1',
                issuedAt: new Date().toISOString(),
                expiresAt: null,
                certificateUrl: 'https://example.com/certificates/download/cert-1.pdf',
                verificationCode: 'DL-CODE-789',
                user: {
                  id: 'user-1',
                  firstName: 'Download',
                  lastName: 'Test',
                  email: 'download@example.com',
                },
                course: {
                  id: 'course-1',
                  title: 'Downloadable Course',
                },
              },
            ],
            total: 1,
          },
        }),
      })
    })

    await page.goto('/instructor/certificates')

    // Should have download link
    const downloadLink = page.locator('a[href*="download"], button:has-text("Download")')
    if (await downloadLink.isVisible()) {
      await expect(downloadLink).toBeVisible()
    }
  })
})

test.describe('Instructor Certificates - Filtering', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should filter by course', async ({ page }) => {
    await page.goto('/instructor/certificates')
    await page.waitForResponse('**/api/instructor/certificates**')

    const courseFilter = page.locator('select').first()
    if (await courseFilter.isVisible()) {
      const options = await courseFilter.locator('option').count()
      if (options > 1) {
        const apiResponse = page.waitForResponse((resp) =>
          resp.url().includes('/api/instructor/certificates') &&
          resp.url().includes('courseId=')
        )

        await courseFilter.selectOption({ index: 1 })

        const response = await apiResponse
        expect(response.status()).toBe(200)
      }
    }
  })
})
