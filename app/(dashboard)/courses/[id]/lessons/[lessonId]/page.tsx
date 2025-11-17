'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  PlayCircle,
  FileText,
  Award,
  BookOpen,
  Clock,
  ChevronDown,
  ChevronUp,
  Menu
} from 'lucide-react'
import Link from 'next/link'

// Mock lesson data
const MOCK_LESSONS = {
  1: {
    id: 1,
    courseId: 1,
    courseTitle: 'Construction Safety Fundamentals',
    moduleId: 1,
    moduleTitle: 'Introduction to Construction Safety',
    title: 'Welcome and Course Overview',
    type: 'video',
    duration: '5 min',
    completed: true,
    videoUrl: 'https://example.com/video.mp4',
    transcript: `Welcome to Construction Safety Fundamentals! In this course, you'll learn essential safety protocols and procedures that are critical for every construction site.

This course is designed for workers at all levels, from newcomers to experienced professionals looking to refresh their knowledge. We'll cover OSHA regulations, personal protective equipment, hazard identification, and emergency response procedures.

By the end of this course, you'll be equipped with the knowledge and skills to maintain a safe working environment and protect yourself and your coworkers from common construction hazards.

Let's get started!`,
    description: 'An introduction to the course structure, learning objectives, and what you can expect to learn throughout this safety training program.',
    nextLesson: 2,
    prevLesson: null
  },
  2: {
    id: 2,
    courseId: 1,
    courseTitle: 'Construction Safety Fundamentals',
    moduleId: 1,
    moduleTitle: 'Introduction to Construction Safety',
    title: 'OSHA Regulations Overview',
    type: 'video',
    duration: '12 min',
    completed: false,
    videoUrl: 'https://example.com/video2.mp4',
    transcript: `The Occupational Safety and Health Administration (OSHA) sets and enforces protective workplace safety and health standards. Understanding these regulations is fundamental to maintaining a safe construction site.

OSHA's mission is to ensure safe and healthful working conditions by setting and enforcing standards and by providing training, outreach, education, and assistance.

Key OSHA standards for construction include:
- Fall Protection (1926.501)
- Scaffolding (1926.451)
- Ladders (1926.1053)
- Personal Protective Equipment (1926.95)
- Excavations (1926.650)

Employers are required to provide a workplace free from serious recognized hazards and comply with OSHA standards. Workers have the right to receive information and training about hazards, methods to prevent harm, and OSHA standards that apply to their workplace.`,
    description: 'Learn about OSHA standards and regulations that govern construction site safety, including employer responsibilities and worker rights.',
    nextLesson: 3,
    prevLesson: 1
  },
  3: {
    id: 3,
    courseId: 1,
    courseTitle: 'Construction Safety Fundamentals',
    moduleId: 1,
    moduleTitle: 'Introduction to Construction Safety',
    title: 'Safety Culture in Construction',
    type: 'reading',
    duration: '8 min',
    completed: false,
    content: `# Safety Culture in Construction

A strong safety culture is the foundation of a safe construction site. It goes beyond compliance with regulations—it's about creating an environment where safety is valued, promoted, and practiced by everyone.

## What is Safety Culture?

Safety culture refers to the shared values, beliefs, and practices regarding safety within an organization. In construction, a positive safety culture means that workers at all levels prioritize safety in their daily activities and decisions.

## Key Components of a Strong Safety Culture

### 1. Leadership Commitment
Management must demonstrate genuine commitment to safety through:
- Visible participation in safety programs
- Allocating resources for safety initiatives
- Holding everyone accountable for safety performance
- Leading by example

### 2. Worker Involvement
Engage workers in safety processes:
- Encourage reporting of hazards and near-misses
- Involve workers in safety planning and decision-making
- Recognize and reward safe behaviors
- Provide channels for safety feedback

### 3. Open Communication
Foster an environment where:
- Safety concerns can be raised without fear of retaliation
- Information flows freely between all levels
- Regular safety meetings are held
- Lessons learned are shared

### 4. Continuous Learning
Commit to ongoing improvement:
- Regular safety training and refreshers
- Analysis of incidents and near-misses
- Updating procedures based on new information
- Staying current with industry best practices

## Building a Safety-First Mindset

Creating a safety culture requires:
- **Consistency**: Safety practices must be applied uniformly
- **Accountability**: Everyone is responsible for safety
- **Training**: Continuous education and skill development
- **Recognition**: Acknowledging safe behaviors and practices
- **Improvement**: Learning from mistakes and successes

## Practical Steps

1. Start each day with a safety briefing
2. Conduct regular safety audits and inspections
3. Empower workers to stop unsafe work
4. Investigate all incidents, no matter how minor
5. Celebrate safety milestones and achievements

Remember: Safety is everyone's responsibility, and a strong safety culture protects lives, reduces injuries, and improves overall project outcomes.`,
    description: 'Understand the importance of safety culture in construction and how to foster a safety-first mindset on job sites.',
    nextLesson: 4,
    prevLesson: 2
  },
  4: {
    id: 4,
    courseId: 1,
    courseTitle: 'Construction Safety Fundamentals',
    moduleId: 1,
    moduleTitle: 'Introduction to Construction Safety',
    title: 'Module 1 Quiz',
    type: 'quiz',
    duration: '5 min',
    completed: false,
    description: 'Test your knowledge of the introduction to construction safety concepts covered in this module.',
    nextLesson: 5,
    prevLesson: 3,
    quizId: 1
  }
}

export default function LessonViewerPage() {
  const params = useParams()
  const router = useRouter()
  const lessonId = parseInt(params.lessonId as string)
  const courseId = parseInt(params.id as string)

  const [lesson, setLesson] = useState(MOCK_LESSONS[lessonId as keyof typeof MOCK_LESSONS])
  const [showTranscript, setShowTranscript] = useState(false)
  const [showNotes, setShowNotes] = useState(false)
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (!lesson) return

    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.lesson-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [lesson])

  if (!lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="glass-effect concrete-texture border-4 border-danger/40 p-12 text-center">
          <h2 className="text-2xl font-black text-neutral-800 mb-4">LESSON NOT FOUND</h2>
          <p className="text-neutral-600 font-semibold mb-6">The lesson you're looking for doesn't exist.</p>
          <Link href={`/courses/${courseId}`}>
            <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
              BACK TO COURSE
            </MagneticButton>
          </Link>
        </Card>
      </div>
    )
  }

  const handleMarkComplete = () => {
    setLesson(prev => prev ? { ...prev, completed: true } : prev)
    // In real app, would call API to save completion
  }

  const handleNext = () => {
    if (lesson.nextLesson) {
      router.push(`/courses/${courseId}/lessons/${lesson.nextLesson}`)
    }
  }

  const handlePrevious = () => {
    if (lesson.prevLesson) {
      router.push(`/courses/${courseId}/lessons/${lesson.prevLesson}`)
    }
  }

  const renderLessonContent = () => {
    switch (lesson.type) {
      case 'video':
        return (
          <div className="space-y-6">
            {/* Video Player Placeholder */}
            <div className="relative aspect-video bg-gradient-to-br from-neutral-800 to-neutral-900 rounded-xl overflow-hidden border-4 border-primary/40">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                    <PlayCircle className="text-white" size={48} />
                  </div>
                  <p className="text-white font-bold text-lg">Video Player</p>
                  <p className="text-white/70 text-sm">Mock video content for: {lesson.title}</p>
                </div>
              </div>
            </div>

            {/* Transcript Toggle */}
            <button
              onClick={() => setShowTranscript(!showTranscript)}
              className="w-full glass-effect border-2 border-secondary/30 rounded-lg p-4 flex items-center justify-between hover:border-secondary/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                <FileText className="text-secondary" size={24} />
                <span className="font-bold text-neutral-800">Video Transcript</span>
              </div>
              {showTranscript ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
            </button>

            {showTranscript && lesson.transcript && (
              <Card className="glass-effect concrete-texture border-2 border-secondary/30">
                <CardContent className="p-6">
                  <p className="text-neutral-700 whitespace-pre-line leading-relaxed">{lesson.transcript}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )

      case 'reading':
        return (
          <Card className="glass-effect concrete-texture border-4 border-primary/40">
            <CardContent className="p-8">
              <div
                className="prose prose-lg max-w-none text-neutral-700"
                dangerouslySetInnerHTML={{
                  __html: lesson.content?.replace(/\n/g, '<br />').replace(/### /g, '<h3 class="text-xl font-black mt-6 mb-3 text-neutral-800">').replace(/## /g, '<h2 class="text-2xl font-black mt-8 mb-4 text-neutral-800">').replace(/# /g, '<h1 class="text-3xl font-black mb-6 text-neutral-900">') || ''
                }}
              />
            </CardContent>
          </Card>
        )

      case 'quiz':
        return (
          <Card className="glass-effect concrete-texture border-4 border-warning/40">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Award className="text-white" size={40} />
              </div>
              <h2 className="text-3xl font-black text-neutral-800 mb-4">READY FOR THE QUIZ?</h2>
              <p className="text-neutral-600 font-semibold mb-8 max-w-lg mx-auto">
                Test your knowledge of the concepts covered in this module. You need 80% to pass.
              </p>
              <Link href={`/courses/${courseId}/quiz/${lesson.quizId}`}>
                <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
                  <Award className="mr-2" size={20} />
                  START QUIZ
                </MagneticButton>
              </Link>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="lesson-item opacity-0">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <button
            onClick={() => router.push(`/courses/${courseId}`)}
            className="flex items-center gap-2 text-neutral-700 hover:text-primary font-bold transition-colors"
          >
            <ArrowLeft size={20} />
            BACK TO COURSE
          </button>

          {lesson.completed && (
            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-success to-green-600 rounded-lg text-white font-bold">
              <CheckCircle size={20} />
              COMPLETED
            </div>
          )}
        </div>
      </div>

      {/* Course Context */}
      <Card className="lesson-item opacity-0 glass-effect concrete-texture border-2 border-neutral-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-3 text-sm">
            <Link href={`/courses/${courseId}`} className="font-bold text-primary hover:text-primary/80">
              {lesson.courseTitle}
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="font-semibold text-neutral-600">{lesson.moduleTitle}</span>
          </div>
        </CardContent>
      </Card>

      {/* Lesson Header */}
      <div className="lesson-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-primary/40">
          {/* Blueprint corner markers */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-primary/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-primary/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-primary/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-primary/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-secondary opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4 flex-wrap">
              {lesson.type === 'video' && (
                <div className="w-12 h-12 bg-gradient-to-br from-danger to-red-600 rounded-lg flex items-center justify-center">
                  <PlayCircle className="text-white" size={24} />
                </div>
              )}
              {lesson.type === 'reading' && (
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={24} />
                </div>
              )}
              {lesson.type === 'quiz' && (
                <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center">
                  <Award className="text-white" size={24} />
                </div>
              )}
              <div className="flex items-center gap-2">
                <Clock className="text-neutral-600" size={18} />
                <span className="text-sm font-bold text-neutral-600">{lesson.duration}</span>
              </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-black text-neutral-800 mb-3">{lesson.title}</h1>
            <p className="text-lg text-neutral-700 font-medium">{lesson.description}</p>
          </div>
        </div>
      </div>

      {/* Lesson Content */}
      <div className="lesson-item opacity-0">
        {renderLessonContent()}
      </div>

      {/* Notes Section */}
      <Card className="lesson-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
        <CardHeader>
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="flex items-center justify-between w-full text-left"
          >
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-secondary to-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={20} />
              </div>
              MY NOTES
            </CardTitle>
            {showNotes ? <ChevronUp size={24} /> : <ChevronDown size={24} />}
          </button>
        </CardHeader>
        {showNotes && (
          <CardContent>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Take notes about this lesson..."
              className="w-full h-32 glass-effect border-2 border-secondary/30 rounded-lg p-4 font-medium resize-none focus:border-secondary focus:outline-none"
            />
            <MagneticButton className="mt-4 bg-gradient-to-r from-secondary to-purple-600 text-white font-black">
              SAVE NOTES
            </MagneticButton>
          </CardContent>
        )}
      </Card>

      {/* Navigation Footer */}
      <Card className="lesson-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardContent className="p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              {lesson.prevLesson && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 text-neutral-700 hover:text-primary font-bold transition-colors"
                >
                  <ArrowLeft size={20} />
                  PREVIOUS LESSON
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {!lesson.completed && lesson.type !== 'quiz' && (
                <MagneticButton
                  onClick={handleMarkComplete}
                  className="bg-gradient-to-r from-success to-green-600 text-white font-black"
                >
                  <CheckCircle className="mr-2" size={20} />
                  MARK AS COMPLETE
                </MagneticButton>
              )}

              {lesson.nextLesson && (
                <MagneticButton
                  onClick={handleNext}
                  className="bg-gradient-to-r from-primary to-blue-600 text-white font-black"
                >
                  NEXT LESSON
                  <ArrowRight className="ml-2" size={20} />
                </MagneticButton>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
