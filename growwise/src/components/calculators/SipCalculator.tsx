'use client';

import { Alert, Button, Grid, Paper, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

export default function SipCalculator() {
  const [monthlyInvestment, setMonthlyInvestment] = useState(10000);
  const [annualRatePct, setAnnualRatePct] = useState(12);
  const [years, setYears] = useState(10);
  const [futureValue, setFV] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function calc() {
    setError(null);
    setFV(null);
    const res = await fetch('/api/calculators/sip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthlyInvestment, annualRatePct, years }),
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      setError(j?.error ?? 'Failed');
      return;
    }
    const j = await res.json();
    setFV(j.futureValue);
  }

  return (
    <Paper sx={{ p: 2 }}>
      <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>SIP Calculator</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <TextField type="number" label="Monthly Investment" value={monthlyInvestment}
            onChange={(e) => setMonthlyInvestment(Number(e.target.value))} fullWidth />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField type="number" label="Annual Return (%)" value={annualRatePct}
            onChange={(e) => setAnnualRatePct(Number(e.target.value))} fullWidth />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField type="number" label="Years" value={years}
            onChange={(e) => setYears(Number(e.target.value))} fullWidth />
        </Grid>
      </Grid>
      <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center">
        <Button variant="contained" onClick={calc}>Calculate</Button>
        {error && <Alert severity="error">{error}</Alert>}
        {futureValue != null && (
          <Typography variant="subtitle1">Future Value: ₹{futureValue.toLocaleString()}</Typography>
        )}
      </Stack>
    </Paper>
  );
}