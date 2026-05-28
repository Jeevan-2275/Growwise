'use client';

import { 
  Box, 
  Grid, 
  TextField, 
  Button, 
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Divider
} from '@mui/material';
import { useState } from 'react';
import { calculateLumpsum } from '@/services/calculators/realFundCalculator';

interface LumpsumCalculatorProps {
  schemeCode?: string;
  minimal?: boolean;
}

interface LumpsumResult {
  investedAmount: number;
  currentValue: number;
  absoluteReturn: number;
  annualizedReturn: number;
  startDate: string;
  endDate: string;
  startNAV: number;
  endNAV: number;
  units: number;
}

export default function LumpsumCalculator({ schemeCode, minimal = false }: LumpsumCalculatorProps) {
  const [amount, setAmount] = useState(100000);
  const [startDate, setStartDate] = useState('2020-01-01');
  const [result, setResult] = useState<LumpsumResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateLumpsumResults = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!schemeCode) {
        setError('Scheme code is required');
        return;
      }

      // Get current date for end date
      const endDateStr = new Date().toISOString().split('T')[0];
      
      // Special handling for fund 37165 - use real data
      const useRealData = schemeCode === '37165';
      
      // Fetch fund NAV data
      const response = await fetch(`/api/mf/${schemeCode}?useRealData=${useRealData}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch fund data');
      }

      const fundData = await response.json();
      
      if (!fundData.success && !fundData.navHistory) {
        throw new Error('Failed to fetch fund NAV data');
      }
      
      // Get NAV history from the response
      const navHistory = fundData.data?.navHistory || fundData.navHistory || [];
      
      if (navHistory.length === 0) {
        throw new Error('No NAV data available for this fund');
      }
      
      // Calculate Lumpsum returns using our calculator logic
      const calculationResult = calculateLumpsum(
        navHistory,
        amount,
        startDate,
        endDateStr
      );
      
      // Transform result to match component's expected format
      setResult({
        investedAmount: calculationResult.totalInvested,
        currentValue: calculationResult.currentValue,
        absoluteReturn: calculationResult.absoluteReturn,
        annualizedReturn: calculationResult.annualizedReturn,
        startDate: startDate,
        endDate: endDateStr,
        startNAV: calculationResult.breakdown[0]?.nav || 0,
        endNAV: calculationResult.breakdown[calculationResult.breakdown.length - 1]?.nav || 0,
        units: calculationResult.totalUnits
      });

      // Result is already set above using the calculator result
    } catch (err) {
      setError('Failed to calculate lumpsum returns');
      console.error('Error calculating lumpsum:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate mock NAV data for the given period
  const generateMockNavData = (start: string, end: string) => {
    const data = [];
    const startDate = new Date(start);
    const endDate = new Date(end);
    let currentDate = new Date(startDate);
    let nav = 100; // Starting NAV
    
    while (currentDate <= endDate) {
      // Simulate realistic NAV movement
      const change = (Math.random() - 0.5) * 0.05; // ±2.5% daily change
      nav = Math.max(50, nav * (1 + change)); // Minimum NAV of 50
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        nav: Number(nav.toFixed(4))
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return data;
  };

  return (
    <Box>
      {!minimal && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            Lumpsum Calculator
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Calculate your one-time investment returns with real-time NAV data
          </Typography>
        </Box>
      )}

      <Grid container spacing={4}>
        {/* Input Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                Investment Parameters
              </Typography>
              
              <Stack spacing={3}>
                <TextField
                  label="Investment Amount (₹)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  fullWidth
                  inputProps={{ min: 1000, step: 1000 }}
                />

                <TextField
                  label="Investment Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <Button
                  variant="contained"
                  onClick={calculateLumpsumResults}
                  disabled={loading}
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)',
                    boxShadow: '0px 4px 20px rgba(0, 212, 170, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
                      boxShadow: '0px 6px 25px rgba(0, 212, 170, 0.4)',
                    },
                    '&:disabled': {
                      background: 'grey.300',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Calculate Returns'}
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Results */}
        <Grid item xs={12} md={6}>
          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {result && (
            <Card sx={{ borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                  Investment Results
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Investment Amount
                    </Typography>
                    <Typography variant="h6">
                      ₹{result.investedAmount.toLocaleString()}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Current Value
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₹{result.currentValue.toLocaleString()}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Units Purchased
                    </Typography>
                    <Typography variant="h6">
                      {result.units.toFixed(4)}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Absolute Return
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={result.absoluteReturn >= 0 ? 'success.main' : 'error.main'}
                    >
                      {result.absoluteReturn >= 0 ? '+' : ''}{result.absoluteReturn.toFixed(2)}%
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Annualized Return
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={result.annualizedReturn >= 0 ? 'success.main' : 'error.main'}
                    >
                      {result.annualizedReturn >= 0 ? '+' : ''}{result.annualizedReturn.toFixed(2)}%
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      NAV Change
                    </Typography>
                    <Typography variant="body2">
                      ₹{result.startNAV.toFixed(4)} → ₹{result.endNAV.toFixed(4)}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Period
                    </Typography>
                    <Typography variant="body2">
                      {result.startDate} to {result.endDate}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
}
