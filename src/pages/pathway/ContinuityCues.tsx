/**
 * Continuity Cues Component
 * 
 * Step 3: Shows partial visibility of next/previous step's title or icon.
 * Instead of seeing "another card," you glimpse: "What's coming next..."
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, SharedValue, withSpring } from 'react-native-reanimated';
import { PATHWAY_STAGES } from './pathwayStages';
import { SNAP_INTERVAL } from './constants';
import { typography, combineClasses } from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

type ContinuityCuesProps = {
  scrollX: SharedValue<number>;
  currentIndex: number;
};

export const ContinuityCues = ({ scrollX, currentIndex }: ContinuityCuesProps) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {PATHWAY_STAGES.map((stage, index) => {
        // Show preview of next step (one ahead)
        if (index !== currentIndex + 1) return null;

        const inputRange = [
          (index - 1) * SNAP_INTERVAL,
          index * SNAP_INTERVAL,
          (index + 1) * SNAP_INTERVAL,
        ];

        // Preview appears as we approach
        const previewStyle = useAnimatedStyle(() => {
          const opacity = interpolate(
            scrollX.value,
            [
              (currentIndex - 0.2) * SNAP_INTERVAL,
              currentIndex * SNAP_INTERVAL,
              index * SNAP_INTERVAL,
            ],
            [0, 0.4, 0.8],
            'clamp'
          );

          const translateX = interpolate(
            scrollX.value,
            [
              (currentIndex - 0.2) * SNAP_INTERVAL,
              currentIndex * SNAP_INTERVAL,
              index * SNAP_INTERVAL,
            ],
            [30, 15, 0],
            'clamp'
          );

          return {
            opacity: withSpring(opacity, { damping: 20, stiffness: 200 }),
            transform: [{ translateX: withSpring(translateX, { damping: 20, stiffness: 200 }) }],
          };
        });

        return (
          <Animated.View
            key={stage.id}
            style={[
              styles.previewContainer,
              {
                right: (SCREEN_WIDTH - CARD_WIDTH) / 2 - 100,
              },
              previewStyle,
            ]}>
            {/* Preview Icon */}
            <View
              style={[
                styles.previewIcon,
                {
                  backgroundColor: `rgba(255, 255, 255, 0.15)`,
                  borderColor: `rgba(255, 255, 255, 0.3)`,
                },
              ]}>
              <Text className="text-2xl">{stage.icon}</Text>
            </View>

            {/* Preview Title - partial visibility */}
            <Text
              className={combineClasses(typography.body.small, 'mt-1 text-center text-white/60')}
              numberOfLines={1}>
              {stage.title}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  previewContainer: {
    position: 'absolute',
    top: '35%',
    alignItems: 'center',
    width: 100,
  },
  previewIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

