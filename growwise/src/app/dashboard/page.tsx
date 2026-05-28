'use client';

import { 
  Box, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  Button,
  Stack,
  Container,
  Avatar,
  Chip
} from '@mui/material';
import { 
  TrendingUp, 
  Search, 
  WatchLater, 
  AccountBalanceWallet,
  Calculate,
  Chat,
  Analytics,
  Speed,
  Security
} from '@mui/icons-material';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Welcome Section */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
          Welcome back{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}! 👋
        </Typography>
        <Typography color="text.secondary" sx={{ fontSize: '1.1rem', maxWidth: 600 }}>
          Your comprehensive mutual fund exploration and investment simulation platform.
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 6 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <Search />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    5000+
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Funds Available
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #6c5ce7 0%, #5f3dc4 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    Live
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Real-time NAV
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #74b9ff 0%, #0984e3 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <Chat />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    24/7
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    AI Assistant
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #fdcb6e 0%, #e17055 100%)', color: 'white' }}>
            <CardContent sx={{ p: 3 }}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)', width: 48, height: 48 }}>
                  <Security />
                </Avatar>
                <Box>
                  <Typography variant="h4" fontWeight={700}>
                    99%
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    Uptime
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Features */}
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Quick Actions
      </Typography>
      
      <Grid container spacing={3}>
        {/* Fund Explorer */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'grey.200',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
                borderColor: 'primary.main',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'primary.50', color: 'primary.main', width: 48, height: 48 }}>
                    <Search />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Fund Explorer
                    </Typography>
                    <Chip label="5000+ Funds" size="small" sx={{ backgroundColor: 'primary.50', color: 'primary.main' }} />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Browse and search through thousands of mutual funds with advanced filters and real-time data.
                </Typography>
                <Button
                  component={Link}
                  href="/funds"
                  variant="contained"
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    background: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
                    },
                  }}
                >
                  Explore Funds
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* SIP Calculator */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'grey.200',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
                borderColor: 'secondary.main',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'secondary.50', color: 'secondary.main', width: 48, height: 48 }}>
                    <Calculate />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      SIP Calculator
                    </Typography>
                    <Chip label="Real-time NAV" size="small" sx={{ backgroundColor: 'secondary.50', color: 'secondary.main' }} />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Calculate SIP returns using historical NAV data for accurate investment planning.
                </Typography>
                <Button
                  component={Link}
                  href="/calculators/sip"
                  variant="outlined"
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: 'secondary.main',
                    color: 'secondary.main',
                    '&:hover': {
                      borderColor: 'secondary.dark',
                      backgroundColor: 'secondary.50',
                    },
                  }}
                >
                  Start Calculating
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Watchlist */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'grey.200',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
                borderColor: 'info.main',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'info.50', color: 'info.main', width: 48, height: 48 }}>
                    <WatchLater />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Watchlist
                    </Typography>
                    <Chip label="Track Funds" size="small" sx={{ backgroundColor: 'info.50', color: 'info.main' }} />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Track your favorite funds and monitor their performance across different time periods.
                </Typography>
                <Button
                  component={Link}
                  href="/dashboard/watchlist"
                  variant="outlined"
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: 'info.main',
                    color: 'info.main',
                    '&:hover': {
                      borderColor: 'info.dark',
                      backgroundColor: 'info.50',
                    },
                  }}
                >
                  View Watchlist
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Virtual Portfolio */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'grey.200',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
                borderColor: 'warning.main',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'warning.50', color: 'warning.main', width: 48, height: 48 }}>
                    <AccountBalanceWallet />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Virtual Portfolio
                    </Typography>
                    <Chip label="Simulate" size="small" sx={{ backgroundColor: 'warning.50', color: 'warning.main' }} />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Simulate investment strategies with virtual money and track performance over time.
                </Typography>
                <Button
                  component={Link}
                  href="/dashboard/virtual-portfolio"
                  variant="outlined"
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: 'warning.main',
                    color: 'warning.main',
                    '&:hover': {
                      borderColor: 'warning.dark',
                      backgroundColor: 'warning.50',
                    },
                  }}
                >
                  Create Portfolio
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* AI Assistant */}
        <Grid item xs={12} md={6} lg={4}>
          <Card 
            sx={{ 
              height: '100%',
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'grey.200',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
                borderColor: 'success.main',
              }
            }}
          >
            <CardContent sx={{ p: 4 }}>
              <Stack spacing={3}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Avatar sx={{ bgcolor: 'success.50', color: 'success.main', width: 48, height: 48 }}>
                    <Chat />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      AI Assistant
                    </Typography>
                    <Chip label="24/7 Support" size="small" sx={{ backgroundColor: 'success.50', color: 'success.main' }} />
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  Get instant answers to your investment questions with our AI-powered chat assistant.
                </Typography>
                <Button
                  component={Link}
                  href="/dashboard"
                  variant="outlined"
                  fullWidth
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    borderColor: 'success.main',
                    color: 'success.main',
                    '&:hover': {
                      borderColor: 'success.dark',
                      backgroundColor: 'success.50',
                    },
                  }}
                >
                  Chat Now
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
