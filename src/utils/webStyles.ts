import { Platform } from 'react-native';

/**
 * Web-compatible shadow styles
 * 
 * React Native's shadow properties (shadowColor, shadowOffset, etc.) don't
 * translate well to web. This utility converts them to CSS box-shadow.
 */
export const getWebShadow = (
  shadowColor: string = '#000',
  shadowOffset: { width: number; height: number } = { width: 0, height: 0 },
  shadowOpacity: number = 0.3,
  shadowRadius: number = 8
) => {
  if (Platform.OS !== 'web') {
    // On native, return React Native shadow props
    return {
      shadowColor,
      shadowOffset,
      shadowOpacity,
      shadowRadius,
      elevation: shadowRadius,
    };
  }

  // On web, convert to CSS box-shadow
  const { width, height } = shadowOffset;
  const rgba = hexToRgba(shadowColor, shadowOpacity);
  const boxShadow = `${width}px ${height}px ${shadowRadius}px ${rgba}`;

  return {
    boxShadow,
  };
};

/**
 * Convert hex color to rgba string
 */
const hexToRgba = (hex: string, alpha: number): string => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

/**
 * Get constrained viewport width for web
 * Returns the actual constrained width (428px) on web, or screen width on native
 */
export const getConstrainedWidth = (): number => {
  if (Platform.OS === 'web') {
    // On web, we constrain to 428px max-width
    return 428;
  }
  
  // On native, use actual screen width
  const { Dimensions } = require('react-native');
  const { width } = Dimensions.get('window');
  return width;
};

/**
 * Get web-safe padding styles
 * Ensures padding works correctly on web by using inline styles
 * @param horizontal - Horizontal padding in pixels (px-6 = 24, px-4 = 16, etc.)
 * @param vertical - Vertical padding in pixels (py-8 = 32, py-4 = 16, etc.)
 */
export const getWebPadding = (
  horizontal?: number,
  vertical?: number
): { paddingHorizontal?: number; paddingVertical?: number } => {
  if (Platform.OS !== 'web') {
    return {};
  }

  const styles: { paddingHorizontal?: number; paddingVertical?: number } = {};
  if (horizontal !== undefined) {
    styles.paddingHorizontal = horizontal;
  }
  if (vertical !== undefined) {
    styles.paddingVertical = vertical;
  }
  return styles;
};

