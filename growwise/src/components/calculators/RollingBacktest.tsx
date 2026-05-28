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
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface RollingBacktestProps {
  schemeCode?: string;
}

interface RollingResult {
  period: string;
  averageReturn: number;
  bestReturn: number;
  worstReturn: number;
  positivePeriods: number;
  totalPeriods: number;
  successRate: number;
  rollingReturns: Array<{
    startDate: string;
    endDate: string;
    return: number;
    period: string;
  }>;
  chartData: Array<{
    period: string;
    return: number;
    average: number;
  }>;
}

export default function RollingBacktest({ schemeCode }: RollingBacktestProps) {
  const [startDate, setStartDate] = useState('2018-01-01');
  const [endDate, setEndDate] = useState('2023-12-31');
  const [period, setPeriod] = useState('1Y');
  const [result, setResult] = useState<RollingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState('line');

  const calculateRollingReturns = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use mock data for demonstration
      const mockNavData = generateMockNavData(startDate, endDate);
      
      // Calculate rolling returns based on period
      const periodDays = period === '1Y' ? 365 : period === '2Y' ? 730 : period === '3Y' ? 1095 : 1825;
      const rollingReturns = [];
      const chartData = [];
      
      for (let i = 0; i < mockNavData.length - periodDays; i++) {
        const startNav = mockNavData[i].nav;
        const endNav = mockNavData[i + periodDays].nav;
        const startDate = mockNavData[i].date;
        const endDate = mockNavData[i + periodDays].date;
        
        const returnValue = ((endNav - startNav) / startNav) * 100;
        
        rollingReturns.push({
          startDate,
          endDate,
          return: returnValue,
          period: `${startDate} to ${endDate}`
        });
        
        chartData.push({
          period: new Date(startDate).toLocaleDateString(),
          return: returnValue,
          average: 0 // Will be calculated later
        });
      }
      
      // Calculate statistics
      const returns = rollingReturns.map(r => r.return);
      const averageReturn = returns.reduce((a, b) => a + b, 0) / returns.length;
      const bestReturn = Math.max(...returns);
      const worstReturn = Math.min(...returns);
      const positivePeriods = returns.filter(r => r > 0).length;
      const successRate = (positivePeriods / returns.length) * 100;
      
      // Update chart data with average
      chartData.forEach(item => {
        item.average = averageReturn;
      });
      
      setResult({
        period,
        averageReturn,
        bestReturn,
        worstReturn,
        positivePeriods,
        totalPeriods: returns.length,
        successRate,
        rollingReturns,
        chartData
      });
      
    } catch (err) {
      setError('Failed to calculate rolling returns');
      console.error('Error calculating rolling returns:', err);
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
      // Simulate realistic NAV movement with some trend
      const trend = 0.0001; // Slight upward trend
      const volatility = (Math.random() - 0.5) * 0.05; // ±2.5% daily volatility
      nav = Math.max(50, nav * (1 + trend + volatility));
      
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
          Rolling Returns Calculator
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Analyze rolling returns over different time periods to understand fund performance consistency
        </Typography>
      </Box>

      <Grid container spacing={4}>
        {/* Input Form */}
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 3, boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.05)' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
                Analysis Parameters
              </Typography>
              
              <Stack spacing={3}>
                <FormControl fullWidth>
                  <InputLabel>Rolling Period</InputLabel>
                  <Select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    label="Rolling Period"
                  >
                    <MenuItem value="1Y">1 Year</MenuItem>
                    <MenuItem value="2Y">2 Years</MenuItem>
                    <MenuItem value="3Y">3 Years</MenuItem>
                    <MenuItem value="5Y">5 Years</MenuItem>
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
                  onClick={calculateRollingReturns}
                  disabled={loading}
                  fullWidth
                  size="large"
                  sx={{
                    py: 1.5,
                    fontSize: '1.1rem',
                    fontWeight: 600,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)',
                    boxShadow: '0px 4px 20px rgba(116, 185, 255, 0.3)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #0984e3 0%, #0770c2 100%)',
                      boxShadow: '0px 6px 25px rgba(116, 185, 255, 0.4)',
                    },
                    '&:disabled': {
                      background: 'grey.300',
                      boxShadow: 'none',
                    },
                  }}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Calculate Rolling Returns'}
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
                  Rolling Returns Analysis
                </Typography>
                
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Average Return ({result.period})
                    </Typography>
                    <Typography 
                      variant="h6" 
                      color={result.averageReturn >= 0 ? 'success.main' : 'error.main'}
                    >
                      {result.averageReturn >= 0 ? '+' : ''}{result.averageReturn.toFixed(2)}%
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Best Return
                    </Typography>
                    <Typography variant="h6" color="success.main">
                      +{result.bestReturn.toFixed(2)}%
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Worst Return
                    </Typography>
                    <Typography variant="h6" color="error.main">
                      {result.worstReturn.toFixed(2)}%
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Success Rate
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {result.successRate.toFixed(1)}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      ({result.positivePeriods} out of {result.totalPeriods} periods)
                    </Typography>
                  </Box>

                  <Divider />

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Volatility (Range)
                    </Typography>
                    <Typography variant="h6">
                      {(result.bestReturn - result.worstReturn).toFixed(2)}%
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" fontWeight={600}>
                Rolling Returns Chart
              </Typography>
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(e, newMode) => newMode && setViewMode(newMode)}
                size="small"
              >
                <ToggleButton value="line">Line Chart</ToggleButton>
                <ToggleButton value="bar">Bar Chart</ToggleButton>
              </ToggleButtonGroup>
            </Box>
            <Box sx={{ height: 400 }}>
              <ResponsiveContainer width="100%" height="100%">
                {viewMode === 'line' ? (
                  <LineChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="period" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `${value.toFixed(2)}%`, 
                        name === 'return' ? 'Rolling Return' : 'Average Return'
                      ]}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="return" 
                      stroke="#74b9ff" 
                      strokeWidth={2}
                      dot={{ fill: '#74b9ff', strokeWidth: 2, r: 4 }}
                      name="Rolling Return"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="average" 
                      stroke="#e17055" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      name="Average Return"
                    />
                  </LineChart>
                ) : (
                  <BarChart data={result.chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="period" 
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis 
                      tickFormatter={(value) => `${value.toFixed(1)}%`}
                    />
                    <Tooltip 
                      formatter={(value: any, name: string) => [
                        `${value.toFixed(2)}%`, 
                        name === 'return' ? 'Rolling Return' : 'Average Return'
                      ]}
                      labelFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <Bar 
                      dataKey="return" 
                      fill="#74b9ff"
                      name="Rolling Return"
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Statistics Summary */}
      {result && (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" color="success.main" fontWeight={700}>
                  {result.averageReturn >= 0 ? '+' : ''}{result.averageReturn.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Average Return
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" color="primary.main" fontWeight={700}>
                  {result.successRate.toFixed(0)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Success Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" color="success.main" fontWeight={700}>
                  +{result.bestReturn.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Best Return
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ borderRadius: 3, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="h4" color="error.main" fontWeight={700}>
                  {result.worstReturn.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Worst Return
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Container>
  );
}
