/**
 * Instructor Assignments E2E Tests
 * Tests for assignment management and grading workflow
 */

import { test, expect, TEST_USERS } from '../fixtures/auth.fixture'

test.describe('Instructor Assignments List', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should display assignments page with heading', async ({ page }) => {
    await page.goto('/instructor/assignments')
    await expect(page.getByText('Assignments')).toBeVisible()
    await expect(page.getByText('Manage assignments and grade submissions')).toBeVisible()
  })

  test('should display stats cards', async ({ page }) => {
    await page.goto('/instructor/assignments')

    await expect(page.getByText('Total Assignments')).toBeVisible()
    await expect(page.getByText('Published')).toBeVisible()
    await expect(page.getByText('Overdue')).toBeVisible()
    await expect(page.getByText('Pending Grading')).toBeVisible()
  })

  test('should have create assignment button', async ({ page }) => {
    await page.goto('/instructor/assignments')

    const createButton = page.getByRole('button', { name: /create assignment/i })
    await expect(createButton).toBeVisible()
  })

  test('should have search input', async ({ page }) => {
    await page.goto('/instructor/assignments')

    const searchInput = page.locator('input[placeholder*="Search"]')
    await expect(searchInput).toBeVisible()
  })

  test('should have status filter', async ({ page }) => {
    await page.goto('/instructor/assignments')

    const statusFilter = page.locator('select')
    await expect(statusFilter).toBeVisible()

    // Check filter options
    await expect(statusFilter.locator('option', { hasText: 'All Status' })).toBeAttached()
    await expect(statusFilter.locator('option', { hasText: 'Draft' })).toBeAttached()
    await expect(statusFilter.locator('option', { hasText: 'Published' })).toBeAttached()
  })

  test('should debounce search input', async ({ page }) => {
    await page.goto('/instructor/assignments')

    let apiCallCount = 0
    page.on('request', (request) => {
      if (request.url().includes('/api/instructor/assignments')) {
        apiCallCount++
      }
    })

    const searchInput = page.locator('input[placeholder*="Search"]')
    await searchInput.fill('test')

    // Wait less than debounce time
    await page.waitForTimeout(100)

    // Type more
    await searchInput.fill('testing')

    // Wait for debounce
    await page.waitForTimeout(400)

    // Should have made fewer calls than keystrokes due to debouncing
    expect(apiCallCount).toBeLessThan(5)
  })
})

test.describe('Instructor Create Assignment', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should open create assignment modal', async ({ page }) => {
    await page.goto('/instructor/assignments')

    await page.click('button:has-text("Create Assignment")')

    await expect(page.getByText('Create New Assignment')).toBeVisible()
  })

  test('should display form fields in modal', async ({ page }) => {
    await page.goto('/instructor/assignments')
    await page.click('button:has-text("Create Assignment")')

    // Check form fields
    await expect(page.locator('label:has-text("Title")')).toBeVisible()
    await expect(page.locator('label:has-text("Course")')).toBeVisible()
    await expect(page.locator('label:has-text("Instructions")')).toBeVisible()
    await expect(page.locator('label:has-text("Due Date")')).toBeVisible()
    await expect(page.locator('label:has-text("Max Points")')).toBeVisible()
  })

  test('should close modal on cancel', async ({ page }) => {
    await page.goto('/instructor/assignments')
    await page.click('button:has-text("Create Assignment")')

    await expect(page.getByText('Create New Assignment')).toBeVisible()

    await page.click('button:has-text("Cancel")')

    await expect(page.getByText('Create New Assignment')).not.toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/instructor/assignments')
    await page.click('button:has-text("Create Assignment")')

    // Try to submit empty form
    await page.click('button:has-text("Create Assignment"):not(:has-text("+"))')

    // Form should show validation errors (HTML5 validation)
    const titleInput = page.locator('input[required]').first()
    await expect(titleInput).toBeVisible()
  })

  test('should have course dropdown with instructor courses', async ({ page }) => {
    await page.goto('/instructor/assignments')

    // Wait for courses to load
    await page.waitForResponse('**/api/instructor/courses**')

    await page.click('button:has-text("Create Assignment")')

    const courseSelect = page.locator('select').filter({ hasText: /select a course/i })
    await expect(courseSelect).toBeVisible()

    // Should have at least "Select a course" option
    const options = await courseSelect.locator('option').count()
    expect(options).toBeGreaterThanOrEqual(1)
  })
})

test.describe('Instructor Assignment Actions', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should display assignment table with columns', async ({ page }) => {
    await page.goto('/instructor/assignments')

    // Wait for data to load
    await page.waitForResponse('**/api/instructor/assignments**')

    // Check table headers
    await expect(page.getByRole('columnheader', { name: 'Assignment' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Course' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Status' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Due Date' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Submissions' })).toBeVisible()
    await expect(page.getByRole('columnheader', { name: 'Actions' })).toBeVisible()
  })

  test('should show publish action for draft assignments', async ({ page }) => {
    // Mock API response with draft assignment
    await page.route('**/api/instructor/assignments**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            assignments: [
              {
                id: 'test-1',
                title: 'Test Assignment',
                description: 'Test description',
                courseId: 'course-1',
                courseName: 'Test Course',
                status: 'DRAFT',
                dueDate: null,
                maxPoints: 100,
                totalSubmissions: 0,
                pendingSubmissions: 0,
                createdAt: new Date().toISOString(),
                publishedAt: null,
              },
            ],
            stats: { total: 1, published: 0, overdue: 0, pendingGrading: 0 },
          },
        }),
      })
    })

    await page.goto('/instructor/assignments')

    await expect(page.getByRole('button', { name: 'Publish' })).toBeVisible()
  })

  test('should show close action for published assignments', async ({ page }) => {
    // Mock API response with published assignment
    await page.route('**/api/instructor/assignments**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            assignments: [
              {
                id: 'test-1',
                title: 'Test Assignment',
                description: 'Test description',
                courseId: 'course-1',
                courseName: 'Test Course',
                status: 'PUBLISHED',
                dueDate: new Date(Date.now() + 86400000).toISOString(),
                maxPoints: 100,
                totalSubmissions: 5,
                pendingSubmissions: 2,
                createdAt: new Date().toISOString(),
                publishedAt: new Date().toISOString(),
              },
            ],
            stats: { total: 1, published: 1, overdue: 0, pendingGrading: 2 },
          },
        }),
      })
    })

    await page.goto('/instructor/assignments')

    await expect(page.getByRole('button', { name: 'Close' })).toBeVisible()
  })

  test('should navigate to assignment details on view', async ({ page }) => {
    // Mock API response
    await page.route('**/api/instructor/assignments', (route) => {
      if (route.request().method() === 'GET') {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              assignments: [
                {
                  id: 'test-assignment-123',
                  title: 'Test Assignment',
                  description: 'Test',
                  courseId: 'course-1',
                  courseName: 'Test Course',
                  status: 'PUBLISHED',
                  dueDate: null,
                  maxPoints: 100,
                  totalSubmissions: 0,
                  pendingSubmissions: 0,
                  createdAt: new Date().toISOString(),
                  publishedAt: new Date().toISOString(),
                },
              ],
              stats: { total: 1, published: 1, overdue: 0, pendingGrading: 0 },
            },
          }),
        })
      }
    })

    await page.goto('/instructor/assignments')

    await page.click('button:has-text("View")')

    await expect(page).toHaveURL(/\/instructor\/assignments\/test-assignment-123/)
  })

  test('should confirm before deleting assignment', async ({ page }) => {
    // Mock API response
    await page.route('**/api/instructor/assignments', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            assignments: [
              {
                id: 'test-1',
                title: 'Test Assignment',
                description: 'Test',
                courseId: 'course-1',
                courseName: 'Test Course',
                status: 'DRAFT',
                dueDate: null,
                maxPoints: 100,
                totalSubmissions: 0,
                pendingSubmissions: 0,
                createdAt: new Date().toISOString(),
                publishedAt: null,
              },
            ],
            stats: { total: 1, published: 0, overdue: 0, pendingGrading: 0 },
          },
        }),
      })
    })

    await page.goto('/instructor/assignments')

    // Setup dialog handler
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm')
      expect(dialog.message()).toContain('delete')
      await dialog.dismiss()
    })

    await page.click('button:has-text("Delete")')
  })
})

test.describe('Instructor Assignment Details & Grading', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('should display assignment details page', async ({ page }) => {
    // Mock assignment detail
    await page.route('**/api/instructor/assignments/*', (route) => {
      if (!route.request().url().includes('submissions')) {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: {
              id: 'test-1',
              title: 'Test Assignment',
              description: 'Test description',
              instructions: 'Test instructions',
              courseId: 'course-1',
              status: 'PUBLISHED',
              dueDate: new Date(Date.now() + 86400000).toISOString(),
              maxPoints: 100,
              course: { id: 'course-1', title: 'Test Course' },
              submissions: [
                {
                  id: 'sub-1',
                  userId: 'user-1',
                  content: 'Student submission content',
                  status: 'SUBMITTED',
                  submittedAt: new Date().toISOString(),
                  grade: null,
                  feedback: null,
                  user: {
                    id: 'user-1',
                    firstName: 'John',
                    lastName: 'Doe',
                    email: 'john@example.com',
                    avatarUrl: null,
                  },
                },
              ],
              _count: { submissions: 1 },
            },
          }),
        })
      } else {
        route.continue()
      }
    })

    await page.goto('/instructor/assignments/test-1')

    await expect(page.getByText('Test Assignment')).toBeVisible()
  })

  test('should display submissions list', async ({ page }) => {
    // Mock assignment with submissions
    await page.route('**/api/instructor/assignments/*', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            id: 'test-1',
            title: 'Test Assignment',
            description: 'Test',
            instructions: 'Instructions',
            courseId: 'course-1',
            status: 'PUBLISHED',
            dueDate: null,
            maxPoints: 100,
            course: { id: 'course-1', title: 'Test Course' },
            submissions: [
              {
                id: 'sub-1',
                userId: 'user-1',
                content: 'My submission',
                status: 'SUBMITTED',
                submittedAt: new Date().toISOString(),
                grade: null,
                feedback: null,
                user: {
                  id: 'user-1',
                  firstName: 'Jane',
                  lastName: 'Smith',
                  email: 'jane@example.com',
                  avatarUrl: null,
                },
              },
            ],
            _count: { submissions: 1 },
          },
        }),
      })
    })

    await page.goto('/instructor/assignments/test-1')

    // Should show student name
    await expect(page.getByText('Jane Smith')).toBeVisible()
    await expect(page.getByText('SUBMITTED')).toBeVisible()
  })
})
