import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'

/**
 * Public endpoint to verify a certificate by its verification code
 *
 * This allows anyone with a verification code to confirm the authenticity
 * of a certificate without requiring authentication.
 *
 * GET /api/certificates/verify/[code]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params

    if (!code) {
      return NextResponse.json(
        { success: false, error: 'Verification code is required' },
        { status: 400 }
      )
    }

    // Find certificate by verification code
    const certificate = await prisma.userCertificate.findUnique({
      where: {
        verificationCode: code,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        certificate: {
          include: {
            course: {
              select: {
                id: true,
                title: true,
                slug: true,
                description: true,
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
            completedAt: true,
            progressPercentage: true,
          },
        },
      },
    })

    if (!certificate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Certificate not found',
          message: 'Invalid verification code. Please check the code and try again.'
        },
        { status: 404 }
      )
    }

    // Check if certificate has expired
    const isExpired = certificate.expiresAt && new Date(certificate.expiresAt) < new Date()

    return NextResponse.json({
      success: true,
      data: {
        verified: true,
        isExpired,
        certificate: {
          id: certificate.id,
          issuedAt: certificate.issuedAt,
          expiresAt: certificate.expiresAt,
          verificationCode: certificate.verificationCode,
        },
        recipient: {
          name: `${certificate.user.firstName} ${certificate.user.lastName}`,
          // Only include email domain for privacy
          emailDomain: certificate.user.email.split('@')[1],
        },
        course: {
          title: certificate.certificate.course.title,
          description: certificate.certificate.course.description,
          instructor: `${certificate.certificate.course.instructor.firstName} ${certificate.certificate.course.instructor.lastName}`,
        },
        completion: {
          completedAt: certificate.enrollment?.completedAt,
          progress: certificate.enrollment?.progressPercentage || 100,
        },
      },
    })
  } catch (error) {
    console.error('[Verify Certificate] Error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to verify certificate',
      },
      { status: 500 }
    )
  }
}
