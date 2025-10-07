'use client';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const baseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { 
      main: '#1e8e3e', // richer green
      light: '#81c784',
      dark: '#005d2b',
      contrastText: '#ffffff',
    },
    secondary: { 
      main: '#0277bd', // deeper blue
      light: '#58a5f0',
      dark: '#004c8c',
      contrastText: '#ffffff',
    },
    background: { 
      default: '#f8fafc', 
      paper: '#ffffff',
    },
    error: {
      main: '#d32f2f',
    },
    warning: {
      main: '#ed6c02',
    },
    info: {
      main: '#0288d1',
    },
    success: {
      main: '#2e7d32',
    },
    text: {
      primary: '#1a2027',
      secondary: '#637381',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    button: {
      fontWeight: 600,
    },
  },
  shape: { 
    borderRadius: 12 
  },
  components: {
    MuiButton: { 
      styleOverrides: { 
        root: { 
          textTransform: 'none', 
          borderRadius: 12,
          boxShadow: 'none',
          padding: '10px 20px',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          },
        },
      } 
    },
    MuiCard: { 
      styleOverrides: { 
        root: { 
          borderRadius: 16,
          boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.05)',
          transition: 'box-shadow 0.3s ease',
          '&:hover': {
            boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.1)',
          },
        } 
      } 
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#ffffff',
          color: '#1a2027',
          boxShadow: '0px 1px 5px rgba(0, 0, 0, 0.05)',
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          }
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        }
      }
    },
  },
});

// Apply responsive font sizes
const theme = responsiveFontSizes(baseTheme);

export default theme;