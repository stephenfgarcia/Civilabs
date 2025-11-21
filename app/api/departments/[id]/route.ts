/**
 * Department Detail API Routes (Admin)
 * GET /api/departments/[id] - Get department details
 * PUT /api/departments/[id] - Update department (admin only)
 * DELETE /api/departments/[id] - Delete department (admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withAdmin, withAuth } from '@/lib/auth/api-auth'

/**
 * GET /api/departments/[id]
 * Get department details with hierarchy
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params

      const department = await prisma.department.findUnique({
        where: { id },
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
              description: true,
              _count: {
                select: {
                  users: true,
                },
              },
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

      if (!department) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Department not found',
          },
          { status: 404 }
        )
      }

      return NextResponse.json({
        success: true,
        data: department,
      })
    } catch (error) {
      console.error('Error fetching department:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to fetch department',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, context)
}

/**
 * PUT /api/departments/[id]
 * Update department (admin only)
 */
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAdmin(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params
      const body = await request.json()
      const { name, parentId, description } = body

      // Check if department exists
      const existingDept = await prisma.department.findUnique({
        where: { id },
      })

      if (!existingDept) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Department not found',
          },
          { status: 404 }
        )
      }

      // Validate parent if provided
      if (parentId !== undefined) {
        // Prevent setting self as parent
        if (parentId === id) {
          return NextResponse.json(
            {
              success: false,
              error: 'Bad Request',
              message: 'A department cannot be its own parent',
            },
            { status: 400 }
          )
        }

        // Prevent circular references
        if (parentId) {
          const parentDept = await prisma.department.findUnique({
            where: { id: parentId },
            include: {
              parent: true,
            },
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

          // Check if new parent is a child of this department
          let currentParent = parentDept.parent
          while (currentParent) {
            if (currentParent.id === id) {
              return NextResponse.json(
                {
                  success: false,
                  error: 'Bad Request',
                  message: 'Cannot create circular department hierarchy',
                },
                { status: 400 }
              )
            }

            currentParent = await prisma.department.findUnique({
              where: { id: currentParent.parentId || '' },
              include: { parent: true },
            }).then(dept => dept?.parent || null)
          }
        }
      }

      // Check for duplicate name at same level (if name changed)
      if (name && name !== existingDept.name) {
        const duplicateDept = await prisma.department.findFirst({
          where: {
            name,
            parentId: parentId !== undefined ? (parentId || null) : existingDept.parentId,
            NOT: {
              id,
            },
          },
        })

        if (duplicateDept) {
          return NextResponse.json(
            {
              success: false,
              error: 'Conflict',
              message: 'A department with this name already exists at this level',
            },
            { status: 409 }
          )
        }
      }

      const department = await prisma.department.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(parentId !== undefined && { parentId: parentId || null }),
          ...(description !== undefined && { description }),
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
      })

      return NextResponse.json({
        success: true,
        data: department,
        message: 'Department updated successfully',
      })
    } catch (error) {
      console.error('Error updating department:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to update department',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, context)
}

/**
 * DELETE /api/departments/[id]
 * Delete department (admin only)
 */
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return withAdmin(async (req, user) => {
    try {
      const params = await context.params
      const { id } = params

      // Check if department exists
      const department = await prisma.department.findUnique({
        where: { id },
        include: {
          _count: {
            select: {
              users: true,
              children: true,
            },
          },
        },
      })

      if (!department) {
        return NextResponse.json(
          {
            success: false,
            error: 'Not Found',
            message: 'Department not found',
          },
          { status: 404 }
        )
      }

      // Check if department has users
      if (department._count.users > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Conflict',
            message: `Cannot delete department with ${department._count.users} users. Please reassign users first.`,
          },
          { status: 409 }
        )
      }

      // Check if department has children
      if (department._count.children > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Conflict',
            message: `Cannot delete department with ${department._count.children} sub-departments. Please delete or reassign sub-departments first.`,
          },
          { status: 409 }
        )
      }

      await prisma.department.delete({
        where: { id },
      })

      return NextResponse.json({
        success: true,
        message: 'Department deleted successfully',
      })
    } catch (error) {
      console.error('Error deleting department:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to delete department',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        { status: 500 }
      )
    }
  })(request, context)
}
