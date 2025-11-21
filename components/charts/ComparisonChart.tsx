/**
 * ComparisonChart Component
 * Bar chart for comparing different categories
 */

'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface ComparisonChartProps {
  data: Array<{
    name: string
    [key: string]: string | number
  }>
  bars: Array<{
    dataKey: string
    name: string
    color: string
  }>
}

export function ComparisonChart({ data, bars }: ComparisonChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        {bars.map((bar) => (
          <Bar key={bar.dataKey} dataKey={bar.dataKey} name={bar.name} fill={bar.color} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
