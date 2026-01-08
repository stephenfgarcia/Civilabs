import { Card, CardContent } from '@/components/ui/card'
import { LucideIcon } from 'lucide-react'

export interface AdminStat {
  label: string
  value: string | number
  icon: LucideIcon
  gradient: string
  borderColor: string
}

interface AdminStatsGridProps {
  stats: AdminStat[]
}

export function AdminStatsGrid({ stats }: AdminStatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={index}
            className={`admin-item opacity-0 glass-effect concrete-texture border-4 ${stat.borderColor}`}
          >
            <CardContent className="p-6 text-center">
              <div className={`text-3xl font-black bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent mb-2`}>
                {stat.value}
              </div>
              <p className="text-sm font-bold text-neutral-600">{stat.label}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
