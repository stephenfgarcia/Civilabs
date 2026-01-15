# Testing Guide - Civilabs LMS

This document provides comprehensive instructions for running and maintaining the test suite.

## Overview

The Civilabs LMS testing infrastructure includes:

- **Unit Tests**: Vitest-based tests for service layer functions
- **E2E Tests**: Playwright-based tests for full user flow testing
- **API Tests**: Integration tests for backend API endpoints

## Test Coverage

### Admin Module E2E Tests

| Module | File | Test Cases |
|--------|------|------------|
| Authentication | `e2e/admin/auth.spec.ts` | Login, logout, authorization, session management |
| Dashboard | `e2e/admin/dashboard.spec.ts` | Stats display, navigation, responsive design |
| User Management | `e2e/admin/users.spec.ts` | CRUD operations, filtering, search, pagination |
| Course Management | `e2e/admin/courses.spec.ts` | CRUD operations, publish/unpublish, filtering |
| Enrollments | `e2e/admin/enrollments.spec.ts` | List, details, filtering, status management |
| Certificates | `e2e/admin/certificates.spec.ts` | Issue, view, revoke, filtering |
| Departments | `e2e/admin/departments.spec.ts` | CRUD operations, hierarchy |
| Discussions | `e2e/admin/discussions.spec.ts` | Moderation actions, filtering |
| Notifications | `e2e/admin/notifications.spec.ts` | Send, history, scheduling |
| Content/Media | `e2e/admin/content.spec.ts` | Upload, library management, filtering |
| Settings | `e2e/admin/settings.spec.ts` | General, email, security, integrations |
| Reports | `e2e/admin/reports.spec.ts` | Analytics, charts, export |

### API Integration Tests

| Endpoint | File |
|----------|------|
| Admin Stats | `e2e/api/admin-api.spec.ts` |
| Admin Settings | `e2e/api/admin-api.spec.ts` |
| Users CRUD | `e2e/api/admin-api.spec.ts` |
| Courses CRUD | `e2e/api/admin-api.spec.ts` |
| Enrollments | `e2e/api/admin-api.spec.ts` |
| Authentication | `e2e/api/admin-api.spec.ts` |

### Unit Tests

| Service | File |
|---------|------|
| Admin Users Service | `tests/services/admin-users.service.test.ts` |
| Admin Enrollments Service | `tests/services/admin-enrollments.service.test.ts` |

## Quick Start

### Prerequisites

1. Node.js 20+
2. PostgreSQL database
3. Environment variables configured (see `.env.example`)

### Installation

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install chromium
```

### Running Tests

```bash
# Run all tests (unit + e2e)
npm test

# Run unit tests only
npm run test:unit

# Run unit tests in watch mode
npm run test:unit:watch

# Run unit tests with coverage
npm run test:unit:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed

# Debug E2E tests
npm run test:e2e:debug

# View Playwright HTML report
npm run test:report
```

## Test Credentials

Tests use seeded data from `prisma/seed.ts`:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@civilabs.com | admin123 |
| Instructor | instructor@civilabs.com | instructor123 |
| Learner | learner@civilabs.com | learner123 |

## Running Specific Tests

```bash
# Run tests for a specific file
npx playwright test e2e/admin/users.spec.ts

# Run tests matching a pattern
npx playwright test --grep "should create user"

# Run a specific test by line number
npx playwright test e2e/admin/users.spec.ts:42
```

## Test Configuration

### Playwright Configuration (`playwright.config.ts`)

- **Browser**: Chromium (headless by default)
- **Base URL**: `http://localhost:3000`
- **Retries**: 2 in CI, 0 locally
- **Reports**: HTML, JSON, and console

### Vitest Configuration (`vitest.config.ts`)

- **Environment**: jsdom
- **Coverage**: V8 provider
- **Globals**: Enabled

## CI/CD Integration

Tests run automatically on GitHub Actions for:
- Push to `main` or `develop` branches
- Pull requests targeting `main` or `develop`

### GitHub Actions Workflow

Located at `.github/workflows/test.yml`:

1. **Unit Tests**: Runs Vitest tests
2. **E2E Tests**: Runs Playwright tests with PostgreSQL service
3. **Lint**: Runs ESLint
4. **Type Check**: Runs TypeScript compiler

### Required Secrets

Add these to your GitHub repository secrets:

- `DATABASE_URL`: PostgreSQL connection string
- `JWT_SECRET`: JWT signing secret (optional, defaults provided for CI)

## Writing New Tests

### E2E Test Template

```typescript
import { test, expect } from '../fixtures/auth.fixture'

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs('admin')
    await page.goto('/admin/feature')
  })

  test('should do something', async ({ page }) => {
    await expect(page.locator('selector')).toBeVisible()
  })
})
```

### Unit Test Template

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { myService } from '@/lib/services/my.service'

vi.mock('@/lib/services/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe('MyService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should do something', async () => {
    // Test implementation
  })
})
```

## Best Practices

1. **Isolation**: Each test should be independent
2. **Deterministic**: Tests should produce consistent results
3. **Fast**: Keep tests focused and efficient
4. **Readable**: Use descriptive test names
5. **Maintainable**: Follow the page object pattern for complex flows

## Troubleshooting

### Common Issues

**E2E tests timing out**
- Increase timeout in playwright.config.ts
- Ensure dev server is running (`npm run dev`)

**Authentication failures**
- Verify seed data exists (`npm run db:seed`)
- Check database connection

**Flaky tests**
- Add explicit waits for dynamic content
- Use `waitForLoadState('networkidle')`

### Debugging

```bash
# Run with debug mode
npm run test:e2e:debug

# Generate trace for failed tests
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

## Reports

### HTML Report
After running E2E tests, view the report:
```bash
npm run test:report
```

### Coverage Report
After running unit tests with coverage:
```bash
npm run test:unit:coverage
# Open coverage/index.html in browser
```

## Test Statistics

| Category | Count |
|----------|-------|
| E2E Test Files | 12 |
| Unit Test Files | 2 |
| Total E2E Test Cases | ~150+ |
| Total Unit Test Cases | ~40+ |

## Maintenance

- Run tests before merging PRs
- Update tests when features change
- Add new tests for new features
- Review failing tests promptly
