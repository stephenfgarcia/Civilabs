'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { apiClient } from '@/lib/services'

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  status: string
  departmentId: string | null
  avatarUrl: string | null
  createdAt: string
  lastLogin: string | null
  department: {
    id: string
    name: string
  } | null
  points: {
    points: number
    level: number
  } | null
  _count: {
    enrollments: number
    certificates: number
    badges: number
  }
}

export default function InstructorSettingsPage() {
  useAuth(['INSTRUCTOR'])

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  )

  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    avatarUrl: '',
  })

  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get('/users/me')

      if (response.status >= 200 && response.status < 300 && response.data) {
        const apiData = response.data as any
        const userData = apiData.data || apiData
        setProfile(userData)
        setFormData({
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          avatarUrl: userData.avatarUrl || '',
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setMessage({ type: 'error', text: 'Failed to load profile' })
    } finally {
      setLoading(false)
    }
  }

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setSaving(true)
      setMessage(null)

      const response = await apiClient.put('/users/me', formData)

      if (response.status >= 200 && response.status < 300) {
        setMessage({ type: 'success', text: 'Profile updated successfully' })
        fetchProfile()
      } else {
        setMessage({
          type: 'error',
          text: response.error || 'Failed to update profile',
        })
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      setMessage({ type: 'error', text: 'Failed to update profile' })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setMessage({ type: 'error', text: 'Password must be at least 8 characters' })
      return
    }

    try {
      setSaving(true)
      setMessage(null)

      const response = await apiClient.put('/users/me', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      })

      if (response.status >= 200 && response.status < 300) {
        setMessage({ type: 'success', text: 'Password changed successfully' })
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        })
      } else {
        setMessage({
          type: 'error',
          text: response.error || 'Failed to change password',
        })
      }
    } catch (error) {
      console.error('Error changing password:', error)
      setMessage({ type: 'error', text: 'Failed to change password' })
    } finally {
      setSaving(false)
    }
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never'
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-neutral-600">Loading settings...</div>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-600">Failed to load profile</div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-600 mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Message Alert */}
      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Account Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">
          Account Overview
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-neutral-600">Email</p>
            <p className="text-base font-medium text-neutral-900 mt-1">
              {profile.email}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600">Role</p>
            <p className="text-base font-medium text-neutral-900 mt-1">
              {profile.role}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600">Department</p>
            <p className="text-base font-medium text-neutral-900 mt-1">
              {profile.department?.name || 'Not assigned'}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600">Account Status</p>
            <p className="text-base font-medium text-neutral-900 mt-1">
              {profile.status}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600">Member Since</p>
            <p className="text-base font-medium text-neutral-900 mt-1">
              {formatDate(profile.createdAt)}
            </p>
          </div>
          <div>
            <p className="text-sm text-neutral-600">Last Login</p>
            <p className="text-base font-medium text-neutral-900 mt-1">
              {formatDate(profile.lastLogin)}
            </p>
          </div>
        </div>
      </div>

      {/* Profile Settings */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">
          Profile Settings
        </h2>
        <form onSubmit={handleProfileUpdate} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                First Name
              </label>
              <input
                type="text"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Avatar URL
            </label>
            <input
              type="url"
              value={formData.avatarUrl}
              onChange={(e) =>
                setFormData({ ...formData, avatarUrl: e.target.value })
              }
              placeholder="https://example.com/avatar.jpg"
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {formData.avatarUrl && (
            <div>
              <p className="text-sm text-neutral-600 mb-2">Avatar Preview</p>
              <img
                src={formData.avatarUrl}
                alt="Avatar preview"
                className="w-20 h-20 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.src =
                    'https://via.placeholder.com/80?text=Invalid'
                }}
              />
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">
          Change Password
        </h2>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  currentPassword: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              New Password
            </label>
            <input
              type="password"
              value={passwordData.newPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  newPassword: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
              minLength={8}
            />
            <p className="text-xs text-neutral-500 mt-1">
              Minimum 8 characters required
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) =>
                setPasswordData({
                  ...passwordData,
                  confirmPassword: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
              minLength={8}
            />
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
