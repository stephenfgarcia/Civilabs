/**
 * User Detail API Routes (Admin)
 * GET /api/users/[id] - Get user details (admin only)
 * PUT /api/users/[id] - Update user (admin only)
 * DELETE /api/users/[id] - Delete user (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAdmin } from '@/lib/auth/api-auth'
import { hashPassword } from '@/lib/auth/auth-helpers'

interface RouteParams {
  params: { id: string }
}

/**
 * GET /api/users/[id]
 * Get user details (admin only)
 */
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  return withAdmin(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params

      const userData = await prisma.user.findUnique({
        where: { id },
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          points: {
            select: {
              totalPoints: true,
              level: true,
              rank: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              certificates: true,
              badges: true,
              coursesCreated: true,
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
      console.error('Error fetching user:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch user',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, { params })
}

/**
 * PUT /api/users/[id]
 * Update user (admin only)
 */
export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  return withAdmin(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params
      const body = await request.json()

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
      })

      if (!existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'User not found',
          },
          { status: 404 }
        )
      }

      // If email is being updated, check for conflicts
      if (body.email && body.email !== existingUser.email) {
        const emailConflict = await prisma.user.findUnique({
          where: { email: body.email },
        })

        if (emailConflict) {
          return NextResponse.json(
            {
              success: false,
              error: 'Conflict',
              message: 'Email already in use by another user',
            },
            { status: 409 }
          )
        }
      }

      // Prepare update data
      const updateData: any = {}

      if (body.email) updateData.email = body.email
      if (body.firstName) updateData.firstName = body.firstName
      if (body.lastName) updateData.lastName = body.lastName
      if (body.role) updateData.role = body.role
      if (body.status) updateData.status = body.status
      if (body.departmentId !== undefined) updateData.departmentId = body.departmentId
      if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl

      // Handle password update
      if (body.password) {
        if (body.password.length < 8) {
          return NextResponse.json(
            {
              success: false,
              error: 'Validation Error',
              message: 'Password must be at least 8 characters long',
            },
            { status: 400 }
          )
        }
        updateData.passwordHash = await hashPassword(body.password)
      }

      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateData,
        include: {
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              enrollments: true,
              certificates: true,
              coursesCreated: true,
            },
          },
        },
      })

      return NextResponse.json({
        success: true,
        data: updatedUser,
        message: 'User updated successfully',
      })
    } catch (error) {
      console.error('Error updating user:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update user',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, { params })
}

/**
 * DELETE /api/users/[id]
 * Delete user (admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  return withAdmin(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params

      // Prevent admin from deleting themselves
      if (id === user.userId) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden',
            message: 'You cannot delete your own account',
          },
          { status: 403 }
        )
      }

      // Check if user exists
      const existingUser = await prisma.user.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              coursesCreated: true,
              enrollments: true,
            },
          },
        },
      })

      if (!existingUser) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'User not found',
          },
          { status: 404 }
        )
      }

      // Prevent deletion if user is an instructor with active courses
      if (existingUser._count.coursesCreated > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Conflict',
            message: 'Cannot delete instructor with active courses. Reassign courses first.',
          },
          { status: 409 }
        )
      }

      // Delete user (cascade will handle related records)
      await prisma.user.delete({
        where: { id },
      })

      return NextResponse.json({
        success: true,
        message: 'User deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting user:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete user',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, { params })
}
