/**
 * Pathway Header Component
 *
 * Displays the header section of the pathway screen
 */

import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, Platform } from 'react-native';
import { typography, combineClasses } from '../../styles/theme';

export const PathwayHeader = () => {
  const [windowHeight, setWindowHeight] = useState(Dimensions.get('window').height);

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowHeight(window.height);
    });

    return () => subscription?.remove();
  }, []);

  // Scale header based on window height
  // Base height is 800px, scale proportionally
  const baseHeight = 800;
  const heightScale = Math.max(0.8, Math.min(1.2, windowHeight / baseHeight));

  // Calculate responsive padding and font sizes
  const headerPaddingTop = Math.max(24, Math.min(48, 12 * heightScale * 2));
  const headerPaddingBottom = Math.max(4, Math.min(8, 2 * heightScale * 2));
  const titleFontSize = Math.max(20, Math.min(32, 24 * heightScale));
  const subtitleFontSize = Math.max(12, Math.min(16, 14 * heightScale));

  return (
    <View
      className="px-6"
      style={{
        paddingTop: headerPaddingTop,
        paddingBottom: headerPaddingBottom,
      }}>
      <Text
        className={combineClasses(typography.h2, 'mb-1 text-center text-white shadow-md')}
        style={{
          fontSize: titleFontSize,
        }}>
        Your Pathway
      </Text>
      <Text
        className={combineClasses(typography.body.small, 'text-center text-white/90 shadow')}
        style={{
          fontSize: subtitleFontSize,
        }}>
        Swipe left or right to explore stages
      </Text>
    </View>
  );
};
