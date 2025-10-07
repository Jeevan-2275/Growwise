"use client"

import { Box, Button, Container, Grid, Typography, Card, CardContent } from '@mui/material'
import ChatDrawer from '@/components/ai/ChatDrawer'

export default function LandingPage() {
  return (
    <Container sx={{ py: 6 }}>
      <Typography variant="h3" fontWeight={700} gutterBottom>Invest smarter with Growwise</Typography>
      <Typography variant="h6" color="text.secondary" gutterBottom>
        Mutual funds research, calculators, and AI insights in one clean dashboard.
      </Typography>
      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button variant="contained" href="/(dashboard)">Go to Dashboard</Button>
        <Button variant="outlined" href="/(funds)">Browse Funds</Button>
      </Box>

      <Grid container spacing={2} sx={{ mt: 4 }}>
        {["Research funds", "Plan investments", "Track performance"].map((t, i) => (
          <Grid item xs={12} md={4} key={t}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>{t}</Typography>
                <Typography variant="body2" color="text.secondary">Clean, fast, and reliable tools inspired by Groww and Zerodha Coin.</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <ChatDrawer />
    </Container>
  )
}

