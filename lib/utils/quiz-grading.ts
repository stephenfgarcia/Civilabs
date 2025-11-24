/**
 * Shared Quiz Grading Utility
 * Consolidates grading logic to ensure consistency across all quiz submission endpoints
 */

export interface QuizQuestion {
  id: string
  questionText: string
  questionType: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'FILL_BLANK' | 'MATCHING' | 'ESSAY'
  points: number
  options?: any
  correctAnswer?: string | null
  explanation?: string | null
}

export interface SubmissionAnswer {
  questionId: string
  selectedAnswer: string
}

export interface GradeResult {
  questionId: string
  questionText: string
  userAnswer: string
  correctAnswer: string | null
  isCorrect: boolean
  points: number
  earnedPoints: number
  explanation?: string | null
}

export interface QuizGradeResult {
  score: number
  totalPoints: number
  earnedPoints: number
  percentage: number
  passed: boolean
  passingScore: number
  detailedResults: GradeResult[]
}

/**
 * Grade a quiz submission
 * @param questions - Array of quiz questions with correct answers
 * @param answers - Array of user's answers
 * @param passingScore - Minimum percentage required to pass
 * @returns Grading results with score, pass/fail status, and detailed per-question results
 */
export function gradeQuizSubmission(
  questions: QuizQuestion[],
  answers: SubmissionAnswer[],
  passingScore: number
): QuizGradeResult {
  let totalPoints = 0
  let earnedPoints = 0
  const detailedResults: GradeResult[] = []

  // Create answer lookup map for O(1) access
  const answerMap = Object.fromEntries(
    answers.map(a => [a.questionId, a.selectedAnswer])
  )

  for (const question of questions) {
    totalPoints += question.points
    const userAnswer = answerMap[question.id]

    let isCorrect = false
    let correctAnswer = question.correctAnswer || null

    // Grade based on question type
    switch (question.questionType) {
      case 'MULTIPLE_CHOICE':
        // For multiple choice, check if options exist with isCorrect flag
        if (question.options && Array.isArray(question.options)) {
          const correctOption = question.options.find((opt: any) => opt.isCorrect)
          if (correctOption) {
            correctAnswer = correctOption.id
            isCorrect = userAnswer === correctOption.id
          } else {
            // Fallback to comparing with correctAnswer field
            isCorrect = userAnswer === question.correctAnswer
          }
        } else {
          isCorrect = userAnswer === question.correctAnswer
        }
        break

      case 'TRUE_FALSE':
        isCorrect = userAnswer === question.correctAnswer
        break

      case 'SHORT_ANSWER':
      case 'FILL_BLANK':
        // Case-insensitive comparison with whitespace trimming
        if (userAnswer && question.correctAnswer) {
          isCorrect = userAnswer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
        }
        break

      case 'MATCHING':
        // For matching questions, both answers should be JSON objects
        try {
          if (userAnswer && question.correctAnswer) {
            const userObj = JSON.parse(userAnswer)
            const correctObj = JSON.parse(question.correctAnswer)
            isCorrect = JSON.stringify(userObj) === JSON.stringify(correctObj)
          }
        } catch {
          isCorrect = false
        }
        break

      case 'ESSAY':
        // Essay questions require manual grading
        isCorrect = false
        correctAnswer = 'Manual grading required'
        break

      default:
        // Unknown question type - mark as incorrect
        isCorrect = false
    }

    if (isCorrect) {
      earnedPoints += question.points
    }

    detailedResults.push({
      questionId: question.id,
      questionText: question.questionText,
      userAnswer: userAnswer || 'No answer provided',
      correctAnswer,
      isCorrect,
      points: question.points,
      earnedPoints: isCorrect ? question.points : 0,
      explanation: question.explanation,
    })
  }

  const percentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0
  const passed = percentage >= passingScore

  return {
    score: percentage,
    totalPoints,
    earnedPoints,
    percentage,
    passed,
    passingScore,
    detailedResults,
  }
}

/**
 * Convert answers object format to array format
 * @param answersObject - Answers in { questionId: answer } format
 * @returns Answers in [{ questionId, selectedAnswer }] format
 */
export function convertAnswersToArray(answersObject: Record<string, string>): SubmissionAnswer[] {
  return Object.entries(answersObject).map(([questionId, selectedAnswer]) => ({
    questionId,
    selectedAnswer,
  }))
}
