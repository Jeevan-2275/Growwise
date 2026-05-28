'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper,
  Typography
} from '@mui/material';

interface ReturnsTableProps {
  returns: {
    period: string;
    value: number | null;
  }[];
}

export default function ReturnsTable({ returns }: ReturnsTableProps) {
  const formatReturn = (value: number | null) => {
    if (value === null) return 'N/A';
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <TableContainer component={Paper} elevation={0} variant="outlined">
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">Period</Typography>
            </TableCell>
            <TableCell align="right">
              <Typography variant="subtitle2">Returns</Typography>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {returns.map((row) => (
            <TableRow key={row.period}>
              <TableCell component="th" scope="row">
                {row.period}
              </TableCell>
              <TableCell 
                align="right"
                sx={{ 
                  color: row.value === null 
                    ? 'text.secondary' 
                    : row.value >= 0 
                      ? 'success.main' 
                      : 'error.main',
                  fontWeight: 'medium'
                }}
              >
                {formatReturn(row.value)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}