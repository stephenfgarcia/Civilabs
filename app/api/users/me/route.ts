/**
 * Current User API Routes
 * GET /api/users/me - Get current user profile
 * PUT /api/users/me - Update current user profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'
import { hashPassword } from '@/lib/auth/auth-helpers'

/**
 * GET /api/users/me
 * Get current user profile
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const userData = await prisma.user.findUnique({
        where: { id: user.userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          department: true,
          avatar: true,
          bio: true,
          phone: true,
          location: true,
          timezone: true,
          language: true,
          points: true,
          createdAt: true,
          lastLogin: true,
          _count: {
            select: {
              enrollments: true,
              certificates: true,
              badges: true,
              discussionThreads: true,
              discussionReplies: true,
            },
          },
        },
      })

      if (!userData) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'User not found',
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: userData,
      })
    } catch (error) {
      console.error('Error fetching user profile:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch user profile',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * PUT /api/users/me
 * Update current user profile
 */
export async function PUT(request: NextRequest) {
  return withAuth(async (req, user) => {
    try {
      const body = await request.json()

      // Prevent updating sensitive fields
      const {
        id,
        email,
        role,
        points,
        createdAt,
        lastLogin,
        password,
        ...allowedUpdates
      } = body

      // Handle password update separately if provided
      const updateData: any = { ...allowedUpdates }

      if (password) {
        // Validate password strength
        if (password.length < 8) {
          return NextResponse.json(
            {
              success: false,
              error: 'Validation Error',
              message: 'Password must be at least 8 characters long',
            },
            { status: 400 }
          )
        }
        updateData.password = await hashPassword(password)
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.userId },
        data: updateData,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          department: true,
          avatar: true,
          bio: true,
          phone: true,
          location: true,
          timezone: true,
          language: true,
          points: true,
        },
      })

      return NextResponse.json({
        success: true,
        data: updatedUser,
        message: 'Profile updated successfully',
      })
    } catch (error) {
      console.error('Error updating user profile:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update profile',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request)
}
