/**
 * useEntranceAnimation Hook
 * Provides consistent CSS entrance animations for dashboard components
 */

import { useEffect, useCallback, useRef } from 'react'

export interface EntranceAnimationOptions {
  /**
   * CSS selector for elements to animate
   * @default '.animate-item'
   */
  selector?: string

  /**
   * Delay between each element's animation (in seconds)
   * @default 0.05
   */
  staggerDelay?: number

  /**
   * Duration of each animation (in seconds)
   * @default 0.5
   */
  duration?: number

  /**
   * CSS easing function
   * @default 'ease-out'
   */
  easing?: string

  /**
   * Animation type
   * @default 'fadeInUp'
   */
  animation?: 'fadeInUp' | 'fadeIn' | 'slideInLeft' | 'slideInRight' | 'scaleIn'

  /**
   * Whether animation is enabled
   * @default true
   */
  enabled?: boolean
}

/**
 * Custom hook for applying entrance animations to elements
 * Replaces the repeated useEffect pattern across dashboard pages
 *
 * @example
 * // Basic usage
 * useEntranceAnimation({ selector: '.dashboard-item' })
 *
 * @example
 * // With custom options
 * useEntranceAnimation({
 *   selector: '.notification-item',
 *   staggerDelay: 0.08,
 *   duration: 0.4
 * })
 *
 * @example
 * // Trigger on dependency change
 * useEntranceAnimation({ selector: '.item' }, [filter])
 */
export function useEntranceAnimation(
  options: EntranceAnimationOptions = {},
  dependencies: React.DependencyList = []
): void {
  const {
    selector = '.animate-item',
    staggerDelay = 0.05,
    duration = 0.5,
    easing = 'ease-out',
    animation = 'fadeInUp',
    enabled = true,
  } = options

  // Track if we've already animated to prevent double animations
  const hasAnimated = useRef(false)

  useEffect(() => {
    if (!enabled) return

    // Use requestAnimationFrame to ensure DOM is ready
    const animationFrame = requestAnimationFrame(() => {
      const elements = document.querySelectorAll(selector)

      elements.forEach((el, index) => {
        const htmlEl = el as HTMLElement
        // Set initial opacity to 0 if not already set
        if (htmlEl.style.opacity !== '1') {
          htmlEl.style.opacity = '0'
        }
        // Apply the animation with staggered delay
        htmlEl.style.animation = `${animation} ${duration}s ${easing} forwards ${index * staggerDelay}s`
      })

      hasAnimated.current = true
    })

    return () => {
      cancelAnimationFrame(animationFrame)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, staggerDelay, duration, easing, animation, enabled, ...dependencies])
}

/**
 * Hook that returns a trigger function for manual animation control
 * Useful when you need to animate after data loads
 *
 * @example
 * const triggerAnimation = useEntranceAnimationTrigger('.item')
 *
 * useEffect(() => {
 *   if (data) {
 *     triggerAnimation()
 *   }
 * }, [data])
 */
export function useEntranceAnimationTrigger(
  options: EntranceAnimationOptions = {}
): () => void {
  const {
    selector = '.animate-item',
    staggerDelay = 0.05,
    duration = 0.5,
    easing = 'ease-out',
    animation = 'fadeInUp',
  } = options

  const trigger = useCallback(() => {
    requestAnimationFrame(() => {
      const elements = document.querySelectorAll(selector)

      elements.forEach((el, index) => {
        const htmlEl = el as HTMLElement
        // Reset animation
        htmlEl.style.animation = 'none'
        htmlEl.style.opacity = '0'

        // Force reflow
        void htmlEl.offsetHeight

        // Apply animation
        htmlEl.style.animation = `${animation} ${duration}s ${easing} forwards ${index * staggerDelay}s`
      })
    })
  }, [selector, staggerDelay, duration, easing, animation])

  return trigger
}

/**
 * Component class names for common animation patterns
 */
export const ANIMATION_CLASSES = {
  dashboard: 'dashboard-item opacity-0',
  certificates: 'certificates-item opacity-0',
  leaderboard: 'leaderboard-item opacity-0',
  notifications: 'notification-item opacity-0',
  discussions: 'discussion-item opacity-0',
  settings: 'settings-item opacity-0',
  help: 'help-item opacity-0',
  profile: 'profile-item opacity-0',
  courses: 'courses-item opacity-0',
} as const

/**
 * Preset configurations for different page types
 */
export const ANIMATION_PRESETS = {
  dashboard: {
    selector: '.dashboard-item',
    staggerDelay: 0.1,
    duration: 0.5,
  },
  list: {
    selector: '.list-item',
    staggerDelay: 0.05,
    duration: 0.4,
  },
  cards: {
    selector: '.card-item',
    staggerDelay: 0.08,
    duration: 0.5,
  },
  fast: {
    staggerDelay: 0.03,
    duration: 0.3,
  },
} as const

export default useEntranceAnimation
