'use client';

import { Card, CardActionArea, CardContent, Typography } from '@mui/material';
import Link from 'next/link';

export default function FundCard({ fund }: { fund: { schemeName: string; schemeCode: string } }) {
  return (
    <Card variant="outlined">
      <CardActionArea component={Link} href={`/(funds)/${fund.schemeCode}`}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700}>
            {fund.schemeName}
          </Typography>
          <Typography color="text.secondary" variant="body2">
            Code: {fund.schemeCode}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}