'use client';

import { useParams } from 'next/navigation';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  CircularProgress, 
  Alert,
  Card,
  CardContent,
  Chip,
  Stack,
  Divider,
  Tabs,
  Tab,
  Button
} from '@mui/material';
import { Add, Remove } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import FundChart from '@/components/mf/FundChart';
import ReturnsTable from '@/components/mf/ReturnsTable';
import LumpsumCalculator from '@/components/calculators/LumpsumCalculator';
import SipCalculator from '@/components/calculators/SipCalculator';
import SipStepupCalculator from '@/components/calculators/SipStepupCalculator';
import SwpCalculator from '@/components/calculators/SwpCalculator';
import SwpStepupCalculator from '@/components/calculators/SwpStepupCalculator';
import RollingBacktest from '@/components/calculators/RollingBacktest';
interface FundData {
  schemeCode: string;
  schemeName: string;
  fundHouse: string;
  schemeType: string;
  schemeCategory: string;
  isActive: boolean;
  isTrending?: boolean;
  nav?: string;
  aum?: string;
  oneMonthReturn?: string;     // ✅ Added
  threeMonthReturn?: string;   // ✅ Added
  sixMonthReturn?: string;     // ✅ Added
  oneYearReturn?: string;
  threeYearReturn?: string;
  fiveYearReturn?: string;
  riskLevel?: string;
  description?: string;
  navHistory: Array<{
    date: string;
    nav: number;
  }>;
}
interface ReturnsData {
  schemeCode: string;
  schemeName: string;
  startDate: string;
  endDate: string;
  startNAV: number;
  endNAV: number;
  simpleReturn: number;
  annualizedReturn: number | null;
  daysDiff: number;
  dataPoints: number;
}

export default function FundDetailPage() {
  const { schemecode } = useParams<{ schemecode: string }>();
  const [fund, setFund] = useState<FundData | null>(null);
  const [returns, setReturns] = useState<ReturnsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistLoading, setWatchlistLoading] = useState(false);
  
  // Tab labels
  const tabLabels = [
    "NAV Chart",
    "SIP Calculator",
    "SIP Step-up",
    "SWP Calculator",
    "SWP Step-up",
    "Lumpsum Calculator",
    "Returns Analysis",
    "Rolling Returns"
  ];

  // Check if fund is in watchlist
  const checkWatchlist = async (schemeCode: string) => {
    try {
      const res = await fetch(`/api/watchlist/check?schemeCode=${schemeCode}`);
      const data = await res.json();
      setInWatchlist(data.inWatchlist);
    } catch (error) {
      console.error('Error checking watchlist:', error);
    }
  };
  
  // Toggle watchlist status
  const toggleWatchlist = async () => {
    if (!fund) return;
    
    try {
      setWatchlistLoading(true);
      
      if (inWatchlist) {
        // Remove from watchlist
        await fetch(`/api/watchlist`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ schemeCode: fund.schemeCode }),
        });
        setInWatchlist(false);
      } else {
        // Add to watchlist
        await fetch(`/api/watchlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ schemeCode: fund.schemeCode }),
        });
        setInWatchlist(true);
      }
    } catch (error) {
      console.error('Error toggling watchlist:', error);
    } finally {
      setWatchlistLoading(false);
    }
  };

  useEffect(() => {
    const fetchFundData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Regular API fetch for funds
        console.log(`Fetching fund data for scheme: ${schemecode}`);
        const res = await fetch(`/api/mf/${schemecode}`);
        
        if (!res.ok) {
          throw new Error(`API request failed with status: ${res.status}`);
        }
        
        const json = await res.json();
        console.log('API Response:', json);
        
        if (!json.success) {
          throw new Error(json.error || 'Failed to load fund data');
        }
        
        // Process the fund data
        const f = json.data;
        
        // Handle different API response formats
        let navHistory = [];
        if (Array.isArray(f.navHistory)) {
          navHistory = f.navHistory;
        } else if (f.data && Array.isArray(f.data)) {
          navHistory = f.data.map((item: any) => ({
            date: item.date,
            nav: parseFloat(item.nav)
          })).reverse();
        } else {
          console.warn('Unexpected NAV history format:', f);
          // Create fallback NAV history
          navHistory = Array.from({ length: 365 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - 365 + i);
            return {
              date: date.toISOString().split('T')[0],
              nav: 100 + Math.sin(i / 30) * 5 + i / 60
            };
          });
        }
        
        const fundData: FundData = {
          schemeCode: f.schemeCode || f.scheme_code || schemecode as string,
          schemeName: f.schemeName || f.scheme_name || `Fund ${schemecode}`,
          fundHouse: f.fundHouse || f.fund_house || 'N/A',
          schemeType: f.schemeType || f.scheme_type || 'N/A',
          schemeCategory: f.schemeCategory || f.scheme_category || 'N/A',
          isActive: f.isActive !== undefined ? f.isActive : true,
          nav: f.nav || (navHistory.length > 0 ? navHistory[navHistory.length - 1].nav.toFixed(4) : '0.00'),
          aum: f.aum || 'N/A',
          oneYearReturn: f.oneYearReturn || 'N/A',
          threeYearReturn: f.threeYearReturn || 'N/A',
          fiveYearReturn: f.fiveYearReturn || 'N/A',
          riskLevel: f.riskLevel || 'Moderate',
          description: f.description || `${f.schemeName || 'This fund'} is managed by ${f.fundHouse || 'an AMC'} and belongs to the ${f.schemeCategory || 'mutual fund'} category.`,
          navHistory: navHistory,
        };
        setFund(fundData);

        // Fetch returns for 1 year
        try {
          const retRes = await fetch(`/api/mf/${schemecode}/returns?period=1y`);
          const retJson = await retRes.json();
          if (retJson.success) setReturns(retJson.data);
        } catch (retErr) {
          console.error('Error fetching returns:', retErr);
          // Create fallback returns data if API fails
          if (navHistory.length > 0) {
            const startNAV = navHistory[0].nav;
            const endNAV = navHistory[navHistory.length - 1].nav;
            const simpleReturn = ((endNAV - startNAV) / startNAV) * 100;
            setReturns({
              schemeCode: fundData.schemeCode,
              schemeName: fundData.schemeName,
              startDate: navHistory[0].date,
              endDate: navHistory[navHistory.length - 1].date,
              startNAV,
              endNAV,
              simpleReturn,
              annualizedReturn: simpleReturn,
              daysDiff: 365,
              dataPoints: navHistory.length
            });
          }
        }
        
        // Check if fund is in watchlist
        await checkWatchlist(schemecode as string);
      } catch (err) {
        console.error('Error fetching fund data:', err);
        setError('Failed to fetch fund data. Please try again later.');
        
        // Set fallback data on error
        const fallbackFund: FundData = {
          schemeCode: schemecode as string,
          schemeName: `Fund ${schemecode}`,
          fundHouse: 'Growwise Asset Management',
          schemeType: 'Open Ended',
          schemeCategory: 'Equity',
          isActive: true,
          nav: '100.50',
          aum: '₹1,000 Cr',
          oneYearReturn: '12.5%',
          threeYearReturn: '36.7%',
          fiveYearReturn: '62.3%',
          riskLevel: 'Moderate',
          description: 'This is a sample fund that invests in a diversified portfolio of equity and equity-related securities of companies across market capitalizations.',
          navHistory: Array.from({ length: 365 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - 365 + i);
            return {
              date: date.toISOString().split('T')[0],
              nav: 100 + Math.sin(i / 30) * 5 + i / 60
            };
          })
        };
        setFund(fallbackFund);
        
        // Create fallback returns data
        const navHistory = fallbackFund.navHistory;
        const startNAV = navHistory[0].nav;
        const endNAV = navHistory[navHistory.length - 1].nav;
        const simpleReturn = ((endNAV - startNAV) / startNAV) * 100;
        setReturns({
          schemeCode: fallbackFund.schemeCode,
          schemeName: fallbackFund.schemeName,
          startDate: navHistory[0].date,
          endDate: navHistory[navHistory.length - 1].date,
          startNAV,
          endNAV,
          simpleReturn,
          annualizedReturn: simpleReturn,
          daysDiff: 365,
          dataPoints: navHistory.length
        });
      } finally {
        setLoading(false);
      }
    };
    
    if (schemecode) {
      fetchFundData();
    }
  }, [schemecode]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !fund) {
    return (
      <Box>
        <Alert severity="error">
          {error || 'Fund not found'}
        </Alert>
      </Box>
    );
  }

  const latestNav = fund.navHistory[fund.navHistory.length - 1]?.nav || 0;
  const previousNav = fund.navHistory[fund.navHistory.length - 2]?.nav || latestNav;
  const dailyChange = latestNav - previousNav;
  const dailyChangePercent = previousNav > 0 ? (dailyChange / previousNav) * 100 : 0;
  
  // Get current NAV value
  const currentNav = fund?.nav || (fund?.navHistory && fund.navHistory.length > 0 
    ? fund.navHistory[fund.navHistory.length - 1].nav.toFixed(4) 
    : "0.00");

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
              {fund.schemeName}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Typography color="text.secondary">
                Code: {fund.schemeCode}
              </Typography>
              <Chip label={fund.schemeCategory} size="small" color="primary" />
              <Chip label={fund.fundHouse} size="small" variant="outlined" />
              <Chip label={`Risk: ${fund.riskLevel || 'Moderate'}`} size="small" color={
                fund.riskLevel === 'High' ? 'error' : 
                fund.riskLevel === 'Low' ? 'success' : 'warning'
              } />
            </Stack>
          </Box>
          
          {/* NAV and Change */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="h4" fontWeight={700}>
              ₹{currentNav}
            </Typography>
            <Typography 
              color={dailyChange >= 0 ? 'success.main' : 'error.main'}
              sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
            >
              {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(2)} 
              ({dailyChange >= 0 ? '+' : ''}{dailyChangePercent.toFixed(2)}%)
              {dailyChange >= 0 ? <Add fontSize="small" /> : <Remove fontSize="small" />}
            </Typography>
          </Box>
          <Stack direction="row" spacing={2}>
            <Button
              variant="contained"
              color="success"
              onClick={async () => {
                // Add to virtual portfolio with all calculators
                const calculators = [
                  { type: 'sip', amount: 5000, frequency: 'monthly' },
                  { type: 'lumpsum', amount: 100000 },
                  { type: 'swp', amount: 2000, frequency: 'monthly' }
                ];
                
                try {
                  // Show confirmation dialog
                  if (window.confirm(`Add ${fund.schemeName} to your portfolio with all calculators?`)) {
                    // Get the first portfolio or create one if none exists
                    const portfolioRes = await fetch('/api/virtual-portfolio');
                    const portfolioData = await portfolioRes.json();
                    
                    let portfolioId;
                    if (portfolioData.success && portfolioData.data.length > 0) {
                      portfolioId = portfolioData.data[0].id;
                    } else {
                      // Create a new portfolio
                      const newPortfolioRes = await fetch('/api/virtual-portfolio', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: 'My Portfolio' })
                      });
                      const newPortfolioData = await newPortfolioRes.json();
                      if (newPortfolioData.success) {
                        portfolioId = newPortfolioData.data.id;
                      } else {
                        throw new Error('Failed to create portfolio');
                      }
                    }
                    
                    // Add each calculator type
                    const results = await Promise.all(calculators.map(async (calc) => {
                      if (calc.type === 'sip') {
                        return fetch('/api/virtual-portfolio/sip', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            portfolioId,
                            schemeCode: fund.schemeCode,
                            amount: calc.amount,
                            frequency: calc.frequency
                          })
                        });
                      } else if (calc.type === 'lumpsum') {
                        return fetch('/api/virtual-portfolio/lumpsum', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            portfolioId,
                            schemeCode: fund.schemeCode,
                            amount: calc.amount
                          })
                        });
                      } else if (calc.type === 'swp') {
                        return fetch('/api/virtual-portfolio/swp', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            portfolioId,
                            schemeCode: fund.schemeCode,
                            amount: calc.amount,
                            frequency: calc.frequency
                          })
                        });
                      }
                    }));
                    
                    alert("All calculators added to your portfolio successfully!");
                  }
                } catch (error) {
                  console.error('Error adding calculators:', error);
                  alert("Failed to add calculators. Please try again.");
                }
              }}
              sx={{ minWidth: 150 }}
            >
              Add All Calculators
            </Button>
            <Button
              variant={inWatchlist ? "outlined" : "contained"}
              color={inWatchlist ? "error" : "primary"}
              onClick={toggleWatchlist}
              disabled={watchlistLoading}
              startIcon={inWatchlist ? <Remove /> : <Add />}
              sx={{ minWidth: 150 }}
            >
              {watchlistLoading ? 'Processing...' : inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
            </Button>
          </Stack>
        </Box>
        
        {/* NAV Summary */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Current NAV
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  ₹{currentNav}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <Typography 
                    color={dailyChange >= 0 ? 'success.main' : 'error.main'}
                    variant="body2"
                  >
                    {dailyChange >= 0 ? '+' : ''}{dailyChange.toFixed(4)}
                  </Typography>
                  <Typography 
                    color={dailyChange >= 0 ? 'success.main' : 'error.main'}
                    variant="body2"
                  >
                    ({dailyChangePercent >= 0 ? '+' : ''}{dailyChangePercent.toFixed(2)}%)
                  </Typography>
                </Stack>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Fund Information
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Type:</strong> {fund.schemeType}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Category:</strong> {fund.schemeCategory}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Fund House:</strong> {fund.fundHouse}
                  </Typography>
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="NAV Chart" />
          <Tab label="SIP Calculator" />
          <Tab label="SIP Step-up" />
          <Tab label="SWP Calculator" />
          <Tab label="SWP Step-up" />
          <Tab label="Lumpsum Calculator" />
          <Tab label="Returns Analysis" />
          <Tab label="Rolling Returns" />
        </Tabs>
      </Box>

      {/* Fund Description */}
      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            About This Fund
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {fund.description || 
              `${fund.schemeName} is a ${fund.schemeType.toLowerCase()} mutual fund from ${fund.fundHouse}. 
              It falls under the ${fund.schemeCategory.toLowerCase()} category and is designed for investors 
              looking for ${fund.riskLevel ? fund.riskLevel.toLowerCase() : 'balanced'} risk exposure. 
              This fund aims to provide capital appreciation through strategic investments in 
              ${fund.schemeType === 'Equity' ? 'stocks and equity-related instruments' : 
                fund.schemeType === 'Debt' ? 'fixed income securities' : 
                'a mix of equity and debt instruments'}.`
            }
          </Typography>
          
          {/* Investment Potential */}
          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Investment Potential
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    Current NAV
                  </Typography>
                  <Typography variant="h6">
                    ₹{currentNav}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    1 Year Return
                  </Typography>
                  <Typography variant="h6" color={parseFloat(fund.oneYearReturn || '0') > 0 ? 'success.main' : 'error.main'}>
                    {fund.oneYearReturn || (returns?.annualizedReturn ? (returns.annualizedReturn * 100).toFixed(2) + '%' : 'N/A')}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    3 Year Return
                  </Typography>
                  <Typography variant="h6" color={parseFloat(fund.threeYearReturn || '0') > 0 ? 'success.main' : 'error.main'}>
                    {fund.threeYearReturn || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={3}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="subtitle2" color="text.secondary">
                    5 Year Return
                  </Typography>
                  <Typography variant="h6" color={parseFloat(fund.fiveYearReturn || '0') > 0 ? 'success.main' : 'error.main'}>
                    {fund.fiveYearReturn || 'N/A'}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Risk Level:</strong> {fund.riskLevel || 'Moderate'} - This fund is suitable for investors with a 
            {fund.riskLevel === 'Low' ? ' conservative approach who prioritize capital preservation.' : 
             fund.riskLevel === 'Moderate' ? ' balanced approach to risk and return.' : 
             fund.riskLevel === 'Moderately High' ? ' higher risk tolerance seeking better returns.' : 
             fund.riskLevel === 'High' ? ' high risk tolerance aiming for maximum returns.' : 
             ' moderate risk tolerance.'}
          </Typography>
          
          <Typography variant="body2" sx={{ mt: 2 }}>
            <strong>Assets Under Management:</strong> {fund.aum || 'Data not available'}
          </Typography>
        </Paper>
      </Box>
              {/* Tab Content */}
      {activeTab === 0 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                NAV Trend (Last 1 Year)
              </Typography>
              <FundChart 
                data={fund.navHistory.map(h => ({ 
                  date: h.date, 
                  nav: String(h.nav) 
                }))}
              />
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="h6" gutterBottom>Historical Returns</Typography>
                <ReturnsTable 
                  returns={[
                    { period: '1 Month', value: parseFloat(fund?.oneMonthReturn as string) || null },
                    { period: '3 Months', value: parseFloat(fund?.threeMonthReturn as string) || null },
                    { period: '6 Months', value: parseFloat(fund?.sixMonthReturn as string) || null },
                    { period: '1 Year', value: parseFloat(fund?.oneYearReturn as string) || null },
                    { period: '3 Years', value: parseFloat(fund?.threeYearReturn as string) || null },
                    { period: '5 Years', value: parseFloat(fund?.fiveYearReturn as string) || null },
                  ]}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                SIP Calculator
              </Typography>
              <SipCalculator schemeCode={fund.schemeCode} minimal />
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                SIP Step-up Calculator
              </Typography>
              <SipStepupCalculator schemeCode={fund.schemeCode} />
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 3 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                SWP Calculator
              </Typography>
              <SwpCalculator schemeCode={fund.schemeCode} />
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 4 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                SWP Step-up Calculator
              </Typography>
              <SwpStepupCalculator schemeCode={fund.schemeCode} />
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 5 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Lumpsum Calculator
              </Typography>
              <LumpsumCalculator schemeCode={fund.schemeCode} minimal />
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 6 && returns && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Performance Summary
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Period: {returns.startDate} to {returns.endDate}
                  </Typography>
                  <Typography variant="h6">
                    {returns.simpleReturn >= 0 ? '+' : ''}{returns.simpleReturn.toFixed(2)}%
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Annualized Return
                  </Typography>
                  <Typography variant="h6">
                    {returns.annualizedReturn ? 
                      `${returns.annualizedReturn >= 0 ? '+' : ''}${returns.annualizedReturn.toFixed(2)}%` : 
                      'N/A'
                    }
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    NAV Change
                  </Typography>
                  <Typography variant="h6">
                    ₹{returns.startNAV.toFixed(4)} → ₹{returns.endNAV.toFixed(4)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Fund Statistics
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Data Points
                  </Typography>
                  <Typography variant="h6">
                    {returns.dataPoints} days
                  </Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    Duration
                  </Typography>
                  <Typography variant="h6">
                    {Math.floor(returns.daysDiff / 365)} years, {Math.floor((returns.daysDiff % 365) / 30)} months
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {activeTab === 7 && (
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Rolling Returns Analysis
              </Typography>
              <RollingBacktest schemeCode={fund.schemeCode} />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}
