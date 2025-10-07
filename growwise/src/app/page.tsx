import { Box, Button, Container, Stack, Typography } from '@mui/material';
import Link from 'next/link';

export default function HomePage() {
  return (
    <Container sx={{ py: 8 }}>
      <Stack spacing={3} alignItems="center">
        <Typography variant="h3" fontWeight={800}>Growwise</Typography>
        <Typography color="text.secondary" textAlign="center" maxWidth={680}>
          A fast, AI-powered finance hub with mutual fund insights, calculators, and chat.
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button component={Link} href="/(dashboard)" variant="contained">Open Dashboard</Button>
          <Button component={Link} href="/(funds)" variant="outlined">Explore Funds</Button>
        </Stack>
      </Stack>
    </Container>
  );
}