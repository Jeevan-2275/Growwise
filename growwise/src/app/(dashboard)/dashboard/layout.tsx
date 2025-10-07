'use client';

import { Box, Toolbar } from '@mui/material';
import { useState } from 'react';
import AppHeader from '@/components/layout/AppHeader';
import AppSidebar from '@/components/layout/AppSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppHeader onMenu={() => setOpen(true)} />
      <AppSidebar open={open} onClose={() => setOpen(false)} />
      <Box component="main" sx={{ flex: 1, p: 2 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}