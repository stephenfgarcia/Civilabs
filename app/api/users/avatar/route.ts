import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { existsSync } from 'fs'

export const POST = withAuth(async (request, user) => {
  try {
    const formData = await request.formData()
    const file = formData.get('avatar') as File

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filename = `avatar-${user.userId}-${Date.now()}${path.extname(file.name)}`
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'avatars')

    // Ensure directory exists
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    const filepath = path.join(uploadsDir, filename)

    // Save file
    await writeFile(filepath, buffer)

    // Update user avatar URL in database
    const avatarUrl = `/uploads/avatars/${filename}`
    await prisma.user.update({
      where: { id: user.userId },
      data: { avatarUrl }
    })

    return NextResponse.json({
      success: true,
      data: { avatarUrl },
      message: 'Avatar uploaded successfully'
    })
  } catch (error) {
    console.error('Avatar upload error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload avatar' },
      { status: 500 }
    )
  }
})
