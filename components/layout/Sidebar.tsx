'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import anime from 'animejs'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  Trophy,
  User,
  Bell,
  HelpCircle,
  Sparkles,
  Search,
  MessageSquare,
  Medal,
} from 'lucide-react'

const navigationItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'from-primary to-blue-600' },
  { name: 'My Learning', href: '/my-learning', icon: GraduationCap, color: 'from-secondary to-purple-600' },
  { name: 'Course Catalog', href: '/courses', icon: BookOpen, color: 'from-success to-green-600' },
  { name: 'Search', href: '/search', icon: Search, color: 'from-cyan-500 to-blue-500' },
  { name: 'Discussions', href: '/discussions', icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
  { name: 'Badges', href: '/badges', icon: Medal, color: 'from-yellow-500 to-orange-500' },
  { name: 'Certificates', href: '/certificates', icon: Award, color: 'from-warning to-orange-600' },
  { name: 'Leaderboard', href: '/leaderboard', icon: Trophy, color: 'from-pink-500 to-rose-600' },
  { name: 'Notifications', href: '/notifications', icon: Bell, color: 'from-orange-500 to-amber-600' },
  { name: 'Profile', href: '/profile', icon: User, color: 'from-indigo-500 to-blue-600' },
  { name: 'Help', href: '/help', icon: HelpCircle, color: 'from-teal-500 to-cyan-600' },
]

export function Sidebar() {
  const pathname = usePathname()
  const sidebarRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Animate sidebar entrance
    anime({
      targets: sidebarRef.current,
      translateX: [-300, 0],
      opacity: [0, 1],
      duration: 800,
      easing: 'easeOutCubic',
    })

    // Animate nav items
    anime({
      targets: '.nav-item',
      opacity: [0, 1],
      translateX: [-30, 0],
      delay: anime.stagger(50, { start: 300 }),
      duration: 600,
      easing: 'easeOutCubic',
    })

    // Animate logo
    anime({
      targets: '.sidebar-logo',
      scale: [0, 1],
      rotate: [-180, 0],
      opacity: [0, 1],
      duration: 1000,
      easing: 'easeOutElastic(1, .6)',
    })
  }, [])

  return (
    <aside 
      ref={sidebarRef}
      className="w-64 glass-effect border-r border-white/20 min-h-screen relative overflow-hidden opacity-0"
    >
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-secondary/5 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 p-6">
        <div className="sidebar-logo opacity-0 flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-lg">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold gradient-text">Civilabs</h1>
        </div>

        <nav className="space-y-2">
          {navigationItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'nav-item opacity-0 group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300',
                  isActive
                    ? 'bg-gradient-to-r ' + item.color + ' text-white shadow-lg scale-105'
                    : 'text-neutral-700 hover:bg-white/50 hover:scale-105'
                )}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r opacity-20 rounded-xl blur-xl" 
                       style={{ background: `linear-gradient(to right, var(--tw-gradient-stops))` }}
                  ></div>
                )}
                
                <div className={cn(
                  'relative z-10 flex items-center justify-center w-8 h-8 rounded-lg transition-transform duration-300',
                  isActive ? 'bg-white/20' : 'group-hover:scale-110'
                )}>
                  <Icon size={20} className={isActive ? 'text-white' : 'text-neutral-600'} />
                </div>
                
                <span className="relative z-10">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-purple-600"></div>
    </aside>
  )
}
