/**
 * Individual Media File API Routes
 * DELETE /api/media/[fileId] - Delete a specific file
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAdmin } from '@/lib/auth/api-auth'
import { promises as fs } from 'fs'
import { join } from 'path'
import { existsSync } from 'fs'

/**
 * DELETE /api/media/[fileId]
 * Delete a specific media file (admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ fileId: string }> }
) {
  const params = await context.params
  const { fileId } = params

  try {
    // Decode the file ID (base64 encoded path)
    const filePath = Buffer.from(fileId, 'base64').toString('utf-8')

    // Security: Ensure the file path is within the uploads directory
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    if (!filePath.startsWith(uploadsDir)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid file path',
        },
        { status: 400 }
      )
    }

    // Check if file exists
    if (!existsSync(filePath)) {
      return NextResponse.json(
        {
          success: false,
          error: 'File not found',
        },
        { status: 404 }
      )
    }

    // Get file stats before deletion
    const stats = await fs.stat(filePath)
    const fileName = filePath.split('/').pop() || 'unknown'

    // Delete the file
    await fs.unlink(filePath)

    return NextResponse.json({
      success: true,
      message: `File "${fileName}" deleted successfully`,
      data: {
        fileName,
        size: stats.size,
      },
    })
  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete file',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
