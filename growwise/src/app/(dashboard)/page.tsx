"use client"

import dynamic from 'next/dynamic'
import { 
  Box, 
  Fab, 
  Grid, 
  Paper, 
  Typography, 
  Card, 
  CardContent, 
  Stack, 
  Divider, 
  Chip, 
  LinearProgress,
  Container,
  Button,
  Avatar,
  IconButton,
  useTheme
} from '@mui/material'
import ChatIcon from '@mui/icons-material/Chat'
import AddIcon from '@mui/icons-material/Add'
import TrendingUpIcon from '@mui/icons-material/TrendingUp'
import TrendingDownIcon from '@mui/icons-material/TrendingDown'
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import { mockFunds } from '@/data/mock/funds'
import Link from 'next/link'

const DynamicChart = dynamic(() => import('@/components/mf/FundChart'), { ssr: false })

export default function DashboardPage() {
  const sample = mockFunds[0]
  const theme = useTheme()
  
  const portfolioSummary = {
    invested: 250000,
    current: 312450,
    returns: 62450,
    returnPercentage: 24.98,
    allocation: [
      { category: 'Equity', percentage: 65, amount: 203087.5 },
      { category: 'Debt', percentage: 25, amount: 78112.5 },
      { category: 'Gold', percentage: 10, amount: 31245 }
    ]
  }
  
  const recentFunds = mockFunds.slice(0, 3).map(fund => ({
    ...fund,
    invested: Math.floor(Math.random() * 50000) + 10000,
    returns: Math.floor(Math.random() * 20000) - 5000
  }))

  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={800}>Dashboard</Typography>
        <Button variant="contained" startIcon={<AddIcon />}>
          Add Investment
        </Button>
      </Box>
      
      {/* Portfolio Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%',
              border: '1px solid',
              borderColor: theme.palette.divider,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Invested
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                ₹{portfolioSummary.invested.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip 
                  size="small" 
                  icon={<TrendingUpIcon fontSize="small" />} 
                  label="Active" 
                  color="success" 
                  variant="outlined" 
                />
                <Typography variant="body2" color="text.secondary">
                  Last updated today
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%',
              border: '1px solid',
              borderColor: theme.palette.divider,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Current Value
              </Typography>
              <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                ₹{portfolioSummary.current.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Chip 
                  size="small" 
                  icon={<ArrowUpwardIcon fontSize="small" />} 
                  label={`+${portfolioSummary.returnPercentage}%`} 
                  color="success" 
                  variant="outlined" 
                />
                <Typography variant="body2" color="text.secondary">
                  Since inception
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              height: '100%',
              border: '1px solid',
              borderColor: theme.palette.divider,
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
              }
            }}
          >
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Total Returns
              </Typography>
              <Typography 
                variant="h4" 
                fontWeight={700} 
                color={portfolioSummary.returns >= 0 ? 'success.main' : 'error.main'}
                sx={{ mb: 1 }}
              >
                ₹{portfolioSummary.returns.toLocaleString()}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                {portfolioSummary.returns >= 0 ? (
                  <Chip 
                    size="small" 
                    icon={<ArrowUpwardIcon fontSize="small" />} 
                    label="Profit" 
                    color="success" 
                    variant="outlined" 
                  />
                ) : (
                  <Chip 
                    size="small" 
                    icon={<ArrowDownwardIcon fontSize="small" />} 
                    label="Loss" 
                    color="error" 
                    variant="outlined" 
                  />
                )}
                <Typography variant="body2" color="text.secondary">
                  Overall performance
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Left Column */}
        <Grid item xs={12} md={8}>
          <Card 
            elevation={0} 
            sx={{ 
              mb: 3,
              border: '1px solid',
              borderColor: theme.palette.divider
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Portfolio Performance</Typography>
                <Box>
                  <Button size="small" variant="outlined" sx={{ mr: 1 }}>1M</Button>
                  <Button size="small" variant="contained">1Y</Button>
                  <Button size="small" variant="outlined" sx={{ ml: 1 }}>All</Button>
                </Box>
              </Box>
              <DynamicChart data={sample.history.map(h => ({ date: h.date, nav: String(h.nav) }))} />
            </CardContent>
          </Card>
          
          <Card 
            elevation={0} 
            sx={{ 
              border: '1px solid',
              borderColor: theme.palette.divider
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Recent Investments</Typography>
              <Stack spacing={2}>
                {recentFunds.map((fund, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar 
                          sx={{ 
                            bgcolor: theme.palette.primary.light,
                            color: theme.palette.primary.contrastText,
                            width: 40,
                            height: 40
                          }}
                        >
                          {fund.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {fund.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {fund.category}
                          </Typography>
                        </Box>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          ₹{fund.invested.toLocaleString()}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          color={fund.returns >= 0 ? 'success.main' : 'error.main'}
                          sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}
                        >
                          {fund.returns >= 0 ? (
                            <ArrowUpwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                          ) : (
                            <ArrowDownwardIcon fontSize="small" sx={{ mr: 0.5 }} />
                          )}
                          ₹{Math.abs(fund.returns).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>
                    {index < recentFunds.length - 1 && <Divider sx={{ mt: 2 }} />}
                  </Box>
                ))}
              </Stack>
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Button 
                  component={Link}
                  href="/funds"
                  variant="text" 
                  color="primary"
                >
                  View All Investments
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Right Column */}
        <Grid item xs={12} md={4}>
          <Card 
            elevation={0} 
            sx={{ 
              mb: 3,
              border: '1px solid',
              borderColor: theme.palette.divider
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>Asset Allocation</Typography>
                <IconButton size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>
              
              <Stack spacing={2}>
                {portfolioSummary.allocation.map((asset, index) => (
                  <Box key={index}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2" fontWeight={500}>
                        {asset.category}
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {asset.percentage}%
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={asset.percentage} 
                      sx={{ 
                        height: 8, 
                        borderRadius: 4,
                        bgcolor: theme.palette.grey[100],
                        '& .MuiLinearProgress-bar': {
                          bgcolor: index === 0 
                            ? theme.palette.primary.main 
                            : index === 1 
                              ? theme.palette.secondary.main 
                              : theme.palette.warning.main
                        }
                      }} 
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      ₹{asset.amount.toLocaleString()}
                    </Typography>
                  </Box>
                ))}
              </Stack>
              
              <Button 
                fullWidth 
                variant="outlined" 
                sx={{ mt: 2 }}
                component={Link}
                href="/calculators"
              >
                Rebalance Portfolio
              </Button>
            </CardContent>
          </Card>
          
          <Card 
            elevation={0} 
            sx={{ 
              border: '1px solid',
              borderColor: theme.palette.divider
            }}
          >
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Financial Goals</Typography>
              
              <Stack spacing={2}>
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body1" fontWeight={500}>
                      Retirement
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      35%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={35} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: theme.palette.grey[100]
                    }} 
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      ₹17.5L of ₹50L
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      2045
                    </Typography>
                  </Box>
                </Box>
                
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body1" fontWeight={500}>
                      Home Purchase
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      60%
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={60} 
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      bgcolor: theme.palette.grey[100],
                      '& .MuiLinearProgress-bar': {
                        bgcolor: theme.palette.secondary.main
                      }
                    }} 
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      ₹12L of ₹20L
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      2025
                    </Typography>
                  </Box>
                </Box>
              </Stack>
              
              <Button 
                fullWidth 
                variant="contained" 
                startIcon={<AddIcon />}
                sx={{ mt: 2 }}
              >
                Add New Goal
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Fab 
        color="primary" 
        sx={{ 
          position: 'fixed', 
          bottom: 24, 
          right: 24,
          boxShadow: '0 8px 16px rgba(0,0,0,0.2)'
        }} 
        onClick={() => window.dispatchEvent(new CustomEvent('gw_open_chat'))}
      >
        <ChatIcon />
      </Fab>
    </Container>
  )
}