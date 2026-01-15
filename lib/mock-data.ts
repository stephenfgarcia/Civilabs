/**
 * Mock Data for Development and Testing
 * Centralized mock data used across dashboard pages
 */

import type {
  DashboardStats,
  EnrollmentWithCourse,
  LeaderboardUser,
  CertificateDisplay,
  NotificationDisplay,
  CourseDisplay,
  FAQCategory,
  ContactOption,
} from './types'

// ============================================
// Dashboard Mock Data
// ============================================

export const MOCK_DASHBOARD_STATS: DashboardStats = {
  enrolled: 3,
  inProgress: 2,
  completed: 5,
  certificates: 3,
  learningHours: 24,
  streak: 7,
}

export const MOCK_ENROLLMENTS: EnrollmentWithCourse[] = [
  {
    id: '1',
    courseId: '1',
    userId: 'user-1',
    status: 'ENROLLED',
    enrolledAt: '2024-01-15',
    progressPercentage: 65,
    calculatedProgress: 65,
    course: {
      id: '1',
      title: 'Safety Fundamentals',
      description: 'Construction Safety Basics',
      category: { id: '1', name: 'Safety' },
      instructor: { firstName: 'John', lastName: 'Martinez' },
    },
  },
  {
    id: '2',
    courseId: '2',
    userId: 'user-1',
    status: 'ENROLLED',
    enrolledAt: '2024-02-01',
    progressPercentage: 30,
    calculatedProgress: 30,
    course: {
      id: '2',
      title: 'Equipment Operation',
      description: 'Heavy Machinery Training',
      category: { id: '2', name: 'Equipment' },
      instructor: { firstName: 'Sarah', lastName: 'Chen' },
    },
  },
  {
    id: '3',
    courseId: '3',
    userId: 'user-1',
    status: 'ENROLLED',
    enrolledAt: '2024-03-01',
    progressPercentage: 0,
    calculatedProgress: 0,
    course: {
      id: '3',
      title: 'Blueprint Reading',
      description: 'Technical Drawing Interpretation',
      category: { id: '3', name: 'Technical' },
      instructor: { firstName: 'Mike', lastName: 'Johnson' },
    },
  },
]

// ============================================
// Courses Mock Data
// ============================================

export const MOCK_COURSES: CourseDisplay[] = [
  {
    id: 1,
    title: 'Construction Safety Fundamentals',
    description: 'Essential safety protocols and procedures for construction sites. Learn to identify hazards and implement safety measures.',
    category: 'Safety',
    level: 'Beginner',
    duration: '4 hours',
    students: 245,
    rating: 4.8,
    instructor: 'John Martinez',
  },
  {
    id: 2,
    title: 'Heavy Equipment Operation',
    description: 'Master the operation of heavy construction machinery including excavators, bulldozers, and cranes.',
    category: 'Equipment',
    level: 'Intermediate',
    duration: '12 hours',
    students: 189,
    rating: 4.7,
    instructor: 'Sarah Chen',
  },
  {
    id: 3,
    title: 'Blueprint Reading & Interpretation',
    description: 'Learn to read and interpret construction blueprints, technical drawings, and architectural plans.',
    category: 'Technical',
    level: 'Beginner',
    duration: '6 hours',
    students: 312,
    rating: 4.9,
    instructor: 'Mike Johnson',
  },
  {
    id: 4,
    title: 'Project Management Essentials',
    description: 'Develop project management skills for construction projects including scheduling, budgeting, and team leadership.',
    category: 'Management',
    level: 'Advanced',
    duration: '10 hours',
    students: 156,
    rating: 4.6,
    instructor: 'Lisa Wong',
  },
  {
    id: 5,
    title: 'Quality Control & Inspection',
    description: 'Learn quality control processes and inspection techniques to ensure construction standards are met.',
    category: 'Quality',
    level: 'Intermediate',
    duration: '8 hours',
    students: 201,
    rating: 4.5,
    instructor: 'Robert Davis',
  },
  {
    id: 6,
    title: 'Electrical Systems Installation',
    description: 'Advanced training on electrical systems installation, wiring, and safety protocols for construction sites.',
    category: 'Technical',
    level: 'Advanced',
    duration: '15 hours',
    students: 134,
    rating: 4.8,
    instructor: 'David Lee',
  },
]

// ============================================
// Certificates Mock Data
// ============================================

export const MOCK_CERTIFICATES: CertificateDisplay[] = [
  {
    id: '1',
    title: 'Construction Safety Fundamentals',
    courseName: 'Safety Training Level 1',
    issueDate: '2024-01-15',
    expiryDate: '2026-01-15',
    credentialId: 'CSF-2024-001234',
    score: 98,
    instructor: 'John Martinez',
    status: 'active',
    iconType: 'shield',
    colorGradient: 'from-danger to-red-600',
  },
  {
    id: '2',
    title: 'Heavy Equipment Operation',
    courseName: 'Equipment Operator Certification',
    issueDate: '2024-02-10',
    expiryDate: '2027-02-10',
    credentialId: 'HEO-2024-005678',
    score: 95,
    instructor: 'Sarah Chen',
    status: 'active',
    iconType: 'hardhat',
    colorGradient: 'from-warning to-orange-600',
  },
  {
    id: '3',
    title: 'Electrical Systems Installation',
    courseName: 'Advanced Electrical Training',
    issueDate: '2024-03-05',
    expiryDate: '2025-03-05',
    credentialId: 'ESI-2024-009012',
    score: 92,
    instructor: 'Mike Johnson',
    status: 'expiring_soon',
    iconType: 'zap',
    colorGradient: 'from-secondary to-purple-600',
  },
]

// ============================================
// Leaderboard Mock Data
// ============================================

export const MOCK_LEADERBOARD_USERS: LeaderboardUser[] = [
  {
    id: '1',
    rank: 1,
    firstName: 'Sarah',
    lastName: 'Chen',
    department: 'Engineering',
    points: 2850,
    completedCourses: 12,
    certificates: 8,
    streak: 45,
    badge: 'Master Builder',
  },
  {
    id: '2',
    rank: 2,
    firstName: 'Mike',
    lastName: 'Johnson',
    department: 'Safety',
    points: 2640,
    completedCourses: 10,
    certificates: 7,
    streak: 32,
    badge: 'Expert Learner',
  },
  {
    id: '3',
    rank: 3,
    firstName: 'John',
    lastName: 'Martinez',
    department: 'Operations',
    points: 2520,
    completedCourses: 11,
    certificates: 6,
    streak: 28,
    badge: 'Safety Champion',
  },
  {
    id: '4',
    rank: 4,
    firstName: 'Lisa',
    lastName: 'Wong',
    department: 'Management',
    points: 2380,
    completedCourses: 9,
    certificates: 5,
    streak: 21,
    badge: 'Team Leader',
  },
  {
    id: '5',
    rank: 5,
    firstName: 'Robert',
    lastName: 'Davis',
    department: 'Quality',
    points: 2100,
    completedCourses: 8,
    certificates: 5,
    streak: 18,
    badge: 'Quality Expert',
  },
  {
    id: '6',
    rank: 6,
    firstName: 'Emily',
    lastName: 'Brown',
    department: 'Engineering',
    points: 1950,
    completedCourses: 7,
    certificates: 4,
    streak: 14,
    badge: 'Rising Star',
  },
  {
    id: '7',
    rank: 7,
    firstName: 'David',
    lastName: 'Lee',
    department: 'Technical',
    points: 1800,
    completedCourses: 6,
    certificates: 4,
    streak: 12,
    badge: 'Tech Expert',
  },
  {
    id: '8',
    rank: 8,
    firstName: 'You',
    lastName: '',
    department: 'Training',
    points: 1550,
    completedCourses: 5,
    certificates: 3,
    streak: 7,
    badge: 'Dedicated Learner',
    isCurrentUser: true,
  },
]

// ============================================
// Notifications Mock Data
// ============================================

export const MOCK_NOTIFICATIONS: NotificationDisplay[] = [
  {
    id: '1',
    type: 'certificate',
    title: 'New Certificate Earned!',
    message: 'Congratulations! You have earned the "Construction Safety Fundamentals" certificate.',
    timestamp: '2 hours ago',
    status: 'unread',
    actionUrl: '/certificates',
  },
  {
    id: '2',
    type: 'course',
    title: 'Course Updated',
    message: 'New content has been added to "Equipment Operation" course.',
    timestamp: '5 hours ago',
    status: 'unread',
    actionUrl: '/courses',
  },
  {
    id: '3',
    type: 'achievement',
    title: 'Streak Milestone!',
    message: 'You have maintained a 7-day learning streak. Keep it up!',
    timestamp: '1 day ago',
    status: 'read',
    actionUrl: '/dashboard',
  },
  {
    id: '4',
    type: 'reminder',
    title: 'Course Reminder',
    message: 'You have not completed "Safety Fundamentals". Continue your learning today.',
    timestamp: '1 day ago',
    status: 'read',
    actionUrl: '/my-learning',
  },
  {
    id: '5',
    type: 'system',
    title: 'Maintenance Notice',
    message: 'Scheduled maintenance on Saturday, 2:00 AM - 4:00 AM. System will be unavailable.',
    timestamp: '2 days ago',
    status: 'read',
  },
  {
    id: '6',
    type: 'course',
    title: 'New Course Available',
    message: 'Check out the new "Advanced Scaffolding" course in the catalog.',
    timestamp: '3 days ago',
    status: 'read',
    actionUrl: '/courses',
  },
  {
    id: '7',
    type: 'certificate',
    title: 'Certificate Expiring Soon',
    message: 'Your "First Aid Training" certificate expires in 30 days. Please renew.',
    timestamp: '4 days ago',
    status: 'read',
    actionUrl: '/certificates',
  },
  {
    id: '8',
    type: 'achievement',
    title: 'Course Completed',
    message: 'You have successfully completed "Heavy Machinery Training".',
    timestamp: '5 days ago',
    status: 'read',
    actionUrl: '/my-learning',
  },
]

// ============================================
// Help & FAQ Mock Data
// ============================================

export const MOCK_FAQ_CATEGORIES: FAQCategory[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    icon: 'Book',
    faqs: [
      {
        question: 'How do I enroll in a course?',
        answer: 'Navigate to the Courses page, browse available courses, and click the "ENROLL NOW" button on any course card. You will be automatically enrolled and can start learning immediately.',
      },
      {
        question: 'How do I track my learning progress?',
        answer: 'Visit the "My Learning" page to view all your enrolled courses, track progress percentages, and see your next lessons. You can also check your overall stats on the Dashboard.',
      },
      {
        question: 'What is the difference between courses and certificates?',
        answer: 'Courses are training modules you can enroll in. After successfully completing a course with a passing score, you will earn a certificate that can be viewed and downloaded from the Certificates page.',
      },
    ],
  },
  {
    id: 'courses',
    title: 'Courses & Learning',
    icon: 'Video',
    faqs: [
      {
        question: 'Can I take multiple courses at the same time?',
        answer: 'Yes! You can enroll in as many courses as you want and learn at your own pace. We recommend focusing on 2-3 courses at a time for the best learning experience.',
      },
      {
        question: 'How long do I have access to a course?',
        answer: 'Once enrolled, you have unlimited access to the course materials. You can revisit lessons and review content anytime you need.',
      },
      {
        question: 'What happens if I fail an assessment?',
        answer: 'You can retake assessments as many times as needed. We encourage you to review the course materials before retaking to improve your understanding.',
      },
    ],
  },
  {
    id: 'certificates',
    title: 'Certificates',
    icon: 'FileText',
    faqs: [
      {
        question: 'How do I download my certificate?',
        answer: 'Go to the Certificates page, find your earned certificate, and click the "DOWNLOAD PDF" button. The certificate will be downloaded to your device in PDF format.',
      },
      {
        question: 'Do certificates expire?',
        answer: 'Some certificates have expiry dates (shown on the certificate card). You will receive notifications when a certificate is expiring soon so you can renew your certification.',
      },
      {
        question: 'Can I share my certificates with employers?',
        answer: 'Yes! Use the "SHARE" button on any certificate to share it via email or social media. You can also use the "Verify Credential" link to provide proof of authenticity.',
      },
    ],
  },
  {
    id: 'account',
    title: 'Account & Profile',
    icon: 'HelpCircle',
    faqs: [
      {
        question: 'How do I update my profile information?',
        answer: 'Visit the Profile page and click the "EDIT PROFILE" button. You can update your name, email, department, position, and other details. Remember to click "SAVE" when done.',
      },
      {
        question: 'How is my ranking calculated on the leaderboard?',
        answer: 'Your ranking is based on total points earned from completing courses, assessments, and maintaining learning streaks. Check the Leaderboard page to see your current position.',
      },
      {
        question: 'What are achievement badges?',
        answer: 'Achievement badges are earned by completing specific milestones like finishing your first course, maintaining streaks, or achieving high scores. View all your badges on the Profile page.',
      },
    ],
  },
]

export const MOCK_CONTACT_OPTIONS: ContactOption[] = [
  {
    id: 'email',
    title: 'Email Support',
    description: 'Get help via email within 24 hours',
    icon: 'Mail',
    contact: 'support@civilabs.com',
    colorGradient: 'from-primary to-blue-600',
  },
  {
    id: 'phone',
    title: 'Phone Support',
    description: 'Call us during business hours',
    icon: 'Phone',
    contact: '+1 (555) 123-4567',
    colorGradient: 'from-success to-green-600',
  },
  {
    id: 'chat',
    title: 'Live Chat',
    description: 'Chat with our support team',
    icon: 'MessageCircle',
    contact: 'Available Mon-Fri 9am-5pm',
    colorGradient: 'from-warning to-orange-600',
  },
]

// ============================================
// Achievements Mock Data
// ============================================

export interface AchievementDisplay {
  id: number
  name: string
  description: string
  icon: string
  earned: boolean
  earnedDate?: string
  colorGradient: string
}

export const MOCK_ACHIEVEMENTS: AchievementDisplay[] = [
  {
    id: 1,
    name: 'First Course',
    description: 'Complete your first course',
    icon: 'Award',
    earned: true,
    earnedDate: '2024-01-20',
    colorGradient: 'from-warning to-orange-600',
  },
  {
    id: 2,
    name: 'Safety Expert',
    description: 'Complete all safety courses',
    icon: 'Shield',
    earned: true,
    earnedDate: '2024-02-15',
    colorGradient: 'from-success to-green-600',
  },
  {
    id: 3,
    name: 'Quick Learner',
    description: 'Complete a course in under 1 week',
    icon: 'Zap',
    earned: false,
    colorGradient: 'from-primary to-blue-600',
  },
  {
    id: 4,
    name: 'Top Performer',
    description: 'Score 100% on 5 assessments',
    icon: 'Trophy',
    earned: false,
    colorGradient: 'from-pink-500 to-rose-600',
  },
  {
    id: 5,
    name: 'Dedicated',
    description: 'Maintain a 30-day learning streak',
    icon: 'Target',
    earned: false,
    colorGradient: 'from-secondary to-purple-600',
  },
]
