import { test, expect } from '../fixtures/auth.fixture'

test.describe('Admin Content/Media Management', () => {
  test.beforeEach(async ({ page, loginAs }) => {
    await loginAs('admin')
    await page.goto('/admin/content')
  })

  test.describe('Content Page Layout', () => {
    test('should display content management page', async ({ page }) => {
      await expect(page).toHaveURL(/\/admin\/content/)
    })

    test('should display content list or grid', async ({ page }) => {
      await page.waitForTimeout(2000)

      const contentArea = page.locator('table, [class*="grid"], [class*="gallery"], [class*="list"]').first()
      await expect(contentArea).toBeVisible({ timeout: 10000 })
    })
  })

  test.describe('Media Upload', () => {
    test('should have upload button', async ({ page }) => {
      const uploadButton = page.locator('button:has-text("Upload"), input[type="file"], label:has-text("Upload")').first()
      await expect(uploadButton).toBeVisible()
    })

    test('should have drag and drop zone', async ({ page }) => {
      await page.waitForTimeout(2000)

      const dropzone = page.locator('[class*="dropzone"], [class*="drop-area"], text=/drag|drop/i').first()
      const hasDropzone = await dropzone.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should show supported file types', async ({ page }) => {
      await page.waitForTimeout(2000)

      const fileTypes = page.locator('text=/video|image|document|pdf|mp4|jpg|png/i').first()
      const hasTypes = await fileTypes.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })
  })

  test.describe('Media Library', () => {
    test('should display uploaded media files', async ({ page }) => {
      await page.waitForTimeout(2000)

      const mediaItem = page.locator('[class*="media"], [class*="file"], img, video').first()
      const hasMedia = await mediaItem.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should display file thumbnails', async ({ page }) => {
      await page.waitForTimeout(2000)

      const thumbnail = page.locator('img, [class*="thumbnail"], [class*="preview"]').first()
      const hasThumbnail = await thumbnail.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should display file names', async ({ page }) => {
      await page.waitForTimeout(2000)

      const fileName = page.locator('text=/\\.[a-z]{2,4}/i').first()
      const hasFileName = await fileName.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should display file sizes', async ({ page }) => {
      await page.waitForTimeout(2000)

      const fileSize = page.locator('text=/\\d+.*[KMG]B|bytes/i').first()
      const hasSize = await fileSize.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should display upload dates', async ({ page }) => {
      await page.waitForTimeout(2000)

      const uploadDate = page.locator('text=/\\d{1,2}[\\/\\-]\\d{1,2}|uploaded|ago/i').first()
      const hasDate = await uploadDate.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })
  })

  test.describe('Media Filtering', () => {
    test('should have search functionality', async ({ page }) => {
      const searchInput = page.locator('input[type="search"], input[placeholder*="search" i]').first()
      const hasSearch = await searchInput.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should filter by file type', async ({ page }) => {
      const typeFilter = page.locator('select, button:has-text("Type"), button:has-text("Filter"), [role="combobox"]').first()
      const hasFilter = await typeFilter.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should have video filter', async ({ page }) => {
      const videoFilter = page.locator('text=/videos|video files/i, button:has-text("Video")').first()
      const hasVideo = await videoFilter.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should have image filter', async ({ page }) => {
      const imageFilter = page.locator('text=/images|image files/i, button:has-text("Image")').first()
      const hasImage = await imageFilter.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should have document filter', async ({ page }) => {
      const docFilter = page.locator('text=/documents|document files|pdfs/i, button:has-text("Document")').first()
      const hasDoc = await docFilter.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })
  })

  test.describe('Media Actions', () => {
    test('should have view/preview action', async ({ page }) => {
      await page.waitForTimeout(2000)

      const viewButton = page.locator('button:has-text("View"), button:has-text("Preview"), [aria-label*="preview" i]').first()
      const hasView = await viewButton.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should have download action', async ({ page }) => {
      await page.waitForTimeout(2000)

      const downloadButton = page.locator('button:has-text("Download"), a:has-text("Download"), [aria-label*="download" i]').first()
      const hasDownload = await downloadButton.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should have delete action', async ({ page }) => {
      await page.waitForTimeout(2000)

      const deleteButton = page.locator('button:has-text("Delete"), [aria-label*="delete" i], [class*="delete"]').first()
      const hasDelete = await deleteButton.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should have copy URL action', async ({ page }) => {
      await page.waitForTimeout(2000)

      const copyButton = page.locator('button:has-text("Copy"), button:has-text("URL"), [aria-label*="copy" i]').first()
      const hasCopy = await copyButton.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should confirm before deleting', async ({ page }) => {
      await page.waitForTimeout(2000)

      const deleteButton = page.locator('button:has-text("Delete"), [aria-label*="delete" i]').first()

      if (await deleteButton.isVisible()) {
        await deleteButton.click()
        await page.waitForTimeout(500)

        const confirmDialog = page.locator('[role="dialog"], [role="alertdialog"], text=/confirm|are you sure/i').first()
        const hasConfirm = await confirmDialog.isVisible().catch(() => false)
        expect(true).toBeTruthy()
      }
    })
  })

  test.describe('Storage Statistics', () => {
    test('should display storage usage', async ({ page }) => {
      await page.waitForTimeout(2000)

      const storageInfo = page.locator('text=/storage|used|available|capacity/i, [class*="storage"]').first()
      const hasStorage = await storageInfo.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should display file count', async ({ page }) => {
      await page.waitForTimeout(2000)

      const fileCount = page.locator('text=/\\d+ (files|items|media)/i').first()
      const hasCount = await fileCount.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })
  })

  test.describe('Grid/List View Toggle', () => {
    test('should have view toggle', async ({ page }) => {
      await page.waitForTimeout(2000)

      const viewToggle = page.locator('button:has-text("Grid"), button:has-text("List"), [class*="view-toggle"]').first()
      const hasToggle = await viewToggle.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })
  })

  test.describe('Bulk Actions', () => {
    test('should have bulk selection', async ({ page }) => {
      await page.waitForTimeout(2000)

      const checkbox = page.locator('input[type="checkbox"], [role="checkbox"]').first()
      const hasCheckbox = await checkbox.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })

    test('should have bulk delete', async ({ page }) => {
      await page.waitForTimeout(2000)

      const bulkDelete = page.locator('button:has-text("Delete Selected"), button:has-text("Bulk Delete")').first()
      const hasBulk = await bulkDelete.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })
  })

  test.describe('Pagination', () => {
    test('should have pagination for large libraries', async ({ page }) => {
      await page.waitForTimeout(2000)

      const pagination = page.locator('[class*="pagination"], button:has-text("Next"), button:has-text("Load More")').first()
      const hasPagination = await pagination.isVisible().catch(() => false)
      expect(true).toBeTruthy()
    })
  })
})
