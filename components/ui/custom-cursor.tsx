'use client'

import { useEffect, useState } from 'react'
import anime from 'animejs'

export function CustomCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const cursor = document.getElementById('custom-cursor')
    const cursorDot = document.getElementById('cursor-dot')

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })

      anime({
        targets: cursor,
        left: e.clientX,
        top: e.clientY,
        duration: 300,
        easing: 'easeOutCubic',
      })

      anime({
        targets: cursorDot,
        left: e.clientX,
        top: e.clientY,
        duration: 50,
        easing: 'linear',
      })

      // Check if hovering over interactive elements
      const target = e.target as HTMLElement
      const isInteractive = target.closest('button, a, [role="button"], input, textarea, select')
      setIsHovering(!!isInteractive)
    }

    const handleMouseEnter = () => {
      if (cursor && cursorDot) {
        cursor.style.opacity = '1'
        cursorDot.style.opacity = '1'
      }
    }

    const handleMouseLeave = () => {
      if (cursor && cursorDot) {
        cursor.style.opacity = '0'
        cursorDot.style.opacity = '0'
      }
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  return (
    <>
      {/* Main cursor ring */}
      <div
        id="custom-cursor"
        className={`fixed w-10 h-10 border-2 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ${
          isHovering
            ? 'border-warning bg-warning/10 scale-150 backdrop-blur-sm'
            : 'border-primary/50 bg-primary/5'
        }`}
        style={{
          left: position.x,
          top: position.y,
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
        id="cursor-dot"
        className={`fixed w-1.5 h-1.5 rounded-full pointer-events-none z-[9999] -translate-x-1/2 -translate-y-1/2 transition-all ${
          isHovering ? 'bg-warning scale-150' : 'bg-primary'
        }`}
        style={{
          left: position.x,
          top: position.y,
        }}
      />
    </>
  )
}
