'use client'

import { useEffect, useRef } from 'react'
import anime from 'animejs'
import { Card } from './card'
import { cn } from '@/lib/utils/cn'
import * as React from 'react'

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number
  hoverScale?: boolean
}

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0,
  hoverScale = true,
  ...props 
}: AnimatedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (cardRef.current) {
      anime({
        targets: cardRef.current,
        opacity: [0, 1],
        translateY: [30, 0],
        scale: [0.95, 1],
        easing: 'easeOutCubic',
        duration: 800,
        delay,
      })
    }
  }, [delay])

  const handleMouseEnter = () => {
    if (hoverScale && cardRef.current) {
      anime({
        targets: cardRef.current,
        scale: 1.03,
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        duration: 300,
        easing: 'easeOutCubic',
      })
    }
  }

  const handleMouseLeave = () => {
    if (hoverScale && cardRef.current) {
      anime({
        targets: cardRef.current,
        scale: 1,
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        duration: 300,
        easing: 'easeOutCubic',
      })
    }
  }

  return (
    <Card
      ref={cardRef}
      className={cn(
        'glass-effect transition-all duration-300',
        className
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </Card>
  )
}
