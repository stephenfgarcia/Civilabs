'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import anime from 'animejs'
import { AnimatedButton } from '@/components/ui/animated-button'
import { BookOpen, Award, TrendingUp, Zap, Users, Target } from 'lucide-react'

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate hero section
    anime.timeline()
      .add({
        targets: '.hero-title',
        opacity: [0, 1],
        translateY: [-50, 0],
        scale: [0.8, 1],
        duration: 1200,
        easing: 'easeOutElastic(1, .8)',
      })
      .add({
        targets: '.hero-subtitle',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 800,
        easing: 'easeOutCubic',
      }, '-=600')
      .add({
        targets: '.hero-description',
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 600,
        easing: 'easeOutCubic',
      }, '-=400')
      .add({
        targets: '.hero-buttons',
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 600,
        easing: 'easeOutCubic',
      }, '-=300')

    // Animate floating orbs
    anime({
      targets: '.orb',
      translateY: [
        { value: -20, duration: 2000 },
        { value: 0, duration: 2000 }
      ],
      scale: [
        { value: 1.1, duration: 2000 },
        { value: 1, duration: 2000 }
      ],
      opacity: [
        { value: 0.8, duration: 2000 },
        { value: 0.6, duration: 2000 }
      ],
      easing: 'easeInOutSine',
      loop: true,
      delay: anime.stagger(400),
    })

    // Animate feature cards on scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          anime({
            targets: entry.target,
            opacity: [0, 1],
            translateY: [50, 0],
            scale: [0.9, 1],
            duration: 800,
            easing: 'easeOutCubic',
            delay: anime.stagger(100),
          })
        }
      })
    })

    document.querySelectorAll('.feature-card').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb absolute top-20 left-10 w-72 h-72 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-full blur-3xl"></div>
        <div className="orb absolute top-40 right-20 w-96 h-96 bg-gradient-to-r from-secondary/30 to-purple-500/30 rounded-full blur-3xl"></div>
        <div className="orb absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-r from-pink-500/30 to-orange-500/30 rounded-full blur-3xl"></div>
      </div>

      {/* Hero Section */}
      <div ref={heroRef} className="relative z-10 container mx-auto px-4 py-20 md:py-32">
        <div className="text-center max-w-5xl mx-auto">
          <div className="hero-title opacity-0">
            <h1 className="text-6xl md:text-8xl font-bold mb-6 gradient-text leading-tight">
              Absorb LMS
            </h1>
          </div>

          <div className="hero-subtitle opacity-0">
            <p className="text-3xl md:text-4xl mb-6 text-transparent bg-clip-text bg-gradient-to-r from-neutral-700 via-neutral-600 to-neutral-700 font-semibold">
              Transform Learning Into An Experience
            </p>
          </div>

          <div className="hero-description opacity-0">
            <p className="text-xl md:text-2xl mb-12 text-neutral-600 max-w-3xl mx-auto leading-relaxed">
              Empower your organization with an immersive, next-generation learning platform 
              that makes education engaging, trackable, and transformative.
            </p>
          </div>

          <div className="hero-buttons opacity-0 flex gap-4 justify-center flex-wrap">
            <Link href="/register">
              <AnimatedButton size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary-dark hover:to-secondary-dark text-white shadow-2xl">
                <Zap className="mr-2" />
                Get Started Free
              </AnimatedButton>
            </Link>
            <Link href="/login">
              <AnimatedButton size="lg" variant="outline" className="text-lg px-8 py-6 border-2 border-primary text-primary hover:bg-primary/10">
                Sign In
              </AnimatedButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div ref={featuresRef} className="relative z-10 container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            Why Choose Absorb LMS?
          </h2>
          <p className="text-xl text-neutral-600">
            Everything you need to deliver world-class online learning
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="feature-card opacity-0 group">
            <div className="glass-effect rounded-2xl p-8 h-full hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-primary/50">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-neutral-800">Rich Course Content</h3>
              <p className="text-neutral-600 leading-relaxed">
                Create engaging courses with videos, documents, quizzes, and interactive content that captivates learners.
              </p>
            </div>
          </div>

          <div className="feature-card opacity-0 group">
            <div className="glass-effect rounded-2xl p-8 h-full hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-secondary/50">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-neutral-800">Advanced Analytics</h3>
              <p className="text-neutral-600 leading-relaxed">
                Track learner progress in real-time with comprehensive analytics and beautiful data visualizations.
              </p>
            </div>
          </div>

          <div className="feature-card opacity-0 group">
            <div className="glass-effect rounded-2xl p-8 h-full hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-success/50">
              <div className="w-16 h-16 bg-gradient-to-br from-success to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Award className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-neutral-800">Smart Certificates</h3>
              <p className="text-neutral-600 leading-relaxed">
                Automatically generate and issue beautiful, verifiable certificates upon course completion.
              </p>
            </div>
          </div>

          <div className="feature-card opacity-0 group">
            <div className="glass-effect rounded-2xl p-8 h-full hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-warning/50">
              <div className="w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Users className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-neutral-800">Team Collaboration</h3>
              <p className="text-neutral-600 leading-relaxed">
                Foster collaboration with discussion forums, group projects, and peer-to-peer learning.
              </p>
            </div>
          </div>

          <div className="feature-card opacity-0 group">
            <div className="glass-effect rounded-2xl p-8 h-full hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-pink-500/50">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-neutral-800">Gamification</h3>
              <p className="text-neutral-600 leading-relaxed">
                Boost engagement with badges, leaderboards, and achievement systems that motivate learners.
              </p>
            </div>
          </div>

          <div className="feature-card opacity-0 group">
            <div className="glass-effect rounded-2xl p-8 h-full hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-indigo-500/50">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="text-white" size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-neutral-800">Lightning Fast</h3>
              <p className="text-neutral-600 leading-relaxed">
                Experience blazing-fast performance with our optimized platform built on modern technology.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative z-10 container mx-auto px-4 py-20 mb-20">
        <div className="glass-effect rounded-3xl p-12 md:p-16 text-center max-w-4xl mx-auto border-2 border-primary/30">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 gradient-text">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Join thousands of organizations already using Absorb LMS to deliver exceptional learning experiences.
          </p>
          <Link href="/register">
            <AnimatedButton size="lg" className="text-xl px-12 py-8 bg-gradient-to-r from-primary via-secondary to-purple-600 hover:shadow-2xl text-white">
              Start Your Free Trial
            </AnimatedButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
