/**
 * Questions API Service
 * Handles quiz question management
 */

import { apiClient } from './api-client'

export interface Question {
  id: string
  quizId: string
  questionText: string
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'
  options: string[]
  correctAnswer: string
  points: number
  order: number
  explanation: string | null
  createdAt: Date
  updatedAt: Date
}

class QuestionsService {
  /**
   * Get all questions for a quiz
   */
  async getQuestions(quizId?: string): Promise<Question[]> {
    const params = new URLSearchParams()
    if (quizId) {
      params.append('quizId', quizId)
    }

    const response = await apiClient.get<{ questions: Question[] }>(
      `/questions${params.toString() ? `?${params.toString()}` : ''}`
    )
    return response.data?.questions || []
  }

  /**
   * Get question by ID
   */
  async getQuestionById(id: string): Promise<Question> {
    const response = await apiClient.get<Question>(`/questions/${id}`)
    return response.data!
  }

  /**
   * Create new question
   */
  async createQuestion(data: {
    quizId: string
    questionText: string
    questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'
    options: string[]
    correctAnswer: string
    points: number
    order?: number
    explanation?: string
  }): Promise<Question> {
    const response = await apiClient.post<Question>('/questions', data)
    return response.data!
  }

  /**
   * Update question
   */
  async updateQuestion(
    id: string,
    data: Partial<{
      questionText: string
      questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER'
      options: string[]
      correctAnswer: string
      points: number
      order: number
      explanation: string
    }>
  ): Promise<Question> {
    const response = await apiClient.put<Question>(`/questions/${id}`, data)
    return response.data!
  }

  /**
   * Delete question
   */
  async deleteQuestion(id: string): Promise<void> {
    await apiClient.delete(`/questions/${id}`)
  }

  /**
   * Reorder questions in a quiz
   */
  async reorderQuestions(quizId: string, questionIds: string[]): Promise<void> {
    await apiClient.post(`/questions/reorder`, { quizId, questionIds })
  }
}

export const questionsService = new QuestionsService()
export default questionsService
