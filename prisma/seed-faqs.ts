import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding FAQ data...')

  // Create FAQ categories
  const gettingStartedCategory = await prisma.faqCategory.create({
    data: {
      title: 'Getting Started',
      slug: 'getting-started',
      icon: 'Book',
      order: 1,
      isActive: true,
    },
  })

  const coursesCategory = await prisma.faqCategory.create({
    data: {
      title: 'Courses & Learning',
      slug: 'courses',
      icon: 'Video',
      order: 2,
      isActive: true,
    },
  })

  const certificatesCategory = await prisma.faqCategory.create({
    data: {
      title: 'Certificates',
      slug: 'certificates',
      icon: 'FileText',
      order: 3,
      isActive: true,
    },
  })

  const accountCategory = await prisma.faqCategory.create({
    data: {
      title: 'Account & Profile',
      slug: 'account',
      icon: 'HelpCircle',
      order: 4,
      isActive: true,
    },
  })

  // Create FAQs for Getting Started
  await prisma.faq.createMany({
    data: [
      {
        categoryId: gettingStartedCategory.id,
        question: 'How do I enroll in a course?',
        answer: 'Navigate to the Courses page, browse available courses, and click the "ENROLL NOW" button on any course card. You will be automatically enrolled and can start learning immediately.',
        order: 1,
        isActive: true,
      },
      {
        categoryId: gettingStartedCategory.id,
        question: 'How do I track my learning progress?',
        answer: 'Visit the "My Learning" page to view all your enrolled courses, track progress percentages, and see your next lessons. You can also check your overall stats on the Dashboard.',
        order: 2,
        isActive: true,
      },
      {
        categoryId: gettingStartedCategory.id,
        question: 'What is the difference between courses and certificates?',
        answer: 'Courses are training modules you can enroll in. After successfully completing a course with a passing score, you will earn a certificate that can be viewed and downloaded from the Certificates page.',
        order: 3,
        isActive: true,
      },
    ],
  })

  // Create FAQs for Courses & Learning
  await prisma.faq.createMany({
    data: [
      {
        categoryId: coursesCategory.id,
        question: 'Can I take multiple courses at the same time?',
        answer: 'Yes! You can enroll in as many courses as you want and learn at your own pace. We recommend focusing on 2-3 courses at a time for the best learning experience.',
        order: 1,
        isActive: true,
      },
      {
        categoryId: coursesCategory.id,
        question: 'How long do I have access to a course?',
        answer: 'Once enrolled, you have unlimited access to the course materials. You can revisit lessons and review content anytime you need.',
        order: 2,
        isActive: true,
      },
      {
        categoryId: coursesCategory.id,
        question: 'What happens if I fail an assessment?',
        answer: 'You can retake assessments as many times as needed. We encourage you to review the course materials before retaking to improve your understanding.',
        order: 3,
        isActive: true,
      },
    ],
  })

  // Create FAQs for Certificates
  await prisma.faq.createMany({
    data: [
      {
        categoryId: certificatesCategory.id,
        question: 'How do I download my certificate?',
        answer: 'Go to the Certificates page, find your earned certificate, and click the "DOWNLOAD PDF" button. The certificate will be downloaded to your device in PDF format.',
        order: 1,
        isActive: true,
      },
      {
        categoryId: certificatesCategory.id,
        question: 'Do certificates expire?',
        answer: 'Some certificates have expiry dates (shown on the certificate card). You will receive notifications when a certificate is expiring soon so you can renew your certification.',
        order: 2,
        isActive: true,
      },
      {
        categoryId: certificatesCategory.id,
        question: 'Can I share my certificates with employers?',
        answer: 'Yes! Use the "SHARE" button on any certificate to share it via email or social media. You can also use the "Verify Credential" link to provide proof of authenticity.',
        order: 3,
        isActive: true,
      },
    ],
  })

  // Create FAQs for Account & Profile
  await prisma.faq.createMany({
    data: [
      {
        categoryId: accountCategory.id,
        question: 'How do I update my profile information?',
        answer: 'Visit the Profile page and click the "EDIT PROFILE" button. You can update your name, email, department, position, and other details. Remember to click "SAVE" when done.',
        order: 1,
        isActive: true,
      },
      {
        categoryId: accountCategory.id,
        question: 'How is my ranking calculated on the leaderboard?',
        answer: 'Your ranking is based on total points earned from completing courses, assessments, and maintaining learning streaks. Check the Leaderboard page to see your current position.',
        order: 2,
        isActive: true,
      },
      {
        categoryId: accountCategory.id,
        question: 'What are achievement badges?',
        answer: 'Achievement badges are earned by completing specific milestones like finishing your first course, maintaining streaks, or achieving high scores. View all your badges on the Profile page.',
        order: 3,
        isActive: true,
      },
    ],
  })

  console.log('✅ FAQ data seeded successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding FAQs:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
