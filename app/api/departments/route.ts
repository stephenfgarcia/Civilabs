/**
 * Departments API Routes (Admin)
 * GET /api/departments - List all departments
 * POST /api/departments - Create new department (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAdmin, withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/departments
 * List all departments with hierarchy
 */
export const GET = withAuth(async (request, user) => {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')
    const search = searchParams.get('search')

    const departments = await prisma.department.findMany({
      where: {
        ...(parentId !== undefined && {
          parentId: parentId === 'null' ? null : parentId,
        }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
          ],
        }),
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            users: true,
            children: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({
      success: true,
      data: departments,
      count: departments.length,
    })
  } catch (error) {
    console.error('Error fetching departments:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch departments',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})

/**
 * POST /api/departments
 * Create new department (admin only)
 */
export const POST = withAdmin(async (request, user) => {
  try {
    const body = await request.json()
    const { name, parentId, description } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        {
          success: false,
          error: 'Bad Request',
          message: 'Department name is required',
        },
        { status: 400 }
      )
    }

    // Check if parent exists (if provided)
    if (parentId) {
      const parentDept = await prisma.department.findUnique({
        where: { id: parentId },
      })

      if (!parentDept) {
        return NextResponse.json(
          {
            success: false,
            error: 'Bad Request',
            message: 'Parent department not found',
          },
          { status: 400 }
        )
      }
    }

    // Check for duplicate name at same level
    const existingDept = await prisma.department.findFirst({
      where: {
        name,
        parentId: parentId || null,
      },
    })

    if (existingDept) {
      return NextResponse.json(
        {
          success: false,
          error: 'Conflict',
          message: 'A department with this name already exists at this level',
        },
        { status: 409 }
      )
    }

    const department = await prisma.department.create({
      data: {
        name,
        parentId: parentId || null,
        description,
      },
      include: {
        parent: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            users: true,
            children: true,
          },
        },
      },
    })

    return NextResponse.json(
      {
        success: true,
        data: department,
        message: 'Department created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating department:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create department',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
})
