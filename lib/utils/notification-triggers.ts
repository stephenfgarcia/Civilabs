/**
 * Notification Triggers
 * Server-side utility functions to create notifications based on events
 * These should be called from API routes when specific events occur
 */

import { prisma } from './prisma'

export class NotificationTriggers {
  /**
   * Trigger: User enrolls in course
   */
  static async onEnrollment(userId: string, courseTitle: string, courseId: string) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: 'enrollment',
          title: 'Enrollment Successful',
          message: `You have been enrolled in ${courseTitle}`,
          linkUrl: `/courses/${courseId}`,
        },
      })
    } catch (error) {
      console.error('Error creating enrollment notification:', error)
    }
  }

  /**
   * Trigger: User completes course
   */
  static async onCourseCompletion(userId: string, courseTitle: string, courseId: string) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: 'achievement',
          title: 'Course Completed!',
          message: `Congratulations! You have completed ${courseTitle}`,
          linkUrl: `/courses/${courseId}`,
        },
      })
    } catch (error) {
      console.error('Error creating course completion notification:', error)
    }
  }

  /**
   * Trigger: User completes lesson
   */
  static async onLessonCompletion(userId: string, lessonTitle: string, courseId: string) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: 'lesson',
          title: 'Lesson Completed',
          message: `You have completed: ${lessonTitle}`,
          linkUrl: `/courses/${courseId}`,
        },
      })
    } catch (error) {
      console.error('Error creating lesson completion notification:', error)
    }
  }

  /**
   * Trigger: User passes quiz
   */
  static async onQuizPass(userId: string, quizTitle: string, score: number, courseId: string) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: 'success',
          title: 'Quiz Passed!',
          message: `You passed "${quizTitle}" with ${score}%`,
          linkUrl: `/courses/${courseId}`,
        },
      })
    } catch (error) {
      console.error('Error creating quiz pass notification:', error)
    }
  }

  /**
   * Trigger: User fails quiz
   */
  static async onQuizFail(userId: string, quizTitle: string, score: number, attemptsLeft: number, courseId: string) {
    try {
      const message = attemptsLeft > 0
        ? `You scored ${score}% on "${quizTitle}". You have ${attemptsLeft} attempt(s) remaining.`
        : `You scored ${score}% on "${quizTitle}". No attempts remaining.`

      await prisma.notification.create({
        data: {
          userId,
          type: 'warning',
          title: 'Quiz Not Passed',
          message,
          linkUrl: `/courses/${courseId}`,
        },
      })
    } catch (error) {
      console.error('Error creating quiz fail notification:', error)
    }
  }

  /**
   * Trigger: Certificate issued
   */
  static async onCertificateIssued(userId: string, courseTitle: string, certificateId: string) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: 'certificate',
          title: 'Certificate Issued',
          message: `Your certificate for ${courseTitle} is now available`,
          linkUrl: `/certificates/${certificateId}`,
        },
      })
    } catch (error) {
      console.error('Error creating certificate notification:', error)
    }
  }

  /**
   * Trigger: Course assignment by admin/manager
   */
  static async onCourseAssignment(userId: string, courseTitle: string, assignedBy: string, courseId: string) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: 'enrollment',
          title: 'Course Assigned',
          message: `You have been assigned to ${courseTitle} by ${assignedBy}`,
          linkUrl: `/courses/${courseId}`,
        },
      })
    } catch (error) {
      console.error('Error creating course assignment notification:', error)
    }
  }

  /**
   * Trigger: Course due date reminder
   */
  static async onCourseDueDateReminder(userId: string, courseTitle: string, daysUntilDue: number, courseId: string) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: 'reminder',
          title: 'Course Due Date Reminder',
          message: `${courseTitle} is due in ${daysUntilDue} day(s)`,
          linkUrl: `/courses/${courseId}`,
        },
      })
    } catch (error) {
      console.error('Error creating due date reminder notification:', error)
    }
  }

  /**
   * Trigger: New lesson published in enrolled course
   */
  static async onNewLessonPublished(userIds: string[], lessonTitle: string, courseTitle: string, courseId: string) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        type: 'course',
        title: 'New Lesson Available',
        message: `A new lesson "${lessonTitle}" is now available in ${courseTitle}`,
        linkUrl: `/courses/${courseId}`,
      }))

      await prisma.notification.createMany({
        data: notifications,
      })
    } catch (error) {
      console.error('Error creating new lesson notifications:', error)
    }
  }

  /**
   * Trigger: Badge earned
   */
  static async onBadgeEarned(userId: string, badgeName: string, badgeId: string) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: 'achievement',
          title: 'Badge Earned!',
          message: `You earned the "${badgeName}" badge`,
          linkUrl: `/profile/badges`,
        },
      })
    } catch (error) {
      console.error('Error creating badge notification:', error)
    }
  }

  /**
   * Trigger: Level up (points/gamification)
   */
  static async onLevelUp(userId: string, newLevel: number) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: 'achievement',
          title: 'Level Up!',
          message: `Congratulations! You reached level ${newLevel}`,
          linkUrl: '/profile',
        },
      })
    } catch (error) {
      console.error('Error creating level up notification:', error)
    }
  }

  /**
   * Trigger: Instructor feedback on assignment
   */
  static async onInstructorFeedback(userId: string, lessonTitle: string, courseId: string) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: 'info',
          title: 'New Feedback Available',
          message: `Your instructor has provided feedback on "${lessonTitle}"`,
          linkUrl: `/courses/${courseId}`,
        },
      })
    } catch (error) {
      console.error('Error creating feedback notification:', error)
    }
  }

  /**
   * Trigger: Course published (notify enrolled users)
   */
  static async onCoursePublished(userIds: string[], courseTitle: string, courseId: string) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        type: 'course',
        title: 'Course Now Available',
        message: `${courseTitle} is now published and available`,
        linkUrl: `/courses/${courseId}`,
      }))

      await prisma.notification.createMany({
        data: notifications,
      })
    } catch (error) {
      console.error('Error creating course published notifications:', error)
    }
  }

  /**
   * Trigger: Enrollment expiring soon
   */
  static async onEnrollmentExpiring(userId: string, courseTitle: string, daysUntilExpiry: number, courseId: string) {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type: 'warning',
          title: 'Enrollment Expiring Soon',
          message: `Your enrollment in ${courseTitle} expires in ${daysUntilExpiry} day(s)`,
          linkUrl: `/courses/${courseId}`,
        },
      })
    } catch (error) {
      console.error('Error creating enrollment expiry notification:', error)
    }
  }

  /**
   * Trigger: New announcement in course
   */
  static async onCourseAnnouncement(userIds: string[], courseTitle: string, announcementTitle: string, courseId: string) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        type: 'announcement',
        title: 'New Course Announcement',
        message: `${announcementTitle} - ${courseTitle}`,
        linkUrl: `/courses/${courseId}`,
      }))

      await prisma.notification.createMany({
        data: notifications,
      })
    } catch (error) {
      console.error('Error creating announcement notifications:', error)
    }
  }

  /**
   * Helper: Get all enrolled user IDs for a course
   */
  static async getEnrolledUserIds(courseId: string): Promise<string[]> {
    try {
      const enrollments = await prisma.enrollment.findMany({
        where: {
          courseId,
          status: {
            in: ['ENROLLED', 'IN_PROGRESS'],
          },
        },
        select: {
          userId: true,
        },
      })

      return enrollments.map(e => e.userId)
    } catch (error) {
      console.error('Error fetching enrolled users:', error)
      return []
    }
  }

  /**
   * Helper: Batch create notifications for multiple users
   */
  static async createBulkNotifications(
    userIds: string[],
    type: string,
    title: string,
    message: string,
    linkUrl?: string
  ) {
    try {
      const notifications = userIds.map(userId => ({
        userId,
        type,
        title,
        message,
        linkUrl,
      }))

      await prisma.notification.createMany({
        data: notifications,
      })
    } catch (error) {
      console.error('Error creating bulk notifications:', error)
    }
  }
}

export default NotificationTriggers
