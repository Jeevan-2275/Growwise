'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import { SessionProvider } from 'next-auth/react';
import theme from '@/styles/theme';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </SessionProvider>
  );
}