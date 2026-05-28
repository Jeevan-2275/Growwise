'use client';
import { createTheme, responsiveFontSizes } from '@mui/material/styles';

const baseTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { 
      main: '#00d4aa', // Groww's signature teal
      light: '#4dd4b8',
      dark: '#00b894',
      contrastText: '#ffffff',
    },
    secondary: { 
      main: '#6c5ce7', // Purple accent
      light: '#a29bfe',
      dark: '#5f3dc4',
      contrastText: '#ffffff',
    },
    background: { 
      default: '#f8fafc', 
      paper: '#ffffff',
    },
    error: {
      main: '#e17055',
    },
    warning: {
      main: '#fdcb6e',
    },
    info: {
      main: '#74b9ff',
    },
    success: {
      main: '#00b894',
    },
    text: {
      primary: '#1f2937',
      secondary: '#64748b',
    },
    grey: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a',
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