/**
 * Courses API Routes
 * GET /api/courses - List all courses
 * POST /api/courses - Create new course (admin/instructor only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withInstructor, authenticateRequest } from '@/lib/auth/api-auth'

/**
 * GET /api/courses
 * List courses with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const published = searchParams.get('published')

    // Check if user is admin/instructor to determine default visibility
    const user = authenticateRequest(request)
    const isAdminOrInstructor = user && (
      user.role === 'ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      user.role === 'INSTRUCTOR'
    )

    const courses = await prisma.course.findMany({
      where: {
        ...(category && { categoryId: category }),
        ...(difficulty && { difficultyLevel: difficulty as any }),
        ...(published !== null && published === 'true' && {
          publishedAt: { not: null }
        }),
        ...(published !== null && published === 'false' && {
          publishedAt: null
        }),
        // Non-admins can only see published courses by default
        ...(!isAdminOrInstructor && published === null && {
          publishedAt: { not: null }
        }),
        ...(search && {
          OR: [
            { title: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json({
      success: true,
      data: courses,
      count: courses.length,
    })
  } catch (error) {
    console.error('Error fetching courses:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch courses',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/courses
 * Create new course (instructor/admin only)
 */
export const POST = withInstructor(async (request, user) => {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.title || !body.description) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Title and description are required',
        },
        { status: 400 }
      )
    }

    // Generate slug from title
    const slug = body.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')

    const course = await prisma.course.create({
      data: {
        title: body.title,
        slug,
        description: body.description,
        categoryId: body.categoryId || null,
        difficultyLevel: body.difficulty || body.difficultyLevel || 'BEGINNER',
        durationMinutes: body.duration || body.durationMinutes || 0,
        thumbnail: body.thumbnail || null,
        publishedAt: body.published ? (body.publishedAt ? new Date(body.publishedAt) : new Date()) : null,
        instructorId: String(user.userId),
        tags: body.tags || [],
        metadata: {
          objectives: body.objectives || [],
          prerequisites: body.prerequisites || [],
          price: body.price || 0,
        },
      },
      include: {
        instructor: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: course,
        message: 'Course created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating course:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create course',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
