'use client';

import { 
  Box, 
  Grid, 
  TextField, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Divider,
  Container,
  Chip
} from '@mui/material';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface SwpCalculatorProps {
  schemeCode?: string;
}

interface SwpResult {
  initialInvestment: number;
  totalWithdrawn: number;
  remainingValue: number;
  totalReturn: number;
  absoluteReturn: number;
  annualizedReturn: number;
  breakdown: Array<{
    date: string;
    nav: number;
    withdrawal: number;
    unitsRedeemed: number;
    remainingUnits: number;
    remainingValue: number;
  }>;
  chartData: Array<{
    date: string;
    investment: number;
    withdrawn: number;
    remaining: number;
    nav: number;
  }>;
}

export default function SwpCalculator({ schemeCode }: SwpCalculatorProps) {
  const [initialAmount, setInitialAmount] = useState(1000000);
  const [withdrawalAmount, setWithdrawalAmount] = useState(10000);
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [result, setResult] = useState<SwpResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateSWP = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data for demonstration
      const mockNavData = generateMockNavData(startDate, endDate);
      
      // Calculate SWP based on frequency
      const frequencyDays = frequency === 'monthly' ? 30 : frequency === 'quarterly' ? 90 : 365;
      const breakdown = [];
      const chartData = [];
      
      let remainingUnits = initialAmount / mockNavData[0].nav; // Initial units
      let totalWithdrawn = 0;
      let currentDate = new Date(startDate);
      const endDateObj = new Date(endDate);
      
      // Add initial investment to chart
      chartData.push({
        date: startDate,
        investment: initialAmount,
        withdrawn: 0,
        remaining: initialAmount,
        nav: mockNavData[0].nav
      });
      
      while (currentDate <= endDateObj && remainingUnits > 0) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const navData = mockNavData.find(d => d.date === dateStr);
        
        if (navData) {
          const unitsToRedeem = withdrawalAmount / navData.nav;
          
          if (unitsToRedeem <= remainingUnits) {
            remainingUnits -= unitsToRedeem;
            totalWithdrawn += withdrawalAmount;
            const remainingValue = remainingUnits * navData.nav;
            
            breakdown.push({
              date: dateStr,
              nav: navData.nav,
              withdrawal: withdrawalAmount,
              unitsRedeemed: unitsToRedeem,
              remainingUnits,
              remainingValue
            });
            
            chartData.push({
              date: dateStr,
              investment: initialAmount,
              withdrawn: totalWithdrawn,
              remaining: remainingValue,
              nav: navData.nav
            });
          } else {
            // Final withdrawal of remaining units
            const finalWithdrawal = remainingUnits * navData.nav;
            totalWithdrawn += finalWithdrawal;
            remainingUnits = 0;
            
            breakdown.push({
              date: dateStr,
              nav: navData.nav,
              withdrawal: finalWithdrawal,
              unitsRedeemed: remainingUnits,
              remainingUnits: 0,
              remainingValue: 0
            });
            
            chartData.push({
              date: dateStr,
              investment: initialAmount,
              withdrawn: totalWithdrawn,
              remaining: 0,
              nav: navData.nav
            });
            break;
          }
        }
        
        // Move to next withdrawal date
        currentDate.setDate(currentDate.getDate() + frequencyDays);
      }
      
      const remainingValue = remainingUnits * mockNavData[mockNavData.length - 1].nav;
      const totalReturn = totalWithdrawn + remainingValue;
      const absoluteReturn = ((totalReturn - initialAmount) / initialAmount) * 100;
      
      // Calculate annualized return
      const startDateObj = new Date(startDate);
      const years = (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365);
      const annualizedReturn = Math.pow(totalReturn / initialAmount, 1 / years) - 1;
      
      setResult({
        initialInvestment: initialAmount,
        totalWithdrawn,
        remainingValue,
        totalReturn,
        absoluteReturn,
        annualizedReturn: annualizedReturn * 100,
        breakdown,
        chartData
      });
      
    } catch (err) {
      setError('Failed to calculate SWP');
      console.error('Error calculating SWP:', err);
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
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          SWP Calculator
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Calculate your Systematic Withdrawal Plan returns and track your income stream
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Input Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                SWP Parameters
              </Typography>
              
              <Stack spacing={3}>
                <TextField
                  label="Initial Investment (₹)"
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(Number(e.target.value))}
                  fullWidth
                  inputProps={{ min: 10000, step: 1000 }}
                />

                <TextField
                  label="Withdrawal Amount (₹)"
                  type="number"
                  value={withdrawalAmount}
                  onChange={(e) => setWithdrawalAmount(Number(e.target.value))}
                  fullWidth
                  inputProps={{ min: 1000, step: 100 }}
                />

                <FormControl fullWidth>
                  <InputLabel>Withdrawal Frequency</InputLabel>
                  <Select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    label="Withdrawal Frequency"
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />

                <Button
                  variant="contained"
                  onClick={calculateSWP}
                  disabled={loading}
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #6c5ce7 0%, #5f3dc4 100%)',
                    boxShadow: '0px 4px 20px rgba(108, 92, 231, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #5f3dc4 0%, #4c2c9a 100%)',
                      boxShadow: '0px 6px 25px rgba(108, 92, 231, 0.4)',
                    },
                    '&:disabled': {
                      background: 'grey.300',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Calculate SWP Returns'}
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
                  SWP Results
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Initial Investment
                    </Typography>
                    <Typography variant="h6">
                      ₹{result.initialInvestment.toLocaleString()}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Withdrawn
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ₹{result.totalWithdrawn.toLocaleString()}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Remaining Value
                    </Typography>
                    <Typography variant="h6">
                      ₹{result.remainingValue.toLocaleString()}
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Return
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      ₹{result.totalReturn.toLocaleString()}
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
                </Stack>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      {/* Interactive Chart */}
      {result && result.chartData && result.chartData.length > 0 && (
        <Card sx={{ mt: 4, borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
              SWP Performance Chart
            </Typography>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={result.chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <YAxis 
                    tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}K`}
                  />
                  <Tooltip 
                    formatter={(value: any, name: string) => [
                      `₹${value.toLocaleString()}`, 
                      name === 'investment' ? 'Initial Investment' : 
                      name === 'withdrawn' ? 'Total Withdrawn' : 'Remaining Value'
                    ]}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="investment" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                    name="Initial Investment"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="withdrawn" 
                    stackId="2" 
                    stroke="#ff7300" 
                    fill="#ff7300" 
                    fillOpacity={0.6}
                    name="Total Withdrawn"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="remaining" 
                    stackId="3" 
                    stroke="#6c5ce7" 
                    fill="#6c5ce7" 
                    fillOpacity={0.8}
                    name="Remaining Value"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Breakdown Table */}
      {result && result.breakdown && result.breakdown.length > 0 && (
        <Card sx={{ mt: 4, borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
              SWP Breakdown (Last 10 Withdrawals)
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>NAV</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Withdrawal</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Units Redeemed</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Remaining Units</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Remaining Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.slice(-10).map((entry, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px' }}>{entry.date}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{entry.nav.toFixed(4)}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{entry.withdrawal.toLocaleString()}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{entry.unitsRedeemed.toFixed(4)}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{entry.remainingUnits.toFixed(4)}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{entry.remainingValue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          </CardContent>
        </Card>
      )}
    </Container>
  );
}
