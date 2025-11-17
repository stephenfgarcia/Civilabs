'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy } from 'lucide-react'

export default function LeaderboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Leaderboard</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Top Learners</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-neutral-500">
            <Trophy size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Leaderboard coming soon</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
