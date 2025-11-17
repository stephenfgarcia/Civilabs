'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle } from 'lucide-react'

export default function HelpPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Help & Support</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>How can we help you?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-neutral-500">
            <HelpCircle size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Help documentation coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
