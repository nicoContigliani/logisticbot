'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';

// ============================================
// Metro UI / Windows 8 Style Theme
// ============================================

// Windows 8 Metro Color Palette
const metroPalette = {
  // Primary Windows Blue
  blue: '#0078d4',
  blueLight: '#1a90e8',
  blueDark: '#005a9e',
  
  // Accent Colors (vibrant, solid)
  magenta: '#e3008c',
  purple: '#5c2d91',
  green: '#107c10',
  orange: '#d83b01',
  teal: '#00827a',
  red: '#d32f2f',
  yellow: '#ffb900',
  lime: '#a2b30e',
  pink: '#e57eb8',
  
  // Neutrals - Windows 8 style
  dark: '#000000',
  darkGray: '#333333',
  gray: '#666666',
  lightGray: '#999999',
  lighterGray: '#cccccc',
  lightestGray: '#f2f2f2',
  white: '#ffffff',
  
  // Background
  background: '#f5f5f5',
  backgroundDark: '#1f1f1f',
};

// Common Metro component styles
const metroComponentStyles = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 0, // Metro has square corners
        padding: '12px 24px',
        fontWeight: 500,
        textTransform: 'none' as const,
        transition: 'all 0.15s ease',
        boxShadow: 'none',
        '&:hover': {
          transform: 'translateY(-1px)',
        },
      },
      contained: {
        '&:hover': {
          boxShadow: 'none',
        },
      },
      containedPrimary: {
        backgroundColor: metroPalette.blue,
        '&:hover': {
          backgroundColor: metroPalette.blueDark,
        },
      },
      outlined: {
        borderWidth: 2,
        borderColor: metroPalette.blue,
        '&:hover': {
          borderWidth: 2,
          borderColor: metroPalette.blueDark,
          backgroundColor: 'rgba(0, 120, 212, 0.04)',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 0, // Square corners
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.16)',
        },
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
      elevation1: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
      elevation2: {
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.12)',
      },
      elevation3: {
        boxShadow: '0 6px 12px rgba(0, 0, 0, 0.14)',
      },
    },
  },
  MuiTextField: {
    styleOverrides: {
      root: {
        '& .MuiOutlinedInput-root': {
          borderRadius: 0,
          backgroundColor: metroPalette.white,
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: metroPalette.blue,
            borderWidth: 2,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: metroPalette.blue,
            borderWidth: 2,
          },
        },
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        fontWeight: 500,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      },
    },
  },
  MuiDrawer: {
    styleOverrides: {
      paper: {
        borderRight: 'none',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      },
    },
  },
  MuiListItemButton: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        transition: 'all 0.15s ease',
        '&:hover': {
          backgroundColor: 'rgba(0, 120, 212, 0.08)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(0, 120, 212, 0.12)',
          borderLeft: `4px solid ${metroPalette.blue}`,
          '&:hover': {
            backgroundColor: 'rgba(0, 120, 212, 0.16)',
          },
        },
      },
    },
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        fontWeight: 500,
        minWidth: 100,
      },
    },
  },
  MuiTabs: {
    styleOverrides: {
      indicator: {
        height: 3,
        borderRadius: '3px 3px 0 0',
      },
    },
  },
  MuiLinearProgress: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        height: 4,
      },
    },
  },
  MuiAlert: {
    styleOverrides: {
      root: {
        borderRadius: 0,
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
  MuiIconButton: {
    styleOverrides: {
      root: {
        transition: 'all 0.15s ease',
        '&:hover': {
          backgroundColor: 'rgba(0, 120, 212, 0.08)',
        },
      },
    },
  },
  MuiTooltip: {
    styleOverrides: {
      tooltip: {
        borderRadius: 0,
        fontSize: '0.75rem',
      },
    },
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        borderRadius: 0,
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        '&:hover': {
          backgroundColor: 'rgba(0, 120, 212, 0.08)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(0, 120, 212, 0.12)',
        },
      },
    },
  },
  MuiAccordion: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        boxShadow: 'none',
        '&:before': {
          display: 'none',
        },
        '&.Mui-expanded': {
          margin: 0,
        },
      },
    },
  },
  MuiAccordionSummary: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        '&:hover': {
          backgroundColor: 'rgba(0, 120, 212, 0.04)',
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        borderBottom: `1px solid ${metroPalette.lighterGray}`,
      },
      head: {
        fontWeight: 600,
        backgroundColor: metroPalette.lightestGray,
      },
    },
  },
  MuiTableRow: {
    styleOverrides: {
      root: {
        '&:hover': {
          backgroundColor: 'rgba(0, 120, 212, 0.04)',
        },
      },
    },
  },
  MuiFab: {
    styleOverrides: {
      root: {
        borderRadius: 0,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      },
    },
  },
  MuiBadge: {
    styleOverrides: {
      badge: {
        borderRadius: 0,
        fontWeight: 600,
      },
    },
  },
  MuiDivider: {
    styleOverrides: {
      root: {
        borderColor: metroPalette.lighterGray,
      },
    },
  },
  MuiBreadcrumbs: {
    styleOverrides: {
      separator: {
        fontWeight: 600,
      },
    },
  },
};

// Theme Options
const metroThemeOptions: ThemeOptions = {
  palette: {
    mode: 'light',
    primary: {
      main: metroPalette.blue,
      light: metroPalette.blueLight,
      dark: metroPalette.blueDark,
      contrastText: metroPalette.white,
    },
    secondary: {
      main: metroPalette.purple,
      light: '#7a4ab4',
      dark: '#4a2378',
      contrastText: metroPalette.white,
    },
    background: {
      default: metroPalette.background,
      paper: metroPalette.white,
    },
    error: {
      main: metroPalette.red,
    },
    warning: {
      main: metroPalette.orange,
    },
    success: {
      main: metroPalette.green,
    },
    info: {
      main: metroPalette.blue,
    },
    text: {
      primary: metroPalette.darkGray,
      secondary: metroPalette.gray,
    },
    divider: metroPalette.lighterGray,
  },
  typography: {
    // Windows 8 uses Segoe UI
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 300, // Windows 8 uses lighter weights
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 300,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 400,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 400,
    },
    h5: {
      fontSize: '1.1rem',
      fontWeight: 500,
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.85rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 500,
    },
    caption: {
      fontSize: '0.75rem',
    },
    overline: {
      fontSize: '0.65rem',
      fontWeight: 600,
      letterSpacing: '0.1em',
      textTransform: 'uppercase',
    },
  },
  shape: {
    borderRadius: 0, // Square corners throughout
  },
  components: metroComponentStyles,
};

// Create Light Theme
export const metroLightTheme = createTheme({
  ...metroThemeOptions,
});

// Create Dark Theme (Windows 8 dark mode)
export const metroDarkTheme = createTheme({
  ...metroThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: metroPalette.blueLight,
      light: '#4da6ff',
      dark: metroPalette.blue,
      contrastText: metroPalette.white,
    },
    secondary: {
      main: '#a87dc9',
      light: '#c4a3db',
      dark: metroPalette.purple,
      contrastText: metroPalette.white,
    },
    background: {
      default: metroPalette.backgroundDark,
      paper: '#2d2d2d',
    },
    error: {
      main: '#ff6b6b',
    },
    warning: {
      main: '#ff9f43',
    },
    success: {
      main: '#26de81',
    },
    info: {
      main: '#4dabf7',
    },
    text: {
      primary: metroPalette.white,
      secondary: metroPalette.lightGray,
    },
    divider: 'rgba(255, 255, 255, 0.1)',
  },
});

// Export colors for use in components
export const metroColors = metroPalette;

export default metroLightTheme;