'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import { useToast, useEntranceAnimation } from '@/lib/hooks'
import { usersService, notificationsService } from '@/lib/services'
import type { User as UserType } from '@/lib/types'
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
  CheckCircle,
  Loader2
} from 'lucide-react'

export default function SettingsPage() {
  const [user, setUser] = useState<UserType | null>(null)
  const [activeTab, setActiveTab] = useState('profile')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [updatingPassword, setUpdatingPassword] = useState(false)
  const [savingNotifications, setSavingNotifications] = useState(false)

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: ''
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const { toast } = useToast()

  // Use entrance animation hook
  useEntranceAnimation({ selector: '.settings-item', staggerDelay: 0.05 }, [activeTab])

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    try {
      const response = await usersService.getCurrentUser()
      const userData = response.data
      setUser(userData ?? null)
      setProfileForm({
        firstName: userData?.firstName || '',
        lastName: userData?.lastName || ''
      })

      // Load notification preferences
      const prefsResponse = await notificationsService.getPreferences()
      const prefs = prefsResponse.data
      if (prefs) {
        setNotifications(prev => ({
          ...prev,
          // Only update fields that exist in the response
          ...(typeof prefs === 'object' ? prefs : {})
        }))
      }
    } catch (error) {
      console.error('Error loading user data:', error)
      // Fallback to localStorage
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsed = JSON.parse(userData)
        setUser(parsed)
        setProfileForm({
          firstName: parsed.firstName || '',
          lastName: parsed.lastName || ''
        })
      }
    }
  }

  const handleSaveProfile = async () => {
    try {
      setSavingProfile(true)
      await usersService.updateProfile(profileForm)

      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      })

      loadUserData()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        variant: 'destructive'
      })
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'Please fill in all password fields',
        variant: 'destructive'
      })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Validation Error',
        description: 'New passwords do not match',
        variant: 'destructive'
      })
      return
    }

    // Comprehensive password validation
    const password = passwordForm.newPassword

    if (password.length < 8) {
      toast({
        title: 'Validation Error',
        description: 'Password must be at least 8 characters long',
        variant: 'destructive'
      })
      return
    }

    if (!/[A-Z]/.test(password)) {
      toast({
        title: 'Validation Error',
        description: 'Password must contain at least one uppercase letter',
        variant: 'destructive'
      })
      return
    }

    if (!/[a-z]/.test(password)) {
      toast({
        title: 'Validation Error',
        description: 'Password must contain at least one lowercase letter',
        variant: 'destructive'
      })
      return
    }

    if (!/[0-9]/.test(password)) {
      toast({
        title: 'Validation Error',
        description: 'Password must contain at least one number',
        variant: 'destructive'
      })
      return
    }

    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      toast({
        title: 'Validation Error',
        description: 'Password must contain at least one special character (!@#$%^&*)',
        variant: 'destructive'
      })
      return
    }

    try {
      setUpdatingPassword(true)

      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update password')
      }

      toast({
        title: 'Success',
        description: 'Password updated successfully'
      })

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update password',
        variant: 'destructive'
      })
    } finally {
      setUpdatingPassword(false)
    }
  }

  const handleSaveNotifications = async () => {
    try {
      setSavingNotifications(true)
      await notificationsService.updatePreferences(notifications as any)

      toast({
        title: 'Success',
        description: 'Notification preferences updated successfully'
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update preferences',
        variant: 'destructive'
      })
    } finally {
      setSavingNotifications(false)
    }
  }

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

  // Helper function to get tab button classes
  const getTabButtonClass = (isActive: boolean, tabColor: string) => {
    if (isActive) {
      switch (tabColor) {
        case 'from-success to-green-600':
          return 'bg-gradient-to-r from-success to-green-600 text-white shadow-lg scale-105'
        case 'from-danger to-red-600':
          return 'bg-gradient-to-r from-danger to-red-600 text-white shadow-lg scale-105'
        case 'from-primary to-blue-600':
          return 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg scale-105'
        case 'from-warning to-orange-600':
          return 'bg-gradient-to-r from-warning to-orange-600 text-white shadow-lg scale-105'
        default:
          return 'bg-gradient-to-r from-primary to-blue-600 text-white shadow-lg scale-105'
      }
    }
    return 'glass-effect border-2 border-warning/30 text-neutral-700 hover:border-warning/60 hover:scale-105'
  }

  // Helper function to get toggle switch background classes
  const getToggleBgClass = (isEnabled: boolean, color: 'primary' | 'success') => {
    if (isEnabled) {
      return color === 'primary' ? 'bg-primary' : 'bg-success'
    }
    return 'bg-neutral-300'
  }

  // Helper function to get toggle knob position classes
  const getToggleKnobClass = (isEnabled: boolean) => {
    return isEnabled
      ? 'absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform translate-x-6'
      : 'absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform'
  }

  const TABS = [
    { id: 'profile', label: 'PROFILE', icon: User, color: 'from-success to-green-600' },
    { id: 'security', label: 'SECURITY', icon: Lock, color: 'from-danger to-red-600' },
    { id: 'notifications', label: 'NOTIFICATIONS', icon: Bell, color: 'from-primary to-blue-600' },
    { id: 'appearance', label: 'APPEARANCE', icon: Palette, color: 'from-warning to-orange-600' }
  ]

  return (
    <div className="space-y-6" role="main" aria-label="Settings">
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
          <div className="hidden md:block" aria-hidden="true">
            <div className="w-16 h-16 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center">
              <SettingsIcon className="text-white" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Card className="settings-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Settings sections">
            {TABS.map(tab => {
              const IconComponent = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`${tab.id}-panel`}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${getTabButtonClass(isActive, tab.color)}`}
                >
                  <IconComponent size={16} aria-hidden="true" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card className="settings-item opacity-0 glass-effect concrete-texture border-4 border-success/40" id="profile-panel" role="tabpanel" aria-labelledby="profile-tab">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-success to-green-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                <User className="text-white" size={20} />
              </div>
              WORKER PROFILE
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="firstName" className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                  <HardHat size={16} className="text-success" aria-hidden="true" />
                  FIRST NAME
                </label>
                <Input
                  id="firstName"
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                  className="h-12 glass-effect border-2 border-success/30 focus:border-success font-medium"
                  aria-required="true"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="lastName" className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                  <HardHat size={16} className="text-success" aria-hidden="true" />
                  LAST NAME
                </label>
                <Input
                  id="lastName"
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                  className="h-12 glass-effect border-2 border-success/30 focus:border-success font-medium"
                  aria-required="true"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                <Mail size={16} className="text-primary" aria-hidden="true" />
                WORKER EMAIL
              </label>
              <Input
                id="email"
                type="email"
                defaultValue={user?.email || ''}
                disabled
                className="h-12 glass-effect border-2 border-neutral-300 bg-neutral-100 font-medium"
                aria-describedby="email-help"
              />
              <p id="email-help" className="text-xs text-neutral-500 font-semibold">Email cannot be changed. Contact site administrator if needed.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-bold text-neutral-700">WORKER ROLE</label>
              <Input
                id="role"
                defaultValue={user?.role || 'LEARNER'}
                disabled
                className="h-12 glass-effect border-2 border-neutral-300 bg-neutral-100 uppercase font-black"
                aria-readonly="true"
              />
            </div>

            <div className="glass-effect border-2 border-success/20 rounded-lg p-6" role="note">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-success flex-shrink-0" size={24} aria-hidden="true" />
                <div>
                  <h3 className="font-black text-neutral-800 mb-1">PROFILE TIP</h3>
                  <p className="text-sm text-neutral-600">
                    Keep your profile information up to date to ensure proper certification records and communication.
                  </p>
                </div>
              </div>
            </div>

            <MagneticButton
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="w-full md:w-auto bg-gradient-to-r from-success to-green-600 text-white font-black flex items-center justify-center gap-2"
            >
              {savingProfile ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {savingProfile ? 'SAVING...' : 'SAVE CHANGES'}
            </MagneticButton>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card className="settings-item opacity-0 glass-effect concrete-texture border-4 border-danger/40" id="security-panel" role="tabpanel" aria-labelledby="security-tab">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-danger to-red-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                <Lock className="text-white" size={20} />
              </div>
              SECURITY SETTINGS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-bold text-neutral-700">CURRENT SECURITY CODE</label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? 'text' : 'password'}
                  placeholder="Enter current password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  className="h-12 glass-effect border-2 border-danger/30 focus:border-danger font-medium pr-12"
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  aria-label={showCurrentPassword ? 'Hide current password' : 'Show current password'}
                >
                  {showCurrentPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-bold text-neutral-700">NEW SECURITY CODE</label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? 'text' : 'password'}
                  placeholder="Enter new password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  className="h-12 glass-effect border-2 border-danger/30 focus:border-danger font-medium pr-12"
                  aria-required="true"
                  aria-describedby="password-requirements"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  aria-label={showNewPassword ? 'Hide new password' : 'Show new password'}
                >
                  {showNewPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </div>
              {passwordForm.newPassword && (
                <div className="mt-3 space-y-2">
                  <div className="text-xs font-semibold text-neutral-600 mb-2">Password Requirements:</div>
                  <div className="space-y-1">
                    <div className={`text-xs flex items-center gap-2 ${passwordForm.newPassword.length >= 8 ? 'text-success' : 'text-neutral-500'}`}>
                      {passwordForm.newPassword.length >= 8 ? '✓' : '○'} At least 8 characters
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${/[A-Z]/.test(passwordForm.newPassword) ? 'text-success' : 'text-neutral-500'}`}>
                      {/[A-Z]/.test(passwordForm.newPassword) ? '✓' : '○'} One uppercase letter
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${/[a-z]/.test(passwordForm.newPassword) ? 'text-success' : 'text-neutral-500'}`}>
                      {/[a-z]/.test(passwordForm.newPassword) ? '✓' : '○'} One lowercase letter
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${/[0-9]/.test(passwordForm.newPassword) ? 'text-success' : 'text-neutral-500'}`}>
                      {/[0-9]/.test(passwordForm.newPassword) ? '✓' : '○'} One number
                    </div>
                    <div className={`text-xs flex items-center gap-2 ${/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword) ? 'text-success' : 'text-neutral-500'}`}>
                      {/[!@#$%^&*(),.?":{}|<>]/.test(passwordForm.newPassword) ? '✓' : '○'} One special character (!@#$%^&*)
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-bold text-neutral-700">CONFIRM NEW SECURITY CODE</label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm new password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  className="h-12 glass-effect border-2 border-danger/30 focus:border-danger font-medium pr-12"
                  aria-required="true"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
                  aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                >
                  {showConfirmPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
                </button>
              </div>
            </div>

            <div className="glass-effect border-l-4 border-warning bg-warning/10 p-4 rounded-lg" id="password-requirements" role="alert">
              <p className="text-sm font-bold text-neutral-700 mb-2">⚠ PASSWORD REQUIREMENTS:</p>
              <ul className="text-sm text-neutral-600 space-y-1 font-semibold">
                <li>• At least 8 characters long</li>
                <li>• Contains uppercase and lowercase letters</li>
                <li>• Contains at least one number</li>
                <li>• Contains at least one special character</li>
              </ul>
            </div>

            <MagneticButton
              onClick={handleUpdatePassword}
              disabled={updatingPassword}
              className="w-full md:w-auto bg-gradient-to-r from-danger to-red-600 text-white font-black flex items-center justify-center gap-2"
            >
              {updatingPassword ? <Loader2 className="animate-spin" size={18} /> : <Lock size={18} />}
              {updatingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </MagneticButton>
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card className="settings-item opacity-0 glass-effect concrete-texture border-4 border-primary/40" id="notifications-panel" role="tabpanel" aria-labelledby="notifications-tab">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                <Bell className="text-white" size={20} />
              </div>
              NOTIFICATION PREFERENCES
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <fieldset>
              <legend className="text-lg font-black text-neutral-800 mb-4 flex items-center gap-2">
                <Mail size={18} className="text-primary" aria-hidden="true" />
                EMAIL NOTIFICATIONS
              </legend>
              <div className="space-y-3" role="group" aria-label="Email notification settings">
                <div className="glass-effect border-2 border-primary/20 rounded-lg p-4 flex items-center justify-between">
                  <div id="email-course-updates-label">
                    <p className="font-bold text-neutral-800">Course Updates</p>
                    <p className="text-sm text-neutral-600">Get notified about new courses and content</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('emailCourseUpdates')}
                    className={`relative w-14 h-8 rounded-full transition-colors ${getToggleBgClass(notifications.emailCourseUpdates, 'primary')}`}
                    role="switch"
                    aria-checked={notifications.emailCourseUpdates}
                    aria-labelledby="email-course-updates-label"
                  >
                    <div className={getToggleKnobClass(notifications.emailCourseUpdates)} />
                  </button>
                </div>

                <div className="glass-effect border-2 border-primary/20 rounded-lg p-4 flex items-center justify-between">
                  <div id="email-certificates-label">
                    <p className="font-bold text-neutral-800">Certificates</p>
                    <p className="text-sm text-neutral-600">Get notified when you earn certificates</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('emailCertificates')}
                    className={`relative w-14 h-8 rounded-full transition-colors ${getToggleBgClass(notifications.emailCertificates, 'primary')}`}
                    role="switch"
                    aria-checked={notifications.emailCertificates}
                    aria-labelledby="email-certificates-label"
                  >
                    <div className={getToggleKnobClass(notifications.emailCertificates)} />
                  </button>
                </div>

                <div className="glass-effect border-2 border-primary/20 rounded-lg p-4 flex items-center justify-between">
                  <div id="email-reminders-label">
                    <p className="font-bold text-neutral-800">Reminders</p>
                    <p className="text-sm text-neutral-600">Get reminded about incomplete courses</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('emailReminders')}
                    className={`relative w-14 h-8 rounded-full transition-colors ${getToggleBgClass(notifications.emailReminders, 'primary')}`}
                    role="switch"
                    aria-checked={notifications.emailReminders}
                    aria-labelledby="email-reminders-label"
                  >
                    <div className={getToggleKnobClass(notifications.emailReminders)} />
                  </button>
                </div>

                <div className="glass-effect border-2 border-primary/20 rounded-lg p-4 flex items-center justify-between">
                  <div id="weekly-digest-label">
                    <p className="font-bold text-neutral-800">Weekly Digest</p>
                    <p className="text-sm text-neutral-600">Receive weekly summary of your progress</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('weeklyDigest')}
                    className={`relative w-14 h-8 rounded-full transition-colors ${getToggleBgClass(notifications.weeklyDigest, 'primary')}`}
                    role="switch"
                    aria-checked={notifications.weeklyDigest}
                    aria-labelledby="weekly-digest-label"
                  >
                    <div className={getToggleKnobClass(notifications.weeklyDigest)} />
                  </button>
                </div>
              </div>
            </fieldset>

            {/* Push Notifications */}
            <fieldset>
              <legend className="text-lg font-black text-neutral-800 mb-4 flex items-center gap-2">
                <Bell size={18} className="text-success" aria-hidden="true" />
                PUSH NOTIFICATIONS
              </legend>
              <div className="space-y-3" role="group" aria-label="Push notification settings">
                <div className="glass-effect border-2 border-success/20 rounded-lg p-4 flex items-center justify-between">
                  <div id="push-course-updates-label">
                    <p className="font-bold text-neutral-800">Course Updates</p>
                    <p className="text-sm text-neutral-600">Instant browser notifications</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('pushCourseUpdates')}
                    className={`relative w-14 h-8 rounded-full transition-colors ${getToggleBgClass(notifications.pushCourseUpdates, 'success')}`}
                    role="switch"
                    aria-checked={notifications.pushCourseUpdates}
                    aria-labelledby="push-course-updates-label"
                  >
                    <div className={getToggleKnobClass(notifications.pushCourseUpdates)} />
                  </button>
                </div>

                <div className="glass-effect border-2 border-success/20 rounded-lg p-4 flex items-center justify-between">
                  <div id="push-certificates-label">
                    <p className="font-bold text-neutral-800">Certificates</p>
                    <p className="text-sm text-neutral-600">Get notified instantly</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('pushCertificates')}
                    className={`relative w-14 h-8 rounded-full transition-colors ${getToggleBgClass(notifications.pushCertificates, 'success')}`}
                    role="switch"
                    aria-checked={notifications.pushCertificates}
                    aria-labelledby="push-certificates-label"
                  >
                    <div className={getToggleKnobClass(notifications.pushCertificates)} />
                  </button>
                </div>

                <div className="glass-effect border-2 border-success/20 rounded-lg p-4 flex items-center justify-between">
                  <div id="push-reminders-label">
                    <p className="font-bold text-neutral-800">Reminders</p>
                    <p className="text-sm text-neutral-600">Browser reminder notifications</p>
                  </div>
                  <button
                    onClick={() => toggleNotification('pushReminders')}
                    className={`relative w-14 h-8 rounded-full transition-colors ${getToggleBgClass(notifications.pushReminders, 'success')}`}
                    role="switch"
                    aria-checked={notifications.pushReminders}
                    aria-labelledby="push-reminders-label"
                  >
                    <div className={getToggleKnobClass(notifications.pushReminders)} />
                  </button>
                </div>
              </div>
            </fieldset>

            <MagneticButton
              onClick={handleSaveNotifications}
              disabled={savingNotifications}
              className="w-full md:w-auto bg-gradient-to-r from-primary to-blue-600 text-white font-black flex items-center justify-center gap-2"
            >
              {savingNotifications ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {savingNotifications ? 'SAVING...' : 'SAVE PREFERENCES'}
            </MagneticButton>
          </CardContent>
        </Card>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <Card className="settings-item opacity-0 glass-effect concrete-texture border-4 border-warning/40" id="appearance-panel" role="tabpanel" aria-labelledby="appearance-tab">
          <CardHeader>
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center" aria-hidden="true">
                <Palette className="text-white" size={20} />
              </div>
              APPEARANCE SETTINGS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <fieldset>
              <legend className="text-lg font-black text-neutral-800 mb-4">THEME SELECTION</legend>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="radiogroup" aria-label="Theme options">
                <div
                  className="glass-effect border-2 border-warning/40 rounded-lg p-6 cursor-pointer hover:border-warning hover:shadow-lg transition-all"
                  role="radio"
                  aria-checked="true"
                  tabIndex={0}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center" aria-hidden="true">
                      <HardHat className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-neutral-800">CONSTRUCTION (Current)</h4>
                      <p className="text-xs text-neutral-600">Bold orange theme</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-warning to-orange-600 rounded-full" aria-hidden="true" />
                </div>

                <div
                  className="glass-effect border-2 border-neutral-300 rounded-lg p-6 cursor-not-allowed opacity-60"
                  role="radio"
                  aria-checked="false"
                  aria-disabled="true"
                  tabIndex={-1}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-neutral-400 rounded-xl flex items-center justify-center" aria-hidden="true">
                      <Palette className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="font-black text-neutral-800">MORE THEMES</h4>
                      <p className="text-xs text-neutral-600">Coming soon</p>
                    </div>
                  </div>
                  <div className="h-2 bg-neutral-300 rounded-full" aria-hidden="true" />
                </div>
              </div>
            </fieldset>

            <div className="glass-effect border-2 border-warning/20 rounded-lg p-6" role="note">
              <div className="flex items-start gap-3">
                <CheckCircle className="text-warning flex-shrink-0" size={24} aria-hidden="true" />
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
