'use client';

import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  IconButton,
  Menu,
  MenuItem,
  Avatar
} from '@mui/material';
import { 
  Menu as MenuIcon, 
  AccountCircle,
  Dashboard,
  Search,
  WatchLater,
  AccountBalanceWallet
} from '@mui/icons-material';
import { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function AppHeader() {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = () => {
    signOut();
    handleClose();
  };

  return (
    <AppBar 
      position="sticky" 
      elevation={0}
      sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid',
        borderColor: 'grey.200',
        backdropFilter: 'blur(8px)',
        background: 'rgba(255, 255, 255, 0.8)',
      }}
    >
      <Toolbar sx={{ minHeight: '64px !important', px: { xs: 2, sm: 3 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', flexGrow: 1 }}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <Typography 
              variant="h5" 
              component="div" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #00d4aa 0%, #6c5ce7 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.5rem',
                letterSpacing: '-0.02em',
              }}
            >
              Growwise
            </Typography>
          </Link>
        </Box>

        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, mr: 2 }}>
          <Button
            component={Link}
            href="/funds"
            startIcon={<Search />}
            sx={{
              color: 'text.primary',
              fontWeight: 500,
              px: 2,
              py: 1,
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'grey.100',
              },
            }}
          >
            Funds
          </Button>
          
          {session && (
            <>
              <Button
                component={Link}
                href="/dashboard"
                startIcon={<Dashboard />}
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                Dashboard
              </Button>
              <Button
                component={Link}
                href="/dashboard/watchlist"
                startIcon={<WatchLater />}
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                Watchlist
              </Button>
              <Button
                component={Link}
                href="/dashboard/virtual-portfolio"
                startIcon={<AccountBalanceWallet />}
                sx={{
                  color: 'text.primary',
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  },
                }}
              >
                Portfolio
              </Button>
            </>
          )}
        </Box>

        {session ? (
          <Box>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              sx={{
                border: '2px solid',
                borderColor: 'grey.200',
                '&:hover': {
                  borderColor: 'primary.main',
                },
              }}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
                {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
              </Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              PaperProps={{
                sx: {
                  mt: 1,
                  borderRadius: 2,
                  boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
                  border: '1px solid',
                  borderColor: 'grey.200',
                },
              }}
            >
              <MenuItem onClick={handleClose} sx={{ px: 3, py: 1.5 }}>
                <Link href="/profile" style={{ textDecoration: 'none', color: 'inherit' }}>
                  Profile
                </Link>
              </MenuItem>
              <MenuItem onClick={handleSignOut} sx={{ px: 3, py: 1.5 }}>
                Sign Out
              </MenuItem>
            </Menu>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              component={Link}
              href="/auth/sign-in"
              sx={{
                color: 'text.primary',
                fontWeight: 500,
                px: 2,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'grey.100',
                },
              }}
            >
              Sign In
            </Button>
            <Button
              component={Link}
              href="/auth/sign-up"
              variant="contained"
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                fontWeight: 600,
                px: 2,
                py: 1,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              }}
            >
              Sign Up
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}