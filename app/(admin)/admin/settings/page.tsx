'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Settings as SettingsIcon, User, Lock, Bell, Palette, HardHat, Shield } from 'lucide-react'

export default function AdminSettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">Loading...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 bg-gradient-to-br from-danger to-red-600 rounded-xl flex items-center justify-center">
            <Shield className="text-white" size={24} />
          </div>
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-danger via-warning to-primary bg-clip-text text-transparent">
              ADMIN SETTINGS
            </h1>
            <p className="text-neutral-600 font-semibold">System Configuration & Management</p>
          </div>
        </div>
      </div>

      {/* Construction-themed tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'profile'
              ? 'bg-gradient-to-r from-danger to-red-600 text-white shadow-lg'
              : 'bg-white/70 backdrop-blur-sm text-neutral-700 hover:bg-danger/10'
          }`}
        >
          <User size={18} />
          Profile
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'security'
              ? 'bg-gradient-to-r from-danger to-red-600 text-white shadow-lg'
              : 'bg-white/70 backdrop-blur-sm text-neutral-700 hover:bg-danger/10'
          }`}
        >
          <Lock size={18} />
          Security
        </button>
        <button
          onClick={() => setActiveTab('system')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'system'
              ? 'bg-gradient-to-r from-danger to-red-600 text-white shadow-lg'
              : 'bg-white/70 backdrop-blur-sm text-neutral-700 hover:bg-danger/10'
          }`}
        >
          <SettingsIcon size={18} />
          System
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all ${
            activeTab === 'notifications'
              ? 'bg-gradient-to-r from-danger to-red-600 text-white shadow-lg'
              : 'bg-white/70 backdrop-blur-sm text-neutral-700 hover:bg-danger/10'
          }`}
        >
          <Bell size={18} />
          Notifications
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <Card className="glass-effect concrete-texture border-4 border-danger/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl font-black">Administrator Profile</CardTitle>
                <CardDescription className="font-semibold">Update your admin information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                  <Shield size={16} className="text-danger" />
                  FIRST NAME
                </label>
                <Input
                  defaultValue={user.firstName}
                  className="h-12 glass-effect border-2 border-danger/30 focus:border-danger"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                  <Shield size={16} className="text-danger" />
                  LAST NAME
                </label>
                <Input
                  defaultValue={user.lastName}
                  className="h-12 glass-effect border-2 border-danger/30 focus:border-danger"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">ADMIN EMAIL</label>
              <Input
                type="email"
                defaultValue={user.email}
                disabled
                className="h-12 glass-effect border-2 border-neutral-300 bg-neutral-100"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">ADMIN ROLE</label>
              <Input
                defaultValue={user.role}
                disabled
                className="h-12 glass-effect border-2 border-neutral-300 bg-neutral-100 uppercase font-bold text-danger"
              />
            </div>
            <Button className="w-full md:w-auto bg-gradient-to-r from-danger to-red-600 text-white font-black px-8 py-6 text-lg">
              SAVE CHANGES
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <Card className="glass-effect concrete-texture border-4 border-warning/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-xl flex items-center justify-center">
                <Lock className="text-white" size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl font-black">Security Settings</CardTitle>
                <CardDescription className="font-semibold">Manage your admin password</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">CURRENT SECURITY CODE</label>
              <Input
                type="password"
                placeholder="Enter current password"
                className="h-12 glass-effect border-2 border-warning/30 focus:border-warning"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">NEW SECURITY CODE</label>
              <Input
                type="password"
                placeholder="Enter new password"
                className="h-12 glass-effect border-2 border-warning/30 focus:border-warning"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-neutral-700">CONFIRM NEW SECURITY CODE</label>
              <Input
                type="password"
                placeholder="Confirm new password"
                className="h-12 glass-effect border-2 border-warning/30 focus:border-warning"
              />
            </div>
            <div className="bg-danger/10 border-l-4 border-danger p-4 rounded-lg">
              <p className="text-sm font-semibold text-neutral-700">
                ⚠ Admin passwords must be extremely secure (minimum 12 characters recommended)
              </p>
            </div>
            <Button className="w-full md:w-auto bg-gradient-to-r from-warning to-orange-600 text-white font-black px-8 py-6 text-lg">
              UPDATE PASSWORD
            </Button>
          </CardContent>
        </Card>
      )}

      {/* System Tab */}
      {activeTab === 'system' && (
        <Card className="glass-effect concrete-texture border-4 border-primary/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-xl flex items-center justify-center">
                <SettingsIcon className="text-white" size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl font-black">System Configuration</CardTitle>
                <CardDescription className="font-semibold">Global system settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-600 font-semibold">System configuration coming soon...</p>
          </CardContent>
        </Card>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <Card className="glass-effect concrete-texture border-4 border-success/40">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-success to-green-600 rounded-xl flex items-center justify-center">
                <Bell className="text-white" size={24} />
              </div>
              <div>
                <CardTitle className="text-2xl font-black">Admin Notifications</CardTitle>
                <CardDescription className="font-semibold">Configure admin alerts</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-neutral-600 font-semibold">Admin notification settings coming soon...</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
