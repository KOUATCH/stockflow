// Unified Theme Configuration for Retailify
export const theme = {
  // Color Palette
  colors: {
    // Primary brand colors
    primary: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6', // Main brand blue
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a',
    },

    // Secondary accent colors
    secondary: {
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

    // Success states
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
    },

    // Warning states
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },

    // Error states
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },

    // Gradient combinations
    gradients: {
      primary: 'from-blue-500 via-indigo-500 to-purple-600',
      secondary: 'from-slate-500 via-gray-600 to-zinc-700',
      success: 'from-emerald-500 via-teal-500 to-cyan-600',
      warning: 'from-amber-500 via-orange-500 to-red-500',
      error: 'from-rose-500 via-pink-500 to-red-600',
      ocean: 'from-blue-600 to-indigo-600',
      sunset: 'from-orange-500 to-red-500',
      forest: 'from-green-500 to-emerald-600',
      cosmic: 'from-violet-500 via-purple-600 to-indigo-700',
    }
  },

  // Typography
  typography: {
    fonts: {
      sans: ['Inter', 'system-ui', 'sans-serif'],
      mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
    },

    sizes: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem', // 36px
      '5xl': '3rem',    // 48px
    },

    weights: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      black: '900',
    }
  },

  // Spacing & Sizing
  spacing: {
    xs: '0.5rem',    // 8px
    sm: '0.75rem',   // 12px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
    '4xl': '6rem',   // 96px
    '5xl': '8rem',   // 128px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadow System
  shadows: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    glow: {
      blue: '0 0 20px rgb(59 130 246 / 0.5)',
      green: '0 0 20px rgb(34 197 94 / 0.5)',
      purple: '0 0 20px rgb(147 51 234 / 0.5)',
      red: '0 0 20px rgb(239 68 68 / 0.5)',
    }
  },

  // Component Variants
  components: {
    button: {
      variants: {
        primary: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl',
        secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300',
        success: 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white',
        warning: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white',
        error: 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white',
        ghost: 'text-slate-600 hover:text-slate-900 hover:bg-slate-100',
      },

      sizes: {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
        xl: 'px-8 py-4 text-xl',
      }
    },

    card: {
      variants: {
        default: 'bg-white/80 backdrop-blur-lg border-0 shadow-lg rounded-2xl',
        elevated: 'bg-white/90 backdrop-blur-xl shadow-2xl rounded-2xl border border-white/20',
        glass: 'bg-white/50 backdrop-blur-sm border border-white/20 shadow-lg rounded-xl',
        solid: 'bg-white border border-slate-200 shadow-md rounded-lg',
      }
    },

    input: {
      variants: {
        default: 'bg-white/80 border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
        filled: 'bg-slate-50 border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-500/20',
        ghost: 'bg-transparent border-slate-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500',
      }
    }
  },

  // Animation & Transitions
  animation: {
    durations: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },

    easings: {
      default: 'cubic-bezier(0.4, 0, 0.2, 1)',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    }
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Layout configurations
  layout: {
    sidebar: {
      width: {
        collapsed: '80px',
        expanded: '320px',
      },

      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },

    header: {
      height: '64px',
      background: 'bg-white/80 backdrop-blur-xl',
      border: 'border-b border-slate-200/60',
    },

    content: {
      padding: 'p-6',
      maxWidth: 'max-w-7xl',
      margin: 'mx-auto',
    }
  }
};

// Helper functions for theme usage
export const getGradient = (name: keyof typeof theme.colors.gradients) => {
  return `bg-gradient-to-r ${theme.colors.gradients[name]}`;
};

export const getShadow = (size: keyof typeof theme.shadows, color?: string) => {
  if (color && typeof theme.shadows[size] === 'object') {
    return (theme.shadows[size] as any)[color];
  }
  return theme.shadows[size];
};

export const getComponentVariant = (
  component: keyof typeof theme.components,
  variant: string
) => {
  const comp = theme.components[component] as any;
  return comp?.variants?.[variant] || '';
};

export default theme;