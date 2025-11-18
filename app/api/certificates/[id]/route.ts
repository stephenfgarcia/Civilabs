/**
 * Certificate Detail API Routes
 * GET /api/certificates/[id] - Get certificate details
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/certificates/[id]
 * Get certificate details
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  return withAuth(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params

      const certificate = await prisma.certificate.findUnique({
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
          course: {
            select: {
              id: true,
              title: true,
              description: true,
              category: true,
              duration: true,
              instructor: {
                select: {
                  firstName: true,
                  lastName: true,
                  email: true,
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

      if (!certificate) {
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
      if (user.role !== 'admin' && certificate.userId !== user.userId) {
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
        data: certificate,
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
  })(request, { params })
}
