/**
 * Certificate Download API Routes
 * GET /api/certificates/[id]/download - Download certificate as PDF
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/certificates/[id]/download
 * Generate and download certificate PDF
 */
export const GET = withAuth(async (request, user, context: RouteParams) => {
  try {
    const params = await context.params
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
                category: {
                  select: {
                    name: true,
                  },
                },
                duration: true,
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
    if (user.role !== 'admin' && userCertificate.userId !== user.userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Forbidden',
          message: 'You can only download your own certificates',
        },
        { status: 403 }
      )
    }

    // TODO: Implement actual PDF generation
    // For now, return a simple HTML certificate that can be printed as PDF
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Certificate of Completion</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 40px;
            font-family: 'Georgia', serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .certificate {
            background: white;
            padding: 60px;
            border: 10px solid #FFD700;
            box-shadow: 0 0 50px rgba(0,0,0,0.3);
            text-align: center;
            max-width: 900px;
          }
          .certificate h1 {
            font-size: 48px;
            color: #333;
            margin: 0 0 20px 0;
            text-transform: uppercase;
            letter-spacing: 3px;
          }
          .certificate h2 {
            font-size: 24px;
            color: #666;
            margin: 0 0 40px 0;
            font-weight: normal;
          }
          .recipient {
            font-size: 36px;
            color: #667eea;
            margin: 30px 0;
            font-style: italic;
            border-bottom: 2px solid #667eea;
            display: inline-block;
            padding-bottom: 10px;
          }
          .course {
            font-size: 28px;
            color: #333;
            margin: 30px 0;
            font-weight: bold;
          }
          .details {
            font-size: 16px;
            color: #666;
            margin: 40px 0;
          }
          .signature {
            display: flex;
            justify-content: space-around;
            margin-top: 60px;
          }
          .signature-line {
            text-align: center;
          }
          .signature-line .line {
            border-top: 2px solid #333;
            width: 200px;
            margin: 0 auto 10px;
          }
          .date {
            color: #999;
            font-size: 14px;
            margin-top: 40px;
          }
        </style>
      </head>
      <body>
        <div class="certificate">
          <h1>Certificate of Completion</h1>
          <h2>This is to certify that</h2>

          <div class="recipient">
            ${userCertificate.user.firstName} ${userCertificate.user.lastName}
          </div>

          <h2>has successfully completed</h2>

          <div class="course">
            ${userCertificate.certificate.course.title}
          </div>

          <div class="details">
            Category: ${userCertificate.certificate.course.category?.name || 'General'}<br>
            Duration: ${userCertificate.certificate.course.duration || 0} hours<br>
            Completion Date: ${userCertificate.enrollment?.completedAt ? new Date(userCertificate.enrollment.completedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date(userCertificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>

          <div class="signature">
            <div class="signature-line">
              <div class="line"></div>
              <div>Instructor</div>
              <div>${userCertificate.certificate.course.instructor.firstName} ${userCertificate.certificate.course.instructor.lastName}</div>
            </div>
            <div class="signature-line">
              <div class="line"></div>
              <div>Administrator</div>
              <div>Civilabs LMS</div>
            </div>
          </div>

          <div class="date">
            Certificate ID: ${userCertificate.id}<br>
            Verification Code: ${userCertificate.verificationCode || 'N/A'}<br>
            Issued: ${new Date(userCertificate.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>
      </body>
      </html>
    `

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
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
