"use client"

import { Button, Grid, Paper, Stack, TextField, Typography } from '@mui/material'
import { useState } from 'react'

export default function SWPPage() {
  const [corpus, setCorpus] = useState(1000000)
  const [withdrawal, setWithdrawal] = useState(10000)
  const [rate, setRate] = useState(10)
  const [months, setMonths] = useState<number | null>(null)

  const calc = () => {
    const r = rate / 1200
    let value = corpus
    let m = 0
    while (value > 0 && m < 600) {
      value = value * (1 + r) - withdrawal
      m++
    }
    setMonths(m)
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>SWP Calculator</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Corpus" value={corpus} onChange={e => setCorpus(Number(e.target.value))} /></Grid>
        <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Monthly Withdrawal" value={withdrawal} onChange={e => setWithdrawal(Number(e.target.value))} /></Grid>
        <Grid item xs={12} md={3}><TextField fullWidth type="number" label="Return (%)" value={rate} onChange={e => setRate(Number(e.target.value))} /></Grid>
      </Grid>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center">
        <Button variant="contained" onClick={calc}>Calculate</Button>
        {months != null && <Typography variant="subtitle1">Corpus lasts ~{months} months</Typography>}
      </Stack>
    </Paper>
  )
}

