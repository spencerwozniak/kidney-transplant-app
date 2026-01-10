/**
 * App Theme and Style Definitions
 * Centralized styles for consistent design across the application
 */

// ============================================================================
// COLOR PALETTE
// ============================================================================

export const colors = {
  // Primary Colors
  primary: {
    50: '#f0fdf4', // lightest green
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e', // main green
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
  },
  // Secondary Colors (Orange)
  secondary: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316', // main orange
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
  },
  // Status Colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  // Neutral Colors
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  // Background Colors
  background: {
    white: '#ffffff',
    light: '#f9fafb',
    card: '#f0fdf4', // light green
  },
} as const;

// ============================================================================
// TYPOGRAPHY
// ============================================================================

export const typography = {
  // Headings
  h1: 'text-5xl font-bold text-gray-900',
  h2: 'text-4xl font-bold text-gray-900',
  h3: 'text-3xl font-bold text-gray-900',
  h4: 'text-2xl font-bold text-gray-900',
  h5: 'text-xl font-semibold text-gray-900',
  h6: 'text-lg font-semibold text-gray-900',

  // Body Text
  body: {
    large: 'text-lg text-gray-700',
    medium: 'text-base text-gray-700',
    small: 'text-sm text-gray-600',
    xsmall: 'text-xs text-gray-600',
  },

  // Special Text
  label: 'text-sm font-semibold text-gray-700',
  caption: 'text-xs text-gray-500',
  link: 'text-base font-medium text-green-600',

  // Colors
  primary: 'text-green-600',
  secondary: 'text-orange-600',
  success: 'text-green-700',
  warning: 'text-orange-700',
  error: 'text-red-700',
  muted: 'text-gray-500',
} as const;

// ============================================================================
// BUTTON STYLES
// ============================================================================

export const buttons = {
  // Primary Button (Green)
  primary: {
    base: 'rounded-2xl px-6 py-4 shadow-lg active:opacity-90',
    enabled: 'bg-green-600',
    disabled: 'bg-gray-300',
    text: 'text-center text-lg font-semibold text-white',
    textDisabled: 'text-center text-lg font-semibold text-gray-500',
  },

  // Secondary Button (Orange)
  secondary: {
    base: 'rounded-2xl px-6 py-4 shadow-lg active:opacity-90',
    enabled: 'bg-orange-500',
    disabled: 'bg-gray-300',
    text: 'text-center text-lg font-semibold text-white',
    textDisabled: 'text-center text-lg font-semibold text-gray-500',
  },

  // Outline Button
  outline: {
    base: 'rounded-2xl border-2 px-6 py-4 shadow-sm active:opacity-90',
    enabled: 'border-gray-200 bg-white',
    disabled: 'border-gray-200 bg-gray-50',
    text: 'text-center text-lg font-semibold text-gray-700',
    textDisabled: 'text-center text-lg font-semibold text-gray-400',
  },

  // Ghost Button (No background)
  ghost: {
    base: 'px-4 py-2 active:opacity-70',
    text: 'text-base font-medium text-green-600',
  },

  // Small Button
  small: {
    base: 'rounded-xl px-4 py-2 shadow-sm active:opacity-90',
    primary: 'bg-green-500',
    secondary: 'bg-orange-500',
    outline: 'border-2 border-gray-200 bg-white',
    text: 'text-center text-sm font-semibold',
    textPrimary: 'text-white',
    textSecondary: 'text-white',
    textOutline: 'text-gray-700',
  },

  // Answer Button (for questionnaires)
  answer: {
    base: 'rounded-xl border-2 px-6 py-4',
    selected: 'border-green-500 bg-green-50',
    unselected: 'border-gray-200 bg-white',
    text: 'text-center text-lg font-semibold',
    textSelected: 'text-green-700',
    textUnselected: 'text-gray-700',
  },
} as const;

// ============================================================================
// CARD STYLES
// ============================================================================

export const cards = {
  // Default Card
  default: {
    container: 'rounded-2xl bg-white p-6 shadow-sm',
    elevated: 'rounded-2xl bg-white p-6 shadow-lg',
  },

  // Colored Cards
  colored: {
    green: 'rounded-xl bg-green-50 p-5 border-l-4 border-green-500',
    orange: 'rounded-xl bg-orange-50 p-5 border-l-4 border-orange-500',
    yellow: 'rounded-xl bg-yellow-50 p-5 border-l-4 border-yellow-500',
    red: 'rounded-xl bg-red-50 p-5 border-l-4 border-red-500',
    blue: 'rounded-xl bg-blue-50 p-5 border-l-4 border-blue-500',
    amber: 'rounded-xl bg-amber-50 p-4 border-l-4 border-amber-500',
  },

  // Question Card
  question: {
    container: 'rounded-2xl bg-green-50 p-6 shadow-sm',
    description: 'rounded-lg bg-white p-3',
  },

  // Result Card
  result: {
    container: 'mb-2 rounded-lg bg-white p-3',
  },
} as const;

// ============================================================================
// BADGE STYLES
// ============================================================================

export const badges = {
  absolute: {
    container: 'self-start rounded-full bg-red-100 px-3 py-1',
    text: 'text-xs font-semibold text-red-700',
  },
  relative: {
    container: 'self-start rounded-full bg-orange-100 px-3 py-1',
    text: 'text-xs font-semibold text-orange-700',
  },
  general: {
    container: 'self-start rounded-full bg-blue-100 px-3 py-1',
    text: 'text-xs font-semibold text-blue-700',
  },
  success: {
    container: 'self-start rounded-full bg-green-100 px-3 py-1',
    text: 'text-xs font-semibold text-green-700',
  },
} as const;

// ============================================================================
// INPUT STYLES
// ============================================================================

export const inputs = {
  default: {
    container: 'overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-lg',
    input: 'px-5 py-4 text-lg text-gray-900',
    placeholder: '#9CA3AF',
  },
  focused: {
    container: 'overflow-hidden rounded-2xl border-2 border-green-500 bg-white shadow-lg',
    input: 'px-5 py-4 text-lg text-gray-900',
  },
  error: {
    container: 'overflow-hidden rounded-2xl border-2 border-red-500 bg-white shadow-lg',
    input: 'px-5 py-4 text-lg text-gray-900',
  },
} as const;

// ============================================================================
// PROGRESS BAR STYLES
// ============================================================================

export const progress = {
  container: 'h-2 w-full overflow-hidden rounded-full bg-gray-200',
  bar: {
    primary: 'h-full bg-green-500',
    secondary: 'h-full bg-orange-500',
    success: 'h-full bg-green-500',
    warning: 'h-full bg-orange-500',
  },
  indicator: 'h-1 w-16 rounded-full bg-green-500',
} as const;

// ============================================================================
// DIVIDER STYLES
// ============================================================================

export const dividers = {
  horizontal: {
    default: 'h-px flex-1 bg-gray-300',
    light: 'h-px flex-1 bg-gray-200',
    accent: 'h-px flex-1 bg-green-300',
  },
  dot: {
    container: 'mx-4',
    dot: 'h-2 w-2 rounded-full bg-green-400',
  },
  full: {
    container: 'mb-8 w-full max-w-sm flex-row items-center',
  },
} as const;

// ============================================================================
// SPACING UTILITIES
// ============================================================================

export const spacing = {
  // Padding
  padding: {
    xs: 'p-2',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-12',
  },
  // Margin
  margin: {
    xs: 'm-2',
    sm: 'm-4',
    md: 'm-6',
    lg: 'm-8',
    xl: 'm-12',
  },
  // Gap
  gap: {
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  },
} as const;

// ============================================================================
// DECORATIVE ELEMENTS
// ============================================================================

export const decorative = {
  circles: {
    small: 'h-32 w-32 rounded-full opacity-30',
    medium: 'h-40 w-40 rounded-full opacity-30',
    large: 'h-48 w-48 rounded-full opacity-30',
    green: 'bg-green-200',
    orange: 'bg-orange-200',
    purple: 'bg-purple-200',
  },
} as const;

// ============================================================================
// LAYOUT UTILITIES
// ============================================================================

export const layout = {
  container: {
    default: 'flex-1 bg-white',
    light: 'flex-1 bg-gray-50',
    green: 'flex-1 bg-green-50',
  },
  safeArea: 'flex-1',
  scrollView: 'flex-1',
  center: 'items-center justify-center',
  row: 'flex-row items-center',
  column: 'flex-col',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Combines multiple class strings into one
 */
export const combineClasses = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Gets button classes based on variant and state
 */
export const getButtonClasses = (
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'small',
  state: 'enabled' | 'disabled' = 'enabled',
  size?: 'small'
): { container: string; text: string } => {
  const button = buttons[variant];

  if (variant === 'small' && size === 'small') {
    return {
      container: combineClasses(button.base, button.primary),
      text: combineClasses(button.text, button.textPrimary),
    };
  }

  if (variant === 'ghost') {
    return {
      container: button.base,
      text: button.text,
    };
  }

  const stateKey = state === 'enabled' ? 'enabled' : 'disabled';
  const textKey = state === 'enabled' ? 'text' : 'textDisabled';

  return {
    container: combineClasses(button.base, button[stateKey]),
    text: button[textKey],
  };
};

/**
 * Gets card classes based on variant
 */
export const getCardClasses = (
  variant: 'default' | 'elevated' | 'question' | keyof typeof cards.colored
): string => {
  if (variant === 'default') return cards.default.container;
  if (variant === 'elevated') return cards.default.elevated;
  if (variant === 'question') return cards.question.container;
  if (variant in cards.colored) return cards.colored[variant as keyof typeof cards.colored];
  return cards.default.container;
};

/**
 * Gets badge classes based on type
 */
export const getBadgeClasses = (
  type: 'absolute' | 'relative' | 'general' | 'success'
): { container: string; text: string } => {
  return badges[type];
};
