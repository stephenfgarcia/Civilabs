/**
 * Certificates API Routes
 * GET /api/certificates - List user certificates
 * POST /api/certificates - Issue certificate (admin/system only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth, withAdmin } from '@/lib/auth/api-auth'

/**
 * GET /api/certificates
 * Get all certificates for the authenticated user
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const certificates = await prisma.userCertificate.findMany({
        where: {
          userId: user.userId,
        },
        include: {
          certificate: {
            include: {
              course: {
                select: {
                  id: true,
                  title: true,
                  category: {
                    select: {
                      name: true,
                    },
                  },
                  instructor: {
                    select: {
                      firstName: true,
                      lastName: true,
                    },
                  },
                },
              },
            },
          },
          enrollment: {
            select: {
              enrolledAt: true,
              completedAt: true,
            },
          },
        },
        orderBy: {
          issuedAt: 'desc',
        },
      })

      return NextResponse.json({
        success: true,
        data: certificates,
        count: certificates.length,
      })
    } catch (error) {
      console.error('Error fetching certificates:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch certificates',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * POST /api/certificates
 * Issue a certificate (admin only)
 */
export const POST = withAdmin(async (request, user) => {
  try {
    const body = await request.json()
    const { userId, courseId, enrollmentId } = body

    // Validate required fields
    if (!userId || !courseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'userId and courseId are required',
        },
        { status: 400 }
      )
    }

    // Verify user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!userExists) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'User not found',
        },
        { status: 404 }
      )
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    })

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Course not found',
        },
        { status: 404 }
      )
    }

    // Get or create certificate template for course
    let certificateTemplate = await prisma.certificate.findUnique({
      where: { courseId },
    })

    if (!certificateTemplate) {
      // Create a basic certificate template if none exists
      certificateTemplate = await prisma.certificate.create({
        data: {
          courseId,
          templateHtml: '<div>Certificate of Completion</div>',
          isActive: true,
        },
      })
    }

    // Check if certificate already issued to user
    const existingCertificate = await prisma.userCertificate.findFirst({
      where: {
        userId,
        certificateId: certificateTemplate.id,
      },
    })

    if (existingCertificate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message: 'Certificate already issued for this user and course',
        },
        { status: 409 }
      )
    }

    // Get enrollment (required for UserCertificate)
    let enrollment
    if (enrollmentId) {
      enrollment = await prisma.enrollment.findUnique({
        where: { id: enrollmentId },
      })
    } else {
      // Find enrollment by userId and courseId
      enrollment = await prisma.enrollment.findFirst({
        where: {
          userId,
          courseId,
        },
      })
    }

    if (!enrollment) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Enrollment not found for this user and course',
        },
        { status: 404 }
      )
    }

    if (enrollment.userId !== userId || enrollment.courseId !== courseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Enrollment does not match user and course',
        },
        { status: 400 }
      )
    }

    // Generate verification code
    const verificationCode = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Issue user certificate
    const userCertificate = await prisma.userCertificate.create({
      data: {
        certificateId: certificateTemplate.id,
        userId,
        enrollmentId: enrollment.id,
        verificationCode,
        issuedAt: new Date(),
      },
      include: {
        certificate: {
          include: {
            course: {
              select: {
                title: true,
              },
            },
          },
        },
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    // Create notification
    await prisma.notification.create({
      data: {
        userId,
        type: 'achievement',
        title: 'Certificate Issued',
        message: `A certificate has been issued for ${userCertificate.certificate.course.title}`,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: userCertificate,
        message: 'Certificate issued successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error issuing certificate:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to issue certificate',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
