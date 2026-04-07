export const colors = {
  primary: '#2A8B8B',        // dark teal (main brand color)
  accent: '#4DB8A4',         // medium teal
  secondary: '#E31C5F',      // keep pink for CTAs
  background: '#FFFFFF',
  backgroundWarm: '#E8F6F3', // very light teal tint
  cardBackground: '#F2FAF8', // subtle teal-tinted white
  text: '#1A2B2B',           // dark teal-black
  textSecondary: '#4A6B6B',  // medium teal-gray
  textMuted: '#8BA5A5',      // muted teal-gray
  border: '#D0E4E0',         // light teal border
  error: '#DC2626',
  success: '#16A34A',
  warning: '#F59E0B',
  star: '#F59E0B',
  white: '#FFFFFF',
  lightBlue: '#E8F6F3',      // light teal background
} as const;

export const lightColors = { ...colors } as const;

export const darkColors = {
  primary: '#4DB8A4',        // lighter teal for dark backgrounds
  accent: '#7DD4C4',
  secondary: '#FF4081',
  background: '#0F1A1A',     // dark teal-black
  backgroundWarm: '#152222',
  cardBackground: '#1A2D2D', // dark teal card
  text: '#E8F6F3',          // light teal white
  textSecondary: '#A3C4BE',  // light teal gray
  textMuted: '#6B8E87',
  border: '#2D4A45',         // dark teal border
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  star: '#FFA726',
  white: '#FFFFFF',
  lightBlue: '#152222',
} as const;

export const fonts = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;
