'use client';

import { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Box, ButtonGroup, Button, Typography } from '@mui/material';

type Point = { date: string; nav: number };

export default function FundChart({ data }: { data: { date: string; nav: string }[] }) {
  const [timeRange, setTimeRange] = useState<'1M' | '3M' | '6M' | '1Y' | '3Y' | 'MAX'>('1Y');
  
  const getDataPoints = () => {
    if (!data || data.length === 0) return [];
    
    const allPoints: Point[] = data.map((d) => ({ 
      date: d.date, 
      nav: parseFloat(d.nav) 
    }));
    
    // Sort by date ascending
    allPoints.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case '1M':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case '3M':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case '6M':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case '1Y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      case '3Y':
        cutoffDate.setFullYear(now.getFullYear() - 3);
        break;
      case 'MAX':
        return allPoints;
    }
    
    return allPoints.filter(point => new Date(point.date) >= cutoffDate);
  };
  
  const points = getDataPoints();
  
  // Calculate returns for the selected period
  const calculateReturn = () => {
    if (points.length < 2) return null;
    
    const startNav = points[0].nav;
    const endNav = points[points.length - 1].nav;
    const percentChange = ((endNav - startNav) / startNav) * 100;
    
    return percentChange.toFixed(2);
  };
  
  const returnValue = calculateReturn();

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <ButtonGroup size="small" aria-label="time range">
          <Button 
            onClick={() => setTimeRange('1M')} 
            variant={timeRange === '1M' ? 'contained' : 'outlined'}
          >
            1M
          </Button>
          <Button 
            onClick={() => setTimeRange('3M')} 
            variant={timeRange === '3M' ? 'contained' : 'outlined'}
          >
            3M
          </Button>
          <Button 
            onClick={() => setTimeRange('6M')} 
            variant={timeRange === '6M' ? 'contained' : 'outlined'}
          >
            6M
          </Button>
          <Button 
            onClick={() => setTimeRange('1Y')} 
            variant={timeRange === '1Y' ? 'contained' : 'outlined'}
          >
            1Y
          </Button>
          <Button 
            onClick={() => setTimeRange('3Y')} 
            variant={timeRange === '3Y' ? 'contained' : 'outlined'}
          >
            3Y
          </Button>
          <Button 
            onClick={() => setTimeRange('MAX')} 
            variant={timeRange === 'MAX' ? 'contained' : 'outlined'}
          >
            MAX
          </Button>
        </ButtonGroup>
        
        {returnValue && (
          <Typography 
            variant="body1" 
            color={parseFloat(returnValue) >= 0 ? 'success.main' : 'error.main'}
            fontWeight="bold"
          >
            {parseFloat(returnValue) >= 0 ? '+' : ''}{returnValue}%
          </Typography>
        )}
      </Box>
      
      <div style={{ width: '100%', height: 280 }}>
        <ResponsiveContainer>
          <AreaChart data={points}>
            <defs>
              <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2e7d32" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#2e7d32" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis 
              dataKey="date" 
              tickFormatter={(date) => new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              tick={{ fontSize: 12 }}
              tickCount={5}
            />
            <YAxis 
              domain={['dataMin', 'dataMax']} 
              width={40} 
              tickFormatter={(value) => value.toFixed(1)}
            />
            <Tooltip 
              formatter={(value: number) => [`₹${value.toFixed(2)}`, 'NAV']}
              labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            />
            <Area 
              type="monotone" 
              dataKey="nav" 
              stroke="#2e7d32" 
              fill="url(#c)" 
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Box>
  );
}