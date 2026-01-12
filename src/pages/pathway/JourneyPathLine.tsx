/**
 * Journey Path Line Component
 * 
 * Step 1: Persistent horizontal path line that cards grow from.
 * The path remains visible during swipe, creating the feeling of moving along a journey.
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, SharedValue } from 'react-native-reanimated';
import { PATHWAY_STAGES } from './pathwayStages';
import { SNAP_INTERVAL } from './constants';
import type { StageStatus } from './types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PATH_HEIGHT = 3;
const NODE_SIZE = 12;
const NODE_ACTIVE_SIZE = 20;
const PATH_PADDING = 40;
const PATH_Y_POSITION = 180; // Position where path sits on screen

type JourneyPathLineProps = {
  scrollX: SharedValue<number>;
  currentStageIndex: number;
  getStageStatus: (index: number) => StageStatus;
};

export const JourneyPathLine = ({ scrollX, currentStageIndex, getStageStatus }: JourneyPathLineProps) => {
  const totalWidth = SCREEN_WIDTH - PATH_PADDING * 2;
  const nodeSpacing = totalWidth / (PATHWAY_STAGES.length - 1);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Main Path Line - Always visible */}
      <View style={styles.pathLine}>
        {/* Animated progress glow that travels along the path */}
        <Animated.View
          style={[
            styles.progressGlow,
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

      {/* Stage Nodes on the Path */}
      {PATHWAY_STAGES.map((stage, index) => {
        const status = getStageStatus(index);
        const isCompleted = status === 'completed';
        const isCurrent = status === 'current';
        const isUpcoming = status === 'upcoming';

        const nodePosition = index * nodeSpacing;

        return (
          <View
            key={stage.id}
            style={[
              styles.nodeContainer,
              {
                left: PATH_PADDING + nodePosition - NODE_ACTIVE_SIZE / 2,
              },
            ]}>
            {/* Node Circle */}
            <Animated.View
              style={[
                styles.node,
                useAnimatedStyle(() => {
                  const scale = interpolate(
                    scrollX.value,
                    [
                      (index - 0.5) * SNAP_INTERVAL,
                      index * SNAP_INTERVAL,
                      (index + 0.5) * SNAP_INTERVAL,
                    ],
                    [1, isCurrent ? 1.3 : 1, 1],
                    'clamp'
                  );
                  return {
                    transform: [{ scale }],
                  };
                }),
                {
                  width: isCurrent ? NODE_ACTIVE_SIZE : NODE_SIZE,
                  height: isCurrent ? NODE_ACTIVE_SIZE : NODE_SIZE,
                  backgroundColor: isCompleted || isCurrent ? stage.color : 'rgba(255, 255, 255, 0.3)',
                  borderColor: isCompleted || isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
                  borderWidth: isCurrent ? 3 : 2,
                  shadowColor: isCurrent ? stage.color : undefined,
                  shadowOffset: isCurrent ? { width: 0, height: 0 } : undefined,
                  shadowOpacity: isCurrent ? 0.8 : undefined,
                  shadowRadius: isCurrent ? 8 : undefined,
                  elevation: isCurrent ? 8 : undefined,
                },
              ]}>
              {/* Inner glow for current node */}
              {isCurrent && (
                <View
                  style={[
                    styles.nodeGlow,
                    {
                      backgroundColor: '#ffffff',
                    },
                  ]}
                />
              )}
            </Animated.View>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: PATH_Y_POSITION,
    left: 0,
    right: 0,
    height: NODE_ACTIVE_SIZE + 20,
    zIndex: 1,
  },
  pathLine: {
    position: 'absolute',
    top: NODE_ACTIVE_SIZE / 2 - PATH_HEIGHT / 2,
    left: PATH_PADDING,
    right: PATH_PADDING,
    height: PATH_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: PATH_HEIGHT / 2,
    overflow: 'hidden',
  },
  progressGlow: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: PATH_HEIGHT / 2,
  },
  nodeContainer: {
    position: 'absolute',
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  node: {
    borderRadius: NODE_ACTIVE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeGlow: {
    width: 6,
    height: 6,
    borderRadius: 3,
    opacity: 0.9,
  },
});

