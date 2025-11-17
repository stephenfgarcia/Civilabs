'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import anime from 'animejs'
import { Bell, Search, LogOut, Settings, User as UserIcon } from 'lucide-react'
import { Input } from '@/components/ui/input'

export function Header() {
  const router = useRouter()
  const headerRef = useRef<HTMLElement>(null)
  const [user, setUser] = useState<any>(null)
  const [showProfile, setShowProfile] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }

    // Animate header entrance
    if (headerRef.current) {
      anime({
        targets: headerRef.current,
        translateY: [-100, 0],
        opacity: [0, 1],
        duration: 800,
        easing: 'easeOutCubic',
      })
    }

    // Animate header elements
    anime({
      targets: '.header-item',
      opacity: [0, 1],
      scale: [0.8, 1],
      delay: anime.stagger(100, { start: 400 }),
      duration: 600,
      easing: 'easeOutCubic',
    })
  }, [])

  const handleLogout = () => {
    anime({
      targets: headerRef.current,
      opacity: [1, 0],
      scale: [1, 0.95],
      duration: 300,
      easing: 'easeInCubic',
      complete: () => {
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        router.push('/login')
      }
    })
  }

  return (
    <header 
      ref={headerRef}
      className="glass-effect border-b border-white/20 px-6 py-4 sticky top-0 z-50 opacity-0"
    >
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-purple-600"></div>
      
      <div className="flex items-center justify-between">
        {/* Search */}
        <div className="flex-1 max-w-xl header-item opacity-0">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors" size={20} />
            <Input
              type="search"
              placeholder="Search courses, lessons..."
              className="pl-10 h-12 glass-effect border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4 ml-6">
          {/* Notifications */}
          <button className="header-item opacity-0 relative p-3 hover:bg-white/50 rounded-xl transition-all duration-300 group">
            <Bell size={20} className="text-neutral-600 group-hover:text-primary transition-colors" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-danger rounded-full animate-pulse"></span>
          </button>

          {/* Profile Dropdown */}
          <div className="header-item opacity-0 relative">
            <button
              onClick={() => setShowProfile(!showProfile)}
              className="flex items-center gap-3 p-2 pr-4 hover:bg-white/50 rounded-xl transition-all duration-300 group"
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-white font-semibold shadow-lg group-hover:scale-110 transition-transform">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-neutral-800">{user?.firstName} {user?.lastName}</p>
                <p className="text-xs text-neutral-500 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {showProfile && (
              <div className="absolute right-0 mt-2 w-56 glass-effect rounded-xl shadow-2xl border border-white/20 py-2 z-50">
                <Link href="/profile" className="flex items-center gap-3 px-4 py-2 hover:bg-white/50 transition-colors">
                  <UserIcon size={16} className="text-neutral-600" />
                  <span className="text-sm">Profile</span>
                </Link>
                <Link href="/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-white/50 transition-colors">
                  <Settings size={16} className="text-neutral-600" />
                  <span className="text-sm">Settings</span>
                </Link>
                <div className="border-t border-neutral-200 my-2"></div>
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2 hover:bg-danger/10 transition-colors w-full text-left text-danger"
                >
                  <LogOut size={16} />
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
