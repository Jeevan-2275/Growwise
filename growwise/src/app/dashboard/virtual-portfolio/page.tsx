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
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { Add, Edit, Delete, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import Link from 'next/link';

interface VirtualPortfolio {
  id: string;
  name: string;
  description?: string;
  totalValue: number;
  totalInvested: number;
  absoluteReturn: number;
  sipEntries: VirtualSIP[];
}

interface VirtualSIP {
  id: string;
  fund: {
    schemeCode: string;
    schemeName: string;
    fundHouse: string;
  };
  amount: number;
  frequency: string;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  currentValue: number;
  totalInvested: number;
  absoluteReturn: number;
}

export default function VirtualPortfolioPage() {
  const [portfolios, setPortfolios] = useState<VirtualPortfolio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newPortfolioName, setNewPortfolioName] = useState('');
  const [newPortfolioDescription, setNewPortfolioDescription] = useState('');

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const fetchPortfolios = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/virtual-portfolio');
      const data = await response.json();
      
      if (data.success) {
        setPortfolios(data.data);
      } else {
        setError(data.error || 'Failed to fetch portfolios');
      }
    } catch (err) {
      setError('Failed to fetch portfolios');
      console.error('Error fetching portfolios:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPortfolio = async () => {
    try {
      const response = await fetch('/api/virtual-portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newPortfolioName,
          description: newPortfolioDescription
        })
      });

      const data = await response.json();

      if (data.success) {
        setPortfolios(prev => [...prev, data.data]);
        setCreateDialogOpen(false);
        setNewPortfolioName('');
        setNewPortfolioDescription('');
      } else {
        setError(data.error || 'Failed to create portfolio');
      }
    } catch (err) {
      setError('Failed to create portfolio');
      console.error('Error creating portfolio:', err);
    }
  };

  const deletePortfolio = async (portfolioId: string) => {
    try {
      const response = await fetch(`/api/virtual-portfolio/${portfolioId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        setPortfolios(prev => prev.filter(p => p.id !== portfolioId));
      }
    } catch (err) {
      console.error('Error deleting portfolio:', err);
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
          Virtual Portfolios
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setCreateDialogOpen(true)}
        >
          Create Portfolio
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {portfolios.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
              No virtual portfolios yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Create a virtual portfolio to simulate SIP investments
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setCreateDialogOpen(true)}
            >
              Create Your First Portfolio
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {portfolios.map((portfolio) => (
            <Grid item xs={12} md={6} lg={4} key={portfolio.id}>
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
                      <Typography variant="h6" sx={{ mb: 1 }}>
                        {portfolio.name}
                      </Typography>
                      {portfolio.description && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {portfolio.description}
                        </Typography>
                      )}
                    </Box>
                    <Box>
                      <Tooltip title="Edit portfolio">
                        <IconButton size="small">
                          <Edit />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete portfolio">
                        <IconButton 
                          size="small" 
                          onClick={() => deletePortfolio(portfolio.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>

                  <Stack spacing={2}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Total Invested
                      </Typography>
                      <Typography variant="h6">
                        ₹{portfolio.totalInvested.toLocaleString()}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Current Value
                      </Typography>
                      <Typography variant="h6" color="primary">
                        ₹{portfolio.totalValue.toLocaleString()}
                      </Typography>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Absolute Return
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {getPerformanceIcon(portfolio.absoluteReturn)}
                        <Typography 
                          variant="h6" 
                          color={getPerformanceColor(portfolio.absoluteReturn)}
                        >
                          {portfolio.absoluteReturn >= 0 ? '+' : ''}{portfolio.absoluteReturn.toFixed(2)}%
                        </Typography>
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Active SIPs
                      </Typography>
                      <Typography variant="body1">
                        {portfolio.sipEntries.filter(sip => sip.isActive).length} / {portfolio.sipEntries.length}
                      </Typography>
                    </Box>
                  </Stack>

                  <Box sx={{ mt: 2 }}>
                    <Button
                      component={Link}
                      href={`/dashboard/virtual-portfolio/${portfolio.id}`}
                      variant="outlined"
                      fullWidth
                      size="small"
                    >
                      Manage Portfolio
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create Portfolio Dialog */}
      <Dialog open={createDialogOpen} onClose={() => setCreateDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Virtual Portfolio</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Portfolio Name"
              value={newPortfolioName}
              onChange={(e) => setNewPortfolioName(e.target.value)}
              fullWidth
              required
            />
            <TextField
              label="Description (Optional)"
              value={newPortfolioDescription}
              onChange={(e) => setNewPortfolioDescription(e.target.value)}
              fullWidth
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={createPortfolio} 
            variant="contained"
            disabled={!newPortfolioName.trim()}
          >
            Create Portfolio
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
