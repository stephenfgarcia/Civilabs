'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import {
  Settings as SettingsIcon,
  Mail,
  Shield,
  Link2,
  Server,
  Bell,
  Palette,
  Globe,
  Lock,
  Database,
  Key,
  CheckCircle,
} from 'lucide-react'

interface SettingItem {
  id: string
  label: string
  value: string
  type: 'text' | 'email' | 'password' | 'toggle'
  description?: string
}

const GENERAL_SETTINGS: SettingItem[] = [
  {
    id: 'siteName',
    label: 'SITE NAME',
    value: 'Civilabs LMS',
    type: 'text',
    description: 'The name of your LMS platform',
  },
  {
    id: 'siteUrl',
    label: 'SITE URL',
    value: 'https://civilabs-lms.com',
    type: 'text',
    description: 'The primary URL for your platform',
  },
  {
    id: 'adminEmail',
    label: 'ADMIN EMAIL',
    value: 'admin@civilabs.com',
    type: 'email',
    description: 'Primary contact email for administration',
  },
  {
    id: 'timezone',
    label: 'TIMEZONE',
    value: 'America/New_York',
    type: 'text',
    description: 'Default timezone for the platform',
  },
]

const EMAIL_SETTINGS: SettingItem[] = [
  {
    id: 'smtpHost',
    label: 'SMTP HOST',
    value: 'smtp.gmail.com',
    type: 'text',
    description: 'SMTP server hostname',
  },
  {
    id: 'smtpPort',
    label: 'SMTP PORT',
    value: '587',
    type: 'text',
    description: 'SMTP server port',
  },
  {
    id: 'smtpUser',
    label: 'SMTP USERNAME',
    value: 'noreply@civilabs.com',
    type: 'email',
    description: 'SMTP authentication username',
  },
  {
    id: 'fromEmail',
    label: 'FROM EMAIL',
    value: 'noreply@civilabs.com',
    type: 'email',
    description: 'Email address for outgoing messages',
  },
]

const SECURITY_SETTINGS: SettingItem[] = [
  {
    id: 'sessionTimeout',
    label: 'SESSION TIMEOUT',
    value: '30',
    type: 'text',
    description: 'Session timeout in minutes',
  },
  {
    id: 'passwordMinLength',
    label: 'PASSWORD MIN LENGTH',
    value: '8',
    type: 'text',
    description: 'Minimum password length',
  },
  {
    id: 'maxLoginAttempts',
    label: 'MAX LOGIN ATTEMPTS',
    value: '5',
    type: 'text',
    description: 'Maximum failed login attempts before lockout',
  },
]

const INTEGRATION_SETTINGS: SettingItem[] = [
  {
    id: 'apiKey',
    label: 'API KEY',
    value: '••••••••••••••••',
    type: 'password',
    description: 'API key for external integrations',
  },
  {
    id: 'webhookUrl',
    label: 'WEBHOOK URL',
    value: 'https://api.civilabs.com/webhooks',
    type: 'text',
    description: 'Webhook endpoint URL',
  },
  {
    id: 'ssoEnabled',
    label: 'SSO ENABLED',
    value: 'false',
    type: 'toggle',
    description: 'Enable single sign-on',
  },
]

const TABS = [
  { id: 'general', label: 'General', icon: Globe, color: 'from-teal-500 to-cyan-600' },
  { id: 'email', label: 'Email', icon: Mail, color: 'from-teal-500 to-cyan-600' },
  { id: 'security', label: 'Security', icon: Lock, color: 'from-teal-500 to-cyan-600' },
  { id: 'integrations', label: 'Integrations', icon: Link2, color: 'from-teal-500 to-cyan-600' },
]

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  useEffect(() => {
    const elements = document.querySelectorAll('.admin-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [])

  const getCurrentSettings = () => {
    switch (activeTab) {
      case 'general':
        return GENERAL_SETTINGS
      case 'email':
        return EMAIL_SETTINGS
      case 'security':
        return SECURITY_SETTINGS
      case 'integrations':
        return INTEGRATION_SETTINGS
      default:
        return GENERAL_SETTINGS
    }
  }

  const getCurrentIcon = () => {
    const tab = TABS.find(t => t.id === activeTab)
    return tab?.icon || Globe
  }

  const getCurrentTitle = () => {
    switch (activeTab) {
      case 'general':
        return 'General Settings'
      case 'email':
        return 'Email Configuration'
      case 'security':
        return 'Security Settings'
      case 'integrations':
        return 'Integration Settings'
      default:
        return 'Settings'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-teal-500/40">
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-teal-500/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-teal-500/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-teal-500/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-teal-500/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 bg-clip-text text-transparent mb-2">
                  ADMIN SETTINGS
                </h1>
                <p className="text-lg font-bold text-neutral-700">
                  Configure platform and system settings
                </p>
              </div>

              <MagneticButton className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-black">
                <CheckCircle className="mr-2" size={20} />
                SAVE ALL
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-teal-500/40">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Globe className="text-white" size={24} />
            </div>
            <p className="text-sm font-bold text-neutral-600">PLATFORM</p>
            <p className="text-lg font-black text-neutral-800">Active</p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-success to-green-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Server className="text-white" size={24} />
            </div>
            <p className="text-sm font-bold text-neutral-600">SERVER</p>
            <p className="text-lg font-black text-neutral-800">Online</p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Database className="text-white" size={24} />
            </div>
            <p className="text-sm font-bold text-neutral-600">DATABASE</p>
            <p className="text-lg font-black text-neutral-800">Connected</p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="text-white" size={24} />
            </div>
            <p className="text-sm font-bold text-neutral-600">SECURITY</p>
            <p className="text-lg font-black text-neutral-800">Secured</p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-teal-500/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
              <SettingsIcon className="text-white" size={20} />
            </div>
            CONFIGURATION
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {TABS.map((tab) => {
              const TabIcon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-lg scale-105`
                      : 'glass-effect border-2 border-teal-500/30 text-neutral-700 hover:border-teal-500/60'
                  }`}
                >
                  <TabIcon size={18} />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Settings Form */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-teal-500/40">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-lg flex items-center justify-center">
              {(() => {
                const Icon = getCurrentIcon()
                return <Icon className="text-white" size={24} />
              })()}
            </div>
            <div>
              <CardTitle className="text-2xl font-black">{getCurrentTitle()}</CardTitle>
              <p className="text-sm font-semibold text-neutral-600">
                Configure {activeTab} settings for the platform
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {getCurrentSettings().map((setting) => (
              <div key={setting.id} className="space-y-2">
                <label className="text-sm font-bold text-neutral-700 flex items-center gap-2">
                  <Key size={14} className="text-teal-600" />
                  {setting.label}
                </label>
                {setting.description && (
                  <p className="text-xs text-neutral-500 font-medium">{setting.description}</p>
                )}
                {setting.type === 'toggle' ? (
                  <div className="flex items-center gap-3">
                    <button
                      className={`w-14 h-8 rounded-full transition-all ${
                        setting.value === 'true'
                          ? 'bg-gradient-to-r from-teal-500 to-cyan-600'
                          : 'bg-neutral-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 bg-white rounded-full transition-all ${
                          setting.value === 'true' ? 'ml-7' : 'ml-1'
                        }`}
                      ></div>
                    </button>
                    <span className="text-sm font-bold text-neutral-700">
                      {setting.value === 'true' ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                ) : (
                  <Input
                    type={setting.type}
                    defaultValue={setting.value}
                    className="h-12 glass-effect border-2 border-teal-500/30 focus:border-teal-500 font-medium"
                  />
                )}
              </div>
            ))}

            {/* Save Button */}
            <div className="pt-4 border-t-2 border-neutral-200">
              <div className="flex gap-3">
                <MagneticButton className="flex-1 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-black">
                  <CheckCircle className="mr-2" size={16} />
                  SAVE CHANGES
                </MagneticButton>
                <MagneticButton className="glass-effect border-2 border-neutral-300 text-neutral-700 font-black hover:border-neutral-400">
                  RESET
                </MagneticButton>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Shield className="text-primary" size={20} />
              SECURITY RECOMMENDATIONS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm font-medium text-neutral-700">
              <li className="flex items-start gap-2">
                <CheckCircle className="text-success flex-shrink-0 mt-0.5" size={16} />
                <span>Use strong passwords with at least 12 characters</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-success flex-shrink-0 mt-0.5" size={16} />
                <span>Enable two-factor authentication for admin accounts</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-success flex-shrink-0 mt-0.5" size={16} />
                <span>Regularly update API keys and credentials</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="text-success flex-shrink-0 mt-0.5" size={16} />
                <span>Monitor login attempts and suspicious activity</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardHeader>
            <CardTitle className="text-lg font-black flex items-center gap-2">
              <Bell className="text-warning" size={20} />
              SYSTEM NOTIFICATIONS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="glass-effect rounded-lg p-3 border-l-4 border-success">
                <p className="text-sm font-bold text-neutral-800">All systems operational</p>
                <p className="text-xs text-neutral-600">Last checked: 2 minutes ago</p>
              </div>
              <div className="glass-effect rounded-lg p-3 border-l-4 border-primary">
                <p className="text-sm font-bold text-neutral-800">Database backup completed</p>
                <p className="text-xs text-neutral-600">Today at 3:00 AM</p>
              </div>
              <div className="glass-effect rounded-lg p-3 border-l-4 border-warning">
                <p className="text-sm font-bold text-neutral-800">SSL certificate expires in 45 days</p>
                <p className="text-xs text-neutral-600">Renewal recommended</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
