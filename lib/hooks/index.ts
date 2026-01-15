/**
 * Hooks Index
 * Central export point for all custom React hooks
 */

// Course hooks
export {
  useCourses,
  useCourse,
  useCourseProgress,
  useLesson,
} from './use-courses'

// User hooks
export {
  useCurrentUser,
  useBadges,
  useAchievements,
  useLeaderboard,
} from './use-user'

// Discussion hooks
export {
  useDiscussions,
  useDiscussion,
  useReplies,
} from './use-discussions'

// Notification hooks
export {
  useNotifications,
  useNotificationPreferences,
  useUnreadCount,
} from './use-notifications'

// Toast hook
export { useToast } from './use-toast'

// Debounce hook
export { useDebounce, useDebouncedCallback, useDebouncedState } from './use-debounce'

// Real-time messaging hooks
export { useMessageStream } from './useMessageStream'
export { useWebSocket } from './useWebSocket'

// Animation hooks
export {
  useEntranceAnimation,
  useEntranceAnimationTrigger,
  ANIMATION_CLASSES,
  ANIMATION_PRESETS,
} from './useEntranceAnimation'
export type { EntranceAnimationOptions } from './useEntranceAnimation'
