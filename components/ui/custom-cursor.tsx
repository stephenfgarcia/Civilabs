'use client'

import { useEffect, useState, useRef } from 'react'

export function CustomCursor() {
  const [isHovering, setIsHovering] = useState(false)
  const [isLowPower, setIsLowPower] = useState(false)
  const cursorRef = useRef<HTMLDivElement>(null)
  const dotRef = useRef<HTMLDivElement>(null)
  const rafIdRef = useRef<number>(0)

  useEffect(() => {
    // Check for reduced motion preference or low-end device
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const cores = navigator.hardwareConcurrency || 4
    setIsLowPower(cores < 4 || prefersReducedMotion)

    let lastX = 0
    let lastY = 0

    const updateCursorPosition = () => {
      if (cursorRef.current && dotRef.current) {
        // Use CSS transforms for GPU acceleration
        cursorRef.current.style.transform = `translate3d(${lastX}px, ${lastY}px, 0) translate(-50%, -50%)`
        dotRef.current.style.transform = `translate3d(${lastX}px, ${lastY}px, 0) translate(-50%, -50%)`
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      lastX = e.clientX
      lastY = e.clientY

      // Use requestAnimationFrame for smooth updates
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
      rafIdRef.current = requestAnimationFrame(updateCursorPosition)

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement
      const isInteractive = target.closest('button, a, [role="button"], input, textarea, select')
      setIsHovering(!!isInteractive)
    }

    const handleMouseEnter = () => {
      if (cursorRef.current && dotRef.current) {
        cursorRef.current.style.opacity = '1'
        dotRef.current.style.opacity = '1'
      }
    }

    const handleMouseLeave = () => {
      if (cursorRef.current && dotRef.current) {
        cursorRef.current.style.opacity = '0'
        dotRef.current.style.opacity = '0'
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  // Disable custom cursor on low-power devices
  if (isLowPower) {
    return null
  }

  return (
    <>
      {/* Main cursor ring */}
      <div
        ref={cursorRef}
        className={`fixed w-10 h-10 border-2 rounded-full pointer-events-none z-[9999] will-change-transform transition-all duration-200 ${
          isHovering
            ? 'border-warning bg-warning/10 scale-150'
            : 'border-primary/50 bg-primary/5'
        }`}
        style={{
          left: 0,
          top: 0,
          mixBlendMode: 'difference',
        }}
      >
        {/* Construction crosshair */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={`w-px h-full bg-current transition-opacity ${isHovering ? 'opacity-100' : 'opacity-50'}`} />
          <div className={`h-px w-full bg-current absolute transition-opacity ${isHovering ? 'opacity-100' : 'opacity-50'}`} />
        </div>
      </div>

      {/* Cursor dot */}
      <div
        ref={dotRef}
        className={`fixed w-1.5 h-1.5 rounded-full pointer-events-none z-[9999] will-change-transform transition-all duration-100 ${
          isHovering ? 'bg-warning scale-150' : 'bg-primary'
        }`}
        style={{
          left: 0,
          top: 0,
        }}
      />
    </>
  )
}
