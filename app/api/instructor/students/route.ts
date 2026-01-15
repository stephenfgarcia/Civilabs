/**
 * Instructor Students API Routes
 * GET /api/instructor/students - Get students enrolled in instructor's courses
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withRole } from '@/lib/auth/api-auth'

/**
 * GET /api/instructor/students
 * Get all students enrolled in the authenticated instructor's courses
 */
export const GET = withRole(['INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN'], async (request, user) => {
  try {
    const instructorId = user.userId
    const { searchParams } = new URL(request.url)

    const courseId = searchParams.get('courseId')
    const search = searchParams.get('search')
    const status = searchParams.get('status') // ENROLLED, IN_PROGRESS, COMPLETED

    // Pagination parameters
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')))

    // Build where clause for enrollments
    const where: any = {
      course: {
        instructorId,
      },
    }

    if (courseId) {
      where.courseId = courseId
    }

    if (status) {
      where.status = status
    }

    // Get enrollments with student and course data
    const enrollments = await prisma.enrollment.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
            department: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        course: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },
        lessonProgress: {
          select: {
            status: true,
            completedAt: true,
          },
        },
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    })

    // Filter by search if provided
    let filteredEnrollments = enrollments
    if (search) {
      const searchLower = search.toLowerCase()
      filteredEnrollments = enrollments.filter(
        enrollment =>
          enrollment.user.firstName.toLowerCase().includes(searchLower) ||
          enrollment.user.lastName.toLowerCase().includes(searchLower) ||
          enrollment.user.email.toLowerCase().includes(searchLower) ||
          enrollment.course.title.toLowerCase().includes(searchLower)
      )
    }

    // Group by student and aggregate their courses
    const studentMap = new Map<string, any>()

    filteredEnrollments.forEach(enrollment => {
      const studentId = enrollment.user.id
      const completedLessons = enrollment.lessonProgress.filter(
        p => p.status === 'COMPLETED'
      ).length

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          id: studentId,
          firstName: enrollment.user.firstName,
          lastName: enrollment.user.lastName,
          email: enrollment.user.email,
          avatarUrl: enrollment.user.avatarUrl,
          department: enrollment.user.department,
          courses: [],
          totalEnrollments: 0,
          completedCourses: 0,
          averageProgress: 0,
        })
      }

      const student = studentMap.get(studentId)
      student.courses.push({
        courseId: enrollment.course.id,
        courseTitle: enrollment.course.title,
        courseSlug: enrollment.course.slug,
        status: enrollment.status,
        progress: enrollment.progressPercentage,
        completedLessons,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
      })
      student.totalEnrollments++
      if (enrollment.status === 'COMPLETED') {
        student.completedCourses++
      }
    })

    // Calculate average progress for each student
    const students = Array.from(studentMap.values()).map(student => {
      const totalProgress = student.courses.reduce(
        (sum: number, course: any) => sum + (course.progress || 0),
        0
      )
      student.averageProgress = student.courses.length > 0
        ? Math.round(totalProgress / student.courses.length)
        : 0
      return student
    })

    // Sort by most recent activity
    students.sort((a, b) => {
      const aLatest = Math.max(
        ...a.courses.map((c: any) => new Date(c.enrolledAt).getTime())
      )
      const bLatest = Math.max(
        ...b.courses.map((c: any) => new Date(c.enrolledAt).getTime())
      )
      return bLatest - aLatest
    })

    // Apply pagination
    const totalStudents = students.length
    const totalPages = Math.ceil(totalStudents / limit)
    const skip = (page - 1) * limit
    const paginatedStudents = students.slice(skip, skip + limit)

    return NextResponse.json({
      success: true,
      data: {
        students: paginatedStudents,
        total: totalStudents,
        pagination: {
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        stats: {
          totalStudents,
          totalEnrollments: filteredEnrollments.length,
          activeStudents: students.filter(s =>
            s.courses.some((c: any) => c.status === 'ENROLLED' || c.status === 'IN_PROGRESS')
          ).length,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching instructor students:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch instructor students',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
