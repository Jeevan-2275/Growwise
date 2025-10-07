"use client"

import { Alert, Button, Grid, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'

export default function LumpsumPage() {
  const [amount, setAmount] = useState(100000)
  const [rate, setRate] = useState(12)
  const [years, setYears] = useState(10)
  const [fv, setFv] = useState<number | null>(null)

  const calc = () => {
    const value = amount * Math.pow(1 + rate / 100, years)
    setFv(Number(value.toFixed(2)))
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Lumpsum Calculator</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}><TextField fullWidth type="number" label="Amount" value={amount} onChange={e => setAmount(Number(e.target.value))} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth type="number" label="Annual Return (%)" value={rate} onChange={e => setRate(Number(e.target.value))} /></Grid>
        <Grid item xs={12} md={4}><TextField fullWidth type="number" label="Years" value={years} onChange={e => setYears(Number(e.target.value))} /></Grid>
      </Grid>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center">
        <Button variant="contained" onClick={calc}>Calculate</Button>
        {fv != null && <Typography variant="subtitle1">Future Value: ₹{fv.toLocaleString()}</Typography>}
      </Stack>
    </Paper>
  )
}

