'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { User, Mail, Building2, Briefcase, Phone, MapPin, Calendar, Award, Edit2, Save, X, Camera, Shield, Trophy, Target, Zap } from 'lucide-react'
import Image from 'next/image'

// Mock achievements data
const ACHIEVEMENTS = [
  {
    id: 1,
    title: 'First Course',
    description: 'Completed your first training course',
    icon: Award,
    color: 'from-success to-green-600',
    earned: true,
    date: '2024-01-15'
  },
  {
    id: 2,
    title: 'Safety Expert',
    description: 'Completed all safety training modules',
    icon: Shield,
    color: 'from-danger to-red-600',
    earned: true,
    date: '2024-02-20'
  },
  {
    id: 3,
    title: 'Quick Learner',
    description: 'Complete 3 courses in one month',
    icon: Zap,
    color: 'from-warning to-orange-600',
    earned: false,
    date: null
  },
  {
    id: 4,
    title: 'Top Performer',
    description: 'Score 100% on 5 assessments',
    icon: Trophy,
    color: 'from-secondary to-purple-600',
    earned: false,
    date: null
  },
  {
    id: 5,
    title: 'Dedicated',
    description: 'Maintain a 30-day learning streak',
    icon: Target,
    color: 'from-primary to-blue-600',
    earned: false,
    date: null
  }
]

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [isEditing, setIsEditing] = useState(false)
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
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('user')
      if (userData) {
        const parsedUser = JSON.parse(userData)
        setUser(parsedUser)
        setFormData({
          firstName: parsedUser.firstName || '',
          lastName: parsedUser.lastName || '',
          email: parsedUser.email || '',
          department: parsedUser.department || 'Engineering',
          position: parsedUser.position || 'Construction Worker',
          phone: parsedUser.phone || '+1 (555) 123-4567',
          location: parsedUser.location || 'New York, NY'
        })
      }
    }

    // Simple CSS-only entrance animations
    const elements = document.querySelectorAll('.profile-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.4s ease-out forwards ${index * 0.05}s`
    })
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSave = () => {
    // Update localStorage
    if (typeof window !== 'undefined') {
      const updatedUser = { ...user, ...formData }
      localStorage.setItem('user', JSON.stringify(updatedUser))
      setUser(updatedUser)
      setIsEditing(false)
    }
  }

  const handleCancel = () => {
    // Reset form to current user data
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        department: user.department || 'Engineering',
        position: user.position || 'Construction Worker',
        phone: user.phone || '+1 (555) 123-4567',
        location: user.location || 'New York, NY'
      })
    }
    setIsEditing(false)
  }

  const earnedAchievements = ACHIEVEMENTS.filter(a => a.earned)
  const lockedAchievements = ACHIEVEMENTS.filter(a => !a.earned)

  return (
    <div className="space-y-6">
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
                  className="bg-gradient-to-r from-success to-green-600 text-white font-black flex items-center gap-2"
                >
                  <Save size={16} />
                  SAVE
                </MagneticButton>
                <MagneticButton
                  onClick={handleCancel}
                  className="bg-gradient-to-r from-neutral-400 to-neutral-600 text-white font-black flex items-center gap-2"
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
                    <User className="text-white" size={96} />
                  </div>
                  {isEditing && (
                    <button className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                      <Camera className="text-white" size={20} />
                    </button>
                  )}
                </div>
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
                      <p className="text-lg font-black text-neutral-800">January 2024</p>
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
                      <p className="text-lg font-black text-neutral-800">{earnedAchievements.length} / {ACHIEVEMENTS.length}</p>
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
