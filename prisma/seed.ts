import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create departments
  const itDept = await prisma.department.create({
    data: {
      name: 'Information Technology',
      description: 'IT Department',
    },
  })

  const hrDept = await prisma.department.create({
    data: {
      name: 'Human Resources',
      description: 'HR Department',
    },
  })

  // Create users
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@civilabs.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      departmentId: itDept.id,
    },
  })

  const instructorPassword = await bcrypt.hash('instructor123', 10)
  const instructor = await prisma.user.create({
    data: {
      email: 'instructor@civilabs.com',
      passwordHash: instructorPassword,
      firstName: 'John',
      lastName: 'Instructor',
      role: 'INSTRUCTOR',
      status: 'ACTIVE',
      departmentId: itDept.id,
    },
  })

  const learnerPassword = await bcrypt.hash('learner123', 10)
  const learner = await prisma.user.create({
    data: {
      email: 'learner@civilabs.com',
      passwordHash: learnerPassword,
      firstName: 'Jane',
      lastName: 'Learner',
      role: 'LEARNER',
      status: 'ACTIVE',
      departmentId: hrDept.id,
    },
  })

  // Create categories
  const techCategory = await prisma.category.create({
    data: {
      name: 'Technology',
      slug: 'technology',
      order: 1,
    },
  })

  const businessCategory = await prisma.category.create({
    data: {
      name: 'Business',
      slug: 'business',
      order: 2,
    },
  })

  // Create sample course
  const course = await prisma.course.create({
    data: {
      title: 'Introduction to Web Development',
      slug: 'intro-to-web-dev',
      description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript',
      instructorId: instructor.id,
      categoryId: techCategory.id,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      difficultyLevel: 'BEGINNER',
      durationMinutes: 180,
      tags: ['web', 'development', 'beginner'],
      publishedAt: new Date(),
    },
  })

  // Create lessons
  await prisma.lesson.create({
    data: {
      courseId: course.id,
      title: 'Introduction to HTML',
      description: 'Learn HTML basics',
      contentType: 'TEXT',
      order: 1,
      durationMinutes: 30,
      contentData: {
        html: '<h1>Welcome to HTML</h1><p>HTML is the foundation of web development...</p>',
      },
    },
  })

  await prisma.lesson.create({
    data: {
      courseId: course.id,
      title: 'CSS Fundamentals',
      description: 'Learn CSS styling',
      contentType: 'TEXT',
      order: 2,
      durationMinutes: 45,
      contentData: {
        html: '<h1>CSS Styling</h1><p>CSS allows you to style your HTML elements...</p>',
      },
    },
  })

  const quizLesson = await prisma.lesson.create({
    data: {
      courseId: course.id,
      title: 'HTML Quiz',
      description: 'Test your HTML knowledge',
      contentType: 'QUIZ',
      order: 3,
      durationMinutes: 15,
    },
  })

  // Create quiz
  const quiz = await prisma.quiz.create({
    data: {
      lessonId: quizLesson.id,
      title: 'HTML Basics Quiz',
      description: 'Test your understanding of HTML',
      passingScore: 70,
      timeLimitMinutes: 10,
      attemptsAllowed: 3,
    },
  })

  // Create questions
  await prisma.question.create({
    data: {
      quizId: quiz.id,
      questionText: 'What does HTML stand for?',
      questionType: 'MULTIPLE_CHOICE',
      order: 1,
      points: 10,
      options: [
        { id: '1', text: 'Hyper Text Markup Language', isCorrect: true },
        { id: '2', text: 'High Tech Modern Language', isCorrect: false },
        { id: '3', text: 'Home Tool Markup Language', isCorrect: false },
        { id: '4', text: 'Hyperlinks and Text Markup Language', isCorrect: false },
      ],
    },
  })

  await prisma.question.create({
    data: {
      quizId: quiz.id,
      questionText: 'HTML is a programming language.',
      questionType: 'TRUE_FALSE',
      order: 2,
      points: 10,
      correctAnswer: 'false',
      explanation: 'HTML is a markup language, not a programming language.',
    },
  })

  // Create second course
  const course2 = await prisma.course.create({
    data: {
      title: 'Construction Safety Fundamentals',
      slug: 'construction-safety-fundamentals',
      description: 'Essential safety practices for construction sites',
      instructorId: instructor.id,
      categoryId: businessCategory.id,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      difficultyLevel: 'BEGINNER',
      durationMinutes: 240,
      tags: ['safety', 'construction', 'fundamentals'],
      publishedAt: new Date(),
    },
  })

  // Create lesson for second course
  await prisma.lesson.create({
    data: {
      courseId: course2.id,
      title: 'PPE Requirements',
      description: 'Personal Protective Equipment guidelines',
      contentType: 'TEXT',
      order: 1,
      durationMinutes: 45,
      contentData: {
        html: '<h1>PPE Requirements</h1><p>Learn about essential safety equipment...</p>',
      },
    },
  })

  await prisma.lesson.create({
    data: {
      courseId: course2.id,
      title: 'Hazard Identification',
      description: 'Identifying workplace hazards',
      contentType: 'TEXT',
      order: 2,
      durationMinutes: 60,
      contentData: {
        html: '<h1>Hazard Identification</h1><p>Learn to identify common construction hazards...</p>',
      },
    },
  })

  // Create third course
  const course3 = await prisma.course.create({
    data: {
      title: 'Heavy Equipment Operation',
      slug: 'heavy-equipment-operation',
      description: 'Learn to operate heavy construction equipment safely and efficiently',
      instructorId: instructor.id,
      categoryId: techCategory.id,
      status: 'PUBLISHED',
      visibility: 'PUBLIC',
      difficultyLevel: 'INTERMEDIATE',
      durationMinutes: 480,
      tags: ['equipment', 'operation', 'heavy machinery'],
      publishedAt: new Date(),
    },
  })

  // Create lesson for third course
  await prisma.lesson.create({
    data: {
      courseId: course3.id,
      title: 'Equipment Safety Checks',
      description: 'Pre-operation safety inspections',
      contentType: 'TEXT',
      order: 1,
      durationMinutes: 30,
      contentData: {
        html: '<h1>Safety Checks</h1><p>Daily equipment inspection procedures...</p>',
      },
    },
  })

  // Enroll learner in courses
  const enrollment1 = await prisma.enrollment.create({
    data: {
      userId: learner.id,
      courseId: course.id,
      status: 'ENROLLED',
      progressPercentage: 35,
      enrolledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    },
  })

  const enrollment2 = await prisma.enrollment.create({
    data: {
      userId: learner.id,
      courseId: course2.id,
      status: 'ENROLLED',
      progressPercentage: 60,
      enrolledAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    },
  })

  // Create some lesson progress for enrollment 1
  const lessons = await prisma.lesson.findMany({
    where: { courseId: course.id },
    take: 1,
  })

  if (lessons.length > 0) {
    await prisma.lessonProgress.create({
      data: {
        enrollmentId: enrollment1.id,
        lessonId: lessons[0].id,
        userId: learner.id,
        status: 'COMPLETED',
        timeSpentSeconds: 1800, // 30 minutes in seconds
        completedAt: new Date(),
      },
    })
  }

  // Create certificate template for course
  const certificate = await prisma.certificate.create({
    data: {
      courseId: course2.id,
      templateHtml: '<div>Certificate of Completion</div>',
      isActive: true,
      expiryMonths: 12,
    },
  })

  // Create user certificate for the completed enrollment
  await prisma.userCertificate.create({
    data: {
      certificateId: certificate.id,
      userId: learner.id,
      enrollmentId: enrollment2.id,
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      verificationCode: `CERT-${Date.now()}`,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log('\n📧 Test Accounts:')
  console.log('Admin: admin@civilabs.com / admin123')
  console.log('Instructor: instructor@civilabs.com / instructor123')
  console.log('Learner: learner@civilabs.com / learner123')
  console.log('\n📚 Courses Created:')
  console.log(`- ${course.title}`)
  console.log(`- ${course2.title}`)
  console.log(`- ${course3.title}`)
  console.log('\n✅ Learner has 2 enrollments and 1 certificate')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
