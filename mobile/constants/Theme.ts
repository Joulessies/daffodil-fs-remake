export const Theme = {
  colors: {
    // Modern Minimalist Palette (Editorial & Architectural Luxury)
    primary: '#18181B', // Deep Zinc / Obsidian Black
    primaryHover: '#27272A',
    primaryLight: '#F4F4F5',
    accentGold: '#B45309', // Subtle warm champagne petal accent
    accentGoldLight: '#FEF3C7',
    accentRose: '#9F1239', // Editorial velvet crimson
    accentRoseLight: '#FFF1F2',
    accentSage: '#2D4F3E', // Understated botanical forest sage
    accentSageLight: '#F0FDF4',

    // Backgrounds & Surfaces
    background: '#FAFAF9', // Clean warm alabaster
    surface: '#FFFFFF',
    surfaceSubtle: '#F4F4F5',
    card: '#FFFFFF',
    border: '#E4E4E7', // Crisp 1px hairline border
    borderSubtle: '#F4F4F5',
    divider: '#E4E4E7',

    // Typographic Hierarchy
    textPrimary: '#18181B', // Primary high contrast
    textSecondary: '#52525B', // Secondary balanced tone
    textMuted: '#A1A1AA', // Subtle tertiary caption tone
    textLight: '#FFFFFF',

    // Status (Restrained)
    success: '#059669',
    warning: '#D97706',
    error: '#DC2626',
    info: '#2563EB',

    // Grayscale
    gray50: '#FAFAFA',
    gray100: '#F4F4F5',
    gray200: '#E4E4E7',
    gray300: '#D4D4D8',
    gray400: '#A1A1AA',
    gray500: '#71717A',
    gray800: '#27272A',
    gray900: '#18181B',
  },
  typography: {
    fontFamily: 'System',
    sizes: {
      xxs: 10,
      xs: 11,
      sm: 13,
      base: 14,
      md: 16,
      lg: 18,
      xl: 22,
      xxl: 28,
      display: 34,
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.8,
      wider: 1.5,
      widest: 2.2,
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
    section: 40,
  },
  borderRadius: {
    none: 0,
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    full: 9999,
  },
  shadows: {
    none: {
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
    },
    minimal: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 4,
      elevation: 1,
    },
    soft: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 10,
      elevation: 2,
    },
  },
};

export default Theme;
