'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MagneticButton } from '@/components/ui/magnetic-button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ConstructionLoader } from '@/components/ui/construction-loader'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { adminUsersService, type AdminUser } from '@/lib/services/admin-users.service'
import { useToast } from '@/hooks/use-toast'
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

const ROLES = ['All', 'LEARNER', 'INSTRUCTOR', 'ADMIN', 'SUPER_ADMIN']
const STATUSES = ['All', 'ACTIVE', 'INACTIVE', 'SUSPENDED']

export default function UsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'LEARNER' as 'LEARNER' | 'INSTRUCTOR' | 'ADMIN' | 'SUPER_ADMIN',
    departmentId: ''
  })
  const [formLoading, setFormLoading] = useState(false)

  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, selectedRole, selectedStatus])

  useEffect(() => {
    const elements = document.querySelectorAll('.users-item')
    elements.forEach((el, index) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.animation = `fadeInUp 0.5s ease-out forwards ${index * 0.05}s`
    })
  }, [loading])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await adminUsersService.getUsers()
      if (response.success && response.data) {
        setUsers(response.data)
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to load users',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load users',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    if (searchQuery) {
      const term = searchQuery.toLowerCase()
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(term) ||
        user.lastName.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      )
    }

    if (selectedRole !== 'All') {
      filtered = filtered.filter(user => user.role === selectedRole)
    }

    if (selectedStatus !== 'All') {
      filtered = filtered.filter(user => user.status === selectedStatus)
    }

    setFilteredUsers(filtered)
  }

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      role: 'LEARNER',
      departmentId: ''
    })
  }

  const handleAddUser = () => {
    resetForm()
    setIsAddModalOpen(true)
  }

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user)
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: '',
      role: user.role,
      departmentId: user.departmentId || ''
    })
    setIsEditModalOpen(true)
  }

  const handleDeleteUser = (user: AdminUser) => {
    setSelectedUser(user)
    setIsDeleteModalOpen(true)
  }

  const submitAddUser = async () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      toast({
        title: 'Validation Error',
        description: 'First name, last name, email, and password are required',
        variant: 'destructive'
      })
      return
    }

    try {
      setFormLoading(true)
      const response = await adminUsersService.createUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        departmentId: formData.departmentId || null
      })

      if (response.success) {
        toast({
          title: 'Success',
          description: 'User created successfully'
        })
        setIsAddModalOpen(false)
        resetForm()
        loadUsers()
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to create user',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create user',
        variant: 'destructive'
      })
    } finally {
      setFormLoading(false)
    }
  }

  const submitEditUser = async () => {
    if (!selectedUser || !formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: 'Validation Error',
        description: 'First name, last name, and email are required',
        variant: 'destructive'
      })
      return
    }

    try {
      setFormLoading(true)
      const updateData: any = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
        departmentId: formData.departmentId || null
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      const response = await adminUsersService.updateUser(selectedUser.id, updateData)

      if (response.success) {
        toast({
          title: 'Success',
          description: 'User updated successfully'
        })
        setIsEditModalOpen(false)
        setSelectedUser(null)
        resetForm()
        loadUsers()
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to update user',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user',
        variant: 'destructive'
      })
    } finally {
      setFormLoading(false)
    }
  }

  const submitDeleteUser = async () => {
    if (!selectedUser) return

    try {
      setFormLoading(true)
      const response = await adminUsersService.deleteUser(selectedUser.id)

      if (response.success) {
        toast({
          title: 'Success',
          description: 'User deleted successfully'
        })
        setIsDeleteModalOpen(false)
        setSelectedUser(null)
        loadUsers()
      } else {
        toast({
          title: 'Error',
          description: response.error || 'Failed to delete user',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete user',
        variant: 'destructive'
      })
    } finally {
      setFormLoading(false)
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return Crown
      case 'INSTRUCTOR':
        return Shield
      default:
        return Users
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return 'from-danger to-red-600'
      case 'INSTRUCTOR':
        return 'from-warning to-orange-600'
      default:
        return 'from-primary to-blue-600'
    }
  }

  const formatRoleDisplay = (role: string) => {
    return role.replace('_', ' ')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <ConstructionLoader />
      </div>
    )
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

              <MagneticButton
                onClick={handleAddUser}
                className="bg-gradient-to-r from-success to-green-600 text-white font-black"
              >
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
              {users.filter(u => u.status === 'ACTIVE').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">ACTIVE USERS</p>
          </CardContent>
        </Card>

        <Card className="users-item opacity-0 glass-effect concrete-texture border-4 border-warning/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-warning to-orange-600 bg-clip-text text-transparent mb-2">
              {users.filter(u => u.role === 'INSTRUCTOR').length}
            </div>
            <p className="text-sm font-bold text-neutral-600">INSTRUCTORS</p>
          </CardContent>
        </Card>

        <Card className="users-item opacity-0 glass-effect concrete-texture border-4 border-danger/40">
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-black bg-gradient-to-r from-danger to-red-600 bg-clip-text text-transparent mb-2">
              {users.filter(u => u.role === 'ADMIN' || u.role === 'SUPER_ADMIN').length}
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
                    {formatRoleDisplay(role)}
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
                        {user.status === 'ACTIVE' ? (
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
                      {formatRoleDisplay(user.role)}
                    </div>

                    {/* Department */}
                    <div className="text-sm font-bold text-neutral-700 min-w-[120px]">
                      {user.department?.name || 'No Department'}
                    </div>

                    {/* Stats */}
                    <div className="flex gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-black text-primary">{user._count?.enrollments || 0}</p>
                        <p className="text-xs text-neutral-600">Enrolled</p>
                      </div>
                      <div className="text-center">
                        <p className="font-black text-success">{user._count?.certificates || 0}</p>
                        <p className="text-xs text-neutral-600">Completed</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="w-10 h-10 glass-effect border-2 border-primary/30 rounded-lg flex items-center justify-center hover:border-primary/60 hover:bg-primary/10 transition-all"
                      >
                        <Edit size={16} className="text-primary" />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="w-10 h-10 glass-effect border-2 border-danger/30 rounded-lg flex items-center justify-center hover:border-danger/60 hover:bg-danger/10 transition-all"
                      >
                        <Trash2 size={16} className="text-danger" />
                      </button>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="mt-3 pt-3 border-t-2 border-neutral-200 flex items-center justify-between text-xs text-neutral-500">
                    <span>Joined: {new Date(user.createdAt).toLocaleDateString()}</span>
                    <span>Last login: {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</span>
                  </div>
                </div>
              )
            })}

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-neutral-400 font-bold text-lg">No users found</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add User Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="glass-effect border-primary/30" onClose={() => setIsAddModalOpen(false)}>
          <DialogHeader>
            <DialogTitle className="text-primary">Add New User</DialogTitle>
            <DialogDescription>Create a new user account</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground font-medium"
              >
                <option value="LEARNER">Learner</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={submitAddUser} disabled={formLoading} className="bg-primary hover:bg-primary/80">
              {formLoading ? 'Creating...' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="glass-effect border-primary/30" onClose={() => setIsEditModalOpen(false)}>
          <DialogHeader>
            <DialogTitle className="text-primary">Edit User</DialogTitle>
            <DialogDescription>Update user account details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium mb-2 block">First Name</label>
              <Input
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Last Name</label>
              <Input
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                placeholder="Enter last name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Email</label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="Enter email"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Password (leave blank to keep current)</label>
              <Input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                className="w-full px-3 py-2 rounded-md bg-background border border-input text-foreground font-medium"
              >
                <option value="LEARNER">Learner</option>
                <option value="INSTRUCTOR">Instructor</option>
                <option value="ADMIN">Admin</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button onClick={submitEditUser} disabled={formLoading} className="bg-primary hover:bg-primary/80">
              {formLoading ? 'Updating...' : 'Update User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Modal */}
      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent className="glass-effect border-primary/30" onClose={() => setIsDeleteModalOpen(false)}>
          <DialogHeader>
            <DialogTitle className="text-primary">Delete User</DialogTitle>
            <DialogDescription>Are you sure you want to delete this user?</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm font-medium">
              User: <span className="font-bold">{selectedUser?.firstName} {selectedUser?.lastName}</span>
            </p>
            <p className="text-sm font-medium">
              Email: <span className="font-bold">{selectedUser?.email}</span>
            </p>
            <p className="text-sm text-danger mt-4 font-semibold">
              This action cannot be undone.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)} disabled={formLoading}>
              Cancel
            </Button>
            <Button
              onClick={submitDeleteUser}
              disabled={formLoading}
              variant="destructive"
            >
              {formLoading ? 'Deleting...' : 'Delete User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
