'use client'

import { useEffect, useRef, useState } from 'react'
import anime from 'animejs'

export function ConstructionBackground() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [isLowPower, setIsLowPower] = useState(false)

  useEffect(() => {
    // Detect performance level
    const checkPerformance = () => {
      // Check for reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      // Check hardware concurrency (CPU cores)
      const cores = navigator.hardwareConcurrency || 4
      // Basic performance check
      const isLowEnd = cores < 4 || prefersReducedMotion
      setIsLowPower(isLowEnd)
      return isLowEnd
    }

    const lowPower = checkPerformance()
    if (!canvasRef.current) return

    // Reduce particle count for midrange laptops: 30 -> 12
    const particleCount = lowPower ? 8 : 12
    const particles: HTMLDivElement[] = []

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'construction-particle absolute will-change-transform'

      // Random construction symbols
      const symbols = ['▢', '▣', '○', '□']
      particle.textContent = symbols[Math.floor(Math.random() * symbols.length)]

      particle.style.left = `${Math.random() * 100}%`
      particle.style.top = `${Math.random() * 100}%`
      particle.style.fontSize = `${Math.random() * 15 + 10}px`
      particle.style.opacity = `${Math.random() * 0.2 + 0.1}`
      particle.style.color = `hsl(${Math.random() * 60 + 180}, 70%, 60%)`
      particle.style.pointerEvents = 'none'

      canvasRef.current.appendChild(particle)
      particles.push(particle)
    }

    // Simplified animation for better performance
    if (!lowPower) {
      anime({
        targets: '.construction-particle',
        translateY: [
          { value: () => anime.random(-50, 50), duration: () => anime.random(4000, 7000) },
          { value: () => anime.random(-50, 50), duration: () => anime.random(4000, 7000) },
        ],
        translateX: [
          { value: () => anime.random(-50, 50), duration: () => anime.random(4000, 7000) },
          { value: () => anime.random(-50, 50), duration: () => anime.random(4000, 7000) },
        ],
        opacity: [
          { value: () => anime.random(0.1, 0.3), duration: () => anime.random(3000, 5000) },
          { value: () => anime.random(0.1, 0.3), duration: () => anime.random(3000, 5000) },
        ],
        easing: 'linear',
        loop: true,
        delay: anime.stagger(200),
      })
    } else {
      // CSS-only animation for low power mode
      particles.forEach(p => {
        p.style.animation = `float ${Math.random() * 10 + 10}s ease-in-out infinite`
      })
    }

    return () => {
      particles.forEach(p => p.remove())
    }
  }, [])

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Blueprint grid overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0, 163, 224, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 163, 224, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Diagonal construction lines */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 100px,
            rgba(255, 165, 0, 0.5) 100px,
            rgba(255, 165, 0, 0.5) 102px
          )`,
        }}
      />

      {/* Animated gradient mesh */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] bg-gradient-to-br from-primary/20 via-secondary/20 to-transparent rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-warning/20 via-success/20 to-transparent rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[600px] bg-gradient-to-t from-secondary/20 via-primary/20 to-transparent rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      {/* Particle container */}
      <div ref={canvasRef} className="absolute inset-0" />

      {/* Construction crane silhouette */}
      <div className="absolute bottom-0 right-10 opacity-5">
        <svg width="200" height="400" viewBox="0 0 200 400" fill="currentColor" className="text-neutral-700">
          {/* Crane tower */}
          <rect x="90" y="100" width="20" height="300" />
          {/* Crane arm */}
          <rect x="20" y="95" width="160" height="10" />
          {/* Crane hook line */}
          <line x1="150" y1="105" x2="150" y2="200" stroke="currentColor" strokeWidth="2" />
          {/* Hook */}
          <circle cx="150" cy="205" r="5" />
        </svg>
      </div>
    </div>
  )
}
