'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import anime from 'animejs'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { HardHat, Building2, Ruler, Users, Award, TrendingUp, Hammer, Shield, Layers } from 'lucide-react'

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)
  const featuresRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Animate hero section with construction theme
    anime.timeline()
      .add({
        targets: '.hero-title',
        opacity: [0, 1],
        translateY: [-100, 0],
        scale: [0.8, 1],
        rotate: [5, 0],
        duration: 1400,
        easing: 'easeOutElastic(1, .7)',
      })
      .add({
        targets: '.hero-subtitle',
        opacity: [0, 1],
        translateY: [30, 0],
        duration: 900,
        easing: 'easeOutCubic',
      }, '-=800')
      .add({
        targets: '.hero-description',
        opacity: [0, 1],
        scale: [0.9, 1],
        duration: 700,
        easing: 'easeOutCubic',
      }, '-=600')
      .add({
        targets: '.hero-buttons',
        opacity: [0, 1],
        translateY: [40, 0],
        scale: [0.8, 1],
        duration: 800,
        easing: 'easeOutElastic(1, .8)',
      }, '-=400')
      .add({
        targets: '.hero-icon',
        opacity: [0, 1],
        rotate: [180, 0],
        scale: [0, 1],
        delay: anime.stagger(100),
        duration: 800,
        easing: 'easeOutElastic(1, .6)',
      }, '-=600')

    // Animate floating orbs with construction colors
    anime({
      targets: '.orb',
      translateY: [
        { value: -30, duration: 3000 },
        { value: 0, duration: 3000 }
      ],
      translateX: [
        { value: 20, duration: 2500 },
        { value: -20, duration: 2500 }
      ],
      scale: [
        { value: 1.15, duration: 3000 },
        { value: 1, duration: 3000 }
      ],
      opacity: [
        { value: 0.9, duration: 3000 },
        { value: 0.6, duration: 3000 }
      ],
      easing: 'easeInOutSine',
      loop: true,
      delay: anime.stagger(600),
    })

    // 3D tilt effect for feature cards
    document.querySelectorAll('.feature-card').forEach((card) => {
      const htmlCard = card as HTMLElement

      htmlCard.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = htmlCard.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top

        const centerX = rect.width / 2
        const centerY = rect.height / 2

        const rotateX = (y - centerY) / 10
        const rotateY = (centerX - x) / 10

        anime({
          targets: htmlCard,
          rotateX: rotateX,
          rotateY: rotateY,
          duration: 300,
          easing: 'easeOutCubic',
        })
      })

      htmlCard.addEventListener('mouseleave', () => {
        anime({
          targets: htmlCard,
          rotateX: 0,
          rotateY: 0,
          duration: 600,
          easing: 'easeOutElastic(1, .6)',
        })
      })
    })

    // Animate feature cards on scroll with stagger
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          anime({
            targets: entry.target,
            opacity: [0, 1],
            translateY: [80, 0],
            rotateX: [45, 0],
            scale: [0.8, 1],
            duration: 1000,
            easing: 'easeOutElastic(1, .8)',
          })
          observer.unobserve(entry.target)
        }
      })
    })

    document.querySelectorAll('.feature-card').forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Construction Blueprint Background */}
      <div className="absolute inset-0 blueprint-grid opacity-20"></div>
      <div className="absolute inset-0 concrete-texture"></div>

      {/* Animated Construction-themed Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="orb absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-warning/40 to-orange-500/40 rounded-full blur-3xl"></div>
        <div className="orb absolute top-40 right-20 w-[500px] h-[500px] bg-gradient-to-r from-primary/35 to-blue-600/35 rounded-full blur-3xl"></div>
        <div className="orb absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-gradient-to-r from-success/30 to-green-600/30 rounded-full blur-3xl"></div>
      </div>

      {/* Construction warning stripes - top and bottom */}
      <div className="absolute top-0 left-0 w-full h-3 warning-stripes opacity-70 z-50"></div>
      <div className="absolute bottom-0 left-0 w-full h-3 warning-stripes opacity-70 z-50"></div>

      {/* Hero Section */}
      <div ref={heroRef} className="relative z-10 container mx-auto px-4 py-16 md:py-28">
        <div className="text-center max-w-6xl mx-auto">
          {/* Construction icons */}
          <div className="flex items-center justify-center gap-8 mb-8">
            <HardHat className="hero-icon text-warning opacity-0" size={72} />
            <Building2 className="hero-icon text-primary opacity-0" size={72} />
            <Ruler className="hero-icon text-success opacity-0" size={72} />
          </div>

          <div className="hero-title opacity-0">
            <h1 className="text-7xl md:text-9xl font-black mb-6 leading-tight">
              <span className="bg-gradient-to-r from-warning via-primary to-success bg-clip-text text-transparent">
                CIVILABS
              </span>
            </h1>
          </div>

          <div className="hero-subtitle opacity-0">
            <p className="text-4xl md:text-5xl mb-8 font-bold">
              <span className="bg-gradient-to-r from-orange-600 via-blue-600 to-green-600 bg-clip-text text-transparent">
                Building the Future of
              </span>
            </p>
            <p className="text-4xl md:text-5xl mb-8 font-bold text-neutral-700">
              Civil Engineering Education
            </p>
          </div>

          <div className="hero-description opacity-0">
            <div className="glass-effect concrete-texture p-8 rounded-3xl max-w-4xl mx-auto mb-12 border-2 border-warning/30">
              <p className="text-xl md:text-2xl text-neutral-700 leading-relaxed font-medium">
                Master structural design, construction management, geotechnical engineering,
                and infrastructure development through our immersive, hands-on learning platform
                built exclusively for aspiring civil engineers.
              </p>
            </div>
          </div>

          <div className="hero-buttons opacity-0 flex gap-6 justify-center flex-wrap">
            <Link href="/register">
              <MagneticButton
                size="lg"
                className="text-xl px-12 py-8 bg-gradient-to-r from-warning via-orange-500 to-warning hover:shadow-[0_0_60px_rgba(255,165,0,0.8)] text-white shadow-2xl font-bold border-2 border-white/30"
              >
                <HardHat className="mr-3" size={28} />
                Start Building Now
              </MagneticButton>
            </Link>
            <Link href="/login">
              <MagneticButton
                size="lg"
                variant="outline"
                className="text-xl px-12 py-8 border-3 border-primary text-primary hover:bg-primary/20 hover:shadow-[0_0_50px_rgba(0,163,224,0.6)] glass-effect font-bold"
              >
                <Building2 className="mr-3" size={28} />
                Enter Construction Site
              </MagneticButton>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid with Construction Theme */}
      <div ref={featuresRef} className="relative z-10 container mx-auto px-4 py-24">
        <div className="text-center mb-20">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-1 bg-gradient-to-r from-transparent to-warning"></div>
            <Hammer className="text-warning" size={48} />
            <div className="w-16 h-1 bg-gradient-to-l from-transparent to-warning"></div>
          </div>
          <h2 className="text-5xl md:text-6xl font-black mb-6">
            <span className="bg-gradient-to-r from-warning via-primary to-success bg-clip-text text-transparent">
              Construction-Grade Features
            </span>
          </h2>
          <p className="text-2xl text-neutral-600 font-semibold">
            Built to Engineering Standards
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10 max-w-7xl mx-auto">
          {/* Feature 1: Structural Learning */}
          <div className="feature-card opacity-0 group tilt-3d">
            <div className="glass-effect concrete-texture rounded-3xl p-10 h-full hover:shadow-2xl transition-all duration-500 border-3 border-transparent hover:border-warning/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-warning/10 rotate-45 transform translate-x-10 -translate-y-10"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-warning to-orange-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                <Layers className="text-white" size={40} />
              </div>
              <h3 className="text-3xl font-black mb-4 text-neutral-800">Structural Learning</h3>
              <p className="text-neutral-600 leading-relaxed text-lg">
                From beam analysis to foundation design - master every layer of structural engineering with interactive 3D models and real-world case studies.
              </p>
              <div className="mt-6 h-2 bg-gradient-to-r from-warning to-orange-600 rounded-full w-1/2"></div>
            </div>
          </div>

          {/* Feature 2: Project Management */}
          <div className="feature-card opacity-0 group tilt-3d">
            <div className="glass-effect concrete-texture rounded-3xl p-10 h-full hover:shadow-2xl transition-all duration-500 border-3 border-transparent hover:border-primary/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rotate-45 transform translate-x-10 -translate-y-10"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                <TrendingUp className="text-white" size={40} />
              </div>
              <h3 className="text-3xl font-black mb-4 text-neutral-800">Project Analytics</h3>
              <p className="text-neutral-600 leading-relaxed text-lg">
                Track progress like a construction timeline. Monitor learning milestones, completion rates, and skill development with powerful analytics.
              </p>
              <div className="mt-6 h-2 bg-gradient-to-r from-primary to-blue-600 rounded-full w-1/2"></div>
            </div>
          </div>

          {/* Feature 3: Safety & Certification */}
          <div className="feature-card opacity-0 group tilt-3d">
            <div className="glass-effect concrete-texture rounded-3xl p-10 h-full hover:shadow-2xl transition-all duration-500 border-3 border-transparent hover:border-success/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-success/10 rotate-45 transform translate-x-10 -translate-y-10"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-success to-green-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                <Shield className="text-white" size={40} />
              </div>
              <h3 className="text-3xl font-black mb-4 text-neutral-800">Safety Certified</h3>
              <p className="text-neutral-600 leading-relaxed text-lg">
                Earn industry-recognized certifications. Each completion meets professional engineering education standards and safety protocols.
              </p>
              <div className="mt-6 h-2 bg-gradient-to-r from-success to-green-600 rounded-full w-1/2"></div>
            </div>
          </div>

          {/* Feature 4: Team Collaboration */}
          <div className="feature-card opacity-0 group tilt-3d">
            <div className="glass-effect concrete-texture rounded-3xl p-10 h-full hover:shadow-2xl transition-all duration-500 border-3 border-transparent hover:border-purple-500/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rotate-45 transform translate-x-10 -translate-y-10"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                <Users className="text-white" size={40} />
              </div>
              <h3 className="text-3xl font-black mb-4 text-neutral-800">Crew Collaboration</h3>
              <p className="text-neutral-600 leading-relaxed text-lg">
                Work together like a construction crew. Collaborate on projects, share blueprints, and learn from experienced engineers.
              </p>
              <div className="mt-6 h-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full w-1/2"></div>
            </div>
          </div>

          {/* Feature 5: Professional Recognition */}
          <div className="feature-card opacity-0 group tilt-3d">
            <div className="glass-effect concrete-texture rounded-3xl p-10 h-full hover:shadow-2xl transition-all duration-500 border-3 border-transparent hover:border-indigo-500/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/10 rotate-45 transform translate-x-10 -translate-y-10"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                <Award className="text-white" size={40} />
              </div>
              <h3 className="text-3xl font-black mb-4 text-neutral-800">Awards & Badges</h3>
              <p className="text-neutral-600 leading-relaxed text-lg">
                Collect achievements as you build your portfolio. Showcase your completed projects and earned credentials to future employers.
              </p>
              <div className="mt-6 h-2 bg-gradient-to-r from-indigo-500 to-blue-700 rounded-full w-1/2"></div>
            </div>
          </div>

          {/* Feature 6: Site Performance */}
          <div className="feature-card opacity-0 group tilt-3d">
            <div className="glass-effect concrete-texture rounded-3xl p-10 h-full hover:shadow-2xl transition-all duration-500 border-3 border-transparent hover:border-rose-500/60 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/10 rotate-45 transform translate-x-10 -translate-y-10"></div>
              <div className="w-20 h-20 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 shadow-lg">
                <Hammer className="text-white" size={40} />
              </div>
              <h3 className="text-3xl font-black mb-4 text-neutral-800">Built for Performance</h3>
              <p className="text-neutral-600 leading-relaxed text-lg">
                Engineered with cutting-edge technology for maximum efficiency. Fast, reliable, and built to handle the toughest engineering concepts.
              </p>
              <div className="mt-6 h-2 bg-gradient-to-r from-rose-500 to-red-600 rounded-full w-1/2"></div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section - Construction Blueprint Style */}
      <div className="relative z-10 container mx-auto px-4 py-28 mb-20">
        <div className="glass-effect concrete-texture rounded-[3rem] p-16 md:p-20 text-center max-w-5xl mx-auto border-4 border-warning/40 relative overflow-hidden shadow-2xl">
          {/* Blueprint corner markers */}
          <div className="absolute top-4 left-4 w-16 h-16 border-t-4 border-l-4 border-warning/50"></div>
          <div className="absolute top-4 right-4 w-16 h-16 border-t-4 border-r-4 border-warning/50"></div>
          <div className="absolute bottom-4 left-4 w-16 h-16 border-b-4 border-l-4 border-warning/50"></div>
          <div className="absolute bottom-4 right-4 w-16 h-16 border-b-4 border-r-4 border-warning/50"></div>

          <div className="flex items-center justify-center gap-4 mb-8">
            <Building2 className="text-warning" size={64} />
          </div>

          <h2 className="text-5xl md:text-7xl font-black mb-8">
            <span className="bg-gradient-to-r from-warning via-primary to-success bg-clip-text text-transparent">
              Ready to Build Your Future?
            </span>
          </h2>
          <p className="text-2xl text-neutral-700 mb-12 max-w-3xl mx-auto font-semibold leading-relaxed">
            Join thousands of civil engineering students who are building their careers
            with Civilabs. Start your journey today - no credit card required.
          </p>
          <Link href="/register">
            <MagneticButton
              size="lg"
              className="text-2xl px-16 py-10 bg-gradient-to-r from-warning via-primary to-success hover:shadow-[0_0_80px_rgba(255,165,0,1)] text-white shadow-2xl font-black"
            >
              <HardHat className="mr-4" size={32} />
              Start Construction
            </MagneticButton>
          </Link>
        </div>
      </div>
    </div>
  )
}
