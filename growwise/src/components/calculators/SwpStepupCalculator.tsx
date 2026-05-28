'use client';

import { 
  Box, Grid, TextField, Button, FormControl, InputLabel, Select, MenuItem,
  Card, CardContent, Typography, Alert, CircularProgress, Stack, Divider, Container
} from '@mui/material';
import { useState } from 'react';

interface SwpStepupCalculatorProps {
  schemeCode?: string;
}

interface SwpStepupResult {
  initialInvestment: number;
  totalWithdrawn: number;
  remainingValue: number;
  totalReturn: number;
  absoluteReturn: number;
  annualizedReturn: number;
}

export default function SwpStepupCalculator({ schemeCode }: SwpStepupCalculatorProps) {
  const [initialAmount, setInitialAmount] = useState(1000000);
  const [withdrawalAmount, setWithdrawalAmount] = useState(10000);
  const [stepupRate, setStepupRate] = useState(10);
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [result, setResult] = useState<SwpStepupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Mocked estimation for now (extend with NAV usage later)
      const years = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 365);
      let totalWithdrawn = 0;
      let currentWithdrawal = withdrawalAmount;
      for (let y = 0; y < Math.floor(years); y++) {
        totalWithdrawn += currentWithdrawal * 12; // approx monthly for a year
        currentWithdrawal = currentWithdrawal * (1 + stepupRate / 100);
      }
      // remaining as simple leftover (no NAV modeling in this minimal version)
      const remainingValue = Math.max(0, initialAmount - totalWithdrawn * 0.2);
      const totalReturn = totalWithdrawn + remainingValue;
      const absoluteReturn = ((totalReturn - initialAmount) / initialAmount) * 100;
      const annualizedReturn = years > 0 ? (Math.pow(totalReturn / initialAmount, 1 / years) - 1) * 100 : 0;

      setResult({
        initialInvestment: initialAmount,
        totalWithdrawn,
        remainingValue,
        totalReturn,
        absoluteReturn,
        annualizedReturn
      });
    } catch (e) {
      setError('Failed to calculate SWP Step-up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>SWP Step-up Parameters</Typography>
              <Stack spacing={2}>
                <TextField label="Initial Investment (₹)" type="number" value={initialAmount} onChange={(e) => setInitialAmount(Number(e.target.value))} fullWidth />
                <TextField label="Withdrawal Amount (₹)" type="number" value={withdrawalAmount} onChange={(e) => setWithdrawalAmount(Number(e.target.value))} fullWidth />
                <TextField label="Annual Step-up Rate (%)" type="number" value={stepupRate} onChange={(e) => setStepupRate(Number(e.target.value))} fullWidth />
                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select value={frequency} onChange={(e) => setFrequency(e.target.value)} label="Frequency">
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>
                <TextField label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
                <TextField label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} fullWidth InputLabelProps={{ shrink: true }} />
                <Button variant="contained" onClick={calculate} disabled={loading} fullWidth>
                  {loading ? <CircularProgress size={20} /> : 'Calculate SWP Step-up'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={6}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {result && (
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>SWP Step-up Results</Typography>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">Initial Investment</Typography>
                    <Typography variant="h6">₹{result.initialInvestment.toLocaleString()}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Total Withdrawn</Typography>
                    <Typography variant="h6">₹{result.totalWithdrawn.toLocaleString()}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Remaining Value</Typography>
                    <Typography variant="h6">₹{result.remainingValue.toLocaleString()}</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Absolute Return</Typography>
                    <Typography variant="h6">{result.absoluteReturn.toFixed(2)}%</Typography>
                  </Box>
                  <Divider />
                  <Box>
                    <Typography variant="body2" color="text.secondary">Annualized Return</Typography>
                    <Typography variant="h6">{result.annualizedReturn.toFixed(2)}%</Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Container>
  );
}


