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
  IconButton,
  Tooltip
} from '@mui/material';
import { Add, Remove, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface WatchlistItem {
  id: string;
  fund: {
    schemeCode: string;
    schemeName: string;
    fundHouse: string;
    schemeCategory: string;
  };
  performance: {
    oneDay: number;
    oneMonth: number;
    threeMonths: number;
    sixMonths: number;
    oneYear: number;
  };
}

export default function WatchlistPage() {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/watchlist');
      const data = await response.json();
      
      if (data.success) {
        setWatchlist(data.data);
      } else {
        setError(data.error || 'Failed to fetch watchlist');
      }
    } catch (err) {
      setError('Failed to fetch watchlist');
      console.error('Error fetching watchlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWatchlist = async (fundId: string) => {
    try {
      const response = await fetch(`/api/watchlist/${fundId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setWatchlist(prev => prev.filter(item => item.id !== fundId));
      }
    } catch (err) {
      console.error('Error removing from watchlist:', err);
    }
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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight={800}>
          My Watchlist
        </Typography>
        <Button
          component={Link}
          href="/funds"
          variant="contained"
          startIcon={<Add />}
        >
          Add Funds
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {watchlist.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              Your watchlist is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Add mutual funds to track their performance
            </Typography>
            <Button
              component={Link}
              href="/funds"
              variant="contained"
              startIcon={<Add />}
            >
              Browse Funds
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {watchlist.map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 2
                  }
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ mb: 1, lineHeight: 1.2 }}>
                        {item.fund.schemeName}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.fund.fundHouse}
                      </Typography>
                      <Chip 
                        label={item.fund.schemeCategory} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                    <Tooltip title="Remove from watchlist">
                      <IconButton 
                        size="small" 
                        onClick={() => removeFromWatchlist(item.id)}
                        color="error"
                      >
                        <Remove />
                      </IconButton>
                    </Tooltip>
                  </Box>

                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        1 Day
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getPerformanceIcon(item.performance.oneDay)}
                        <Typography 
                          variant="body2" 
                          color={getPerformanceColor(item.performance.oneDay)}
                          fontWeight={600}
                        >
                          {item.performance.oneDay >= 0 ? '+' : ''}{item.performance.oneDay.toFixed(2)}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        1 Month
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getPerformanceIcon(item.performance.oneMonth)}
                        <Typography 
                          variant="body2" 
                          color={getPerformanceColor(item.performance.oneMonth)}
                          fontWeight={600}
                        >
                          {item.performance.oneMonth >= 0 ? '+' : ''}{item.performance.oneMonth.toFixed(2)}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        3 Months
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getPerformanceIcon(item.performance.threeMonths)}
                        <Typography 
                          variant="body2" 
                          color={getPerformanceColor(item.performance.threeMonths)}
                          fontWeight={600}
                        >
                          {item.performance.threeMonths >= 0 ? '+' : ''}{item.performance.threeMonths.toFixed(2)}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        6 Months
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getPerformanceIcon(item.performance.sixMonths)}
                        <Typography 
                          variant="body2" 
                          color={getPerformanceColor(item.performance.sixMonths)}
                          fontWeight={600}
                        >
                          {item.performance.sixMonths >= 0 ? '+' : ''}{item.performance.sixMonths.toFixed(2)}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        1 Year
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getPerformanceIcon(item.performance.oneYear)}
                        <Typography 
                          variant="body2" 
                          color={getPerformanceColor(item.performance.oneYear)}
                          fontWeight={600}
                        >
                          {item.performance.oneYear >= 0 ? '+' : ''}{item.performance.oneYear.toFixed(2)}%
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      component={Link}
                      href={`/funds/${item.fund.schemeCode}`}
                      variant="outlined"
                      fullWidth
                      size="small"
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
