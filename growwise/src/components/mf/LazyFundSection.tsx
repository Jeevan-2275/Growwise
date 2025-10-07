'use client';

import dynamic from 'next/dynamic';
import { useOnScreen } from '@/hooks/useOnScreen';
import { Box, Skeleton, Typography } from '@mui/material';
import { mockFunds } from '@/data/mock/funds';

const FundChart = dynamic(() => import('./FundChart'), {
  ssr: false,
  loading: () => <Skeleton variant="rectangular" height={240} />,
});

export default function LazyFundSection({ schemeCode }: { schemeCode: string }) {
  const { ref, visible } = useOnScreen<HTMLDivElement>({ rootMargin: '200px' });
  const fund = mockFunds.find(f => f.schemeCode === schemeCode)
  const data = fund?.history.map(h => ({ date: h.date, nav: String(h.nav) })) ?? []

  return (
    <Box ref={ref} sx={{ my: 2 }}>
      {!visible && <Skeleton variant="rectangular" height={280} />}
      {visible && (
        <>
          <Typography variant="h6">{fund?.schemeName ?? 'Mutual Fund'}</Typography>
          <FundChart data={data} />
        </>
      )}
    </Box>
  );
}