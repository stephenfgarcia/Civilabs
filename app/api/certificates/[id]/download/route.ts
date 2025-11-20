/**
 * Certificate Download API Routes
 * GET /api/certificates/[id]/download - Download certificate as PDF
 */

import { NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'
import { pdfGeneratorService, CertificateData } from '@/lib/services/pdf-generator.service'

/**
 * GET /api/certificates/[id]/download
 * Generate and download certificate PDF
 */
export const GET = withAuth(async (request, user, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    const userCertificate = await prisma.userCertificate.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
        certificate: {
          include: {
            course: {
              select: {
                title: true,
                durationMinutes: true,
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
            completedAt: true,
          },
        },
      },
    })

    if (!userCertificate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not Found',
          message: 'Certificate not found',
        },
        { status: 404 }
      )
    }

    // Only allow user to download their own certificates (unless admin)
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    if (!isAdmin && userCertificate.userId !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You can only download your own certificates',
        },
        { status: 403 }
      )
    }

    // Prepare certificate data
    const certificateData: CertificateData = {
      recipientName: `${userCertificate.user.firstName} ${userCertificate.user.lastName}`,
      courseTitle: userCertificate.certificate.course.title,
      courseCategory: userCertificate.certificate.course.category?.name,
      courseDuration: userCertificate.certificate.course.durationMinutes
        ? Math.round(userCertificate.certificate.course.durationMinutes / 60)
        : undefined,
      completionDate: pdfGeneratorService.formatDate(
        userCertificate.enrollment?.completedAt || userCertificate.issuedAt
      ),
      issuedDate: pdfGeneratorService.formatDate(userCertificate.issuedAt),
      certificateId: userCertificate.id,
      verificationCode: userCertificate.verificationCode,
      instructorName: `${userCertificate.certificate.course.instructor.firstName} ${userCertificate.certificate.course.instructor.lastName}`,
      instructorTitle: 'Course Instructor',
      organizationName: 'Civilabs LMS',
    }

    // Get template type from query params (default to 'modern')
    const url = new URL(request.url)
    const template = (url.searchParams.get('template') as 'classic' | 'modern' | 'elegant') || 'modern'

    // Generate certificate HTML
    const html = pdfGeneratorService.generateCertificateHTML(certificateData, template)

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="certificate-${userCertificate.id}.html"`,
      },
    })
  } catch (error) {
    console.error('Error downloading certificate:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to download certificate',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
