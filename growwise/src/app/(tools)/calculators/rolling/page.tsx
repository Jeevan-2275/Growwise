"use client"

import { Paper, Typography } from '@mui/material'
import dynamic from 'next/dynamic'
import { mockFunds } from '@/data/mock/funds'

const FundChart = dynamic(() => import('@/components/mf/FundChart'), { ssr: false })

export default function RollingPage() {
  const f = mockFunds[1]
  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Rolling Returns (Mock)</Typography>
      <FundChart data={f.history.map(h => ({ date: h.date, nav: String(h.nav) }))} />
    </Paper>
  )
}

