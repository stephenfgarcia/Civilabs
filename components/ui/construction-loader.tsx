'use client'

import { useEffect, useRef } from 'react'
import anime from 'animejs'

interface ConstructionLoaderProps {
  text?: string
}

export function ConstructionLoader({ text = 'Building...' }: ConstructionLoaderProps) {
  const loaderRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate construction crane
    anime({
      targets: '.crane-arm',
      rotate: [0, 180, 0],
      duration: 3000,
      easing: 'easeInOutSine',
      loop: true,
    })

    // Animate building blocks
    anime({
      targets: '.building-block',
      translateY: [
        { value: -10, duration: 500 },
        { value: 0, duration: 500 },
      ],
      opacity: [
        { value: 0.5, duration: 500 },
        { value: 1, duration: 500 },
      ],
      delay: anime.stagger(200),
      loop: true,
      easing: 'easeInOutCubic',
    })

    // Animate progress bar
    anime({
      targets: '.progress-fill',
      width: ['0%', '100%'],
      duration: 2000,
      easing: 'linear',
      loop: true,
    })

  }, [])

  return (
    <div ref={loaderRef} className="flex flex-col items-center justify-center gap-8">
      {/* Construction crane loader */}
      <div className="relative w-32 h-32">
        {/* Crane base */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-2 h-20 bg-gradient-to-b from-primary to-primary-dark rounded-t-sm" />

        {/* Rotating crane arm */}
        <div className="crane-arm absolute bottom-20 left-1/2 -translate-x-1/2 origin-bottom">
          <div className="w-24 h-2 bg-gradient-to-r from-warning to-warning-dark rounded-full" />
          {/* Hook */}
          <div className="absolute right-0 top-2 w-0.5 h-8 bg-neutral-600">
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-warning rounded-full animate-pulse" />
          </div>
        </div>

        {/* Building blocks being constructed */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-1">
          <div className="building-block w-6 h-6 bg-secondary rounded-sm opacity-50" />
          <div className="building-block w-6 h-6 bg-primary rounded-sm opacity-50" />
          <div className="building-block w-6 h-6 bg-warning rounded-sm opacity-50" />
        </div>
      </div>

      {/* Progress bar with construction theme */}
      <div className="w-64 space-y-2">
        <div className="text-center text-sm font-semibold text-neutral-700 gradient-text">
          {text}
        </div>
        <div className="relative h-3 bg-neutral-200 rounded-full overflow-hidden border-2 border-primary/20">
          {/* Blueprint pattern background */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 163, 224, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 163, 224, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '8px 8px',
            }}
          />
          {/* Progress fill */}
          <div className="progress-fill absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-secondary to-warning rounded-full" />

          {/* Diagonal construction stripes */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: `repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255, 255, 255, 0.5) 10px,
                rgba(255, 255, 255, 0.5) 12px
              )`,
            }}
          />
        </div>

        {/* Construction safety message */}
        <div className="text-xs text-center text-neutral-500 flex items-center justify-center gap-2">
          <span className="text-warning">⚠</span>
          <span>Construction in Progress</span>
          <span className="text-warning">⚠</span>
        </div>
      </div>
    </div>
  )
}

// Skeleton loader for construction-themed content
export function ConstructionSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="flex gap-4">
        <div className="w-20 h-20 bg-gradient-to-br from-neutral-200 to-neutral-300 rounded-lg relative overflow-hidden">
          {/* Blueprint grid */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: `
                linear-gradient(rgba(0, 163, 224, 0.2) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0, 163, 224, 0.2) 1px, transparent 1px)
              `,
              backgroundSize: '10px 10px',
            }}
          />
        </div>
        <div className="flex-1 space-y-3">
          <div className="h-4 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-full w-3/4 shimmer" />
          <div className="h-3 bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-full w-1/2 shimmer" />
        </div>
      </div>
    </div>
  )
}
