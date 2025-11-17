'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Palette,
  HardHat,
  Mail,
  Save,
  Eye,
  EyeOff,
  CheckCircle
} from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  useEffect(() => {
    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.settings-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.4s ease-out forwards ${index * 0.05}s`
    })

    // Load user data
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  // Notification settings state
  const [notifications, setNotifications] = useState({
    emailCourseUpdates: true,
    emailCertificates: true,
    emailReminders: true,
    pushCourseUpdates: false,
    pushCertificates: true,
    pushReminders: false,
    weeklyDigest: true,
    marketingEmails: false
  })

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const TABS = [
    { id: 'profile', label: 'PROFILE', icon: User, color: 'from-success to-green-600' },
    { id: 'security', label: 'SECURITY', icon: Lock, color: 'from-danger to-red-600' },
    { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell, color: 'from-primary to-blue-600' },
    { id: 'appearance', label: 'APPEARANCE', icon: Palette, color: 'from-warning to-orange-600' }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="settings-item opacity-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-warning via-primary to-success bg-clip-text text-transparent">
              SETTINGS
            </h1>
            <p className="text-neutral-600 font-semibold mt-1">
              Configure your account preferences
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center">
              <SettingsIcon className="text-white" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card className="settings-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {TABS.map(tab => {
              const IconComponent = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    isActive
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                      : 'glass-effect border-2 border-warning/30 text-neutral-700 hover:border-warning/60 hover:scale-105'
                  }`}
                >
                  <IconComponent size={16} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card className="settings-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-success to-green-600 rounded-lg flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              WORKER PROFILE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                  <HardHat size={16} className="text-success" />
                  FIRST NAME
                </label>
                <Input
                  defaultValue={user?.firstName || ''}
                  className="h-12 glass-effect border-2 border-success/30 focus:border-success font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                  <HardHat size={16} className="text-success" />
                  LAST NAME
                </label>
                <Input
                  defaultValue={user?.lastName || ''}
                  className="h-12 glass-effect border-2 border-success/30 focus:border-success font-medium"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                <Mail size={16} className="text-primary" />
                WORKER EMAIL
              </label>
              <Input
                type="email"
                defaultValue={user?.email || ''}
                disabled
                className="h-12 glass-effect border-2 border-neutral-300 bg-neutral-100 font-medium"
              />
              <p className="text-xs text-neutral-500 font-semibold">Email cannot be changed. Contact site administrator if needed.</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">WORKER ROLE</label>
              <Input
                defaultValue={user?.role || 'LEARNER'}
                disabled
                className="h-12 glass-effect border-2 border-neutral-300 bg-neutral-100 uppercase font-black"
              />
            </div>

            <div className="glass-effect border-2 border-success/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-success flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-black text-neutral-800 mb-1">PROFILE TIP</h3>
                  <p className="text-sm text-neutral-600">
                    Keep your profile information up to date to ensure proper certification records and communication.
                  </p>
                </div>
              </div>
            </div>

            <MagneticButton className="w-full md:w-auto bg-gradient-to-r from-success to-green-600 text-white font-black flex items-center justify-center gap-2">
              <Save size={18} />
              SAVE CHANGES
            </MagneticButton>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card className="settings-item opacity-0 glass-effect concrete-texture border-4 border-danger/40">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-danger to-red-600 rounded-lg flex items-center justify-center">
                <Lock className="text-white" size={20} />
              </div>
              SECURITY SETTINGS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">CURRENT SECURITY CODE</label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  className="h-12 glass-effect border-2 border-danger/30 focus:border-danger font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                >
                  {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">NEW SECURITY CODE</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  className="h-12 glass-effect border-2 border-danger/30 focus:border-danger font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">CONFIRM NEW SECURITY CODE</label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  className="h-12 glass-effect border-2 border-danger/30 focus:border-danger font-medium pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <div className="glass-effect border-l-4 border-warning bg-warning/10 p-4 rounded-lg">
              <p className="text-sm font-bold text-neutral-700 mb-2">⚠ PASSWORD REQUIREMENTS:</p>
              <ul className="text-sm text-neutral-600 space-y-1 font-semibold">
                <li>• At least 8 characters long</li>
                <li>• Contains uppercase and lowercase letters</li>
                <li>• Contains at least one number</li>
                <li>• Contains at least one special character</li>
              </ul>
            </div>

            <MagneticButton className="w-full md:w-auto bg-gradient-to-r from-danger to-red-600 text-white font-black flex items-center justify-center gap-2">
              <Lock size={18} />
              UPDATE PASSWORD
            </MagneticButton>
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card className="settings-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <Bell className="text-white" size={20} />
              </div>
              NOTIFICATION PREFERENCES
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div>
              <h3 className="text-lg font-black text-neutral-800 mb-4 flex items-center gap-2">
                <Mail size={18} className="text-primary" />
                EMAIL NOTIFICATIONS
              </h3>
              <div className="space-y-3">
                <div className="glass-effect border-2 border-primary/20 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-neutral-800">Course Updates</p>
                    <p className="text-sm text-neutral-600">Get notified about new courses and content</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('emailCourseUpdates')}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      notifications.emailCourseUpdates ? 'bg-primary' : 'bg-neutral-300'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      notifications.emailCourseUpdates ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </div>

                <div className="glass-effect border-2 border-primary/20 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-neutral-800">Certificates</p>
                    <p className="text-sm text-neutral-600">Get notified when you earn certificates</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('emailCertificates')}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      notifications.emailCertificates ? 'bg-primary' : 'bg-neutral-300'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      notifications.emailCertificates ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </div>

                <div className="glass-effect border-2 border-primary/20 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-neutral-800">Reminders</p>
                    <p className="text-sm text-neutral-600">Get reminded about incomplete courses</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('emailReminders')}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      notifications.emailReminders ? 'bg-primary' : 'bg-neutral-300'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      notifications.emailReminders ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </div>

                <div className="glass-effect border-2 border-primary/20 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-neutral-800">Weekly Digest</p>
                    <p className="text-sm text-neutral-600">Receive weekly summary of your progress</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('weeklyDigest')}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      notifications.weeklyDigest ? 'bg-primary' : 'bg-neutral-300'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      notifications.weeklyDigest ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Push Notifications */}
            <div>
              <h3 className="text-lg font-black text-neutral-800 mb-4 flex items-center gap-2">
                <Bell size={18} className="text-success" />
                PUSH NOTIFICATIONS
              </h3>
              <div className="space-y-3">
                <div className="glass-effect border-2 border-success/20 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-neutral-800">Course Updates</p>
                    <p className="text-sm text-neutral-600">Instant browser notifications</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('pushCourseUpdates')}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      notifications.pushCourseUpdates ? 'bg-success' : 'bg-neutral-300'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      notifications.pushCourseUpdates ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </div>

                <div className="glass-effect border-2 border-success/20 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-neutral-800">Certificates</p>
                    <p className="text-sm text-neutral-600">Get notified instantly</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('pushCertificates')}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      notifications.pushCertificates ? 'bg-success' : 'bg-neutral-300'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      notifications.pushCertificates ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </div>

                <div className="glass-effect border-2 border-success/20 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-neutral-800">Reminders</p>
                    <p className="text-sm text-neutral-600">Browser reminder notifications</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('pushReminders')}
                    className={`relative w-14 h-8 rounded-full transition-colors ${
                      notifications.pushReminders ? 'bg-success' : 'bg-neutral-300'
                    }`}
                  >
                    <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                      notifications.pushReminders ? 'translate-x-6' : ''
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            <MagneticButton className="w-full md:w-auto bg-gradient-to-r from-primary to-blue-600 text-white font-black flex items-center justify-center gap-2">
              <Save size={18} />
              SAVE PREFERENCES
            </MagneticButton>
          </CardContent>
        </Card>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <Card className="settings-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center">
                <Palette className="text-white" size={20} />
              </div>
              APPEARANCE SETTINGS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-lg font-black text-neutral-800 mb-4">THEME SELECTION</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-effect border-2 border-warning/40 rounded-lg p-6 cursor-pointer hover:border-warning hover:shadow-lg transition-all">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center">
                      <HardHat className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-neutral-800">CONSTRUCTION (Current)</h4>
                      <p className="text-xs text-neutral-600">Bold orange theme</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-warning to-orange-600 rounded-full" />
                </div>

                <div className="glass-effect border-2 border-neutral-300 rounded-lg p-6 cursor-not-allowed opacity-60">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-neutral-400 rounded-xl flex items-center justify-center">
                      <Palette className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-neutral-800">MORE THEMES</h4>
                      <p className="text-xs text-neutral-600">Coming soon</p>
                    </div>
                  </div>
                  <div className="h-2 bg-neutral-300 rounded-full" />
                </div>
              </div>
            </div>

            <div className="glass-effect border-2 border-warning/20 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-warning flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-black text-neutral-800 mb-1">CUSTOMIZATION COMING SOON</h3>
                  <p className="text-sm text-neutral-600">
                    More appearance options including dark mode, custom colors, and layout preferences will be available soon.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
