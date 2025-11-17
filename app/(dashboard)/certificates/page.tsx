'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Award } from 'lucide-react'

export default function CertificatesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Certificates</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Earned Certificates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-neutral-500">
            <Award size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">No certificates earned yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
