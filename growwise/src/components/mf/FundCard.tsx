'use client';

import { 
  Card, 
  CardActionArea, 
  CardContent, 
  Typography, 
  Chip,
  Box,
  Stack
} from '@mui/material';
import Link from 'next/link';

interface FundCardProps {
  fund: {
    schemeName: string;
    schemeCode: string;
    fundHouse?: string;
    schemeCategory?: string;
    latestNAV?: { date: string; nav: number } | null;
  };
}

export default function FundCard({ fund }: FundCardProps) {
  return (
    <Card 
      variant="outlined" 
      sx={{ 
        height: '100%',
        border: '1px solid',
        borderColor: 'grey.200',
        borderRadius: 3,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0px 8px 25px rgba(0, 0, 0, 0.1)',
          borderColor: 'primary.main',
        }
      }}
    >
      <CardActionArea 
        component={Link} 
        href={`/funds/${fund.schemeCode}`}
        sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          p: 0,
        }}
      >
        <CardContent sx={{ 
          flexGrow: 1, 
          p: 3,
          '&:last-child': {
            pb: 3,
          }
        }}>
          <Typography 
            variant="h6" 
            fontWeight={600}
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              lineHeight: 1.4,
              color: 'text.primary',
              fontSize: '1.1rem',
            }}
          >
            {fund.schemeName}
          </Typography>
          
          <Stack spacing={1.5}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography 
                color="text.secondary" 
                variant="body2"
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                Code:
              </Typography>
              <Typography 
                color="primary.main" 
                variant="body2"
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  fontFamily: 'monospace',
                }}
              >
                {fund.schemeCode}
              </Typography>
            </Box>
            
            {fund.latestNAV && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  color="text.secondary" 
                  variant="body2"
                  sx={{ 
                    fontSize: '0.875rem',
                    fontWeight: 500,
                  }}
                >
                  NAV:
                </Typography>
                <Typography 
                  color="text.primary" 
                  variant="body2"
                  sx={{ 
                    fontSize: '0.875rem',
                    fontWeight: 600,
                  }}
                >
                  ₹{fund.latestNAV.nav.toFixed(2)}
                </Typography>
                <Typography 
                  color="text.secondary" 
                  variant="caption"
                >
                  ({fund.latestNAV.date})
                </Typography>
              </Box>
            )}

            {fund.fundHouse && (
              <Typography 
                color="text.secondary" 
                variant="body2" 
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 500,
                }}
              >
                {fund.fundHouse}
              </Typography>
            )}
            
            {fund.schemeCategory && (
              <Box sx={{ mt: 1 }}>
                <Chip 
                  label={fund.schemeCategory} 
                  size="small" 
                  sx={{ 
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    backgroundColor: 'primary.50',
                    color: 'primary.main',
                    border: '1px solid',
                    borderColor: 'primary.200',
                    '&:hover': {
                      backgroundColor: 'primary.100',
                    }
                  }}
                />
              </Box>
            )}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}