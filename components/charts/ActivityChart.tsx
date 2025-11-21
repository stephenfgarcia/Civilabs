/**
 * ActivityChart Component
 * Area chart for showing activity metrics over time
 */

'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ActivityChartProps {
  data: Array<{
    name: string
    value: number
  }>
  color?: string
}

export function ActivityChart({ data, color = '#8B5CF6' }: ActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{
          top: 10,
          right: 30,
          left: 0,
          bottom: 0,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Area type="monotone" dataKey="value" stroke={color} fill={color} fillOpacity={0.6} />
      </AreaChart>
    </ResponsiveContainer>
  )
}
