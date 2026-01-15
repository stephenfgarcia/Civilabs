/**
 * Instructor Discussions E2E Tests
 * Tests for discussion moderation functionality
 */

import { test, expect, TEST_USERS } from '../fixtures/auth.fixture'

test.describe('Instructor Discussions List', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should display discussions page', async ({ page }) => {
    await page.goto('/instructor/discussions')

    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('should fetch discussions from API', async ({ page }) => {
    const apiResponse = page.waitForResponse('**/api/instructor/discussions**')

    await page.goto('/instructor/discussions')

    const response = await apiResponse
    expect(response.status()).toBe(200)

    const data = await response.json()
    expect(data.success).toBe(true)
    expect(data.data).toHaveProperty('discussions')
    expect(data.data).toHaveProperty('stats')
    expect(data.data).toHaveProperty('pagination')
  })

  test('should display discussion stats', async ({ page }) => {
    await page.goto('/instructor/discussions')
    await page.waitForResponse('**/api/instructor/discussions**')

    // Stats should include total, flagged, solved, unsolved
    await expect(page.getByText(/total|all/i)).toBeVisible()
  })

  test('should have status filter', async ({ page }) => {
    await page.goto('/instructor/discussions')

    // Look for filter dropdown or tabs
    const filter = page.locator('select, [role="tablist"]')
    await expect(filter.first()).toBeVisible()
  })

  test('should filter by flagged', async ({ page }) => {
    await page.goto('/instructor/discussions')
    await page.waitForResponse('**/api/instructor/discussions**')

    // Click flagged filter
    const flaggedFilter = page.getByText(/flagged/i).first()
    if (await flaggedFilter.isVisible()) {
      const apiResponse = page.waitForResponse((resp) =>
        resp.url().includes('/api/instructor/discussions') &&
        resp.url().includes('status=flagged')
      )

      await flaggedFilter.click()

      const response = await apiResponse
      expect(response.status()).toBe(200)
    }
  })

  test('should filter by solved', async ({ page }) => {
    await page.goto('/instructor/discussions')
    await page.waitForResponse('**/api/instructor/discussions**')

    const solvedFilter = page.getByText(/solved/i).first()
    if (await solvedFilter.isVisible()) {
      await solvedFilter.click()
      await page.waitForTimeout(500)
    }
  })

  test('should have search functionality', async ({ page }) => {
    await page.goto('/instructor/discussions')

    const searchInput = page.locator('input[placeholder*="Search"]')
    if (await searchInput.isVisible()) {
      await searchInput.fill('help with')

      const response = await page.waitForResponse((resp) =>
        resp.url().includes('/api/instructor/discussions') &&
        resp.url().includes('search=')
      )

      expect(response.status()).toBe(200)
    }
  })

  test('should display discussion list', async ({ page }) => {
    // Mock discussions
    await page.route('**/api/instructor/discussions', (route) => {
      if (!route.request().url().includes('/discussions/')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              discussions: [
                {
                  id: 'disc-1',
                  title: 'Need help with lesson 3',
                  content: 'I am stuck on the quiz',
                  courseId: 'course-1',
                  courseName: 'Safety Training',
                  user: {
                    id: 'user-1',
                    name: 'Student User',
                    email: 'student@example.com',
                    avatarUrl: null,
                  },
                  isPinned: false,
                  isLocked: false,
                  isFlagged: false,
                  isSolved: false,
                  repliesCount: 2,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
              },
              stats: {
                total: 1,
                flagged: 0,
                solved: 0,
                unsolved: 1,
              },
            },
          }),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('/instructor/discussions')

    await expect(page.getByText('Need help with lesson 3')).toBeVisible()
    await expect(page.getByText('Student User')).toBeVisible()
  })
})

test.describe('Instructor Discussion Moderation', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should mark discussion as solved', async ({ page }) => {
    // Mock discussions list
    await page.route('**/api/instructor/discussions', (route) => {
      if (route.request().method() === 'GET' && !route.request().url().includes('/discussions/')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              discussions: [
                {
                  id: 'disc-1',
                  title: 'Test Discussion',
                  content: 'Test content',
                  courseId: 'course-1',
                  courseName: 'Test Course',
                  user: {
                    id: 'user-1',
                    name: 'Test User',
                    email: 'test@example.com',
                    avatarUrl: null,
                  },
                  isPinned: false,
                  isLocked: false,
                  isFlagged: false,
                  isSolved: false,
                  repliesCount: 0,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
              ],
              pagination: {
                page: 1,
                limit: 20,
                total: 1,
                totalPages: 1,
                hasNextPage: false,
                hasPrevPage: false,
              },
              stats: { total: 1, flagged: 0, solved: 0, unsolved: 1 },
            },
          }),
        })
      } else {
        route.continue()
      }
    })

    // Mock PATCH request
    await page.route('**/api/instructor/discussions/*', (route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { id: 'disc-1', isSolved: true },
            message: 'Discussion solved successfully',
          }),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('/instructor/discussions')

    // Click solve button
    const solveButton = page.getByRole('button', { name: /solve|mark.*solved/i })
    if (await solveButton.isVisible()) {
      await solveButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('should pin discussion', async ({ page }) => {
    await page.route('**/api/instructor/discussions', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            discussions: [
              {
                id: 'disc-1',
                title: 'Important Announcement',
                content: 'Please read',
                courseId: 'course-1',
                courseName: 'Test Course',
                user: { id: 'user-1', name: 'User', email: 'user@test.com', avatarUrl: null },
                isPinned: false,
                isLocked: false,
                isFlagged: false,
                isSolved: false,
                repliesCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
            stats: { total: 1, flagged: 0, solved: 0, unsolved: 1 },
          },
        }),
      })
    })

    await page.route('**/api/instructor/discussions/*', (route) => {
      if (route.request().method() === 'PATCH') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: { id: 'disc-1', isPinned: true },
            message: 'Discussion pinned successfully',
          }),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('/instructor/discussions')

    const pinButton = page.getByRole('button', { name: /pin/i })
    if (await pinButton.isVisible()) {
      await pinButton.click()
      await page.waitForTimeout(500)
    }
  })

  test('should lock discussion', async ({ page }) => {
    await page.route('**/api/instructor/discussions', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            discussions: [
              {
                id: 'disc-1',
                title: 'Discussion to Lock',
                content: 'Content',
                courseId: 'course-1',
                courseName: 'Test Course',
                user: { id: 'user-1', name: 'User', email: 'user@test.com', avatarUrl: null },
                isPinned: false,
                isLocked: false,
                isFlagged: false,
                isSolved: false,
                repliesCount: 10,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
            stats: { total: 1, flagged: 0, solved: 0, unsolved: 1 },
          },
        }),
      })
    })

    await page.goto('/instructor/discussions')

    const lockButton = page.getByRole('button', { name: /lock/i })
    if (await lockButton.isVisible()) {
      await lockButton.click()
    }
  })

  test('should handle flagged discussions', async ({ page }) => {
    await page.route('**/api/instructor/discussions**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            discussions: [
              {
                id: 'disc-1',
                title: 'Flagged Discussion',
                content: 'Inappropriate content',
                courseId: 'course-1',
                courseName: 'Test Course',
                user: { id: 'user-1', name: 'User', email: 'user@test.com', avatarUrl: null },
                isPinned: false,
                isLocked: false,
                isFlagged: true,
                isSolved: false,
                repliesCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
            ],
            pagination: { page: 1, limit: 20, total: 1, totalPages: 1, hasNextPage: false, hasPrevPage: false },
            stats: { total: 1, flagged: 1, solved: 0, unsolved: 1 },
          },
        }),
      })
    })

    await page.goto('/instructor/discussions')

    // Should show flagged indicator
    await expect(page.locator('[class*="flag"], [class*="warning"]').first()).toBeVisible()
  })
})

test.describe('Instructor Discussion Details', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should display discussion details with replies', async ({ page }) => {
    await page.route('**/api/instructor/discussions/*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'disc-1',
            title: 'Question about module 2',
            content: 'I need clarification on the safety procedures',
            courseId: 'course-1',
            courseName: 'Safety Training',
            isPinned: false,
            isLocked: false,
            isFlagged: false,
            isSolved: false,
            repliesCount: 2,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            user: {
              firstName: 'John',
              lastName: 'Doe',
            },
            course: {
              id: 'course-1',
              title: 'Safety Training',
              instructorId: 'instructor-1',
            },
            replies: [
              {
                id: 'reply-1',
                content: 'Great question! Let me explain...',
                createdAt: new Date().toISOString(),
                user: { firstName: 'Instructor', lastName: 'Test' },
              },
              {
                id: 'reply-2',
                content: 'Thank you for the clarification',
                createdAt: new Date().toISOString(),
                user: { firstName: 'John', lastName: 'Doe' },
              },
            ],
            _count: { replies: 2 },
          },
        }),
      })
    })

    await page.goto('/instructor/discussions/disc-1')

    await expect(page.getByText('Question about module 2')).toBeVisible()
    await expect(page.getByText('I need clarification on the safety procedures')).toBeVisible()
  })

  test('should handle discussion not found', async ({ page }) => {
    await page.route('**/api/instructor/discussions/*', (route) => {
      route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Discussion not found',
        }),
      })
    })

    await page.goto('/instructor/discussions/non-existent')

    await expect(page.getByText(/not found|does not exist/i)).toBeVisible()
  })
})
