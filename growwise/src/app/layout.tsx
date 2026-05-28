import './globals.css';
import type { Metadata } from 'next';
import Providers from './providers';
import AppHeader from '@/components/layout/AppHeader';
import { Box } from '@mui/material';

export const metadata: Metadata = {
  title: 'Growwise - Mutual Fund Explorer',
  description: 'AI-Powered Finance Hub with SIP Calculator, Watchlist, and Virtual Portfolio',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppHeader />
          <Box component="main">
            {children}
          </Box>
        </Providers>
      </body>
    </html>
  );
}