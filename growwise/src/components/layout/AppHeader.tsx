'use client';

import { 
  AppBar, 
  Toolbar, 
  Typography, 
  IconButton, 
  Box, 
  Avatar, 
  Menu, 
  MenuItem, 
  Tooltip, 
  Button,
  Badge,
  Container,
  useMediaQuery,
  useTheme
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';
import LoginIcon from '@mui/icons-material/Login';
import PersonIcon from '@mui/icons-material/Person';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

export default function AppHeader({ onMenu }: { onMenu?: () => void }) {
  const { data: session } = useSession();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <AppBar 
      position="sticky" 
      color="inherit" 
      elevation={0} 
      sx={{ 
        borderBottom: '1px solid #e5e8ec',
        backdropFilter: 'blur(20px)',
        backgroundColor: 'rgba(255, 255, 255, 0.95)'
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton 
              edge="start" 
              onClick={onMenu} 
              aria-label="menu" 
              sx={{ mr: 1, display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography 
              variant="h5" 
              component={Link} 
              href="/"
              sx={{ 
                fontWeight: 800, 
                color: 'primary.main', 
                textDecoration: 'none',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <Box 
                component="img" 
                src="/logo.svg" 
                alt="Growwise Logo" 
                sx={{ height: 32, mr: 1 }} 
              />
              Growwise
            </Typography>
            
            {!isMobile && (
              <Box sx={{ ml: 4, display: 'flex', gap: 2 }}>
                <Button component={Link} href="/dashboard" startIcon={<DashboardIcon />}>
                  Dashboard
                </Button>
                <Button component={Link} href="/calculators">
                  Calculators
                </Button>
                <Button component={Link} href="/funds">
                  Explore Funds
                </Button>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {session?.user ? (
              <>
                <Tooltip title="Notifications">
                  <IconButton color="primary" sx={{ mr: 1 }}>
                    <Badge badgeContent={3} color="error">
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>
                
                <Tooltip title={session.user.email ?? ''}>
                  <Avatar
                    onClick={(e) => setAnchor(e.currentTarget)}
                    sx={{ 
                      bgcolor: 'primary.main', 
                      cursor: 'pointer',
                      transition: 'transform 0.2s',
                      '&:hover': {
                        transform: 'scale(1.1)',
                        boxShadow: '0 0 8px rgba(0,0,0,0.1)'
                      }
                    }}
                    alt={session.user.name ?? 'User'}
                    src={session.user.image ?? ''}
                  >
                    {session.user.name?.[0] ?? 'U'}
                  </Avatar>
                </Tooltip>
                <Menu 
                  anchorEl={anchor} 
                  open={Boolean(anchor)} 
                  onClose={() => setAnchor(null)}
                  transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                  anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  PaperProps={{
                    elevation: 3,
                    sx: { mt: 1, minWidth: 180 }
                  }}
                >
                  <MenuItem component={Link} href="/profile">
                    <PersonIcon fontSize="small" sx={{ mr: 1 }} /> Profile
                  </MenuItem>
                  <MenuItem onClick={() => signOut()}>
                    <LogoutIcon fontSize="small" sx={{ mr: 1 }} /> Sign out
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="outlined" 
                  onClick={() => signIn()}
                  startIcon={<LoginIcon />}
                >
                  Sign In
                </Button>
                <Button 
                  variant="contained" 
                  component={Link} 
                  href="/auth/sign-up"
                >
                  Sign Up
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}