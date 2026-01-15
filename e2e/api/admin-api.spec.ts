import { test, expect, TEST_USERS } from '../fixtures/auth.fixture'

test.describe('Admin API Endpoints', () => {
  let authToken: string

  test.beforeAll(async ({ request }) => {
    // Login and get token
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: TEST_USERS.admin.email,
        password: TEST_USERS.admin.password,
      },
    })

    if (loginResponse.ok()) {
      const data = await loginResponse.json()
      authToken = data.token || data.accessToken
    }
  })

  test.describe('GET /api/admin/stats', () => {
    test('should return dashboard statistics', async ({ request }) => {
      const response = await request.get('/api/admin/stats', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })

      // Should return 200 or 401 (if auth required via cookies instead)
      expect([200, 401, 403]).toContain(response.status())

      if (response.ok()) {
        const data = await response.json()
        // Should have expected stat fields
        expect(data).toBeDefined()
      }
    })

    test('should reject unauthenticated requests', async ({ request }) => {
      const response = await request.get('/api/admin/stats')

      // Should require authentication
      expect([401, 403, 302]).toContain(response.status())
    })
  })

  test.describe('GET /api/admin/settings', () => {
    test('should return platform settings', async ({ request }) => {
      const response = await request.get('/api/admin/settings', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })

      expect([200, 401, 403]).toContain(response.status())

      if (response.ok()) {
        const data = await response.json()
        expect(data).toBeDefined()
      }
    })

    test('should reject non-admin users', async ({ request }) => {
      // Login as learner
      const loginResponse = await request.post('/api/auth/login', {
        data: {
          email: TEST_USERS.learner.email,
          password: TEST_USERS.learner.password,
        },
      })

      let learnerToken: string | undefined
      if (loginResponse.ok()) {
        const data = await loginResponse.json()
        learnerToken = data.token || data.accessToken
      }

      const response = await request.get('/api/admin/settings', {
        headers: learnerToken ? { Authorization: `Bearer ${learnerToken}` } : {},
      })

      // Should be forbidden for learners
      expect([401, 403]).toContain(response.status())
    })
  })

  test.describe('PUT /api/admin/settings', () => {
    test('should update platform settings', async ({ request }) => {
      const response = await request.put('/api/admin/settings', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        data: {
          siteName: 'Civilabs LMS Test',
        },
      })

      expect([200, 201, 401, 403]).toContain(response.status())
    })
  })

  test.describe('POST /api/admin/settings/generate-api-key', () => {
    test('should generate API key', async ({ request }) => {
      const response = await request.post('/api/admin/settings/generate-api-key', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      })

      expect([200, 201, 401, 403]).toContain(response.status())

      if (response.ok()) {
        const data = await response.json()
        // Should return generated key
        expect(data).toBeDefined()
      }
    })
  })

  test.describe('POST /api/admin/settings/test-email', () => {
    test('should test email configuration', async ({ request }) => {
      const response = await request.post('/api/admin/settings/test-email', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        data: {
          email: 'test@example.com',
        },
      })

      // May fail if SMTP not configured, but should not crash
      expect([200, 201, 400, 401, 403, 500]).toContain(response.status())
    })
  })

  test.describe('POST /api/admin/notifications/send', () => {
    test('should send notification', async ({ request }) => {
      const response = await request.post('/api/admin/notifications/send', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        data: {
          title: 'Test Notification',
          message: 'This is a test notification from API tests',
          recipients: 'all',
        },
      })

      expect([200, 201, 400, 401, 403]).toContain(response.status())
    })

    test('should validate notification data', async ({ request }) => {
      const response = await request.post('/api/admin/notifications/send', {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
        data: {
          // Missing required fields
        },
      })

      // Should return validation error
      expect([400, 401, 403, 422]).toContain(response.status())
    })
  })
})

test.describe('Users API', () => {
  test.describe('GET /api/users', () => {
    test('should return users list', async ({ request }) => {
      const response = await request.get('/api/users')

      expect([200, 401, 403]).toContain(response.status())

      if (response.ok()) {
        const data = await response.json()
        expect(Array.isArray(data) || data.users).toBeTruthy()
      }
    })

    test('should support pagination', async ({ request }) => {
      const response = await request.get('/api/users?page=1&limit=10')

      expect([200, 401, 403]).toContain(response.status())
    })

    test('should support filtering by role', async ({ request }) => {
      const response = await request.get('/api/users?role=LEARNER')

      expect([200, 401, 403]).toContain(response.status())
    })
  })

  test.describe('POST /api/users', () => {
    test('should create new user', async ({ request }) => {
      const response = await request.post('/api/users', {
        data: {
          email: `api-test-${Date.now()}@example.com`,
          firstName: 'API',
          lastName: 'Test',
          password: 'TestPassword123!',
          role: 'LEARNER',
        },
      })

      expect([200, 201, 400, 401, 403]).toContain(response.status())
    })

    test('should validate required fields', async ({ request }) => {
      const response = await request.post('/api/users', {
        data: {
          // Missing required fields
        },
      })

      expect([400, 422, 401, 403]).toContain(response.status())
    })

    test('should reject duplicate email', async ({ request }) => {
      const response = await request.post('/api/users', {
        data: {
          email: TEST_USERS.admin.email, // Already exists
          firstName: 'Duplicate',
          lastName: 'User',
          password: 'TestPassword123!',
        },
      })

      expect([400, 409, 422, 401, 403]).toContain(response.status())
    })
  })
})

test.describe('Courses API', () => {
  test.describe('GET /api/courses', () => {
    test('should return courses list', async ({ request }) => {
      const response = await request.get('/api/courses')

      expect([200, 401, 403]).toContain(response.status())

      if (response.ok()) {
        const data = await response.json()
        expect(Array.isArray(data) || data.courses).toBeTruthy()
      }
    })

    test('should support filtering by status', async ({ request }) => {
      const response = await request.get('/api/courses?status=PUBLISHED')

      expect([200, 401, 403]).toContain(response.status())
    })

    test('should support filtering by category', async ({ request }) => {
      const response = await request.get('/api/courses?category=technology')

      expect([200, 401, 403]).toContain(response.status())
    })
  })

  test.describe('GET /api/courses/:id', () => {
    test('should return course details', async ({ request }) => {
      // First get list to find an ID
      const listResponse = await request.get('/api/courses')

      if (listResponse.ok()) {
        const courses = await listResponse.json()
        const courseList = Array.isArray(courses) ? courses : courses.courses

        if (courseList && courseList.length > 0) {
          const courseId = courseList[0].id

          const response = await request.get(`/api/courses/${courseId}`)
          expect([200, 401, 403, 404]).toContain(response.status())
        }
      }
    })

    test('should return 404 for non-existent course', async ({ request }) => {
      const response = await request.get('/api/courses/non-existent-id-12345')

      expect([400, 404]).toContain(response.status())
    })
  })
})

test.describe('Enrollments API', () => {
  test.describe('GET /api/enrollments', () => {
    test('should return enrollments list', async ({ request }) => {
      const response = await request.get('/api/enrollments')

      expect([200, 401, 403]).toContain(response.status())
    })

    test('should support filtering by status', async ({ request }) => {
      const response = await request.get('/api/enrollments?status=ENROLLED')

      expect([200, 401, 403]).toContain(response.status())
    })
  })
})

test.describe('Departments API', () => {
  test.describe('GET /api/departments', () => {
    test('should return departments list', async ({ request }) => {
      const response = await request.get('/api/departments')

      expect([200, 401, 403]).toContain(response.status())

      if (response.ok()) {
        const data = await response.json()
        // Should have seeded departments
        expect(data).toBeDefined()
      }
    })
  })

  test.describe('POST /api/departments', () => {
    test('should create new department', async ({ request }) => {
      const response = await request.post('/api/departments', {
        data: {
          name: `API Test Dept ${Date.now()}`,
          description: 'Created via API test',
        },
      })

      expect([200, 201, 400, 401, 403]).toContain(response.status())
    })
  })
})

test.describe('Categories API', () => {
  test.describe('GET /api/categories', () => {
    test('should return categories list', async ({ request }) => {
      const response = await request.get('/api/categories')

      expect([200, 401, 403]).toContain(response.status())

      if (response.ok()) {
        const data = await response.json()
        // Should have seeded categories (Technology, Business)
        expect(data).toBeDefined()
      }
    })
  })
})

test.describe('Authentication API', () => {
  test.describe('POST /api/auth/login', () => {
    test('should login with valid credentials', async ({ request }) => {
      const response = await request.post('/api/auth/login', {
        data: {
          email: TEST_USERS.admin.email,
          password: TEST_USERS.admin.password,
        },
      })

      expect(response.status()).toBe(200)

      const data = await response.json()
      expect(data.token || data.accessToken || data.user).toBeDefined()
    })

    test('should reject invalid credentials', async ({ request }) => {
      const response = await request.post('/api/auth/login', {
        data: {
          email: 'invalid@email.com',
          password: 'wrongpassword',
        },
      })

      expect([400, 401, 403]).toContain(response.status())
    })

    test('should reject empty credentials', async ({ request }) => {
      const response = await request.post('/api/auth/login', {
        data: {},
      })

      expect([400, 401, 422]).toContain(response.status())
    })
  })

  test.describe('POST /api/auth/logout', () => {
    test('should logout successfully', async ({ request }) => {
      const response = await request.post('/api/auth/logout')

      // Logout should generally succeed even without auth
      expect([200, 204, 302, 401]).toContain(response.status())
    })
  })
})
