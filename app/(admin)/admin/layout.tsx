export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-primary text-white p-4">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}
