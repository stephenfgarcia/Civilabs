/**
 * File Upload API Route
 * POST /api/upload - Upload files (authenticated users only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { withAuth } from '@/lib/auth/api-auth'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 100 * 1024 * 1024 // 100MB
const ALLOWED_TYPES = {
  video: ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
  ],
  image: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
  scorm: ['application/zip', 'application/x-zip-compressed'],
}

/**
 * POST /api/upload
 * Upload file to server
 */
export const POST = withAuth(async (request, user) => {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const fileType = formData.get('type') as string | null // video, document, image, scorm

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'No file provided',
        },
        { status: 400 }
      )
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
        },
        { status: 400 }
      )
    }

    // Validate file type if specified
    if (fileType) {
      const allowedMimeTypes = ALLOWED_TYPES[fileType as keyof typeof ALLOWED_TYPES]
      if (!allowedMimeTypes || !allowedMimeTypes.includes(file.type)) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bad Request',
            message: `Invalid file type. Expected ${fileType}, got ${file.type}`,
          },
          { status: 400 }
        )
      }
    }

    // Create upload directory structure by type and date
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const typeDir = fileType || 'files'
    const uploadPath = join(UPLOAD_DIR, typeDir, `${year}`, month)

    if (!existsSync(uploadPath)) {
      await mkdir(uploadPath, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop() || ''
    const safeFileName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .substring(0, 100) // Limit filename length
    const uniqueFileName = `${timestamp}-${randomString}-${safeFileName}`

    // Save file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filePath = join(uploadPath, uniqueFileName)
    await writeFile(filePath, buffer)

    // Generate public URL
    const publicUrl = `/uploads/${typeDir}/${year}/${month}/${uniqueFileName}`

    return NextResponse.json(
      {
        success: true,
        data: {
          url: publicUrl,
          filename: uniqueFileName,
          originalName: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: now.toISOString(),
        },
        message: 'File uploaded successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to upload file',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

// Note: bodyParser: false is no longer needed in Next.js App Router
// FormData is handled automatically
