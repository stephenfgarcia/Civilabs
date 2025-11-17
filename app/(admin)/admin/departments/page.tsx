'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import {
  Building2,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Users,
  ChevronRight,
  FolderTree,
  AlertTriangle,
  MoreVertical,
} from 'lucide-react'

interface Department {
  id: number
  name: string
  parentDepartment: string | null
  userCount: number
  description: string
  head: string
  status: 'active' | 'inactive'
  createdDate: string
}

// Mock departments data
const MOCK_DEPARTMENTS: Department[] = [
  {
    id: 1,
    name: 'Engineering',
    parentDepartment: null,
    userCount: 45,
    description: 'Core engineering and technical operations',
    head: 'John Martinez',
    status: 'active',
    createdDate: '2023-01-15',
  },
  {
    id: 2,
    name: 'Safety',
    parentDepartment: null,
    userCount: 32,
    description: 'Safety compliance and training',
    head: 'Sarah Johnson',
    status: 'active',
    createdDate: '2023-01-15',
  },
  {
    id: 3,
    name: 'Operations',
    parentDepartment: null,
    userCount: 28,
    description: 'Daily operations and logistics',
    head: 'Mike Chen',
    status: 'active',
    createdDate: '2023-02-01',
  },
  {
    id: 4,
    name: 'Administration',
    parentDepartment: null,
    userCount: 15,
    description: 'Administrative and support functions',
    head: 'Emily Davis',
    status: 'active',
    createdDate: '2023-01-20',
  },
  {
    id: 5,
    name: 'Structural Engineering',
    parentDepartment: 'Engineering',
    userCount: 18,
    description: 'Structural design and analysis',
    head: 'Tom Wilson',
    status: 'active',
    createdDate: '2023-03-10',
  },
  {
    id: 6,
    name: 'Quality Control',
    parentDepartment: 'Operations',
    userCount: 12,
    description: 'Quality assurance and control',
    head: 'Lisa Anderson',
    status: 'active',
    createdDate: '2023-04-05',
  },
]

const STATUSES = ['All', 'Active', 'Inactive']

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState(MOCK_DEPARTMENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('All')

  useEffect(() => {
    const elements = document.querySelectorAll('.admin-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [])

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = !searchQuery ||
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.head.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = selectedStatus === 'All' || dept.status === selectedStatus.toLowerCase()
    return matchesSearch && matchesStatus
  })

  const totalUsers = departments.reduce((sum, dept) => sum + dept.userCount, 0)
  const activeDepartments = departments.filter(d => d.status === 'active').length
  const avgUsersPerDept = Math.round(totalUsers / departments.length)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="admin-item opacity-0">
        <div className="glass-effect concrete-texture rounded-xl p-8 relative overflow-hidden border-4 border-warning/40">
          <div className="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-warning/60"></div>
          <div className="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-warning/60"></div>
          <div className="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-warning/60"></div>
          <div className="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-warning/60"></div>

          <div className="absolute inset-0 bg-gradient-to-r from-warning via-orange-500 to-amber-500 opacity-10"></div>
          <div className="absolute inset-0 blueprint-grid opacity-20"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-warning via-orange-500 to-amber-500 bg-clip-text text-transparent mb-2">
                  DEPARTMENTS
                </h1>
                <p className="text-lg font-bold text-neutral-700">
                  Organize teams and manage hierarchy
                </p>
              </div>

              <MagneticButton className="bg-gradient-to-r from-warning to-orange-600 text-white font-black">
                <Plus className="mr-2" size={20} />
                ADD DEPARTMENT
              </MagneticButton>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
              {departments.length}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL DEPARTMENTS</p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-success/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-success to-green-600 bg-clip-text text-transparent mb-2">
              {activeDepartments}
            </div>
            <p className="text-sm font-bold text-neutral-600">ACTIVE</p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-primary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent mb-2">
              {totalUsers}
            </div>
            <p className="text-sm font-bold text-neutral-600">TOTAL USERS</p>
          </CardContent>
        </Card>

        <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-secondary/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-secondary to-purple-600 bg-clip-text text-transparent mb-2">
              {avgUsersPerDept}
            </div>
            <p className="text-sm font-bold text-neutral-600">AVG USERS/DEPT</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center">
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
              placeholder="Search departments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 glass-effect border-2 border-warning/30 focus:border-warning font-medium"
            />
          </div>

          {/* Status Filter */}
          <div>
            <p className="text-sm font-bold text-neutral-700 mb-2">STATUS</p>
            <div className="flex gap-2 flex-wrap">
              {STATUSES.map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    selectedStatus === status
                      ? 'bg-gradient-to-r from-warning to-orange-600 text-white shadow-lg scale-105'
                      : 'glass-effect border-2 border-warning/30 text-neutral-700 hover:border-warning/60'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Department Hierarchy Info */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardHeader>
          <CardTitle className="text-xl font-black flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center">
              <FolderTree className="text-white" size={20} />
            </div>
            ORGANIZATIONAL HIERARCHY
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {departments
              .filter(d => !d.parentDepartment)
              .map((parentDept) => (
                <div key={parentDept.id} className="space-y-2">
                  {/* Parent Department */}
                  <div className="glass-effect rounded-lg p-4 border-2 border-warning/30">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center">
                        <Building2 className="text-white" size={20} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-neutral-800">{parentDept.name}</h3>
                        <p className="text-sm text-neutral-600">{parentDept.userCount} users</p>
                      </div>
                      <ChevronRight className="text-neutral-400" size={20} />
                    </div>
                  </div>

                  {/* Child Departments */}
                  {departments
                    .filter(d => d.parentDepartment === parentDept.name)
                    .map((childDept) => (
                      <div key={childDept.id} className="ml-12 glass-effect rounded-lg p-4 border-2 border-warning/20">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-amber-500 rounded-lg flex items-center justify-center">
                            <Building2 className="text-white" size={16} />
                          </div>
                          <div className="flex-1">
                            <h4 className="text-base font-bold text-neutral-700">{childDept.name}</h4>
                            <p className="text-xs text-neutral-500">{childDept.userCount} users</p>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Departments List */}
      <Card className="admin-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
        <CardHeader>
          <CardTitle className="text-xl font-black">
            ALL DEPARTMENTS ({filteredDepartments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredDepartments.map((dept) => (
              <div
                key={dept.id}
                className="glass-effect rounded-lg p-6 hover:bg-white/50 transition-all border-2 border-transparent hover:border-warning/30"
              >
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-12 h-12 bg-gradient-to-br from-warning to-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Building2 className="text-white" size={24} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-neutral-800 mb-1">
                          {dept.name}
                        </h3>
                        {dept.parentDepartment && (
                          <p className="text-xs font-semibold text-warning flex items-center gap-1">
                            <ChevronRight size={12} />
                            {dept.parentDepartment}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-black ${
                      dept.status === 'active'
                        ? 'bg-gradient-to-r from-success to-green-600 text-white'
                        : 'bg-gradient-to-r from-neutral-400 to-neutral-600 text-white'
                    }`}>
                      {dept.status.toUpperCase()}
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-neutral-600 font-medium">
                    {dept.description}
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4 py-3 border-y-2 border-neutral-200">
                    <div className="text-center">
                      <Users className="mx-auto mb-1 text-warning" size={20} />
                      <p className="font-black text-2xl text-neutral-800">{dept.userCount}</p>
                      <p className="text-xs text-neutral-600">Users</p>
                    </div>
                    <div className="text-center">
                      <AlertTriangle className="mx-auto mb-1 text-primary" size={20} />
                      <p className="font-black text-2xl text-neutral-800">{dept.head}</p>
                      <p className="text-xs text-neutral-600">Department Head</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button className="flex-1 h-10 glass-effect border-2 border-warning/30 rounded-lg flex items-center justify-center gap-2 hover:border-warning/60 hover:bg-warning/10 transition-all font-bold text-sm">
                      <Edit size={16} className="text-warning" />
                      EDIT
                    </button>
                    <button className="flex-1 h-10 glass-effect border-2 border-primary/30 rounded-lg flex items-center justify-center gap-2 hover:border-primary/60 hover:bg-primary/10 transition-all font-bold text-sm">
                      <Users size={16} className="text-primary" />
                      MANAGE
                    </button>
                    <button className="w-10 h-10 glass-effect border-2 border-danger/30 rounded-lg flex items-center justify-center hover:border-danger/60 hover:bg-danger/10 transition-all">
                      <Trash2 size={16} className="text-danger" />
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="text-xs text-neutral-500">
                    Created: {new Date(dept.createdDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
