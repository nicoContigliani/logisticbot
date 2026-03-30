'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';

// Marble-inspired pastel palette - modern, minimal, futuristic
const marblePalette = {
  // Soft pastels - like marble veins
  cream: '#faf9f7',
  ivory: '#f5f3f0',
  pearl: '#e8e6e3',
  cloud: '#f0eeeb',
  // Accent colors - soft and elegant
  lavender: '#b8a9c9',
  sage: '#a8b5a0',
  rose: '#d4a5a5',
  sky: '#a5c4d4',
  peach: '#e8c4b8',
  mint: '#b8d4c9',
  // Primary - soft indigo
  primary: '#7c8db0',
  primaryLight: '#9ba4c4',
  primaryDark: '#5d6d8a',
};

const themeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: marblePalette.primary,
      light: marblePalette.primaryLight,
      dark: marblePalette.primaryDark,
      contrastText: '#ffffff',
    },
    secondary: {
      main: marblePalette.lavender,
      light: '#d4cfe0',
      dark: '#9a8aaa',
      contrastText: '#ffffff',
    },
    background: {
      default: marblePalette.cream,
      paper: '#ffffff',
    },
    error: {
      main: '#e8a5a5',
      light: '#f5caca',
      dark: '#c98080',
    },
    warning: {
      main: '#e8c9a5',
      light: '#f5dfc8',
      dark: '#c9a580',
    },
    success: {
      main: '#a8c4a8',
      light: '#c8dcc8',
      dark: '#80a580',
    },
    info: {
      main: marblePalette.sky,
      light: '#c8dae6',
      dark: '#80a0b0',
    },
    text: {
      primary: '#3a3a3a',
      secondary: '#6b6b6b',
    },
    // Custom divider
    divider: '#e8e6e3',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h5: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    h6: {
      fontSize: '0.875rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
          boxShadow: 'none',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 24px rgba(124, 141, 176, 0.2)',
          },
        },
        contained: {
          background: 'linear-gradient(135deg, #7c8db0 0%, #9ba4c4 100%)',
          '&:hover': {
            background: 'linear-gradient(135deg, #6b7d9d 0%, #8a93b3 100%)',
            boxShadow: '0 12px 32px rgba(124, 141, 176, 0.3)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.04)',
          border: '1px solid rgba(0, 0, 0, 0.02)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.2s ease-in-out',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            '&:hover': {
              backgroundColor: '#ffffff',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: marblePalette.primaryLight,
              },
            },
            '&.Mui-focused': {
              backgroundColor: '#ffffff',
              boxShadow: '0 0 0 3px rgba(124, 141, 176, 0.15)',
            },
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
        },
        filled: {
          backgroundColor: 'rgba(124, 141, 176, 0.1)',
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          backgroundColor: 'rgba(124, 141, 176, 0.1)',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 24,
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '4px 0 24px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 16px rgba(0, 0, 0, 0.04)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: 'all 0.2s ease',
          '&:hover': {
            backgroundColor: 'rgba(124, 141, 176, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(124, 141, 176, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(124, 141, 176, 0.16)',
            },
          },
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...themeOptions,
});

export const darkTheme = createTheme({
  ...themeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#9ba4c4',
      light: '#b8c2d8',
      dark: '#7c8db0',
      contrastText: '#1a1a1a',
    },
    secondary: {
      main: '#c4b8d8',
      light: '#d8d0e8',
      dark: '#a898c4',
      contrastText: '#1a1a1a',
    },
    background: {
      default: '#1a1a1f',
      paper: '#242429',
    },
    text: {
      primary: '#f0f0f0',
      secondary: '#a0a0a0',
    },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
});

export default lightTheme;
