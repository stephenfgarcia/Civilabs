import { AdminSidebar } from '@/components/layout/AdminSidebar'
import { Header } from '@/components/layout/Header'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-neutral-50 via-white to-neutral-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
