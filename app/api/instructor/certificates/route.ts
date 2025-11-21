/**
 * Instructor Certificates API Routes
 * GET /api/instructor/certificates - Get all certificates issued to students in instructor's courses
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withInstructor } from '@/lib/auth/api-auth'

/**
 * GET /api/instructor/certificates
 * Get all certificates issued to students in the instructor's courses
 */
export const GET = withInstructor(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Get instructor's courses
    const instructorCourses = await prisma.course.findMany({
      where: { instructorId: String(user.userId) },
      select: { id: true },
    })

    const courseIds = instructorCourses.map((c) => c.id)

    // Build where clause
    const where: any = {
      certificate: {
        courseId: courseId ? courseId : { in: courseIds },
      },
    }

    // Handle status filter (active/expired/revoked)
    if (status && status !== 'all') {
      const now = new Date()
      if (status === 'active') {
        where.AND = [
          { revokedAt: null },
          {
            OR: [{ expiresAt: null }, { expiresAt: { gte: now } }],
          },
        ]
      } else if (status === 'expired') {
        where.expiresAt = { lt: now }
        where.revokedAt = null
      } else if (status === 'revoked') {
        where.revokedAt = { not: null }
      }
    }

    // Search by student name or email
    if (search) {
      where.user = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    // Fetch certificates with related data
    const certificates = await prisma.userCertificate.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatarUrl: true,
          },
        },
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
        enrollment: {
          select: {
            id: true,
            enrolledAt: true,
            completedAt: true,
            progressPercentage: true,
          },
        },
      },
      orderBy: {
        issuedAt: 'desc',
      },
    })

    // Calculate stats
    const totalCertificates = certificates.length

    const activeCertificates = certificates.filter((cert) => {
      if (!cert.expiresAt) return true
      return cert.expiresAt > new Date()
    }).length

    const expiredCertificates = certificates.filter((cert) => {
      if (!cert.expiresAt) return false
      return cert.expiresAt < new Date()
    }).length

    // No revoked field in UserCertificate model
    const revokedCertificates = 0

    // Get unique students count
    const uniqueStudents = new Set(certificates.map((cert) => cert.userId)).size

    // Format certificates data
    const formattedCertificates = certificates.map((cert) => ({
      id: cert.id,
      verificationCode: cert.verificationCode,
      issuedAt: cert.issuedAt,
      expiresAt: cert.expiresAt,
      student: {
        id: cert.user.id,
        name: `${cert.user.firstName} ${cert.user.lastName}`,
        email: cert.user.email,
        avatarUrl: cert.user.avatarUrl,
      },
      course: {
        id: cert.certificate.course.id,
        title: cert.certificate.course.title,
        thumbnail: cert.certificate.course.thumbnail,
      },
      enrollment: cert.enrollment,
    }))

    return NextResponse.json({
      success: true,
      data: {
        certificates: formattedCertificates,
        stats: {
          total: totalCertificates,
          active: activeCertificates,
          expired: expiredCertificates,
          revoked: revokedCertificates,
          uniqueStudents,
        },
      },
    })
  } catch (error) {
    console.error('Error fetching instructor certificates:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch certificates',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
