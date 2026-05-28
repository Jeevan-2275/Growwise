import { 
  Box, 
  Button, 
  Container, 
  Stack, 
  Typography, 
  Grid, 
  Card, 
  CardContent,
  Chip,
  Avatar
} from '@mui/material';
import Link from 'next/link';
import { 
  TrendingUp, 
  Calculate, 
  Search, 
  AccountBalanceWallet,
  Chat,
  Star,
  Speed,
  Security
} from '@mui/icons-material';

export default function HomePage() {
  const features = [
    {
      icon: <Search />,
      title: 'Smart Fund Discovery',
      description: 'Find the best mutual funds with AI-powered recommendations and advanced filtering.',
      color: '#00d4aa'
    },
    {
      icon: <Calculate />,
      title: 'Advanced Calculators',
      description: 'SIP, Lumpsum, SWP calculators with real-time NAV data and historical analysis.',
      color: '#6c5ce7'
    },
    {
      icon: <AccountBalanceWallet />,
      title: 'Virtual Portfolio',
      description: 'Track your investments and simulate strategies without real money.',
      color: '#74b9ff'
    },
    {
      icon: <Chat />,
      title: 'AI Assistant',
      description: 'Get instant answers to your investment questions with our AI chat.',
      color: '#fdcb6e'
    }
  ];

  const stats = [
    { label: 'Funds Available', value: '5000+' },
    { label: 'Real-time NAV', value: 'Live' },
    { label: 'AI Insights', value: '24/7' },
    { label: 'User Satisfaction', value: '99%' }
  ];

  return (
    <Box>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
        <Stack spacing={6} alignItems="center" textAlign="center">
          <Box>
            <Chip 
              label="🚀 New AI Features Available" 
              sx={{ 
                mb: 3,
                backgroundColor: 'primary.50',
                color: 'primary.main',
                fontWeight: 600,
                px: 2,
                py: 1,
              }} 
            />
            <Typography 
              variant="h2" 
              fontWeight={800}
              sx={{ 
                mb: 3,
                background: 'linear-gradient(135deg, #00d4aa 0%, #6c5ce7 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                lineHeight: 1.2,
              }}
            >
              Invest Smarter with Growwise
            </Typography>
            <Typography 
              color="text.secondary" 
              sx={{ 
                maxWidth: 600,
                fontSize: '1.25rem',
                lineHeight: 1.6,
                mx: 'auto',
              }}
            >
              The ultimate platform for mutual fund investing. Get AI-powered insights, 
              advanced calculators, and real-time data to make informed investment decisions.
            </Typography>
          </Box>

          <Stack 
            direction={{ xs: 'column', sm: 'row' }} 
            spacing={2}
            sx={{ mt: 2 }}
          >
            <Button 
              component={Link} 
              href="/dashboard" 
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                background: 'linear-gradient(135deg, #00d4aa 0%, #00b894 100%)',
                boxShadow: '0px 4px 20px rgba(0, 212, 170, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #00b894 0%, #00a085 100%)',
                  boxShadow: '0px 6px 25px rgba(0, 212, 170, 0.4)',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Start Investing
            </Button>
            <Button 
              component={Link} 
              href="/funds" 
              variant="outlined"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                borderColor: 'primary.main',
                color: 'primary.main',
                '&:hover': {
                  borderColor: 'primary.dark',
                  backgroundColor: 'primary.50',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Explore Funds
            </Button>
          </Stack>
        </Stack>
      </Container>

      {/* Stats Section */}
      <Box sx={{ backgroundColor: 'grey.50', py: 6 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <Box textAlign="center">
                  <Typography variant="h4" fontWeight={700} color="primary.main">
                    {stat.value}
                  </Typography>
                  <Typography color="text.secondary" fontWeight={500}>
                    {stat.label}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 10 }}>
        <Box textAlign="center" sx={{ mb: 8 }}>
          <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
            Why Choose Growwise?
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 600, mx: 'auto' }}>
            Everything you need to make smart investment decisions, all in one place.
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Card 
                sx={{ 
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 3,
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
                    borderColor: feature.color,
                  }
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Avatar 
                    sx={{ 
                      width: 56, 
                      height: 56, 
                      backgroundColor: `${feature.color}20`,
                      color: feature.color,
                      mb: 3,
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Typography variant="h5" fontWeight={600} sx={{ mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ backgroundColor: 'primary.main', py: 8 }}>
        <Container maxWidth="md">
          <Stack spacing={4} alignItems="center" textAlign="center">
            <Typography 
              variant="h3" 
              fontWeight={700}
              sx={{ color: 'white' }}
            >
              Ready to Start Your Investment Journey?
            </Typography>
            <Typography 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                fontSize: '1.2rem',
                maxWidth: 500,
              }}
            >
              Join thousands of investors who trust Growwise for their mutual fund investments.
            </Typography>
            <Button 
              component={Link} 
              href="/auth/sign-up" 
              variant="contained"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                fontWeight: 600,
                borderRadius: 3,
                backgroundColor: 'white',
                color: 'primary.main',
                '&:hover': {
                  backgroundColor: 'grey.100',
                  transform: 'translateY(-2px)',
                },
              }}
            >
              Get Started Free
            </Button>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}