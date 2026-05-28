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
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { Add, Edit, Delete, TrendingUp, TrendingDown } from '@mui/icons-material';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

export default function PortfolioDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [portfolio, setPortfolio] = useState<VirtualPortfolio | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addSipDialogOpen, setAddSipDialogOpen] = useState(false);
  const [newSip, setNewSip] = useState({
    fundId: '',
    amount: 5000,
    frequency: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: ''
  });
  const [availableFunds, setAvailableFunds] = useState<any[]>([]);

  useEffect(() => {
    if (id) {
      fetchPortfolio();
      fetchAvailableFunds();
    }
  }, [id]);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/virtual-portfolio/${id}`);
      const data = await response.json();
      
      if (data.success) {
        setPortfolio(data.data);
      } else {
        setError(data.error || 'Failed to fetch portfolio');
      }
    } catch (err) {
      setError('Failed to fetch portfolio');
      console.error('Error fetching portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableFunds = async () => {
    try {
      const response = await fetch('/api/mf');
      const data = await response.json();
      
      if (data.success) {
        setAvailableFunds(data.data.slice(0, 100)); // Limit to first 100 funds
      }
    } catch (err) {
      console.error('Error fetching funds:', err);
    }
  };

  const addSip = async () => {
    try {
      const response = await fetch(`/api/virtual-portfolio/${id}/sip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSip)
      });

      const data = await response.json();

      if (data.success) {
        setAddSipDialogOpen(false);
        setNewSip({
          fundId: '',
          amount: 5000,
          frequency: 'monthly',
          startDate: new Date().toISOString().split('T')[0],
          endDate: ''
        });
        fetchPortfolio(); // Refresh portfolio data
      } else {
        setError(data.error || 'Failed to add SIP');
      }
    } catch (err) {
      setError('Failed to add SIP');
      console.error('Error adding SIP:', err);
    }
  };

  const toggleSipStatus = async (sipId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/virtual-portfolio/sip`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: sipId,
          isActive
        })
      });

      if (response.ok) {
        fetchPortfolio(); // Refresh portfolio data
      } else {
        setError('Failed to update SIP status');
      }
    } catch (err) {
      setError('Failed to update SIP status');
      console.error('Error updating SIP status:', err);
    }
  };

  const deleteSip = async (sipId: string) => {
    try {
      const response = await fetch(`/api/virtual-portfolio/sip?id=${sipId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchPortfolio(); // Refresh portfolio data
      } else {
        setError('Failed to delete SIP');
      }
    } catch (err) {
      setError('Failed to delete SIP');
      console.error('Error deleting SIP:', err);
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

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  if (!portfolio) {
    return (
      <Alert severity="warning" sx={{ mb: 3 }}>
        Portfolio not found
      </Alert>
    );
  }

  return (
    <Box>
      <Button 
        component={Link} 
        href="/dashboard/virtual-portfolio"
        sx={{ mb: 3 }}
      >
        Back to Portfolios
      </Button>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={800}>
            {portfolio.name}
          </Typography>
          {portfolio.description && (
            <Typography variant="body2" color="text.secondary">
              {portfolio.description}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => setAddSipDialogOpen(true)}
        >
          Add SIP
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total Invested
              </Typography>
              <Typography variant="h5">
                ₹{portfolio.totalInvested.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Current Value
              </Typography>
              <Typography variant="h5" color="primary">
                ₹{portfolio.totalValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Absolute Return
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getPerformanceIcon(portfolio.absoluteReturn)}
                <Typography 
                  variant="h5" 
                  color={getPerformanceColor(portfolio.absoluteReturn)}
                >
                  {portfolio.absoluteReturn >= 0 ? '+' : ''}{portfolio.absoluteReturn.toFixed(2)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" sx={{ mb: 2 }}>
        SIP Investments
      </Typography>

      {portfolio.sipEntries.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              No SIP investments yet
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddSipDialogOpen(true)}
            >
              Add Your First SIP
            </Button>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Fund</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Start Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Current Value</TableCell>
                <TableCell>Return</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {portfolio.sipEntries.map((sip) => (
                <TableRow key={sip.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {sip.fund.schemeName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {sip.fund.fundHouse}
                    </Typography>
                  </TableCell>
                  <TableCell>₹{sip.amount.toLocaleString()}</TableCell>
                  <TableCell>
                    {sip.frequency.charAt(0).toUpperCase() + sip.frequency.slice(1)}
                  </TableCell>
                  <TableCell>
                    {new Date(sip.startDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={sip.isActive ? "Active" : "Inactive"} 
                      color={sip.isActive ? "success" : "default"}
                      size="small"
                      onClick={() => toggleSipStatus(sip.id, !sip.isActive)}
                    />
                  </TableCell>
                  <TableCell>₹{sip.currentValue.toLocaleString()}</TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      {getPerformanceIcon(sip.absoluteReturn)}
                      <Typography 
                        color={getPerformanceColor(sip.absoluteReturn)}
                      >
                        {sip.absoluteReturn >= 0 ? '+' : ''}{sip.absoluteReturn.toFixed(2)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Tooltip title="Delete SIP">
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => deleteSip(sip.id)}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add SIP Dialog */}
      <Dialog open={addSipDialogOpen} onClose={() => setAddSipDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add SIP Investment</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Fund</InputLabel>
              <Select
                value={newSip.fundId}
                onChange={(e) => setNewSip({...newSip, fundId: e.target.value})}
                label="Fund"
              >
                {availableFunds.map((fund) => (
                  <MenuItem key={fund.schemeCode} value={fund.schemeCode}>
                    {fund.schemeName} - {fund.fundHouse}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              label="Amount (₹)"
              type="number"
              value={newSip.amount}
              onChange={(e) => setNewSip({...newSip, amount: Number(e.target.value)})}
              fullWidth
              InputProps={{ inputProps: { min: 100 } }}
            />
            
            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={newSip.frequency}
                onChange={(e) => setNewSip({...newSip, frequency: e.target.value})}
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
              value={newSip.startDate}
              onChange={(e) => setNewSip({...newSip, startDate: e.target.value})}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            
            <TextField
              label="End Date (Optional)"
              type="date"
              value={newSip.endDate}
              onChange={(e) => setNewSip({...newSip, endDate: e.target.value})}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSipDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={addSip} 
            variant="contained"
            disabled={!newSip.fundId || !newSip.amount}
          >
            Add SIP
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

// Original toggleSipStatus implementation
try {
  const response = await fetch(`/api/virtual-portfolio/sip/${sipId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive })
      });

      if (response.ok) {
        fetchPortfolio(); // Refresh portfolio data
      }
    } catch (err) {
      console.error('Error toggling SIP status:', err);
    }
  };

  const deleteSip = async (sipId: string) => {
    try {
      const response = await fetch(`/api/virtual-portfolio/sip/${sipId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        fetchPortfolio(); // Refresh portfolio data
      }
    } catch (err) {
      console.error('Error deleting SIP:', err);
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

  if (error || !portfolio) {
    return (
      <Box>
        <Alert severity="error">
          {error || 'Portfolio not found'}
        </Alert>
        <Button component={Link} href="/dashboard/virtual-portfolio" sx={{ mt: 2 }}>
          Back to Portfolios
        </Button>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ mb: 1 }}>
            {portfolio.name}
          </Typography>
          {portfolio.description && (
            <Typography variant="body1" color="text.secondary">
              {portfolio.description}
            </Typography>
          )}
        </Box>
        <Button
          component={Link}
          href="/dashboard/virtual-portfolio"
          variant="outlined"
        >
          Back to Portfolios
        </Button>
      </Box>

      {/* Portfolio Summary */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Invested
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                ₹{portfolio.totalInvested.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Current Value
              </Typography>
              <Typography variant="h5" fontWeight={600} color="primary">
                ₹{portfolio.totalValue.toLocaleString()}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Absolute Return
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {getPerformanceIcon(portfolio.absoluteReturn)}
                <Typography 
                  variant="h5" 
                  fontWeight={600}
                  color={getPerformanceColor(portfolio.absoluteReturn)}
                >
                  {portfolio.absoluteReturn >= 0 ? '+' : ''}{portfolio.absoluteReturn.toFixed(2)}%
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Active SIPs
              </Typography>
              <Typography variant="h5" fontWeight={600}>
                {portfolio.sipEntries.filter(sip => sip.isActive).length} / {portfolio.sipEntries.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* SIP Management */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight={600}>
              SIP Investments
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => setAddSipDialogOpen(true)}
            >
              Add SIP
            </Button>
          </Box>

          {portfolio.sipEntries.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                No SIP investments yet
              </Typography>
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => setAddSipDialogOpen(true)}
              >
                Add Your First SIP
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Fund</TableCell>
                    <TableCell align="right">Amount</TableCell>
                    <TableCell align="center">Frequency</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="right">Invested</TableCell>
                    <TableCell align="right">Current Value</TableCell>
                    <TableCell align="right">Return</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {portfolio.sipEntries.map((sip) => (
                    <TableRow key={sip.id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {sip.fund.schemeName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {sip.fund.fundHouse}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        ₹{sip.amount.toLocaleString()}
                      </TableCell>
                      <TableCell align="center">
                        <Chip label={sip.frequency} size="small" />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={sip.isActive ? 'Active' : 'Paused'} 
                          color={sip.isActive ? 'success' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        ₹{sip.totalInvested.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        ₹{sip.currentValue.toLocaleString()}
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                          {getPerformanceIcon(sip.absoluteReturn)}
                          <Typography 
                            color={getPerformanceColor(sip.absoluteReturn)}
                            fontWeight={600}
                          >
                            {sip.absoluteReturn >= 0 ? '+' : ''}{sip.absoluteReturn.toFixed(2)}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1}>
                          <Tooltip title={sip.isActive ? 'Pause SIP' : 'Resume SIP'}>
                            <IconButton 
                              size="small"
                              onClick={() => toggleSipStatus(sip.id, !sip.isActive)}
                            >
                              {sip.isActive ? <Delete /> : <Add />}
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete SIP">
                            <IconButton 
                              size="small" 
                              onClick={() => deleteSip(sip.id)}
                              color="error"
                            >
                              <Delete />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Add SIP Dialog */}
      <Dialog open={addSipDialogOpen} onClose={() => setAddSipDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New SIP Investment</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <FormControl fullWidth>
              <InputLabel>Select Fund</InputLabel>
              <Select
                value={newSip.fundId}
                onChange={(e) => setNewSip(prev => ({ ...prev, fundId: e.target.value }))}
                label="Select Fund"
              >
                {availableFunds.map((fund) => (
                  <MenuItem key={fund.schemeCode} value={fund.schemeCode}>
                    {fund.schemeName} - {fund.fundHouse}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="SIP Amount (₹)"
              type="number"
              value={newSip.amount}
              onChange={(e) => setNewSip(prev => ({ ...prev, amount: Number(e.target.value) }))}
              fullWidth
              inputProps={{ min: 100, step: 100 }}
            />

            <FormControl fullWidth>
              <InputLabel>Frequency</InputLabel>
              <Select
                value={newSip.frequency}
                onChange={(e) => setNewSip(prev => ({ ...prev, frequency: e.target.value }))}
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
              value={newSip.startDate}
              onChange={(e) => setNewSip(prev => ({ ...prev, startDate: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="End Date (Optional)"
              type="date"
              value={newSip.endDate}
              onChange={(e) => setNewSip(prev => ({ ...prev, endDate: e.target.value }))}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddSipDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={addSip} 
            variant="contained"
            disabled={!newSip.fundId || !newSip.amount}
          >
            Add SIP
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
