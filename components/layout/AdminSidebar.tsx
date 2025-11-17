'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import anime from 'animejs'
import { cn } from '@/lib/utils/cn'
import {
  LayoutDashboard,
  Users,
  BookOpen,
  GraduationCap,
  Award,
  Settings,
  BarChart3,
  FolderTree,
  Shield,
  Bell,
  MessageSquare,
  FileText,
} from 'lucide-react'

const adminNavigationItems = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard, color: 'from-primary to-blue-600' },
  { name: 'Users', href: '/admin/users', icon: Users, color: 'from-secondary to-purple-600' },
  { name: 'Courses', href: '/admin/courses', icon: BookOpen, color: 'from-success to-green-600' },
  { name: 'Departments', href: '/admin/departments', icon: FolderTree, color: 'from-warning to-orange-600' },
  { name: 'Enrollments', href: '/admin/enrollments', icon: GraduationCap, color: 'from-cyan-500 to-blue-500' },
  { name: 'Certificates', href: '/admin/certificates', icon: Award, color: 'from-yellow-500 to-orange-500' },
  { name: 'Reports', href: '/admin/reports', icon: BarChart3, color: 'from-pink-500 to-rose-600' },
  { name: 'Discussions', href: '/admin/discussions', icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
  { name: 'Content', href: '/admin/content', icon: FileText, color: 'from-indigo-500 to-blue-600' },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell, color: 'from-orange-500 to-amber-600' },
  { name: 'Settings', href: '/admin/settings', icon: Settings, color: 'from-teal-500 to-cyan-600' },
]

export function AdminSidebar() {
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
      targets: '.admin-nav-item',
      opacity: [0, 1],
      translateX: [-30, 0],
      delay: anime.stagger(50, { start: 300 }),
      duration: 600,
      easing: 'easeOutCubic',
    })

    // Animate logo
    anime({
      targets: '.admin-sidebar-logo',
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
      {/* Background gradient - darker for admin */}
      <div className="absolute inset-0 bg-gradient-to-b from-danger/10 via-warning/10 to-transparent pointer-events-none"></div>

      <div className="relative z-10 p-6">
        <div className="admin-sidebar-logo opacity-0 flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-danger to-warning rounded-xl flex items-center justify-center shadow-lg">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold gradient-text">Civilabs</h1>
            <p className="text-xs font-black text-danger uppercase">Admin Panel</p>
          </div>
        </div>

        <nav className="space-y-2">
          {adminNavigationItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'admin-nav-item opacity-0 group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300',
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

      {/* Bottom decoration - admin colors */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-danger via-warning to-orange-600"></div>
    </aside>
  )
}
