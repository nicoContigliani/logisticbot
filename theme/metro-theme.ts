// Windows 8 Metro Color Palette
export const metroPalette = {
  blue: '#0078d4',
  blueLight: '#1a90e8',
  blueDark: '#005a9e',
  magenta: '#e3008c',
  purple: '#5c2d91',
  green: '#107c10',
  orange: '#d83b01',
  teal: '#00827a',
  red: '#d32f2f',
  yellow: '#ffb900',
  lime: '#a2b30e',
  pink: '#e57eb8',
  dark: '#000000',
  darkGray: '#333333',
  gray: '#666666',
  lightGray: '#999999',
  lighterGray: '#cccccc',
  lightestGray: '#f2f2f2',
  white: '#ffffff',
  background: '#f5f5f5',
  backgroundDark: '#1f1f1f',
};

export const metroLightTheme = {
  palette: {
    mode: 'light' as const,
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
    error: { main: metroPalette.red },
    warning: { main: metroPalette.orange },
    success: { main: metroPalette.green },
    info: { main: metroPalette.blue },
    text: { primary: metroPalette.darkGray, secondary: metroPalette.gray },
    divider: metroPalette.lighterGray,
  },
  typography: {
    fontFamily: '"Segoe UI", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  shape: {
    borderRadius: 0,
  },
};

export const metroDarkTheme = {
  ...metroLightTheme,
  palette: {
    mode: 'dark' as const,
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
    error: { main: '#ff6b6b' },
    warning: { main: '#ff9f43' },
    success: { main: '#26de81' },
    info: { main: '#4dabf7' },
    text: { primary: metroPalette.white, secondary: metroPalette.lightGray },
    divider: 'rgba(255, 255, 255, 0.1)',
  },
};

export const metroColors = metroPalette;

export default metroLightTheme;
