/**
 * Instructor Layout
 * Layout wrapper for instructor dashboard pages
 */

import { InstructorSidebar } from '@/components/layout/InstructorSidebar'

export default function InstructorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <InstructorSidebar />

      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
