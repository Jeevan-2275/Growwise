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
  Autocomplete
} from '@mui/material';
import { useState, useEffect } from 'react';
import { mockFunds, MockFund } from '@/data/mock/funds';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { calculateSIP } from '@/services/calculators/realFundCalculator';

interface SipCalculatorProps {
  schemeCode?: string;
  minimal?: boolean;
}

interface SipResult {
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

export default function SipCalculator({ schemeCode: initialSchemeCode, minimal = false }: SipCalculatorProps) {
  const [amount, setAmount] = useState(5000);
  const [frequency, setFrequency] = useState('monthly');
  const [startDate, setStartDate] = useState('2020-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [result, setResult] = useState<SipResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [funds, setFunds] = useState<MockFund[]>([]);
  const [selectedFund, setSelectedFund] = useState<MockFund | null>(null);

  useEffect(() => {
    setFunds(mockFunds);
    // If initial schemeCode is provided, select the fund
    if (initialSchemeCode) {
      const found = mockFunds.find(f => f.schemeCode === initialSchemeCode);
      if (found) setSelectedFund(found);
    }
  }, [initialSchemeCode]);

  const calculateSIPResults = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!selectedFund) {
        setError('Please select a fund');
        return;
      }
      const schemeCode = selectedFund.schemeCode;
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
      
      // Calculate SIP returns using our calculator logic
      const calculationResult = calculateSIP(
        navHistory,
        amount,
        startDate,
        endDate
      );
      
      // Set the result
      setResult(calculationResult);
      setLoading(false);
    } catch (err: any) {
      console.error('Error calculating SIP:', err);
      setError(err.message || 'Failed to calculate SIP returns');
      setLoading(false);
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Format percentage
  const formatPercentage = (value: number) => {
    return `${value.toFixed(2)}%`;
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {!minimal && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            SIP Calculator
          </Typography>
          <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>
            Calculate your Systematic Investment Plan returns with real-time NAV data
          </Typography>
        </Box>
      )}

      <Grid container spacing={4}>
        {/* Input Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                SIP Parameters
              </Typography>
              
              <Stack spacing={3}>
                <Autocomplete
                  options={funds}
                  getOptionLabel={(option) => `${option.schemeName} (${option.schemeCode})`}
                  value={selectedFund}
                  onChange={(_, value) => setSelectedFund(value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Search Fund by Name or Code" variant="outlined" fullWidth />
                  )}
                  isOptionEqualToValue={(option, value) => option.schemeCode === value.schemeCode}
                  filterOptions={(options, { inputValue }) => {
                    const search = inputValue.toLowerCase();
                    return options.filter(f =>
                      f.schemeName.toLowerCase().includes(search) ||
                      f.schemeCode.includes(search) ||
                      (f.fundHouse && f.fundHouse.toLowerCase().includes(search))
                    );
                  }}
                  sx={{ mb: 1 }}
                />
                <TextField
                  label="SIP Amount (₹)"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  fullWidth
                  inputProps={{ min: 100, step: 100 }}
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
                  onClick={calculateSIPResults}
                  disabled={loading || !selectedFund}
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
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Calculate SIP Returns'}
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
                  SIP Results
                </Typography>
                {selectedFund && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" fontWeight={500}>
                      Fund: {selectedFund.schemeName} ({selectedFund.schemeCode})
                    </Typography>
                  </Box>
                )}
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
        </Grid>
      </Grid>

      {/* Show selected fund details */}
      {selectedFund && (
        <Box sx={{ mt: 3, mb: 2 }}>
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600}>{selectedFund.schemeName}</Typography>
              <Typography variant="body2" color="text.secondary">Code: {selectedFund.schemeCode}</Typography>
              <Typography variant="body2" color="text.secondary">Fund House: {selectedFund.fundHouse}</Typography>
              <Typography variant="body2" color="text.secondary">Category: {selectedFund.schemeCategory}</Typography>
            </CardContent>
          </Card>
        </Box>
      )}
      {/* Interactive Chart */}
      {result && result.chartData && result.chartData.length > 0 && (
        <Card sx={{ mt: 4, borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
              SIP Growth Chart
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
              SIP Breakdown (Last 10 Investments)
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