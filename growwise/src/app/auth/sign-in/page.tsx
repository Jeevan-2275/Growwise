import { Container, Paper, Stack, Typography } from '@mui/material';
import SignInForm from '@/components/auth/SignInForm';
import Link from 'next/link';

export default function SignInPage() {
  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant="h5" fontWeight={800}>Sign in</Typography>
          <SignInForm />
          <Typography variant="body2">
            Don&apos;t have an account? <Link href="/(auth)/sign-up">Sign up</Link>
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}