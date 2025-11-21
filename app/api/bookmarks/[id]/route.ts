/**
 * Bookmark Detail API Routes
 * DELETE /api/bookmarks/[id] - Remove a bookmark
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * DELETE /api/bookmarks/[id]
 * Remove a course from user's bookmarks
 */
export const DELETE = withAuth(async (request, user, context?: { params: Promise<{ id: string }> }) => {
  try {
    const params = await context!.params
    const { id } = params

    // Check if bookmark exists
    const bookmark = await prisma.bookmark.findUnique({
      where: { id },
    })

    if (!bookmark) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Bookmark not found',
        },
        { status: 404 }
      )
    }

    // Verify ownership (users can only delete their own bookmarks)
    if (bookmark.userId !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You can only delete your own bookmarks',
        },
        { status: 403 }
      )
    }

    // Delete bookmark
    await prisma.bookmark.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: 'Bookmark removed successfully',
    })
  } catch (error) {
    console.error('Error deleting bookmark:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete bookmark',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
