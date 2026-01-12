/**
 * Progress Spine Component
 * 
 * Step 4: Always visible journey spine showing past (filled), current (glowing), and future (hollow) steps.
 * The glow travels smoothly along the spine as the user navigates.
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, withSpring, SharedValue } from 'react-native-reanimated';
import { PATHWAY_STAGES } from './pathwayStages';
import { SNAP_INTERVAL } from './constants';
import type { StageStatus } from './types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SPINE_HEIGHT = 2;
const SPINE_NODE_SIZE = 6;
const SPINE_ACTIVE_SIZE = 10;
const SPINE_PADDING = 20;

type ProgressSpineProps = {
  scrollX: SharedValue<number>;
  currentStageIndex: number;
  getStageStatus: (index: number) => StageStatus;
};

export const ProgressSpine = ({ scrollX, currentStageIndex, getStageStatus }: ProgressSpineProps) => {
  const totalWidth = SCREEN_WIDTH - SPINE_PADDING * 2;
  const nodeSpacing = totalWidth / (PATHWAY_STAGES.length - 1);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Spine Line */}
      <View style={styles.spineLine}>
        {/* Animated glow that travels along the spine */}
        <Animated.View
          style={[
            styles.spineGlow,
            useAnimatedStyle(() => {
              const progress = interpolate(
                scrollX.value,
                [0, SNAP_INTERVAL * (PATHWAY_STAGES.length - 1)],
                [0, totalWidth],
                'clamp'
              );
              return {
                width: progress,
              };
            }),
          ]}
        />
      </View>

      {/* Spine Nodes */}
      {PATHWAY_STAGES.map((stage, index) => {
        const status = getStageStatus(index);
        const isCompleted = status === 'completed';
        const isCurrent = status === 'current';
        const isUpcoming = status === 'upcoming';

        const nodePosition = index * nodeSpacing;

        return (
          <Animated.View
            key={stage.id}
            style={[
              styles.spineNodeContainer,
              {
                left: SPINE_PADDING + nodePosition - SPINE_ACTIVE_SIZE / 2,
              },
              useAnimatedStyle(() => {
                const scale = interpolate(
                  scrollX.value,
                  [
                    (index - 0.5) * SNAP_INTERVAL,
                    index * SNAP_INTERVAL,
                    (index + 0.5) * SNAP_INTERVAL,
                  ],
                  [1, isCurrent ? 1.5 : 1, 1],
                  'clamp'
                );
                return {
                  transform: [{ scale: withSpring(scale, { damping: 15, stiffness: 150 }) }],
                };
              }),
            ]}>
            {/* Past steps - filled */}
            {isCompleted && (
              <View
                style={[
                  styles.spineNode,
                  {
                    width: SPINE_NODE_SIZE,
                    height: SPINE_NODE_SIZE,
                    backgroundColor: stage.color,
                    borderColor: '#ffffff',
                  },
                ]}
              />
            )}

            {/* Current step - glowing */}
            {isCurrent && (
              <View
                style={[
                  styles.spineNode,
                  {
                    width: SPINE_ACTIVE_SIZE,
                    height: SPINE_ACTIVE_SIZE,
                    backgroundColor: stage.color,
                    borderColor: '#ffffff',
                    borderWidth: 2,
                    shadowColor: stage.color,
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 6,
                    elevation: 6,
                  },
                ]}>
                <View
                  style={[
                    styles.spineNodeInner,
                    {
                      backgroundColor: '#ffffff',
                    },
                  ]}
                />
              </View>
            )}

            {/* Future steps - hollow */}
            {isUpcoming && (
              <View
                style={[
                  styles.spineNode,
                  {
                    width: SPINE_NODE_SIZE,
                    height: SPINE_NODE_SIZE,
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(255, 255, 255, 0.4)',
                    borderWidth: 2,
                  },
                ]}
              />
            )}
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 40,
    left: 0,
    right: 0,
    height: SPINE_ACTIVE_SIZE + 10,
    zIndex: 10,
  },
  spineLine: {
    position: 'absolute',
    top: SPINE_ACTIVE_SIZE / 2 - SPINE_HEIGHT / 2,
    left: SPINE_PADDING,
    right: SPINE_PADDING,
    height: SPINE_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SPINE_HEIGHT / 2,
    overflow: 'hidden',
  },
  spineGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: SPINE_HEIGHT / 2,
  },
  spineNodeContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spineNode: {
    borderRadius: SPINE_ACTIVE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  spineNodeInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
  },
});
