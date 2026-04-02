// Marble-inspired pastel palette - modern, minimal, futuristic
export const marblePalette = {
  cream: '#faf9f7',
  ivory: '#f5f3f0',
  pearl: '#e8e6e3',
  cloud: '#f0eeeb',
  lavender: '#b8a9c9',
  sage: '#a8b5a0',
  rose: '#d4a5a5',
  sky: '#a5c4d4',
  peach: '#e8c4b8',
  mint: '#b8d4c9',
  primary: '#7c8db0',
  primaryLight: '#9ba4c4',
  primaryDark: '#5d6d8a',
};

export const lightTheme = {
  palette: {
    mode: 'light' as const,
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
    error: { main: '#e8a5a5', light: '#f5caca', dark: '#c98080' },
    warning: { main: '#e8c9a5', light: '#f5dfc8', dark: '#c9a580' },
    success: { main: '#a8c4a8', light: '#c8dcc8', dark: '#80a580' },
    info: { main: marblePalette.sky, light: '#c8dae6', dark: '#80a0b0' },
    text: { primary: '#3a3a3a', secondary: '#6b6b6b' },
    divider: '#e8e6e3',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 16,
  },
};

export const darkTheme = {
  ...lightTheme,
  palette: {
    mode: 'dark' as const,
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
    text: { primary: '#f0f0f0', secondary: '#a0a0a0' },
    divider: 'rgba(255, 255, 255, 0.08)',
  },
};

export default lightTheme;
