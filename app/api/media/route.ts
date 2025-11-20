/**
 * Media Library API Routes
 * GET /api/media - List media files
 * DELETE /api/media - Cleanup old files
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth, withAdmin } from '@/lib/auth/api-auth'
import { fileStorageManager } from '@/lib/utils/file-storage'

/**
 * GET /api/media
 * Get storage statistics and media library info
 */
export const GET = withAuth(async () => {
  try {
    const stats = await fileStorageManager.getStorageStats()
    const summary = await fileStorageManager.getDiskUsageSummary()

    return NextResponse.json({
      success: true,
      data: {
        stats,
        summary,
      },
    })
  } catch (error) {
    console.error('Error fetching media stats:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch media statistics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * DELETE /api/media
 * Cleanup old or unused files (admin only)
 */
export const DELETE = withAdmin(async (request) => {
  try {
    const body = await request.json()
    const { olderThanDays, fileTypes, minSizeBytes, dryRun } = body

    const result = await fileStorageManager.cleanup({
      olderThanDays,
      fileTypes,
      minSizeBytes,
      dryRun: dryRun ?? true, // Default to dry run for safety
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: dryRun
        ? `Dry run complete: ${result.filesDeleted} files would be deleted`
        : `Cleanup complete: ${result.filesDeleted} files deleted`,
    })
  } catch (error) {
    console.error('Error during cleanup:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to cleanup media files',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
