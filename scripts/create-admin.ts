/**
 * Script to create or reset admin user credentials
 * Usage: npx ts-node scripts/create-admin.ts
 */

import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createAdminUser() {
  try {
    const email = 'admin@civilabs.com'
    const password = 'Admin123!' // Change this to your desired password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // Update existing user
      await prisma.user.update({
        where: { email },
        data: {
          passwordHash: hashedPassword,
          status: 'ACTIVE',
          role: 'SUPER_ADMIN',
        },
      })
      console.log('✅ Admin user password updated successfully!')
    } else {
      // Create new user
      await prisma.user.create({
        data: {
          email,
          passwordHash: hashedPassword,
          firstName: 'Super',
          lastName: 'Admin',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
        },
      })
      console.log('✅ Admin user created successfully!')
    }

    console.log('\n📧 Email:', email)
    console.log('🔐 Password:', password)
    console.log('\n⚠️  Please change this password after first login!\n')
  } catch (error) {
    console.error('❌ Error creating admin user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdminUser()
