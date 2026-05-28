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
  Chip,
  Slider,
  InputAdornment,
  Tooltip
} from '@mui/material';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import InfoIcon from '@mui/icons-material/Info';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

interface SipStepupCalculatorProps {
  schemeCode?: string;
}

interface SipStepupResult {
  totalInvested: number;
  currentValue: number;
  totalUnits: number;
  absoluteReturn: number;
  annualizedReturn: number;
  breakdown: Array<{
    date: string;
    nav: number;
    amount: number;
    units: number;
    cumulativeUnits: number;
    cumulativeInvested: number;
    cumulativeValue: number;
  }>;
  chartData: Array<{
    date: string;
    invested: number;
    value: number;
    nav: number;
  }>;
}

export default function SipStepupCalculator({ schemeCode }: SipStepupCalculatorProps) {
  const [amount, setAmount] = useState(5000);
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [stepupRate, setStepupRate] = useState(10); // Annual step-up percentage
  const [stepupFrequency, setStepupFrequency] = useState('yearly'); // How often to apply step-up
  const [result, setResult] = useState<SipStepupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const calculateSIPStepup = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data for demonstration
      const mockNavData = generateMockNavData(startDate, endDate);
      
      // Calculate SIP based on frequency
      const frequencyDays = frequency === 'monthly' ? 30 : frequency === 'quarterly' ? 90 : 365;
      const breakdown = [];
      const chartData = [];
      
      let cumulativeUnits = 0;
      let cumulativeInvested = 0;
      let currentDate = new Date(startDate);
      const endDateObj = new Date(endDate);
      let currentAmount = amount;
      let lastStepupDate = new Date(startDate);
      
      while (currentDate <= endDateObj) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const navData = mockNavData.find(d => d.date === dateStr);
        
        // Check if it's time for a step-up
        if (stepupFrequency === 'yearly' && 
            currentDate.getMonth() === lastStepupDate.getMonth() && 
            currentDate.getDate() === lastStepupDate.getDate() && 
            currentDate.getFullYear() > lastStepupDate.getFullYear()) {
          
          // Apply step-up
          currentAmount = currentAmount * (1 + stepupRate / 100);
          lastStepupDate = new Date(currentDate);
        }
        
        if (navData) {
          const units = currentAmount / navData.nav;
          cumulativeUnits += units;
          cumulativeInvested += currentAmount;
          const cumulativeValue = cumulativeUnits * navData.nav;
          
          breakdown.push({
            date: dateStr,
            nav: navData.nav,
            amount: currentAmount,
            units,
            cumulativeUnits,
            cumulativeInvested,
            cumulativeValue
          });
          
          chartData.push({
            date: dateStr,
            invested: cumulativeInvested,
            value: cumulativeValue,
            nav: navData.nav
          });
        }
        
        // Move to next investment date
        currentDate.setDate(currentDate.getDate() + frequencyDays);
      }
      
      const totalInvested = cumulativeInvested;
      const currentValue = cumulativeUnits * mockNavData[mockNavData.length - 1].nav;
      const absoluteReturn = ((currentValue - totalInvested) / totalInvested) * 100;
      
      // Calculate annualized return
      const startDateObj = new Date(startDate);
      const years = (endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24 * 365);
      const annualizedReturn = Math.pow(currentValue / totalInvested, 1 / years) - 1;
      
      setResult({
        totalInvested,
        currentValue,
        totalUnits: cumulativeUnits,
        absoluteReturn,
        annualizedReturn: annualizedReturn * 100,
        breakdown,
        chartData
      });
      
    } catch (err) {
      setError('Failed to calculate SIP with step-up');
      console.error('Error calculating SIP with step-up:', err);
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
          SIP Step-up Calculator
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Calculate your Systematic Investment Plan returns with annual step-up increases
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Input Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                SIP Step-up Parameters
              </Typography>
              
              <Stack spacing={3}>
                <TextField
                  label="Initial SIP Amount (₹)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  fullWidth
                  inputProps={{ min: 100, step: 100 }}
                  InputProps={{
                    startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                  }}
                />

                <FormControl fullWidth>
                  <InputLabel>Frequency</InputLabel>
                  <Select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    label="Frequency"
                  >
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="quarterly">Quarterly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Annual Step-up Rate (%)"
                  type="number"
                  value={stepupRate}
                  onChange={(e) => setStepupRate(Number(e.target.value))}
                  fullWidth
                  inputProps={{ min: 0, max: 100, step: 1 }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Tooltip title="The percentage by which your SIP amount will increase each year">
                          <InfoIcon fontSize="small" color="action" />
                        </Tooltip>
                      </InputAdornment>
                    ),
                  }}
                />

                <Box sx={{ px: 1 }}>
                  <Typography gutterBottom>Step-up Rate: {stepupRate}%</Typography>
                  <Slider
                    value={stepupRate}
                    onChange={(_, newValue) => setStepupRate(newValue as number)}
                    aria-labelledby="step-up-rate-slider"
                    valueLabelDisplay="auto"
                    step={1}
                    marks
                    min={0}
                    max={25}
                  />
                </Box>

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
                  onClick={calculateSIPStepup}
                  disabled={loading}
                  fullWidth
                  size="large"
                  startIcon={<TrendingUpIcon />}
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
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Calculate Step-up SIP Returns'}
                </Button>
              </Stack>
            </CardContent>
          </Card>

          {/* Step-up Explanation Card */}
          <Card sx={{ mt: 3, borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', border: '1px solid #e0f7fa' }}>
            <CardContent sx={{ p: 3, bgcolor: '#e0f7fa20' }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1, color: 'primary.main' }}>
                What is SIP Step-up?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                SIP Step-up allows you to increase your investment amount periodically, typically annually. 
                For example, with a 10% step-up rate on a ₹5,000 monthly SIP, your investment would increase 
                to ₹5,500 in the second year, ₹6,050 in the third year, and so on. This strategy helps you 
                invest more as your income grows over time.
              </Typography>
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
                  SIP Step-up Results
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total Invested
                    </Typography>
                    <Typography variant="h6">
                      ₹{result.totalInvested.toLocaleString()}
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
                      Total Units
                    </Typography>
                    <Typography variant="h6">
                      {result.totalUnits.toFixed(2)}
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

          {/* Comparison with Regular SIP */}
          {result && (
            <Card sx={{ mt: 3, borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)', border: '1px solid #e6f7ff' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'info.main' }}>
                  Benefits of Step-up SIP vs Regular SIP
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Regular SIP Total Value (estimated):
                  </Typography>
                  <Typography variant="body2" fontWeight={500}>
                    ₹{(amount * result.breakdown.length * 0.85).toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Step-up SIP Total Value:
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="primary.main">
                    ₹{result.currentValue.toLocaleString()}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="text.secondary">
                    Additional Returns:
                  </Typography>
                  <Typography variant="body2" fontWeight={700} color="success.main">
                    +₹{(result.currentValue - (amount * result.breakdown.length * 0.85)).toLocaleString()}
                  </Typography>
                </Box>
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
              SIP Step-up Growth Chart
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
                  <RechartsTooltip 
                    formatter={(value: any, name: string) => [
                      `₹${value.toLocaleString()}`, 
                      name === 'invested' ? 'Invested' : 'Current Value'
                    ]}
                    labelFormatter={(value) => new Date(value).toLocaleDateString()}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="invested" 
                    stackId="1" 
                    stroke="#8884d8" 
                    fill="#8884d8" 
                    fillOpacity={0.3}
                    name="Invested"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="value" 
                    stackId="2" 
                    stroke="#00d4aa" 
                    fill="#00d4aa" 
                    fillOpacity={0.6}
                    name="Current Value"
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
              SIP Step-up Breakdown (Last 10 Investments)
            </Typography>
            <Box sx={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #e0e0e0' }}>
                    <th style={{ padding: '8px', textAlign: 'left' }}>Date</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>NAV</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Amount</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Units</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Cumulative Units</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Cumulative Invested</th>
                    <th style={{ padding: '8px', textAlign: 'right' }}>Current Value</th>
                  </tr>
                </thead>
                <tbody>
                  {result.breakdown.slice(-10).map((entry, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                      <td style={{ padding: '8px' }}>{entry.date}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{entry.nav.toFixed(4)}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{entry.amount.toLocaleString()}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{entry.units.toFixed(4)}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{entry.cumulativeUnits.toFixed(4)}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{entry.cumulativeInvested.toLocaleString()}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>₹{entry.cumulativeValue.toLocaleString()}</td>
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