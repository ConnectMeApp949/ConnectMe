export const colors = {
  primary: '#AA8330',        // warm gold (from website)
  accent: '#C9A55C',         // lighter gold
  secondary: '#E31C5F',      // keep the pink action color (for CTAs like Book Now)
  background: '#FFFFFF',
  backgroundWarm: '#FEF2E4', // cream from website
  cardBackground: '#FBF7F2', // warm off-white (warmer than current gray)
  text: '#151515',           // near black (from website)
  textSecondary: '#575757',  // medium gray (from website)
  textMuted: '#9CA3AF',
  border: '#E8E2D9',         // warm border (not cold gray)
  error: '#DC2626',
  success: '#16A34A',
  warning: '#F59E0B',
  star: '#F59E0B',
  white: '#FFFFFF',
  lightBlue: '#FEF2E4',      // replace cold blue with warm cream
} as const;

export const lightColors = { ...colors } as const;

export const darkColors = {
  primary: '#C9A55C',        // lighter gold for dark backgrounds
  accent: '#D4B877',
  secondary: '#FF4081',
  background: '#1A1714',     // warm dark (not cold #121212)
  backgroundWarm: '#2A2520',
  cardBackground: '#252018', // warm dark card
  text: '#F5F0EB',          // warm white
  textSecondary: '#B8AFA3',  // warm gray
  textMuted: '#7A7268',
  border: '#3D3630',         // warm dark border
  error: '#EF5350',
  success: '#66BB6A',
  warning: '#FFA726',
  star: '#FFA726',
  white: '#FFFFFF',
  lightBlue: '#2A2520',
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
