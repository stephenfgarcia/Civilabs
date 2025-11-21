/**
 * Certificate Detail API Routes
 * GET /api/certificates/[id] - Get certificate details
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/certificates/[id]
 * Get certificate details
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params
  return withAuth(async (req, user) => {
    try {
      const { id } = params

      const userCertificate = await prisma.userCertificate.findUnique({
        where: { id },
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
                  description: true,
                  durationMinutes: true,
                  category: {
                    select: {
                      id: true,
                      name: true,
                    },
                  },
                  instructor: {
                    select: {
                      firstName: true,
                      lastName: true,
                      email: true,
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

      // Only allow user to view their own certificates (unless admin)
      if (user.role !== 'admin' && userCertificate.userId !== user.userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'You can only view your own certificates',
          },
          { status: 403 }
        )
      }

      return NextResponse.json({
        success: true,
        data: userCertificate,
      })
    } catch (error) {
      console.error('Error fetching certificate:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch certificate',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request)
}
