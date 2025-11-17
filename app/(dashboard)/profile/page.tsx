'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User } from 'lucide-react'

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-neutral-500">
            <User size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Profile page coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
