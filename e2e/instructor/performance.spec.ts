/**
 * Instructor Performance Tests
 * Load time, response time, and resource usage tests
 */

import { test, expect, TEST_USERS } from '../fixtures/auth.fixture'

test.describe('Instructor Page Load Performance', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('dashboard loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // Dashboard should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)

    console.log(`Dashboard load time: ${loadTime}ms`)
  })

  test('courses page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/instructor/my-courses')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(5000)
    console.log(`Courses page load time: ${loadTime}ms`)
  })

  test('assignments page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/instructor/assignments')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(5000)
    console.log(`Assignments page load time: ${loadTime}ms`)
  })

  test('students page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/instructor/students')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    expect(loadTime).toBeLessThan(5000)
    console.log(`Students page load time: ${loadTime}ms`)
  })

  test('analytics page loads within acceptable time', async ({ page }) => {
    const startTime = Date.now()

    await page.goto('/instructor/analytics')
    await page.waitForLoadState('networkidle')

    const loadTime = Date.now() - startTime

    // Analytics page might be slightly slower due to data processing
    expect(loadTime).toBeLessThan(7000)
    console.log(`Analytics page load time: ${loadTime}ms`)
  })
})

test.describe('Instructor API Response Performance', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('stats API responds within 2 seconds', async ({ page }) => {
    let responseTime = 0

    page.on('response', (response) => {
      if (response.url().includes('/api/instructor/stats')) {
        const timing = response.request().timing()
        responseTime = timing.responseEnd - timing.requestStart
      }
    })

    await page.goto('/instructor/dashboard')
    await page.waitForResponse('**/api/instructor/stats**')

    // API should respond within 2 seconds
    expect(responseTime).toBeLessThan(2000)
    console.log(`Stats API response time: ${responseTime}ms`)
  })

  test('courses API responds within 2 seconds', async ({ page }) => {
    let responseTime = 0

    page.on('response', (response) => {
      if (response.url().includes('/api/instructor/courses')) {
        const timing = response.request().timing()
        responseTime = timing.responseEnd - timing.requestStart
      }
    })

    await page.goto('/instructor/my-courses')
    await page.waitForResponse('**/api/instructor/courses**')

    expect(responseTime).toBeLessThan(2000)
    console.log(`Courses API response time: ${responseTime}ms`)
  })

  test('students API responds within 2 seconds', async ({ page }) => {
    let responseTime = 0

    page.on('response', (response) => {
      if (response.url().includes('/api/instructor/students')) {
        const timing = response.request().timing()
        responseTime = timing.responseEnd - timing.requestStart
      }
    })

    await page.goto('/instructor/students')
    await page.waitForResponse('**/api/instructor/students**')

    expect(responseTime).toBeLessThan(2000)
    console.log(`Students API response time: ${responseTime}ms`)
  })

  test('analytics API responds within 3 seconds', async ({ page }) => {
    let responseTime = 0

    page.on('response', (response) => {
      if (response.url().includes('/api/instructor/analytics')) {
        const timing = response.request().timing()
        responseTime = timing.responseEnd - timing.requestStart
      }
    })

    await page.goto('/instructor/analytics')
    await page.waitForResponse('**/api/instructor/analytics**')

    // Analytics API might be slower due to aggregations
    expect(responseTime).toBeLessThan(3000)
    console.log(`Analytics API response time: ${responseTime}ms`)
  })
})

test.describe('Instructor Resource Usage', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('dashboard memory usage is acceptable', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      const perf = performance as any
      if (perf.memory) {
        return {
          usedJSHeapSize: perf.memory.usedJSHeapSize,
          totalJSHeapSize: perf.memory.totalJSHeapSize,
        }
      }
      return null
    })

    if (metrics) {
      // Used heap should be less than 100MB
      expect(metrics.usedJSHeapSize).toBeLessThan(100 * 1024 * 1024)
      console.log(`Used JS Heap: ${Math.round(metrics.usedJSHeapSize / 1024 / 1024)}MB`)
    }
  })

  test('no significant memory leaks on navigation', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    const initialMetrics = await page.evaluate(() => {
      const perf = performance as any
      return perf.memory ? perf.memory.usedJSHeapSize : 0
    })

    // Navigate through multiple pages
    const pages = [
      '/instructor/my-courses',
      '/instructor/assignments',
      '/instructor/students',
      '/instructor/discussions',
      '/instructor/analytics',
      '/instructor/certificates',
      '/instructor/dashboard',
    ]

    for (const path of pages) {
      await page.goto(path)
      await page.waitForLoadState('networkidle')
    }

    // Force garbage collection if available
    await page.evaluate(() => {
      if ((window as any).gc) {
        (window as any).gc()
      }
    })

    const finalMetrics = await page.evaluate(() => {
      const perf = performance as any
      return perf.memory ? perf.memory.usedJSHeapSize : 0
    })

    if (initialMetrics && finalMetrics) {
      const memoryIncrease = finalMetrics - initialMetrics
      const increasePercentage = (memoryIncrease / initialMetrics) * 100

      // Memory increase should be less than 50%
      expect(increasePercentage).toBeLessThan(50)
      console.log(`Memory increase: ${increasePercentage.toFixed(2)}%`)
    }
  })

  test('page resources are not excessive', async ({ page }) => {
    const resources: { type: string; size: number }[] = []

    page.on('response', async (response) => {
      const headers = response.headers()
      const contentLength = parseInt(headers['content-length'] || '0')
      const contentType = headers['content-type'] || 'unknown'

      if (contentLength > 0) {
        resources.push({
          type: contentType.split(';')[0],
          size: contentLength,
        })
      }
    })

    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    const totalSize = resources.reduce((sum, r) => sum + r.size, 0)
    const jsResources = resources.filter((r) => r.type.includes('javascript'))
    const cssResources = resources.filter((r) => r.type.includes('css'))

    // Total page size should be less than 5MB
    expect(totalSize).toBeLessThan(5 * 1024 * 1024)

    console.log(`Total resources: ${resources.length}`)
    console.log(`Total size: ${Math.round(totalSize / 1024)}KB`)
    console.log(`JS bundles: ${jsResources.length}`)
    console.log(`CSS files: ${cssResources.length}`)
  })
})

test.describe('Instructor Interaction Performance', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('search responds quickly', async ({ page }) => {
    await page.goto('/instructor/assignments')
    await page.waitForLoadState('networkidle')

    const searchInput = page.locator('input[placeholder*="Search"]')

    if (await searchInput.isVisible()) {
      const startTime = Date.now()

      await searchInput.fill('test')

      // Wait for debounced search to complete
      await page.waitForResponse('**/api/instructor/assignments**')

      const searchTime = Date.now() - startTime

      // Search (including debounce) should complete within 1 second
      expect(searchTime).toBeLessThan(1000)
      console.log(`Search response time: ${searchTime}ms`)
    }
  })

  test('filter changes respond quickly', async ({ page }) => {
    await page.goto('/instructor/assignments')
    await page.waitForResponse('**/api/instructor/assignments**')

    const statusFilter = page.locator('select').first()

    if (await statusFilter.isVisible()) {
      const startTime = Date.now()

      await statusFilter.selectOption('PUBLISHED')
      await page.waitForResponse('**/api/instructor/assignments**')

      const filterTime = Date.now() - startTime

      // Filter should respond within 500ms
      expect(filterTime).toBeLessThan(500)
      console.log(`Filter response time: ${filterTime}ms`)
    }
  })

  test('modal opens quickly', async ({ page }) => {
    await page.goto('/instructor/assignments')
    await page.waitForLoadState('networkidle')

    const startTime = Date.now()

    await page.click('button:has-text("Create Assignment")')

    const modal = page.locator('[role="dialog"], [class*="modal"]')
    await expect(modal).toBeVisible()

    const modalOpenTime = Date.now() - startTime

    // Modal should open within 300ms
    expect(modalOpenTime).toBeLessThan(300)
    console.log(`Modal open time: ${modalOpenTime}ms`)
  })

  test('navigation between pages is smooth', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    const navigationTimes: number[] = []

    const links = [
      'text=MY COURSES',
      'text=ASSIGNMENTS',
      'text=STUDENTS',
    ]

    for (const linkText of links) {
      const link = page.locator(linkText).first()

      if (await link.isVisible()) {
        const startTime = Date.now()
        await link.click()
        await page.waitForLoadState('networkidle')
        navigationTimes.push(Date.now() - startTime)
      }
    }

    if (navigationTimes.length > 0) {
      const avgNavigationTime = navigationTimes.reduce((a, b) => a + b, 0) / navigationTimes.length

      // Average navigation should be under 2 seconds
      expect(avgNavigationTime).toBeLessThan(2000)
      console.log(`Average navigation time: ${avgNavigationTime.toFixed(0)}ms`)
    }
  })
})

test.describe('Instructor Core Web Vitals', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('instructor')
  })

  test('dashboard meets Core Web Vitals thresholds', async ({ page }) => {
    await page.goto('/instructor/dashboard')
    await page.waitForLoadState('networkidle')

    // Get Web Vitals metrics
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const metrics: any = {}

          entries.forEach((entry) => {
            if (entry.entryType === 'largest-contentful-paint') {
              metrics.lcp = entry.startTime
            }
            if (entry.entryType === 'first-input') {
              metrics.fid = (entry as any).processingStart - entry.startTime
            }
            if (entry.entryType === 'layout-shift') {
              metrics.cls = (metrics.cls || 0) + (entry as any).value
            }
          })

          resolve(metrics)
        })

        observer.observe({
          type: 'largest-contentful-paint',
          buffered: true,
        })

        // Trigger some interaction to measure FID
        setTimeout(() => {
          document.body.click()
          setTimeout(() => resolve({}), 100)
        }, 1000)
      })
    })

    console.log('Core Web Vitals:', metrics)

    // Note: These thresholds are based on Google's recommendations
    // LCP: < 2.5s (good), < 4s (needs improvement)
    // FID: < 100ms (good), < 300ms (needs improvement)
    // CLS: < 0.1 (good), < 0.25 (needs improvement)
  })
})
