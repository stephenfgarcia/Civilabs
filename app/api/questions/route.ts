/**
 * Questions API Routes  
 * POST /api/questions - Create question (instructor/admin only)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/utils/prisma'
import { withInstructor } from '@/lib/auth/api-auth'

export const POST = withInstructor(async (request, user) => {
  try {
    const body = await request.json()
    const { quizId, questionText, questionType, points, order, options, correctAnswer, explanation } = body

    if (!quizId || !questionText || !questionType) {
      return NextResponse.json(
        { success: false, error: 'quizId, questionText, and questionType are required' },
        { status: 400 }
      )
    }

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
      include: { lesson: { select: { course: { select: { instructorId: true } } } } },
    })

    if (!quiz) {
      return NextResponse.json({ success: false, error: 'Quiz not found' }, { status: 404 })
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    if (!isAdmin && quiz.lesson.course.instructorId !== user.userId) {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 })
    }

    let questionOrder = order
    if (questionOrder === undefined) {
      const lastQuestion = await prisma.question.findFirst({
        where: { quizId },
        orderBy: { order: 'desc' },
      })
      questionOrder = lastQuestion ? lastQuestion.order + 1 : 1
    }

    const question = await prisma.question.create({
      data: {
        quizId,
        questionText,
        questionType,
        points: points ?? 1,
        order: questionOrder,
        options,
        correctAnswer,
        explanation,
      },
    })

    return NextResponse.json({ success: true, data: question }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create question' }, { status: 500 })
  }
})
