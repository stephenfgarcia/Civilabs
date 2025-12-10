'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { apiClient } from '@/lib/services'
import { useToast } from '@/lib/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import {
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Award,
  User,
  Download,
  Loader2,
  AlertCircle,
} from 'lucide-react'

interface Submission {
  id: string
  content: string | null
  fileUrl: string | null
  status: string
  submittedAt: string | null
  grade: number | null
  feedback: string | null
  gradedAt: string | null
  gradedBy: string | null
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    avatarUrl: string | null
  }
}

interface Assignment {
  id: string
  title: string
  description: string | null
  instructions: string | null
  courseId: string
  status: string
  dueDate: string | null
  maxPoints: number
  allowLateSubmission: boolean
  createdAt: string
  publishedAt: string | null
  course: {
    id: string
    title: string
  }
  submissions: Submission[]
  _count: {
    submissions: number
  }
}

export default function InstructorAssignmentGradingPage() {
  useAuth(['INSTRUCTOR'])
  const { toast } = useToast()
  const params = useParams()
  const router = useRouter()
  const assignmentId = params.id as string

  const [assignment, setAssignment] = useState<Assignment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [gradingData, setGradingData] = useState({
    grade: '',
    feedback: '',
  })
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAssignment()
  }, [assignmentId])

  const fetchAssignment = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await apiClient.get(`/instructor/assignments/${assignmentId}`)

      if (response.status >= 200 && response.status < 300 && response.data) {
        const apiData = response.data as any
        setAssignment(apiData.data)
      } else {
        throw new Error(response.error || 'Failed to fetch assignment')
      }
    } catch (err) {
      console.error('Error fetching assignment:', err)
      setError(err instanceof Error ? err.message : 'Failed to load assignment')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectSubmission = (submission: Submission) => {
    setSelectedSubmission(submission)
    setGradingData({
      grade: submission.grade?.toString() || '',
      feedback: submission.feedback || '',
    })
  }

  const handleGradeSubmission = async () => {
    if (!selectedSubmission || !assignment) return

    // Validate grade
    const gradeValue = parseInt(gradingData.grade)
    if (isNaN(gradeValue) || gradeValue < 0 || gradeValue > assignment.maxPoints) {
      toast({
        title: 'Invalid Grade',
        description: `Grade must be between 0 and ${assignment.maxPoints}`,
        variant: 'destructive',
      })
      return
    }

    try {
      setSubmitting(true)

      const response = await apiClient.patch(
        `/instructor/assignments/${assignmentId}/submissions/${selectedSubmission.id}`,
        {
          grade: gradeValue,
          feedback: gradingData.feedback,
        }
      )

      if (response.status >= 200 && response.status < 300) {
        toast({
          title: 'Success',
          description: 'Submission graded successfully',
        })

        // Refresh assignment data
        fetchAssignment()

        // Clear selection
        setSelectedSubmission(null)
        setGradingData({ grade: '', feedback: '' })
      } else {
        throw new Error(response.error || 'Failed to grade submission')
      }
    } catch (err) {
      console.error('Error grading submission:', err)
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Failed to grade submission',
        variant: 'destructive',
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GRADED':
        return 'from-success to-green-600'
      case 'SUBMITTED':
        return 'from-warning to-orange-600'
      case 'LATE':
        return 'from-danger to-red-600'
      default:
        return 'from-neutral-400 to-neutral-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'GRADED':
        return CheckCircle
      case 'SUBMITTED':
      case 'LATE':
        return Clock
      default:
        return XCircle
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-primary mb-4" />
          <p className="text-lg font-bold text-neutral-700">Loading assignment...</p>
        </div>
      </div>
    )
  }

  if (error || !assignment) {
    return (
      <div className="space-y-6">
        <Link href="/instructor/assignments">
          <MagneticButton className="bg-gradient-to-r from-neutral-600 to-neutral-800 text-white font-black">
            <ArrowLeft className="mr-2" size={20} />
            BACK TO ASSIGNMENTS
          </MagneticButton>
        </Link>
        <Card className="glass-effect concrete-texture border-4 border-danger/40">
          <CardContent className="p-12 text-center">
            <AlertCircle className="mx-auto h-16 w-16 text-danger mb-4" />
            <h3 className="text-2xl font-black text-neutral-700 mb-2">ERROR LOADING ASSIGNMENT</h3>
            <p className="text-neutral-600 font-semibold mb-6">{error || 'Assignment not found'}</p>
            <MagneticButton onClick={fetchAssignment} className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
              TRY AGAIN
            </MagneticButton>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pendingSubmissions = assignment.submissions.filter(s => s.status === 'SUBMITTED' || s.status === 'LATE')
  const gradedSubmissions = assignment.submissions.filter(s => s.status === 'GRADED')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-primary/40">
        <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-primary/60"></div>
        <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-primary/60"></div>
        <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-primary/60"></div>
        <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-primary/60"></div>

        <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-secondary opacity-10"></div>
        <div className="absolute inset-0 blueprint-grid opacity-20"></div>

        <div className="relative z-10">
          <Link href="/instructor/assignments">
            <MagneticButton className="mb-4 bg-gradient-to-r from-neutral-600 to-neutral-800 text-white font-black">
              <ArrowLeft className="mr-2" size={20} />
              BACK TO ASSIGNMENTS
            </MagneticButton>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="text-white" size={32} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-blue-500 to-secondary bg-clip-text text-transparent">
                {assignment.title}
              </h1>
              <p className="text-sm font-bold text-neutral-600 mt-1">
                {assignment.course.title}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
            <div className="glass-effect rounded-lg p-4">
              <p className="text-xs font-bold text-neutral-500 uppercase">Total Submissions</p>
              <p className="text-2xl font-black text-neutral-800">{assignment.submissions.length}</p>
            </div>
            <div className="glass-effect rounded-lg p-4">
              <p className="text-xs font-bold text-neutral-500 uppercase">Pending Review</p>
              <p className="text-2xl font-black text-warning">{pendingSubmissions.length}</p>
            </div>
            <div className="glass-effect rounded-lg p-4">
              <p className="text-xs font-bold text-neutral-500 uppercase">Graded</p>
              <p className="text-2xl font-black text-success">{gradedSubmissions.length}</p>
            </div>
            <div className="glass-effect rounded-lg p-4">
              <p className="text-xs font-bold text-neutral-500 uppercase">Max Points</p>
              <p className="text-2xl font-black text-primary">{assignment.maxPoints}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Submissions List */}
        <div className="space-y-4">
          <Card className="glass-effect concrete-texture border-4 border-secondary/40">
            <CardHeader>
              <CardTitle className="text-2xl font-black flex items-center gap-2">
                <FileText className="text-secondary" size={24} />
                STUDENT SUBMISSIONS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 max-h-[600px] overflow-y-auto">
              {assignment.submissions.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                  <p className="text-neutral-600 font-semibold">No submissions yet</p>
                </div>
              ) : (
                assignment.submissions.map((submission) => {
                  const StatusIcon = getStatusIcon(submission.status)
                  return (
                    <div
                      key={submission.id}
                      onClick={() => handleSelectSubmission(submission)}
                      className={`p-4 rounded-lg cursor-pointer transition-all ${
                        selectedSubmission?.id === submission.id
                          ? 'glass-effect border-2 border-primary shadow-lg'
                          : 'glass-effect border-2 border-neutral-200 hover:border-primary/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                            <User className="text-white" size={20} />
                          </div>
                          <div>
                            <p className="font-black text-neutral-800">
                              {submission.user.firstName} {submission.user.lastName}
                            </p>
                            <p className="text-xs text-neutral-600">{submission.user.email}</p>
                          </div>
                        </div>
                        <div className={`px-3 py-1 rounded-lg bg-gradient-to-r ${getStatusColor(submission.status)} flex items-center gap-1`}>
                          <StatusIcon className="text-white" size={14} />
                          <span className="text-white text-xs font-black">{submission.status}</span>
                        </div>
                      </div>

                      {submission.submittedAt && (
                        <div className="flex items-center gap-2 text-xs text-neutral-600 mb-2">
                          <Calendar size={12} />
                          <span>Submitted: {new Date(submission.submittedAt).toLocaleString()}</span>
                        </div>
                      )}

                      {submission.grade !== null && (
                        <div className="flex items-center gap-2 text-xs font-bold text-success">
                          <Award size={12} />
                          <span>Grade: {submission.grade} / {assignment.maxPoints}</span>
                        </div>
                      )}
                    </div>
                  )
                })
              )}
            </CardContent>
          </Card>
        </div>

        {/* Grading Panel */}
        <div className="space-y-4">
          {selectedSubmission ? (
            <Card className="glass-effect concrete-texture border-4 border-success/40">
              <CardHeader>
                <CardTitle className="text-2xl font-black flex items-center gap-2">
                  <Award className="text-success" size={24} />
                  GRADE SUBMISSION
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Student Info */}
                <div className="glass-effect rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-full flex items-center justify-center">
                      <User className="text-white" size={24} />
                    </div>
                    <div>
                      <p className="font-black text-neutral-800">
                        {selectedSubmission.user.firstName} {selectedSubmission.user.lastName}
                      </p>
                      <p className="text-sm text-neutral-600">{selectedSubmission.user.email}</p>
                    </div>
                  </div>
                  {selectedSubmission.submittedAt && (
                    <div className="flex items-center gap-2 text-sm text-neutral-600">
                      <Calendar size={14} />
                      <span>Submitted: {new Date(selectedSubmission.submittedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>

                {/* Submission Content */}
                <div>
                  <p className="text-xs font-bold text-neutral-500 uppercase mb-2">Submission Content</p>
                  <div className="glass-effect rounded-lg p-4 min-h-[100px] max-h-[200px] overflow-y-auto">
                    <p className="text-neutral-700 whitespace-pre-wrap">
                      {selectedSubmission.content || 'No text content provided'}
                    </p>
                  </div>
                </div>

                {/* File Attachment */}
                {selectedSubmission.fileUrl && (
                  <div>
                    <p className="text-xs font-bold text-neutral-500 uppercase mb-2">Attachment</p>
                    <a
                      href={selectedSubmission.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 glass-effect rounded-lg p-3 hover:border-primary transition-all"
                    >
                      <Download size={16} className="text-primary" />
                      <span className="text-sm font-semibold text-primary">Download Attachment</span>
                    </a>
                  </div>
                )}

                {/* Grading Form */}
                <div className="border-t-2 border-neutral-200 pt-4 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">
                      Grade (Max: {assignment.maxPoints})
                    </label>
                    <Input
                      type="number"
                      min="0"
                      max={assignment.maxPoints}
                      value={gradingData.grade}
                      onChange={(e) => setGradingData({ ...gradingData, grade: e.target.value })}
                      placeholder={`Enter grade (0-${assignment.maxPoints})`}
                      className="glass-effect border-2 border-success/30 focus:border-success font-bold"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-neutral-500 uppercase block mb-2">
                      Feedback (Optional)
                    </label>
                    <Textarea
                      value={gradingData.feedback}
                      onChange={(e) => setGradingData({ ...gradingData, feedback: e.target.value })}
                      placeholder="Provide feedback to the student..."
                      className="glass-effect border-2 border-success/30 focus:border-success min-h-[120px]"
                    />
                  </div>

                  <MagneticButton
                    onClick={handleGradeSubmission}
                    disabled={!gradingData.grade || submitting}
                    className="w-full bg-gradient-to-r from-success to-green-600 text-white font-black disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="animate-spin mr-2" size={20} />
                        SUBMITTING...
                      </>
                    ) : (
                      <>
                        <Award className="mr-2" size={20} />
                        SUBMIT GRADE
                      </>
                    )}
                  </MagneticButton>
                </div>

                {/* Previously Graded Info */}
                {selectedSubmission.gradedAt && (
                  <div className="glass-effect rounded-lg p-4 border-2 border-warning/40">
                    <p className="text-xs font-bold text-warning uppercase mb-2">Previously Graded</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-neutral-700">
                        <strong>Grade:</strong> {selectedSubmission.grade} / {assignment.maxPoints}
                      </p>
                      <p className="text-neutral-700">
                        <strong>Graded:</strong> {new Date(selectedSubmission.gradedAt).toLocaleString()}
                      </p>
                      {selectedSubmission.feedback && (
                        <div className="mt-2">
                          <p className="text-neutral-700 font-semibold">Previous Feedback:</p>
                          <p className="text-neutral-600 italic">{selectedSubmission.feedback}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-effect concrete-texture border-4 border-neutral-300">
              <CardContent className="p-12 text-center">
                <FileText className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
                <h3 className="text-xl font-black text-neutral-700 mb-2">NO SUBMISSION SELECTED</h3>
                <p className="text-neutral-600">
                  Select a submission from the list to view details and assign a grade
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
