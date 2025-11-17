import { useEffect, useRef } from 'react'
import anime from 'animejs'

export function useAnime(options: anime.AnimeParams, dependencies: any[] = []) {
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (elementRef.current) {
      anime({
        targets: elementRef.current,
        ...options,
      })
    }
  }, dependencies)

  return elementRef
}

export function useFadeIn(delay = 0, duration = 800) {
  return useAnime({
    opacity: [0, 1],
    translateY: [20, 0],
    easing: 'easeOutCubic',
    duration,
    delay,
  })
}

export function useSlideIn(direction: 'left' | 'right' | 'top' | 'bottom' = 'left', delay = 0) {
  const translateProp = direction === 'left' || direction === 'right' ? 'translateX' : 'translateY'
  const startValue = direction === 'left' || direction === 'top' ? -50 : 50

  return useAnime({
    opacity: [0, 1],
    [translateProp]: [startValue, 0],
    easing: 'easeOutExpo',
    duration: 1000,
    delay,
  })
}

export function useScaleIn(delay = 0) {
  return useAnime({
    scale: [0.8, 1],
    opacity: [0, 1],
    easing: 'easeOutElastic(1, .6)',
    duration: 1200,
    delay,
  })
}

export function useBounceIn(delay = 0) {
  return useAnime({
    scale: [0, 1],
    opacity: [0, 1],
    easing: 'easeOutBounce',
    duration: 1000,
    delay,
  })
}
