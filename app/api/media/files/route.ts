/**
 * Media Files List API Route
 * GET /api/media/files - List all uploaded files
 */

import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth/api-auth'
import { promises as fs } from 'fs'
import { join } from 'path'
import { existsSync } from 'fs'

interface FileInfo {
  id: string
  name: string
  type: 'video' | 'document' | 'image' | 'other'
  size: string
  sizeBytes: number
  uploadDate: string
  path: string
}

/**
 * Get file type based on extension
 */
function getFileType(filename: string): FileInfo['type'] {
  const ext = filename.split('.').pop()?.toLowerCase() || ''

  const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'wmv']
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
  const documentExtensions = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx']

  if (videoExtensions.includes(ext)) return 'video'
  if (imageExtensions.includes(ext)) return 'image'
  if (documentExtensions.includes(ext)) return 'document'
  return 'other'
}

/**
 * Format bytes to human-readable size
 */
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Recursively get all files from a directory
 */
async function getAllFiles(directory: string, baseDir: string): Promise<FileInfo[]> {
  const files: FileInfo[] = []

  if (!existsSync(directory)) {
    return files
  }

  try {
    const entries = await fs.readdir(directory, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(directory, entry.name)

      if (entry.isDirectory()) {
        files.push(...(await getAllFiles(fullPath, baseDir)))
      } else {
        const stats = await fs.stat(fullPath)
        const relativePath = fullPath.replace(baseDir, '').replace(/^[/\\]/, '')

        files.push({
          id: Buffer.from(fullPath).toString('base64'),
          name: entry.name,
          type: getFileType(entry.name),
          size: formatFileSize(stats.size),
          sizeBytes: stats.size,
          uploadDate: stats.mtime.toISOString(),
          path: `/uploads/${relativePath.replace(/\\/g, '/')}`,
        })
      }
    }
  } catch (error) {
    console.error(`Error reading directory ${directory}:`, error)
  }

  return files
}

/**
 * GET /api/media/files
 * Get list of all uploaded files
 */
export const GET = withAuth(async (request: NextRequest) => {
  try {
    const uploadsDir = join(process.cwd(), 'public', 'uploads')
    const files = await getAllFiles(uploadsDir, uploadsDir)

    // Sort by upload date (newest first)
    files.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime())

    // Calculate stats
    const totalSize = files.reduce((acc, f) => acc + f.sizeBytes, 0)
    const stats = {
      totalFiles: files.length,
      totalSize: formatFileSize(totalSize),
      byType: {
        video: files.filter(f => f.type === 'video').length,
        image: files.filter(f => f.type === 'image').length,
        document: files.filter(f => f.type === 'document').length,
        other: files.filter(f => f.type === 'other').length,
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        files,
        stats,
      },
    })
  } catch (error) {
    console.error('Error listing media files:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to list media files',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
