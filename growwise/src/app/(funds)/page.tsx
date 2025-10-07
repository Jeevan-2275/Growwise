'use client';

import { Box, Grid, TextField, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import FundCard from '@/components/mf/FundCard';
import { mockFunds } from '@/data/mock/funds';

export default function FundsPage() {
  const [q, setQ] = useState('');
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return mockFunds;
    return mockFunds.filter(
      f => f.schemeName.toLowerCase().includes(t) || f.schemeCode.includes(q)
    );
  }, [q]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={800} sx={{ mb: 2 }}>Search Mutual Funds</Typography>
      <TextField
        fullWidth
        placeholder="Search by fund name or code"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Grid container spacing={2}>
        {filtered.map((f) => (
          <Grid item xs={12} md={6} key={f.schemeCode}>
            <FundCard fund={{ schemeName: f.schemeName, schemeCode: f.schemeCode }} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}