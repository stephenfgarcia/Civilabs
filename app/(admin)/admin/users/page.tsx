'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit,
  Trash2,
  MoreVertical,
  Mail,
  Shield,
  CheckCircle,
  XCircle,
  Crown,
} from 'lucide-react'
import Link from 'next/link'

interface User {
  id: number
  firstName: string
  lastName: string
  email: string
  role: string
  department: string
  status: 'active' | 'inactive'
  enrollments: number
  completedCourses: number
  joinedDate: string
  lastActive: string
}

// Mock users data
const MOCK_USERS: User[] = [
  {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@civilabs.com',
    role: 'Learner',
    department: 'Engineering',
    status: 'active',
    enrollments: 5,
    completedCourses: 3,
    joinedDate: '2024-01-15',
    lastActive: '2 hours ago',
  },
  {
    id: 2,
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@civilabs.com',
    role: 'Instructor',
    department: 'Safety',
    status: 'active',
    enrollments: 0,
    completedCourses: 12,
    joinedDate: '2023-11-20',
    lastActive: '1 day ago',
  },
  {
    id: 3,
    firstName: 'Mike',
    lastName: 'Chen',
    email: 'mike.chen@civilabs.com',
    role: 'Learner',
    department: 'Operations',
    status: 'active',
    enrollments: 8,
    completedCourses: 6,
    joinedDate: '2024-02-01',
    lastActive: '5 minutes ago',
  },
  {
    id: 4,
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@civilabs.com',
    role: 'Admin',
    department: 'Administration',
    status: 'active',
    enrollments: 0,
    completedCourses: 0,
    joinedDate: '2023-08-10',
    lastActive: '30 minutes ago',
  },
  {
    id: 5,
    firstName: 'Tom',
    lastName: 'Wilson',
    email: 'tom.w@civilabs.com',
    role: 'Learner',
    department: 'Engineering',
    status: 'inactive',
    enrollments: 2,
    completedCourses: 0,
    joinedDate: '2023-12-05',
    lastActive: '2 weeks ago',
  },
]

const ROLES = ['All', 'Admin', 'Instructor', 'Learner']
const STATUSES = ['All', 'Active', 'Inactive']

export default function UsersPage() {
  const [users, setUsers] = useState(MOCK_USERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  useEffect(() => {
    const elements = document.querySelectorAll('.users-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [])

  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchQuery ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = selectedRole === 'All' || user.role === selectedRole
    const matchesStatus = selectedStatus === 'All' || user.status === selectedStatus.toLowerCase()
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return Crown
      case 'Instructor':
        return Shield
      default:
        return Users
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Admin':
        return 'from-danger to-red-600'
      case 'Instructor':
        return 'from-warning to-orange-600'
      default:
        return 'from-primary to-blue-600'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="users-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-secondary/40">
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-secondary/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-secondary/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-secondary/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-secondary/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-purple-500 to-pink-500 opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-secondary via-purple-500 to-pink-500 bg-clip-text text-transparent mb-2">
                  USER MANAGEMENT
                </h1>
                <p className="text-lg font-bold text-neutral-700">
                  Manage users, roles, and permissions
                </p>
              </div>

              <MagneticButton className="bg-gradient-to-r from-success to-green-600 text-white font-black">
                <UserPlus className="mr-2" size={20} />
                ADD USER
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="users-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
              {users.length}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL USERS</p>
          </CardContent>
        </Card>

        <Card className="users-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mb-2">
              {users.filter(u => u.status === 'active').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">ACTIVE USERS</p>
          </CardContent>
        </Card>

        <Card className="users-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
              {users.filter(u => u.role === 'Instructor').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">INSTRUCTORS</p>
          </CardContent>
        </Card>

        <Card className="users-item opacity-0 glass-effect concrete-texture border-4 border-danger/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-danger to-red-600 bg-clip-text text-transparent mb-2">
              {users.filter(u => u.role === 'Admin').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">ADMINS</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="users-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-600 rounded-lg flex items-center justify-center">
              <Filter className="text-white" size={20} />
            </div>
            SEARCH & FILTER
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <Input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 glass-effect border-2 border-primary/30 focus:border-primary font-medium"
            />
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-bold text-neutral-700 mb-2">ROLE</p>
              <div className="flex gap-2 flex-wrap">
                {ROLES.map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      selectedRole === role
                        ? 'bg-gradient-to-r from-secondary to-purple-600 text-white shadow-lg scale-105'
                        : 'glass-effect border-2 border-secondary/30 text-neutral-700 hover:border-secondary/60'
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm font-bold text-neutral-700 mb-2">STATUS</p>
              <div className="flex gap-2 flex-wrap">
                {STATUSES.map((status) => (
                  <button
                    key={status}
                    onClick={() => setSelectedStatus(status)}
                    className={`px-4 py-2 rounded-lg font-bold transition-all ${
                      selectedStatus === status
                        ? 'bg-gradient-to-r from-success to-green-600 text-white shadow-lg scale-105'
                        : 'glass-effect border-2 border-success/30 text-neutral-700 hover:border-success/60'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="users-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
        <CardHeader>
          <CardTitle className="text-xl font-black">
            USERS ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredUsers.map((user) => {
              const RoleIcon = getRoleIcon(user.role)
              const roleColor = getRoleColor(user.role)

              return (
                <div
                  key={user.id}
                  className="glass-effect rounded-lg p-4 hover:bg-white/50 transition-all border-2 border-transparent hover:border-primary/30"
                >
                  <div className="flex items-center gap-4 flex-wrap">
                    {/* Avatar */}
                    <div className={`w-12 h-12 bg-gradient-to-br ${roleColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <span className="text-white font-black text-lg">
                        {user.firstName[0]}{user.lastName[0]}
                      </span>
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-black text-neutral-800">
                          {user.firstName} {user.lastName}
                        </h3>
                        {user.status === 'active' ? (
                          <CheckCircle className="text-success" size={16} />
                        ) : (
                          <XCircle className="text-danger" size={16} />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-neutral-600">
                        <Mail size={14} />
                        <span>{user.email}</span>
                      </div>
                    </div>

                    {/* Role Badge */}
                    <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${roleColor} text-white font-black text-xs flex items-center gap-1`}>
                      <RoleIcon size={12} />
                      {user.role}
                    </div>

                    {/* Department */}
                    <div className="text-sm font-bold text-neutral-700 min-w-[120px]">
                      {user.department}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-black text-primary">{user.enrollments}</p>
                        <p className="text-xs text-neutral-600">Enrolled</p>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-success">{user.completedCourses}</p>
                        <p className="text-xs text-neutral-600">Completed</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button className="w-10 h-10 glass-effect border-2 border-primary/30 rounded-lg flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition-all">
                        <Edit size={16} className="text-primary" />
                      </button>
                      <button className="w-10 h-10 glass-effect border-2 border-danger/30 rounded-lg flex items-center justify-center hover:border-danger/60 hover:bg-danger/10 transition-all">
                        <Trash2 size={16} className="text-danger" />
                      </button>
                      <button className="w-10 h-10 glass-effect border-2 border-neutral-300 rounded-lg flex items-center justify-center hover:border-neutral-400 hover:bg-neutral-100 transition-all">
                        <MoreVertical size={16} className="text-neutral-600" />
                      </button>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-3 pt-3 border-t-2 border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
                    <span>Joined: {new Date(user.joinedDate).toLocaleDateString()}</span>
                    <span>Last active: {user.lastActive}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
