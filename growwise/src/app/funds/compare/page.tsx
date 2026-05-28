'use client';

import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Grid, 
  Button, 
  Chip, 
  Stack,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import { Add, Remove, TrendingUp, TrendingDown, Compare } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Legend } from 'recharts';

interface Fund {
  schemeCode: string;
  schemeName: string;
  fundHouse: string;
  schemeType: string;
  schemeCategory: string;
  currentNAV: number;
  returns: {
    oneMonth: number | null;
    threeMonths: number | null;
    sixMonths: number | null;
    oneYear: number | null;
  };
  navHistory: Array<{
    date: string;
    nav: number;
  }>;
}

interface ComparisonData {
  funds: Fund[];
  metrics: {
    bestPerformer: {
      oneMonth: Fund;
      threeMonths: Fund;
      sixMonths: Fund;
      oneYear: Fund;
    };
    averageReturns: {
      oneMonth: number;
      threeMonths: number;
      sixMonths: number;
      oneYear: number;
    };
  };
}

export default function FundComparisonPage() {
  const [availableFunds, setAvailableFunds] = useState<any[]>([]);
  const [selectedFunds, setSelectedFunds] = useState<string[]>([]);
  const [comparisonData, setComparisonData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableFunds();
  }, []);

  const fetchAvailableFunds = async () => {
    try {
      const response = await fetch('/api/mf');
      const data = await response.json();
      
      if (data.success) {
        setAvailableFunds(data.data.slice(0, 200)); // Limit to first 200 funds
      }
    } catch (err) {
      console.error('Error fetching funds:', err);
    }
  };

  const compareFunds = async () => {
    if (selectedFunds.length < 2) {
      setError('Please select at least 2 funds to compare');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/mf/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ schemeCodes: selectedFunds })
      });

      const data = await response.json();

      if (data.success) {
        setComparisonData(data.data);
      } else {
        setError(data.error || 'Failed to compare funds');
      }
    } catch (err) {
      setError('Failed to compare funds');
      console.error('Error comparing funds:', err);
    } finally {
      setLoading(false);
    }
  };

  const addFund = (schemeCode: string) => {
    if (selectedFunds.length < 5 && !selectedFunds.includes(schemeCode)) {
      setSelectedFunds(prev => [...prev, schemeCode]);
    }
  };

  const removeFund = (schemeCode: string) => {
    setSelectedFunds(prev => prev.filter(code => code !== schemeCode));
  };

  const getPerformanceColor = (value: number) => {
    if (value > 0) return 'success.main';
    if (value < 0) return 'error.main';
    return 'text.secondary';
  };

  const getPerformanceIcon = (value: number) => {
    if (value > 0) return <TrendingUp fontSize="small" />;
    if (value < 0) return <TrendingDown fontSize="small" />;
    return null;
  };

  const prepareChartData = () => {
    if (!comparisonData) return [];

    const chartData: any[] = [];
    const maxLength = Math.max(...comparisonData.funds.map(fund => fund.navHistory.length));
    
    for (let i = 0; i < maxLength; i++) {
      const dataPoint: any = { date: '' };
      
      comparisonData.funds.forEach(fund => {
        if (fund.navHistory[i]) {
          dataPoint[fund.schemeName] = fund.navHistory[i].nav;
          if (!dataPoint.date) {
            dataPoint.date = fund.navHistory[i].date;
          }
        }
      });
      
      chartData.push(dataPoint);
    }
    
    return chartData;
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
          Fund Comparison
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1.1rem' }}>
          Compare up to 5 mutual funds side by side
        </Typography>
      </Box>

      {/* Fund Selection */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 3 }}>
            Select Funds to Compare
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <Autocomplete
                options={availableFunds}
                getOptionLabel={(option) => `${option.schemeName} - ${option.fundHouse}`}
                value={null}
                onChange={(event, newValue) => {
                  if (newValue && selectedFunds.length < 5) {
                    addFund(newValue.schemeCode);
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Search and select funds"
                    placeholder="Type to search funds..."
                  />
                )}
                disabled={selectedFunds.length >= 5}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Button
                variant="contained"
                onClick={compareFunds}
                disabled={selectedFunds.length < 2 || loading}
                startIcon={loading ? <CircularProgress size={20} /> : <Compare />}
                fullWidth
              >
                {loading ? 'Comparing...' : 'Compare Funds'}
              </Button>
            </Grid>
          </Grid>

          {/* Selected Funds */}
          {selectedFunds.length > 0 && (
            <Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Selected Funds ({selectedFunds.length}/5):
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {selectedFunds.map(schemeCode => {
                  const fund = availableFunds.find(f => f.schemeCode === schemeCode);
                  return (
                    <Chip
                      key={schemeCode}
                      label={fund?.schemeName || schemeCode}
                      onDelete={() => removeFund(schemeCode)}
                      color="primary"
                      variant="outlined"
                    />
                  );
                })}
              </Stack>
            </Box>
          )}
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Comparison Results */}
      {comparisonData && (
        <Grid container spacing={3}>
          {/* Performance Table */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Performance Comparison
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Fund Name</TableCell>
                        <TableCell align="right">Current NAV</TableCell>
                        <TableCell align="right">1 Month</TableCell>
                        <TableCell align="right">3 Months</TableCell>
                        <TableCell align="right">6 Months</TableCell>
                        <TableCell align="right">1 Year</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {comparisonData.funds.map((fund) => (
                        <TableRow key={fund.schemeCode}>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {fund.schemeName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {fund.fundHouse} • {fund.schemeCategory}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            ₹{fund.currentNAV.toFixed(4)}
                          </TableCell>
                          <TableCell align="right">
                            {fund.returns.oneMonth !== null ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                {getPerformanceIcon(fund.returns.oneMonth)}
                                <Typography 
                                  color={getPerformanceColor(fund.returns.oneMonth)}
                                  fontWeight={600}
                                >
                                  {fund.returns.oneMonth >= 0 ? '+' : ''}{fund.returns.oneMonth.toFixed(2)}%
                                </Typography>
                              </Box>
                            ) : (
                              <Typography color="text.secondary">N/A</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {fund.returns.threeMonths !== null ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                {getPerformanceIcon(fund.returns.threeMonths)}
                                <Typography 
                                  color={getPerformanceColor(fund.returns.threeMonths)}
                                  fontWeight={600}
                                >
                                  {fund.returns.threeMonths >= 0 ? '+' : ''}{fund.returns.threeMonths.toFixed(2)}%
                                </Typography>
                              </Box>
                            ) : (
                              <Typography color="text.secondary">N/A</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {fund.returns.sixMonths !== null ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                {getPerformanceIcon(fund.returns.sixMonths)}
                                <Typography 
                                  color={getPerformanceColor(fund.returns.sixMonths)}
                                  fontWeight={600}
                                >
                                  {fund.returns.sixMonths >= 0 ? '+' : ''}{fund.returns.sixMonths.toFixed(2)}%
                                </Typography>
                              </Box>
                            ) : (
                              <Typography color="text.secondary">N/A</Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            {fund.returns.oneYear !== null ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                                {getPerformanceIcon(fund.returns.oneYear)}
                                <Typography 
                                  color={getPerformanceColor(fund.returns.oneYear)}
                                  fontWeight={600}
                                >
                                  {fund.returns.oneYear >= 0 ? '+' : ''}{fund.returns.oneYear.toFixed(2)}%
                                </Typography>
                              </Box>
                            ) : (
                              <Typography color="text.secondary">N/A</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* NAV Trend Chart */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  NAV Trend Comparison
                </Typography>
                <Box sx={{ height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis 
                        tickFormatter={(value) => `₹${value.toFixed(2)}`}
                      />
                      <RechartsTooltip 
                        formatter={(value: any, name: string) => [
                          `₹${value.toFixed(4)}`, 
                          name
                        ]}
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Legend />
                      {comparisonData.funds.map((fund, index) => (
                        <Line
                          key={fund.schemeCode}
                          type="monotone"
                          dataKey={fund.schemeName}
                          stroke={`hsl(${index * 60}, 70%, 50%)`}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Best Performers */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 3 }}>
                  Best Performers
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        1 Month
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {comparisonData.metrics.bestPerformer.oneMonth.schemeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {comparisonData.metrics.bestPerformer.oneMonth.returns.oneMonth?.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        3 Months
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {comparisonData.metrics.bestPerformer.threeMonths.schemeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {comparisonData.metrics.bestPerformer.threeMonths.returns.threeMonths?.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        6 Months
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {comparisonData.metrics.bestPerformer.sixMonths.schemeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {comparisonData.metrics.bestPerformer.sixMonths.returns.sixMonths?.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        1 Year
                      </Typography>
                      <Typography variant="h6" fontWeight={600}>
                        {comparisonData.metrics.bestPerformer.oneYear.schemeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {comparisonData.metrics.bestPerformer.oneYear.returns.oneYear?.toFixed(2)}%
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
