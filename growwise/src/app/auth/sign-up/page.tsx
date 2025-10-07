import { Container, Paper, Stack, Typography } from '@mui/material';
import SignUpForm from '@/components/auth/SignUpForm';
import Link from 'next/link';

export default function SignUpPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={800}>Create account</Typography>
          <SignUpForm />
          <Typography variant="body2">
            Already have an account? <Link href="/(auth)/sign-in">Sign in</Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}