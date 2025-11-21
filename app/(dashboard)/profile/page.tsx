'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { User, Mail, Building2, Briefcase, Phone, MapPin, Calendar, Award, Edit2, Save, X, Camera, Shield, Trophy, Target, Zap, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import { usersService } from '@/lib/services'

// Icon mapping for achievements/badges
const ACHIEVEMENT_ICONS: Record<string, any> = {
  'First Course': Award,
  'Safety Expert': Shield,
  'Quick Learner': Zap,
  'Top Performer': Trophy,
  'Dedicated': Target,
  'Award': Award,
  'Shield': Shield,
  'Zap': Zap,
  'Trophy': Trophy,
  'Target': Target
}

const ACHIEVEMENT_COLORS: Record<string, string> = {
  'First Course': 'from-success to-green-600',
  'Safety Expert': 'from-danger to-red-600',
  'Quick Learner': 'from-warning to-orange-600',
  'Top Performer': 'from-secondary to-purple-600',
  'Dedicated': 'from-primary to-blue-600',
  'default': 'from-primary to-blue-600'
}

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [achievements, setAchievements] = useState<any[]>([])
  const [badges, setBadges] = useState<any[]>([])
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    department: '',
    position: '',
    phone: '',
    location: ''
  })

  useEffect(() => {
    fetchProfileData()

    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.profile-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.4s ease-out forwards ${index * 0.05}s`
    })
  }, [])

  const fetchProfileData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch user profile
      const userResponse = await usersService.getCurrentUser()
      if (userResponse.status < 200 || userResponse.status >= 300) {
        throw new Error(userResponse.error || 'Failed to fetch user profile')
      }

      const userData = userResponse.data
      if (!userData) {
        throw new Error('User data not found')
      }

      setUser(userData)
      const userDataAny = userData as any
      setFormData({
        firstName: userDataAny.firstName || '',
        lastName: userDataAny.lastName || '',
        email: userDataAny.email || '',
        department: typeof userDataAny.department === 'string' ? userDataAny.department : (userDataAny.department?.name || ''),
        position: userDataAny.position || '',
        phone: userDataAny.phone || '',
        location: userDataAny.location || ''
      })

      // Fetch achievements and badges
      const achievementsResponse = await usersService.getUserAchievements()
      const badgesResponse = await usersService.getUserBadges()

      if (achievementsResponse.status >= 200 && achievementsResponse.status < 300 && achievementsResponse.data) {
        setAchievements(achievementsResponse.data)
      }

      if (badgesResponse.status >= 200 && badgesResponse.status < 300 && badgesResponse.data) {
        setBadges(badgesResponse.data)
      }
    } catch (err) {
      console.error('Error fetching profile data:', err)
      setError(err instanceof Error ? err.message : 'Failed to load profile data')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      // Update profile via API
      const response = await usersService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        location: formData.location
      })

      if (response.status < 200 || response.status >= 300) {
        throw new Error(response.error || 'Failed to update profile')
      }

      // Refresh profile data
      await fetchProfileData()
      setIsEditing(false)
    } catch (err) {
      console.error('Error updating profile:', err)
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset form to current user data
    if (user) {
      const userAny = user as any
      setFormData({
        firstName: userAny.firstName || '',
        lastName: userAny.lastName || '',
        email: userAny.email || '',
        department: typeof userAny.department === 'string' ? userAny.department : (userAny.department?.name || ''),
        position: userAny.position || '',
        phone: userAny.phone || '',
        location: userAny.location || ''
      })
    }
    setIsEditing(false)
    setError(null)
    setAvatarFile(null)
    setAvatarPreview(null)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB')
      return
    }

    setAvatarFile(file)
    setError(null)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile) return

    try {
      setUploadingAvatar(true)
      setError(null)

      const formData = new FormData()
      formData.append('avatar', avatarFile)

      const response = await fetch('/api/users/avatar', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to upload avatar')
      }

      // Refresh profile data to show new avatar
      await fetchProfileData()
      setAvatarFile(null)
      setAvatarPreview(null)
    } catch (err) {
      console.error('Avatar upload error:', err)
      setError(err instanceof Error ? err.message : 'Failed to upload avatar')
    } finally {
      setUploadingAvatar(false)
    }
  }

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="animate-spin h-12 w-12 mx-auto text-warning mb-4" />
          <p className="text-lg font-bold text-neutral-700">Loading your profile...</p>
        </div>
      </div>
    )
  }

  // Combine achievements and badges for display
  const allAchievements = [
    ...achievements.map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      icon: ACHIEVEMENT_ICONS[a.title] || Award,
      color: ACHIEVEMENT_COLORS[a.title] || ACHIEVEMENT_COLORS['default'],
      earned: true,
      date: new Date(a.earnedDate).toLocaleDateString()
    })),
    ...badges.map(b => ({
      id: `badge-${b.id}`,
      title: b.name,
      description: b.description,
      icon: ACHIEVEMENT_ICONS[b.icon] || Award,
      color: ACHIEVEMENT_COLORS[b.name] || ACHIEVEMENT_COLORS['default'],
      earned: !!b.earnedDate,
      date: b.earnedDate ? new Date(b.earnedDate).toLocaleDateString() : null
    }))
  ]

  const earnedAchievements = allAchievements.filter(a => a.earned)
  const lockedAchievements = allAchievements.filter(a => !a.earned)

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {error && (
        <Card className="glass-effect concrete-texture border-4 border-red-500/40">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="text-red-500" size={24} />
              <div>
                <p className="font-bold text-red-600">Error</p>
                <p className="text-sm text-neutral-700">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Page Header */}
      <div className="profile-item opacity-0">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-primary via-warning to-success bg-clip-text text-transparent">
              MY PROFILE
            </h1>
            <p className="text-neutral-600 font-semibold mt-1">
              Manage your account and view achievements
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
              <User className="text-white" size={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="profile-item opacity-0 glass-effect concrete-texture border-4 border-primary/40 relative overflow-hidden">
        {/* Accent Bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-warning to-success"></div>

        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-black flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
                <User className="text-white" size={20} />
              </div>
              PERSONAL INFORMATION
            </CardTitle>
            {!isEditing ? (
              <MagneticButton
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-warning to-orange-600 text-white font-black flex items-center gap-2"
              >
                <Edit2 size={16} />
                EDIT PROFILE
              </MagneticButton>
            ) : (
              <div className="flex gap-2">
                <MagneticButton
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-gradient-to-r from-success to-green-600 text-white font-black flex items-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      SAVING...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      SAVE
                    </>
                  )}
                </MagneticButton>
                <MagneticButton
                  onClick={handleCancel}
                  disabled={saving}
                  className="bg-gradient-to-r from-neutral-400 to-neutral-600 text-white font-black flex items-center gap-2 disabled:opacity-50"
                >
                  <X size={16} />
                  CANCEL
                </MagneticButton>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Avatar Section */}
            <div className="lg:col-span-4">
              <div className="flex flex-col items-center">
                <div className="relative group">
                  <div className="w-48 h-48 bg-gradient-to-br from-warning to-orange-600 rounded-2xl flex items-center justify-center overflow-hidden border-4 border-warning/40">
                    {avatarPreview || user?.avatarUrl ? (
                      <Image
                        src={avatarPreview || user.avatarUrl}
                        alt="Avatar"
                        width={192}
                        height={192}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="text-white" size={96} />
                    )}
                  </div>
                  {isEditing && (
                    <>
                      <input
                        type="file"
                        id="avatar-upload"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform cursor-pointer"
                      >
                        <Camera className="text-white" size={20} />
                      </label>
                    </>
                  )}
                </div>
                {avatarFile && (
                  <div className="mt-3">
                    <MagneticButton
                      onClick={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="bg-gradient-to-r from-success to-green-600 text-white font-black flex items-center gap-2 disabled:opacity-50 text-sm"
                    >
                      {uploadingAvatar ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          UPLOADING...
                        </>
                      ) : (
                        <>
                          <Camera size={14} />
                          UPLOAD AVATAR
                        </>
                      )}
                    </MagneticButton>
                  </div>
                )}
                <h2 className="text-2xl font-black text-neutral-800 mt-4">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-neutral-600 font-semibold">{formData.position}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-success/20 text-success">
                    ACTIVE
                  </span>
                  <span className="text-xs font-bold px-3 py-1 rounded-full bg-primary/20 text-primary">
                    LEARNER
                  </span>
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="lg:col-span-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    FIRST NAME
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="glass-effect border-2 border-primary/30 focus:border-primary font-medium"
                    />
                  ) : (
                    <div className="glass-effect border-2 border-neutral-200 rounded-lg px-4 py-3 font-semibold text-neutral-800">
                      {formData.firstName}
                    </div>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2">
                    <User size={16} className="text-primary" />
                    LAST NAME
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="glass-effect border-2 border-primary/30 focus:border-primary font-medium"
                    />
                  ) : (
                    <div className="glass-effect border-2 border-neutral-200 rounded-lg px-4 py-3 font-semibold text-neutral-800">
                      {formData.lastName}
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-warning" />
                    EMAIL
                  </label>
                  {isEditing ? (
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="glass-effect border-2 border-warning/30 focus:border-warning font-medium"
                    />
                  ) : (
                    <div className="glass-effect border-2 border-neutral-200 rounded-lg px-4 py-3 font-semibold text-neutral-800">
                      {formData.email}
                    </div>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2">
                    <Phone size={16} className="text-success" />
                    PHONE
                  </label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="glass-effect border-2 border-success/30 focus:border-success font-medium"
                    />
                  ) : (
                    <div className="glass-effect border-2 border-neutral-200 rounded-lg px-4 py-3 font-semibold text-neutral-800">
                      {formData.phone}
                    </div>
                  )}
                </div>

                {/* Department */}
                <div>
                  <label className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2">
                    <Building2 size={16} className="text-secondary" />
                    DEPARTMENT
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      className="glass-effect border-2 border-secondary/30 focus:border-secondary font-medium"
                    />
                  ) : (
                    <div className="glass-effect border-2 border-neutral-200 rounded-lg px-4 py-3 font-semibold text-neutral-800">
                      {formData.department}
                    </div>
                  )}
                </div>

                {/* Position */}
                <div>
                  <label className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2">
                    <Briefcase size={16} className="text-primary" />
                    POSITION
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="position"
                      value={formData.position}
                      onChange={handleInputChange}
                      className="glass-effect border-2 border-primary/30 focus:border-primary font-medium"
                    />
                  ) : (
                    <div className="glass-effect border-2 border-neutral-200 rounded-lg px-4 py-3 font-semibold text-neutral-800">
                      {formData.position}
                    </div>
                  )}
                </div>

                {/* Location */}
                <div className="md:col-span-2">
                  <label className="text-sm font-bold text-neutral-700 mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-danger" />
                    LOCATION
                  </label>
                  {isEditing ? (
                    <Input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="glass-effect border-2 border-danger/30 focus:border-danger font-medium"
                    />
                  ) : (
                    <div className="glass-effect border-2 border-neutral-200 rounded-lg px-4 py-3 font-semibold text-neutral-800">
                      {formData.location}
                    </div>
                  )}
                </div>
              </div>

              {/* Account Info */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass-effect border-2 border-primary/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calendar className="text-primary" size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-600">MEMBER SINCE</p>
                      <p className="text-lg font-black text-neutral-800">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="glass-effect border-2 border-warning/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                      <Award className="text-warning" size={24} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-neutral-600">ACHIEVEMENTS</p>
                      <p className="text-lg font-black text-neutral-800">{earnedAchievements.length} / {allAchievements.length}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <Card className="profile-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardHeader>
          <CardTitle className="text-2xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center">
              <Trophy className="text-white" size={20} />
            </div>
            ACHIEVEMENTS & BADGES
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Earned Achievements */}
          <div className="mb-8">
            <h3 className="text-lg font-black text-neutral-800 mb-4 flex items-center gap-2">
              <Award className="text-success" size={20} />
              EARNED ({earnedAchievements.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {earnedAchievements.map(achievement => {
                const IconComponent = achievement.icon
                return (
                  <div
                    key={achievement.id}
                    className="glass-effect border-2 border-success/30 rounded-lg p-4 hover:border-success/60 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-14 h-14 bg-gradient-to-br ${achievement.color} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                        <IconComponent className="text-white" size={28} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-neutral-800">{achievement.title}</h4>
                        <p className="text-xs text-neutral-600 mt-1">{achievement.description}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Calendar size={12} className="text-success" />
                          <span className="text-xs font-semibold text-success">{achievement.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Locked Achievements */}
          <div>
            <h3 className="text-lg font-black text-neutral-800 mb-4 flex items-center gap-2">
              <Target className="text-neutral-400" size={20} />
              LOCKED ({lockedAchievements.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lockedAchievements.map(achievement => {
                const IconComponent = achievement.icon
                return (
                  <div
                    key={achievement.id}
                    className="glass-effect border-2 border-neutral-200 rounded-lg p-4 opacity-60"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-neutral-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <IconComponent className="text-neutral-400" size={28} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-neutral-600">{achievement.title}</h4>
                        <p className="text-xs text-neutral-500 mt-1">{achievement.description}</p>
                        <div className="flex items-center gap-1 mt-2">
                          <Target size={12} className="text-neutral-400" />
                          <span className="text-xs font-semibold text-neutral-400">Keep training to unlock</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
