import { Box, Typography } from '@mui/material'

export default function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <Box sx={{ textAlign: 'center', py: 6 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>{title}</Typography>
      {subtitle && <Typography color="text.secondary">{subtitle}</Typography>}
    </Box>
  )
}

