/**
 * Pathway Constants
 * 
 * Layout and sizing constants for the pathway screen
 */

import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CARD_WIDTH = SCREEN_WIDTH * 0.9; // 90% of screen width
export const CARD_SPACING = 16;
export const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

