import { describe, it, expect, vi, beforeEach } from 'vitest'
import { adminUsersService, AdminUser, CreateUserData, UpdateUserData } from '@/lib/services/admin-users.service'

// Mock the API client
vi.mock('@/lib/services/api-client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

import { apiClient } from '@/lib/services/api-client'

const mockApiClient = apiClient as {
  get: ReturnType<typeof vi.fn>
  post: ReturnType<typeof vi.fn>
  put: ReturnType<typeof vi.fn>
  delete: ReturnType<typeof vi.fn>
}

describe('AdminUsersService', () => {
  const mockUser: AdminUser = {
    id: '1',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    role: 'LEARNER',
    status: 'ACTIVE',
    department: null,
    createdAt: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getUsers', () => {
    it('should fetch users successfully', async () => {
      mockApiClient.get.mockResolvedValue({
        status: 200,
        data: {
          data: [mockUser],
          count: 1,
          total: 1,
        },
      })

      const result = await adminUsersService.getUsers()

      expect(result.success).toBe(true)
      expect(result.data).toHaveLength(1)
      expect(result.data[0]).toEqual(mockUser)
      expect(result.count).toBe(1)
      expect(result.total).toBe(1)
    })

    it('should pass filter parameters correctly', async () => {
      mockApiClient.get.mockResolvedValue({
        status: 200,
        data: {
          data: [],
          count: 0,
          total: 0,
        },
      })

      await adminUsersService.getUsers({
        role: 'ADMIN',
        status: 'ACTIVE',
        search: 'test',
        limit: 10,
        offset: 0,
      })

      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('role=ADMIN')
      )
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('status=ACTIVE')
      )
      expect(mockApiClient.get).toHaveBeenCalledWith(
        expect.stringContaining('search=test')
      )
    })

    it('should handle API errors gracefully', async () => {
      mockApiClient.get.mockResolvedValue({
        status: 500,
        error: 'Server error',
      })

      const result = await adminUsersService.getUsers()

      expect(result.success).toBe(false)
      expect(result.data).toEqual([])
      expect(result.error).toBe('Server error')
    })

    it('should handle network exceptions', async () => {
      mockApiClient.get.mockRejectedValue(new Error('Network error'))

      const result = await adminUsersService.getUsers()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Network error')
    })
  })

  describe('getUser', () => {
    it('should fetch single user successfully', async () => {
      mockApiClient.get.mockResolvedValue({
        status: 200,
        data: {
          data: mockUser,
        },
      })

      const result = await adminUsersService.getUser('1')

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUser)
      expect(mockApiClient.get).toHaveBeenCalledWith('/users/1')
    })

    it('should handle user not found', async () => {
      mockApiClient.get.mockResolvedValue({
        status: 404,
        error: 'User not found',
      })

      const result = await adminUsersService.getUser('non-existent')

      expect(result.success).toBe(false)
      expect(result.data).toBeNull()
      expect(result.error).toBe('User not found')
    })
  })

  describe('createUser', () => {
    const createData: CreateUserData = {
      email: 'new@example.com',
      password: 'password123',
      firstName: 'New',
      lastName: 'User',
      role: 'LEARNER',
    }

    it('should create user successfully', async () => {
      const createdUser = { ...mockUser, ...createData, id: '2' }
      mockApiClient.post.mockResolvedValue({
        status: 201,
        data: {
          data: createdUser,
          message: 'User created successfully',
        },
      })

      const result = await adminUsersService.createUser(createData)

      expect(result.success).toBe(true)
      expect(result.data?.email).toBe(createData.email)
      expect(result.message).toBe('User created successfully')
      expect(mockApiClient.post).toHaveBeenCalledWith('/users', createData)
    })

    it('should handle validation errors', async () => {
      mockApiClient.post.mockResolvedValue({
        status: 400,
        error: 'Email already exists',
      })

      const result = await adminUsersService.createUser(createData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('Email already exists')
    })

    it('should handle creation with optional departmentId', async () => {
      const dataWithDept: CreateUserData = {
        ...createData,
        departmentId: 'dept-1',
      }

      mockApiClient.post.mockResolvedValue({
        status: 201,
        data: {
          data: { ...mockUser, departmentId: 'dept-1' },
        },
      })

      await adminUsersService.createUser(dataWithDept)

      expect(mockApiClient.post).toHaveBeenCalledWith('/users', dataWithDept)
    })
  })

  describe('updateUser', () => {
    const updateData: UpdateUserData = {
      firstName: 'Updated',
      status: 'INACTIVE',
    }

    it('should update user successfully', async () => {
      const updatedUser = { ...mockUser, ...updateData }
      mockApiClient.put.mockResolvedValue({
        status: 200,
        data: {
          data: updatedUser,
          message: 'User updated successfully',
        },
      })

      const result = await adminUsersService.updateUser('1', updateData)

      expect(result.success).toBe(true)
      expect(result.data?.firstName).toBe('Updated')
      expect(result.data?.status).toBe('INACTIVE')
      expect(mockApiClient.put).toHaveBeenCalledWith('/users/1', updateData)
    })

    it('should handle update of non-existent user', async () => {
      mockApiClient.put.mockResolvedValue({
        status: 404,
        error: 'User not found',
      })

      const result = await adminUsersService.updateUser('non-existent', updateData)

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
    })

    it('should update user role', async () => {
      const roleUpdate: UpdateUserData = { role: 'ADMIN' }
      mockApiClient.put.mockResolvedValue({
        status: 200,
        data: {
          data: { ...mockUser, role: 'ADMIN' },
        },
      })

      const result = await adminUsersService.updateUser('1', roleUpdate)

      expect(result.success).toBe(true)
      expect(result.data?.role).toBe('ADMIN')
    })
  })

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockApiClient.delete.mockResolvedValue({
        status: 200,
      })

      const result = await adminUsersService.deleteUser('1')

      expect(result.success).toBe(true)
      expect(mockApiClient.delete).toHaveBeenCalledWith('/users/1')
    })

    it('should handle delete of non-existent user', async () => {
      mockApiClient.delete.mockResolvedValue({
        status: 404,
        error: 'User not found',
      })

      const result = await adminUsersService.deleteUser('non-existent')

      expect(result.success).toBe(false)
      expect(result.error).toBe('User not found')
    })

    it('should handle delete permission denied', async () => {
      mockApiClient.delete.mockResolvedValue({
        status: 403,
        error: 'Cannot delete admin user',
      })

      const result = await adminUsersService.deleteUser('admin-id')

      expect(result.success).toBe(false)
      expect(result.error).toBe('Cannot delete admin user')
    })
  })
})
