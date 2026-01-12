/**
 * Journey Path Component
 * 
 * Displays a persistent horizontal path line with nodes for each stage.
 * The path remains visible during navigation, creating the feeling of moving along a journey.
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, interpolate } from 'react-native-reanimated';
import { PATHWAY_STAGES } from './pathwayStages';
import { SNAP_INTERVAL } from './constants';
import type { StageStatus } from './types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PATH_HEIGHT = 4;
const NODE_SIZE = 16;
const NODE_ACTIVE_SIZE = 24;
const PATH_PADDING = 40;

type JourneyPathProps = {
  scrollX: Animated.SharedValue<number>;
  currentStageIndex: number;
  getStageStatus: (index: number) => StageStatus;
};

export const JourneyPath = ({ scrollX, currentStageIndex, getStageStatus }: JourneyPathProps) => {
  const totalWidth = SCREEN_WIDTH - PATH_PADDING * 2;
  const nodeSpacing = totalWidth / (PATHWAY_STAGES.length - 1);

  return (
    <View style={styles.container} pointerEvents="none">
      {/* Main Path Line */}
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

      {/* Stage Nodes */}
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
            <View
              style={[
                styles.node,
                {
                  width: isCurrent ? NODE_ACTIVE_SIZE : NODE_SIZE,
                  height: isCurrent ? NODE_ACTIVE_SIZE : NODE_SIZE,
                  backgroundColor: isCompleted || isCurrent ? stage.color : 'rgba(255, 255, 255, 0.4)',
                  borderColor: isCompleted || isCurrent ? '#ffffff' : 'rgba(255, 255, 255, 0.6)',
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
                      backgroundColor: stage.color,
                    },
                  ]}
                />
              )}
            </View>

            {/* Ghost preview for upcoming nodes */}
            {isUpcoming && index === currentStageIndex + 1 && (
              <Animated.View
                style={[
                  styles.ghostNode,
                  useAnimatedStyle(() => {
                    const opacity = interpolate(
                      scrollX.value,
                      [
                        (index - 1) * SNAP_INTERVAL,
                        index * SNAP_INTERVAL,
                      ],
                      [0, 0.6],
                      'clamp'
                    );
                    return { opacity };
                  }),
                ]}>
                <View
                  style={[
                    styles.ghostIcon,
                    {
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    },
                  ]}>
                  {/* Stage icon preview */}
                </View>
              </Animated.View>
            )}
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 100,
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
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
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
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.9,
  },
  ghostNode: {
    position: 'absolute',
    top: -10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ghostIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
});

