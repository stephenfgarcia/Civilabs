/**
 * Users API Routes (Admin)
 * GET /api/users - List all users (admin only)
 * POST /api/users - Create new user (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAdmin } from '@/lib/auth/api-auth'
import { hashPassword } from '@/lib/auth/auth-helpers'

/**
 * GET /api/users
 * List all users with filtering (admin only)
 */
export const GET = withAdmin(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const department = searchParams.get('department')
    const search = searchParams.get('search')
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')

    const users = await prisma.user.findMany({
      where: {
        ...(role && { role: role as 'admin' | 'instructor' | 'learner' }),
        ...(department && { department }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
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
        _count: {
          select: {
            enrollments: true,
            certificates: true,
            coursesCreated: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      ...(limit && { take: parseInt(limit) }),
      ...(offset && { skip: parseInt(offset) }),
    })

    const totalCount = await prisma.user.count({
      where: {
        ...(role && { role: role as 'admin' | 'instructor' | 'learner' }),
        ...(department && { department }),
        ...(search && {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
    })

    return NextResponse.json({
      success: true,
      data: users,
      count: users.length,
      total: totalCount,
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch users',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/users
 * Create new user (admin only)
 */
export const POST = withAdmin(async (request, user) => {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.email || !body.password || !body.firstName || !body.lastName) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Email, password, first name, and last name are required',
        },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation Error',
          message: 'Invalid email format',
        },
        { status: 400 }
      )
    }

    // Validate password strength
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

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: body.email },
    })

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message: 'User with this email already exists',
        },
        { status: 409 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(body.password)

    // Create user
    const newUser = await prisma.user.create({
      data: {
        email: body.email,
        password: hashedPassword,
        firstName: body.firstName,
        lastName: body.lastName,
        role: body.role || 'learner',
        department: body.department || null,
        avatar: body.avatar || null,
        bio: body.bio || null,
        phone: body.phone || null,
        location: body.location || null,
        timezone: body.timezone || 'UTC',
        language: body.language || 'en',
      },
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
        createdAt: true,
      },
    })

    // Create welcome notification
    await prisma.notification.create({
      data: {
        userId: newUser.id,
        type: 'info',
        title: 'Welcome to Civilabs LMS',
        message: `Welcome ${newUser.firstName}! Your account has been created successfully.`,
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: newUser,
        message: 'User created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create user',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
