/**
 * Individual Question API Routes
 * PUT /api/questions/[id] - Update question (instructor/admin only)
 * DELETE /api/questions/[id] - Delete question (instructor/admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withInstructor } from '@/lib/auth/api-auth'

export const PUT = withInstructor(async (request, user, { params }: { params: { id: string } }) => {
  try {
    const { id } = params
    const body = await request.json()

    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        quiz: {
          select: {
            lesson: { select: { course: { select: { instructorId: true } } } },
          },
        },
      },
    })

    if (!existingQuestion) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 })
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    if (!isAdmin && existingQuestion.quiz.lesson.course.instructorId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    const question = await prisma.question.update({
      where: { id },
      data: body,
    })

    return NextResponse.json({ success: true, data: question })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to update question' }, { status: 500 })
  }
})

export const DELETE = withInstructor(async (request, user, { params }: { params: { id: string } }) => {
  try {
    const { id } = params

    const existingQuestion = await prisma.question.findUnique({
      where: { id },
      include: {
        quiz: {
          select: {
            lesson: { select: { course: { select: { instructorId: true } } } },
          },
        },
      },
    })

    if (!existingQuestion) {
      return NextResponse.json({ success: false, error: 'Question not found' }, { status: 404 })
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    if (!isAdmin && existingQuestion.quiz.lesson.course.instructorId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    await prisma.question.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to delete question' }, { status: 500 })
  }
})
