/**
 * Ghost Steps Component
 * 
 * Step 8: Shows preview of next step's icon/title before content loads.
 * Creates anticipation: "I'm approaching something."
 */

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, SharedValue, withSpring } from 'react-native-reanimated';
import { PATHWAY_STAGES } from './pathwayStages';
import { SNAP_INTERVAL } from './constants';
import { typography, combineClasses } from '../../styles/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;

type GhostStepsProps = {
  scrollX: SharedValue<number>;
  currentIndex: number;
};

export const GhostSteps = ({ scrollX, currentIndex }: GhostStepsProps) => {
  return (
    <View style={styles.container} pointerEvents="none">
      {PATHWAY_STAGES.map((stage, index) => {
        // Only show ghost for next step (one ahead)
        if (index !== currentIndex + 1) return null;

        const inputRange = [
          (index - 1) * SNAP_INTERVAL,
          index * SNAP_INTERVAL,
          (index + 1) * SNAP_INTERVAL,
        ];

        // Ghost appears as we approach the next step
        const ghostStyle = useAnimatedStyle(() => {
          const opacity = interpolate(
            scrollX.value,
            [
              (currentIndex - 0.3) * SNAP_INTERVAL,
              currentIndex * SNAP_INTERVAL,
              index * SNAP_INTERVAL,
            ],
            [0, 0.3, 0.7],
            'clamp'
          );

          const scale = interpolate(
            scrollX.value,
            [
              (currentIndex - 0.3) * SNAP_INTERVAL,
              currentIndex * SNAP_INTERVAL,
              index * SNAP_INTERVAL,
            ],
            [0.8, 0.9, 1],
            'clamp'
          );

          const translateX = interpolate(
            scrollX.value,
            [
              (currentIndex - 0.3) * SNAP_INTERVAL,
              currentIndex * SNAP_INTERVAL,
              index * SNAP_INTERVAL,
            ],
            [50, 30, 0],
            'clamp'
          );

          return {
            opacity: withSpring(opacity, { damping: 20, stiffness: 200 }),
            transform: [
              { scale: withSpring(scale, { damping: 20, stiffness: 200 }) },
              { translateX: withSpring(translateX, { damping: 20, stiffness: 200 }) },
            ],
          };
        });

        return (
          <Animated.View
            key={stage.id}
            style={[
              styles.ghostContainer,
              {
                left: (SCREEN_WIDTH - CARD_WIDTH) / 2 + CARD_WIDTH + 20,
              },
              ghostStyle,
            ]}>
            {/* Ghost Icon */}
            <View
              style={[
                styles.ghostIcon,
                {
                  backgroundColor: `rgba(255, 255, 255, 0.2)`,
                  borderColor: `rgba(255, 255, 255, 0.4)`,
                },
              ]}>
              <Text className="text-3xl">{stage.icon}</Text>
            </View>

            {/* Ghost Title */}
            <Text
              className={combineClasses(typography.body.medium, 'mt-2 text-center text-white/70')}
              numberOfLines={2}>
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
    zIndex: 2,
  },
  ghostContainer: {
    position: 'absolute',
    top: '40%',
    alignItems: 'center',
    width: 120,
  },
  ghostIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

