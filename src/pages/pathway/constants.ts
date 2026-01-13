/**
 * Pathway Constants
 * 
 * Layout and sizing constants for the pathway screen
 */

import { Platform, Dimensions } from 'react-native';

// Get the actual viewport width (constrained on web, full screen on native)
const getViewportWidth = () => {
  if (Platform.OS === 'web') {
    // On web, we constrain to 428px max-width, so use that for calculations
    return 428;
  }
  const { width } = Dimensions.get('window');
  return width;
};

const VIEWPORT_WIDTH = getViewportWidth();

export const CARD_WIDTH = VIEWPORT_WIDTH * 0.9; // 90% of viewport width
export const CARD_SPACING = 16;
export const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

