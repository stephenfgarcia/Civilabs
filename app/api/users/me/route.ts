/**
 * Current User API Routes
 * GET /api/users/me - Get current user profile
 * PUT /api/users/me - Update current user profile
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAuth } from '@/lib/auth/api-auth'
import bcrypt from 'bcryptjs'

/**
 * GET /api/users/me
 * Get current user profile
 */
export const GET = withAuth(async (request, user) => {
  try {
    const userData = await prisma.user.findUnique({
      where: { id: String(user.userId) },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        departmentId: true,
        avatarUrl: true,
        createdAt: true,
        lastLogin: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        points: {
          select: {
            points: true,
            level: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            certificates: true,
            badges: true,
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
})

/**
 * PUT/PATCH /api/users/me
 * Update current user profile
 */
const updateProfile = withAuth(async (request, user) => {
  try {
    const body = await request.json()

    // Only allow specific fields that exist in the User schema
    const updateData: Record<string, string | undefined> = {}

    // Whitelist of allowed profile fields
    if (body.firstName !== undefined) updateData.firstName = body.firstName
    if (body.lastName !== undefined) updateData.lastName = body.lastName
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl

    // Store additional profile fields (phone, location, bio, etc.) in metadata
    const metadataFields: Record<string, unknown> = {}
    if (body.phone !== undefined) metadataFields.phone = body.phone
    if (body.location !== undefined) metadataFields.location = body.location
    if (body.bio !== undefined) metadataFields.bio = body.bio
    if (body.timezone !== undefined) metadataFields.timezone = body.timezone

    // If there are metadata fields, merge with existing metadata
    if (Object.keys(metadataFields).length > 0) {
      const existingUser = await prisma.user.findUnique({
        where: { id: String(user.userId) },
        select: { metadata: true }
      })
      const existingMetadata = (existingUser?.metadata as Record<string, unknown>) || {}
      ;(updateData as Record<string, unknown>).metadata = { ...existingMetadata, ...metadataFields }
    }

    const password = body.password

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
      updateData.passwordHash = await bcrypt.hash(password, 10)
    }

    const updatedUser = await prisma.user.update({
      where: { id: String(user.userId) },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        status: true,
        departmentId: true,
        avatarUrl: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
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
})

// Export both PUT and PATCH methods using the same handler
export const PUT = updateProfile
export const PATCH = updateProfile
