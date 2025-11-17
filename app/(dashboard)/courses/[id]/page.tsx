'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import {
  BookOpen,
  Clock,
  Users,
  Award,
  CheckCircle,
  PlayCircle,
  FileText,
  Download,
  Star,
  Shield,
  Wrench,
  HardHat,
  Zap,
  ArrowLeft,
  Lock,
  BarChart
} from 'lucide-react'
import Link from 'next/link'

// Mock course data (same structure as courses page)
const MOCK_COURSES = [
  {
    id: 1,
    title: 'Construction Safety Fundamentals',
    description: 'Essential safety protocols and procedures for construction sites. Learn to identify hazards, use personal protective equipment, and implement safety measures.',
    fullDescription: 'This comprehensive safety course covers all aspects of construction site safety, from basic hazard identification to advanced emergency response procedures. You will learn OSHA regulations, proper PPE usage, fall protection, electrical safety, and how to create a culture of safety on your job sites.',
    category: 'Safety',
    level: 'Beginner',
    duration: '4 hours',
    students: 245,
    rating: 4.8,
    reviews: 89,
    instructor: 'John Martinez',
    instructorTitle: 'Safety Director',
    icon: Shield,
    color: 'from-danger to-red-600',
    enrolled: true,
    progress: 65,
    modules: [
      {
        id: 1,
        title: 'Introduction to Construction Safety',
        lessons: [
          { id: 1, title: 'Welcome and Course Overview', type: 'video', duration: '5 min', completed: true },
          { id: 2, title: 'OSHA Regulations Overview', type: 'video', duration: '12 min', completed: true },
          { id: 3, title: 'Safety Culture in Construction', type: 'reading', duration: '8 min', completed: true },
          { id: 4, title: 'Module 1 Quiz', type: 'quiz', duration: '5 min', completed: true }
        ]
      },
      {
        id: 2,
        title: 'Personal Protective Equipment (PPE)',
        lessons: [
          { id: 5, title: 'Types of PPE', type: 'video', duration: '10 min', completed: true },
          { id: 6, title: 'Proper PPE Usage', type: 'video', duration: '15 min', completed: true },
          { id: 7, title: 'PPE Maintenance and Inspection', type: 'reading', duration: '10 min', completed: false },
          { id: 8, title: 'Module 2 Quiz', type: 'quiz', duration: '5 min', completed: false }
        ]
      },
      {
        id: 3,
        title: 'Hazard Identification and Control',
        lessons: [
          { id: 9, title: 'Common Construction Hazards', type: 'video', duration: '18 min', completed: false },
          { id: 10, title: 'Risk Assessment Methods', type: 'video', duration: '12 min', completed: false },
          { id: 11, title: 'Control Measures and Hierarchy', type: 'reading', duration: '15 min', completed: false },
          { id: 12, title: 'Module 3 Quiz', type: 'quiz', duration: '5 min', completed: false }
        ]
      },
      {
        id: 4,
        title: 'Emergency Response Procedures',
        lessons: [
          { id: 13, title: 'Emergency Action Plans', type: 'video', duration: '10 min', completed: false },
          { id: 14, title: 'First Aid Basics', type: 'video', duration: '20 min', completed: false },
          { id: 15, title: 'Evacuation Procedures', type: 'reading', duration: '8 min', completed: false },
          { id: 16, title: 'Final Assessment', type: 'quiz', duration: '15 min', completed: false }
        ]
      }
    ],
    learningObjectives: [
      'Identify and assess construction site hazards',
      'Select and properly use personal protective equipment',
      'Implement OSHA safety regulations and standards',
      'Develop emergency response plans',
      'Create a safety-first culture on construction sites'
    ],
    requirements: [
      'No prior construction experience required',
      'Basic understanding of workplace safety',
      'Access to a computer or mobile device'
    ]
  },
  {
    id: 2,
    title: 'Heavy Equipment Operation',
    description: 'Learn to operate excavators, bulldozers, and cranes safely',
    fullDescription: 'Master the operation of heavy construction equipment including excavators, bulldozers, loaders, and cranes. This hands-on course combines theoretical knowledge with practical skills.',
    category: 'Equipment',
    level: 'Intermediate',
    duration: '12 hours',
    students: 189,
    rating: 4.6,
    reviews: 67,
    instructor: 'Mike Johnson',
    instructorTitle: 'Equipment Specialist',
    icon: Wrench,
    color: 'from-warning to-orange-600',
    enrolled: false,
    progress: 0,
    modules: [
      {
        id: 1,
        title: 'Equipment Basics',
        lessons: [
          { id: 1, title: 'Equipment Types and Uses', type: 'video', duration: '15 min', completed: false },
          { id: 2, title: 'Safety Protocols', type: 'video', duration: '12 min', completed: false },
          { id: 3, title: 'Pre-Operation Inspection', type: 'reading', duration: '10 min', completed: false }
        ]
      },
      {
        id: 2,
        title: 'Excavator Operation',
        lessons: [
          { id: 4, title: 'Excavator Controls', type: 'video', duration: '20 min', completed: false },
          { id: 5, title: 'Digging Techniques', type: 'video', duration: '25 min', completed: false },
          { id: 6, title: 'Practice Exercises', type: 'quiz', duration: '15 min', completed: false }
        ]
      }
    ],
    learningObjectives: [
      'Operate excavators, bulldozers, and loaders safely',
      'Perform pre-operation inspections',
      'Execute precise digging and grading tasks',
      'Understand equipment maintenance requirements'
    ],
    requirements: [
      'Valid driver\'s license',
      'Basic mechanical knowledge',
      'Physical ability to operate heavy machinery'
    ]
  }
]

export default function CourseDetailPage() {
  const params = useParams()
  const router = useRouter()
  const courseId = parseInt(params.id as string)
  const [course, setCourse] = useState(MOCK_COURSES.find(c => c.id === courseId))
  const [expandedModules, setExpandedModules] = useState<number[]>([1])

  useEffect(() => {
    if (!course) return

    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.course-detail-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [course])

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="glass-effect concrete-texture border-4 border-danger/40 p-12 text-center">
          <h2 className="text-2xl font-black text-neutral-800 mb-4">COURSE NOT FOUND</h2>
          <p className="text-neutral-600 font-semibold mb-6">The course you're looking for doesn't exist.</p>
          <Link href="/courses">
            <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
              BACK TO COURSES
            </MagneticButton>
          </Link>
        </Card>
      </div>
    )
  }

  const Icon = course.icon
  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0)
  const completedLessons = course.modules.reduce(
    (acc, mod) => acc + mod.lessons.filter(l => l.completed).length,
    0
  )

  const toggleModule = (moduleId: number) => {
    setExpandedModules(prev =>
      prev.includes(moduleId) ? prev.filter(id => id !== moduleId) : [...prev, moduleId]
    )
  }

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return PlayCircle
      case 'reading':
        return FileText
      case 'quiz':
        return Award
      default:
        return BookOpen
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <div className="course-detail-item opacity-0">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-neutral-700 hover:text-primary font-bold transition-colors"
        >
          <ArrowLeft size={20} />
          BACK TO COURSES
        </button>
      </div>

      {/* Course Header */}
      <div className="course-detail-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 md:p-12 relative overflow-hidden border-4 border-primary/40">
          {/* Blueprint corner markers */}
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-primary/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-primary/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-primary/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-primary/60"></div>

          {/* Background */}
          <div className={`absolute inset-0 bg-gradient-to-r ${course.color} opacity-10`}></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-start gap-6 flex-wrap">
              <div className={`w-20 h-20 bg-gradient-to-br ${course.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                <Icon className="text-white" size={40} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <span className={`px-4 py-1 rounded-full text-sm font-black bg-gradient-to-r ${course.color} text-white`}>
                    {course.category}
                  </span>
                  <span className="px-4 py-1 rounded-full text-sm font-black bg-gradient-to-r from-neutral-600 to-neutral-800 text-white">
                    {course.level}
                  </span>
                  {course.enrolled && (
                    <span className="px-4 py-1 rounded-full text-sm font-black bg-gradient-to-r from-success to-green-600 text-white">
                      ENROLLED
                    </span>
                  )}
                </div>

                <h1 className="text-4xl md:text-5xl font-black text-neutral-800 mb-4">{course.title}</h1>
                <p className="text-lg text-neutral-700 font-medium mb-6">{course.fullDescription}</p>

                <div className="flex items-center gap-6 flex-wrap mb-6">
                  <div className="flex items-center gap-2">
                    <Clock className="text-primary" size={20} />
                    <span className="font-bold text-neutral-700">{course.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="text-success" size={20} />
                    <span className="font-bold text-neutral-700">{course.students} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="text-warning fill-warning" size={20} />
                    <span className="font-bold text-neutral-700">{course.rating} ({course.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="text-secondary" size={20} />
                    <span className="font-bold text-neutral-700">{totalLessons} lessons</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-wrap">
                  {course.enrolled ? (
                    <MagneticButton className="bg-gradient-to-r from-success to-green-600 text-white font-black">
                      <PlayCircle className="mr-2" size={20} />
                      CONTINUE LEARNING
                    </MagneticButton>
                  ) : (
                    <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black">
                      <Zap className="mr-2" size={20} />
                      ENROLL NOW
                    </MagneticButton>
                  )}
                  <MagneticButton className="glass-effect border-2 border-neutral-400 text-neutral-700 font-black">
                    <Download className="mr-2" size={20} />
                    DOWNLOAD SYLLABUS
                  </MagneticButton>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress (if enrolled) */}
      {course.enrolled && (
        <Card className="course-detail-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardHeader>
            <CardTitle className="text-xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-success to-green-600 rounded-lg flex items-center justify-center">
                <BarChart className="text-white" size={20} />
              </div>
              YOUR PROGRESS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-700">Overall Completion</span>
                <span className="text-2xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent">
                  {course.progress}%
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-4">
                <div
                  className="bg-gradient-to-r from-success to-green-600 h-4 rounded-full transition-all"
                  style={{ width: `${course.progress}%` }}
                ></div>
              </div>
              <div className="flex items-center justify-between text-sm font-semibold text-neutral-600">
                <span>{completedLessons} of {totalLessons} lessons completed</span>
                <span>{totalLessons - completedLessons} remaining</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Course Curriculum */}
          <Card className="course-detail-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
            <CardHeader>
              <CardTitle className="text-2xl font-black flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="text-white" size={20} />
                </div>
                COURSE CURRICULUM
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {course.modules.map((module, moduleIndex) => {
                  const isExpanded = expandedModules.includes(module.id)
                  const completedInModule = module.lessons.filter(l => l.completed).length
                  const totalInModule = module.lessons.length

                  return (
                    <div key={module.id} className="glass-effect border-2 border-primary/20 rounded-lg overflow-hidden">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full p-4 flex items-center justify-between hover:bg-white/30 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center flex-shrink-0 font-black text-white">
                            {moduleIndex + 1}
                          </div>
                          <div className="text-left flex-1">
                            <h3 className="font-black text-neutral-800">{module.title}</h3>
                            <p className="text-sm font-semibold text-neutral-600">
                              {totalInModule} lessons • {completedInModule} completed
                            </p>
                          </div>
                        </div>
                        <div className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                          <ChevronRight size={24} className="text-neutral-600" />
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="border-t-2 border-primary/20 bg-white/20">
                          {module.lessons.map((lesson) => {
                            const LessonIcon = getLessonIcon(lesson.type)
                            const isLocked = !course.enrolled

                            return (
                              <div
                                key={lesson.id}
                                className="p-4 flex items-center gap-3 hover:bg-white/30 transition-colors border-b border-neutral-200 last:border-0"
                              >
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  lesson.completed
                                    ? 'bg-gradient-to-br from-success to-green-600'
                                    : isLocked
                                    ? 'bg-gradient-to-br from-neutral-300 to-neutral-500'
                                    : 'bg-gradient-to-br from-secondary to-purple-600'
                                }`}>
                                  {lesson.completed ? (
                                    <CheckCircle className="text-white" size={16} />
                                  ) : isLocked ? (
                                    <Lock className="text-white" size={16} />
                                  ) : (
                                    <LessonIcon className="text-white" size={16} />
                                  )}
                                </div>

                                <div className="flex-1">
                                  <h4 className={`font-bold ${lesson.completed ? 'text-neutral-600 line-through' : 'text-neutral-800'}`}>
                                    {lesson.title}
                                  </h4>
                                  <p className="text-xs font-semibold text-neutral-500 uppercase">
                                    {lesson.type} • {lesson.duration}
                                  </p>
                                </div>

                                {!isLocked && !lesson.completed && (
                                  <MagneticButton className="bg-gradient-to-r from-primary to-blue-600 text-white font-black text-sm px-4 py-2">
                                    START
                                  </MagneticButton>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Learning Objectives */}
          <Card className="course-detail-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
            <CardHeader>
              <CardTitle className="text-xl font-black flex items-center gap-2">
                <div className="w-10 h-10 bg-gradient-to-br from-success to-green-600 rounded-lg flex items-center justify-center">
                  <Award className="text-white" size={20} />
                </div>
                LEARNING OBJECTIVES
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {course.learningObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="text-success flex-shrink-0 mt-1" size={20} />
                    <span className="font-medium text-neutral-700">{objective}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instructor */}
          <Card className="course-detail-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
            <CardHeader>
              <CardTitle className="text-lg font-black">INSTRUCTOR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-purple-600 rounded-full flex items-center justify-center text-white font-black text-xl">
                  {course.instructor.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-black text-neutral-800">{course.instructor}</h3>
                  <p className="text-sm font-semibold text-neutral-600">{course.instructorTitle}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card className="course-detail-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
            <CardHeader>
              <CardTitle className="text-lg font-black">REQUIREMENTS</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {course.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2 flex-shrink-0"></div>
                    <span className="text-sm font-medium text-neutral-700">{req}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
