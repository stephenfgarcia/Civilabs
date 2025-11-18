import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔐 Resetting test user passwords...')

  const adminPassword = await bcrypt.hash('admin123', 10)
  const instructorPassword = await bcrypt.hash('instructor123', 10)
  const learnerPassword = await bcrypt.hash('learner123', 10)

  // Update admin
  await prisma.user.update({
    where: { email: 'admin@civilabs.com' },
    data: { passwordHash: adminPassword },
  })
  console.log('✅ Admin password reset')

  // Update instructor
  await prisma.user.update({
    where: { email: 'instructor@civilabs.com' },
    data: { passwordHash: instructorPassword },
  })
  console.log('✅ Instructor password reset')

  // Update learner
  await prisma.user.update({
    where: { email: 'learner@civilabs.com' },
    data: { passwordHash: learnerPassword },
  })
  console.log('✅ Learner password reset')

  console.log('\n📋 Test Credentials:')
  console.log('Admin: admin@civilabs.com / admin123')
  console.log('Instructor: instructor@civilabs.com / instructor123')
  console.log('Learner: learner@civilabs.com / learner123')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
