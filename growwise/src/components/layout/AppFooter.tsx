import { Box, Typography } from '@mui/material'

export default function AppFooter() {
  return (
    <Box component="footer" sx={{ p: 2, borderTop: 1, borderColor: 'divider', textAlign: 'center' }}>
      <Typography variant="body2">© Growwise 2025</Typography>
    </Box>
  )
}

