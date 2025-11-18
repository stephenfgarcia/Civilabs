/**
 * Courses API Routes
 * GET /api/courses - List all courses
 * POST /api/courses - Create new course (admin/instructor only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withInstructor } from '@/lib/auth/api-auth'

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

    const courses = await prisma.course.findMany({
      where: {
        ...(category && { category }),
        ...(difficulty && { difficulty }),
        ...(published !== null && { published: published === 'true' }),
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

    const course = await prisma.course.create({
      data: {
        title: body.title,
        description: body.description,
        category: body.category || 'General',
        difficulty: body.difficulty || 'beginner',
        duration: body.duration || 0,
        price: body.price || 0,
        thumbnail: body.thumbnail || null,
        published: body.published !== undefined ? body.published : false,
        instructorId: user.userId,
        objectives: body.objectives || [],
        prerequisites: body.prerequisites || [],
        tags: body.tags || [],
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
