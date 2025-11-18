/**
 * Instructor Sidebar Component
 * Navigation sidebar for instructor dashboard
 */

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  MessageSquare,
  FileText,
  Award,
  Settings,
  LogOut,
  GraduationCap
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

const navigation = [
  { name: 'Dashboard', href: '/instructor/dashboard', icon: LayoutDashboard },
  { name: 'My Courses', href: '/instructor/my-courses', icon: BookOpen },
  { name: 'Students', href: '/instructor/students', icon: Users },
  { name: 'Analytics', href: '/instructor/analytics', icon: BarChart3 },
  { name: 'Discussions', href: '/instructor/discussions', icon: MessageSquare },
  { name: 'Assignments', href: '/instructor/assignments', icon: FileText },
  { name: 'Certificates', href: '/instructor/certificates', icon: Award },
  { name: 'Settings', href: '/instructor/settings', icon: Settings },
]

export function InstructorSidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 glass-effect border-r-4 border-warning/30 blueprint-grid overflow-y-auto">
      {/* Logo */}
      <div className="p-6 border-b-4 border-warning/30">
        <Link href="/instructor/dashboard" className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center shadow-lg">
            <GraduationCap className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black text-neutral-800">CIVILABS</h1>
            <p className="text-xs font-bold text-warning">Instructor Panel</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-lg font-bold transition-all',
                'hover:bg-warning/10 hover:translate-x-1',
                isActive
                  ? 'bg-gradient-to-r from-warning to-orange-500 text-white shadow-lg'
                  : 'text-neutral-700 hover:text-warning'
              )}
            >
              <Icon size={20} />
              <span>{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t-4 border-warning/30 bg-neutral-50/50">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-full flex items-center justify-center font-black text-white">
            JD
          </div>
          <div className="flex-1">
            <p className="font-black text-sm text-neutral-800">John Doe</p>
            <p className="text-xs text-neutral-600 font-medium">Instructor</p>
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-danger/10 text-danger rounded-lg font-bold hover:bg-danger/20 transition-colors">
          <LogOut size={16} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
