'use client';

import { useParams } from 'next/navigation';
import { Box, Grid, Paper, Typography } from '@mui/material';
import FundChart from '@/components/mf/FundChart';
import { mockFunds } from '@/data/mock/funds';

export default function FundDetailPage() {
  const { schemecode } = useParams<{ schemecode: string }>() as any
  const fund = mockFunds.find(f => f.schemeCode === schemecode)
  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 1 }}>{fund?.schemeName ?? 'Fund'}</Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Code: {schemecode}</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>NAV Trend</Typography>
            <FundChart data={(fund?.history ?? []).map(h => ({ date: h.date, nav: String(h.nav) }))} />
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>Snapshot</Typography>
            <Typography>Category: {fund?.category}</Typography>
            <Typography>Rating: {fund?.rating}★</Typography>
            <Typography>Latest NAV: ₹{fund?.latestNav.toFixed(2)}</Typography>
            <Typography>1Y: {fund?.returns.oneY}% | 3Y: {fund?.returns.threeY}% | 5Y: {fund?.returns.fiveY}%</Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}