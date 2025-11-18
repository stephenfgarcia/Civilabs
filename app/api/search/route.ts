/**
 * Search API Route
 * GET /api/search - Full-text search across courses, lessons, instructors, and certificates
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'

    if (!query || query.trim().length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          courses: [],
          lessons: [],
          instructors: [],
          certificates: [],
          total: 0,
        },
      })
    }

    const searchTerm = query.trim().toLowerCase()
    const results: {
      courses: any[]
      lessons: any[]
      instructors: any[]
      certificates: any[]
      total: number
    } = {
      courses: [],
      lessons: [],
      instructors: [],
      certificates: [],
      total: 0,
    }

    // Search courses
    if (type === 'all' || type === 'course') {
      const courses = await prisma.course.findMany({
        where: {
          AND: [
            { status: 'PUBLISHED' },
            {
              OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
                { tags: { hasSome: [searchTerm] } },
              ],
            },
          ],
        },
        include: {
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
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
        take: 20,
        orderBy: [
          { createdAt: 'desc' },
        ],
      })

      results.courses = courses.map((course) => ({
        id: course.id,
        type: 'course',
        title: course.title,
        description: course.description || '',
        category: course.category?.name,
        duration: course.durationMinutes
          ? `${Math.floor(course.durationMinutes / 60)} hours`
          : undefined,
        students: course._count.enrollments,
        url: `/courses/${course.id}`,
        metadata: course.category?.name
          ? `${course.category.name} • ${course._count.lessons} lessons`
          : `${course._count.lessons} lessons`,
        difficultyLevel: course.difficultyLevel,
        thumbnail: course.thumbnail,
      }))
    }

    // Search lessons
    if (type === 'all' || type === 'lesson') {
      const lessons = await prisma.lesson.findMany({
        where: {
          AND: [
            {
              course: {
                status: 'PUBLISHED',
              },
            },
            {
              OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
          ],
        },
        include: {
          course: {
            select: {
              id: true,
              title: true,
              status: true,
            },
          },
        },
        take: 20,
        orderBy: [
          { createdAt: 'desc' },
        ],
      })

      results.lessons = lessons.map((lesson) => ({
        id: lesson.id,
        type: 'lesson',
        title: lesson.title,
        description: lesson.description || '',
        duration: lesson.durationMinutes ? `${lesson.durationMinutes} min` : undefined,
        url: `/courses/${lesson.courseId}/lessons/${lesson.id}`,
        metadata: lesson.course.title,
        contentType: lesson.contentType,
      }))
    }

    // Search instructors
    if (type === 'all' || type === 'instructor') {
      const instructors = await prisma.user.findMany({
        where: {
          AND: [
            {
              role: {
                in: ['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'],
              },
            },
            {
              OR: [
                { firstName: { contains: searchTerm, mode: 'insensitive' } },
                { lastName: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
          ],
        },
        include: {
          _count: {
            select: {
              coursesCreated: true,
            },
          },
        },
        take: 20,
      })

      results.instructors = instructors.map((instructor) => ({
        id: instructor.id,
        type: 'instructor',
        title: `${instructor.firstName} ${instructor.lastName}`,
        description: instructor.email,
        url: `/instructors/${instructor.id}`,
        metadata: `${instructor._count.coursesCreated} ${
          instructor._count.coursesCreated === 1 ? 'course' : 'courses'
        }`,
        avatarUrl: instructor.avatarUrl,
        role: instructor.role,
      }))
    }

    // Search certificates
    if (type === 'all' || type === 'certificate') {
      const userCertificates = await prisma.userCertificate.findMany({
        where: {
          certificate: {
            course: {
              OR: [
                { title: { contains: searchTerm, mode: 'insensitive' } },
                { description: { contains: searchTerm, mode: 'insensitive' } },
              ],
            },
          },
        },
        include: {
          certificate: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  thumbnail: true,
                },
              },
            },
          },
        },
        take: 20,
        orderBy: {
          issuedAt: 'desc',
        },
      })

      results.certificates = userCertificates.map((userCert) => ({
        id: userCert.id,
        type: 'certificate',
        title: `${userCert.certificate.course.title} Certificate`,
        description: `Verification Code: ${userCert.verificationCode}`,
        url: `/certificates/${userCert.id}`,
        metadata: `Issued: ${new Date(userCert.issuedAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })}`,
        verificationCode: userCert.verificationCode,
        issuedAt: userCert.issuedAt,
        expiresAt: userCert.expiresAt,
      }))
    }

    // Calculate total
    results.total =
      results.courses.length +
      results.lessons.length +
      results.instructors.length +
      results.certificates.length

    return NextResponse.json({
      success: true,
      data: results,
    })
  } catch (error) {
    console.error('Error searching:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to search',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
