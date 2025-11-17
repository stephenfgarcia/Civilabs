'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import anime from 'animejs'

export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    setIsTransitioning(true)

    // Liquid transition effect
    const layers = document.querySelectorAll('.transition-layer')

    anime.timeline({
      complete: () => {
        setIsTransitioning(false)
      }
    })
      .add({
        targets: layers,
        scaleY: [0, 1],
        translateY: ['100%', '0%'],
        duration: 800,
        delay: anime.stagger(100),
        easing: 'cubicBezier(0.76, 0, 0.24, 1)',
      })
      .add({
        targets: layers,
        scaleY: [1, 0],
        translateY: ['0%', '-100%'],
        duration: 800,
        delay: anime.stagger(100),
        easing: 'cubicBezier(0.76, 0, 0.24, 1)',
      }, '+=200')

  }, [pathname])

  return (
    <>
      {/* Liquid transition layers */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[9998] pointer-events-none flex">
          <div className="transition-layer flex-1 bg-primary origin-bottom" />
          <div className="transition-layer flex-1 bg-secondary origin-bottom" />
          <div className="transition-layer flex-1 bg-warning origin-bottom" />
          <div className="transition-layer flex-1 bg-success origin-bottom" />
          <div className="transition-layer flex-1 bg-primary origin-bottom" />
        </div>
      )}

      {/* Page content */}
      <div className={isTransitioning ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
        {children}
      </div>
    </>
  )
}
