'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BookOpen } from 'lucide-react'

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Course Catalog</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-neutral-500">
            <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Courses will appear here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
