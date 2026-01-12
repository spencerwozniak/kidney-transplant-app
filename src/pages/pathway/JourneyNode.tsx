/**
 * Journey Node Component
 * 
 * Represents a stage as a node that expands into content.
 * The card grows out of the path line, creating the anchored feeling.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, { useAnimatedStyle, interpolate, SharedValue, withSpring } from 'react-native-reanimated';
import { buttons, typography, combineClasses } from '../../styles/theme';
import { InfoIcon } from '../../components/InfoIcon';
import type { PathwayStageData, StageStatus } from './types';
import type { PatientStatus, TransplantChecklist } from '../../services/api';
import { PATHWAY_STAGES } from './pathwayStages';
import { EvaluationProgress } from './EvaluationProgress';
import { StageActions } from './StageActions';
import { SNAP_INTERVAL } from './constants';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const NODE_BASE_SIZE = 12;
const NODE_EXPANDED_SIZE = 20;
const PATH_Y_POSITION = 180;

type JourneyNodeProps = {
  stage: PathwayStageData;
  index: number;
  status: StageStatus;
  currentStageIndex: number;
  patientStatus: PatientStatus | null;
  checklist: TransplantChecklist | null;
  scrollX: SharedValue<number>;
  onPress: () => void;
  onViewResults?: () => void;
  onViewChecklist?: () => void;
  onNavigateToQuestionnaire?: () => void;
  onFindReferral?: () => void;
  onViewReferral?: () => void;
};

export const JourneyNode = ({
  stage,
  index,
  status,
  currentStageIndex,
  patientStatus,
  checklist,
  scrollX,
  onPress,
  onViewResults,
  onViewChecklist,
  onNavigateToQuestionnaire,
  onFindReferral,
  onViewReferral,
}: JourneyNodeProps) => {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const isUpcoming = status === 'upcoming';

  // Calculate position based on scroll
  const inputRange = [
    (index - 1) * SNAP_INTERVAL,
    index * SNAP_INTERVAL,
    (index + 1) * SNAP_INTERVAL,
  ];

  // Animated styles for the node/card
  const animatedCardStyle = useAnimatedStyle(() => {
    // Distance from center (0 = centered, 1 = one card away)
    const distance = Math.abs(scrollX.value - index * SNAP_INTERVAL) / SNAP_INTERVAL;
    
    // Scale: largest when centered, smaller when away
    const scale = interpolate(
      scrollX.value,
      inputRange,
      [0.85, 1, 0.85],
      'clamp'
    );

    // Opacity: fade out when not centered
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0.4, 1, 0.4],
      'clamp'
    );

    // Transform: slight parallax effect
    const translateY = interpolate(
      scrollX.value,
      inputRange,
      [20, 0, 20],
      'clamp'
    );

    return {
      transform: [
        { scale: withSpring(scale, { damping: 20, stiffness: 200 }) },
        { translateY: withSpring(translateY, { damping: 20, stiffness: 200 }) },
      ],
      opacity: withSpring(opacity, { damping: 20, stiffness: 200 }),
    };
  });

  // Animated style for connecting line from path to card
  const animatedConnectorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 0.3, 0],
      'clamp'
    );
    const height = interpolate(
      scrollX.value,
      inputRange,
      [0, 60, 0],
      'clamp'
    );
    return {
      opacity: withSpring(opacity, { damping: 20, stiffness: 200 }),
      height: withSpring(height, { damping: 20, stiffness: 200 }),
    };
  });

  // Content visibility - only show full content when centered
  const contentOpacity = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollX.value,
      inputRange,
      [0, 1, 0],
      'clamp'
    );
    return {
      opacity: withSpring(opacity, { damping: 20, stiffness: 200 }),
    };
  });

  return (
    <View
      style={{
        width: CARD_WIDTH,
        marginHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
        alignItems: 'center',
      }}>
      {/* Connecting line from path to card */}
      <Animated.View
        style={[
          styles.connector,
          animatedConnectorStyle,
          {
            backgroundColor: isCurrent || isCompleted ? stage.color : 'rgba(255, 255, 255, 0.3)',
          },
        ]}
      />

      {/* Main Card/Node - grows out of path */}
      <Animated.View style={[animatedCardStyle]}>
        <View
          style={[
            styles.card,
            {
              // Step 3: Softer borders, no hard edges
              borderColor: isCurrent
                ? stage.color
                : isCompleted
                ? stage.color
                : 'rgba(255, 255, 255, 0.3)',
              borderWidth: isCurrent ? 2.5 : 1.5,
              backgroundColor: isCurrent
                ? 'rgba(255, 255, 255, 0.98)'
                : isCompleted
                ? 'rgba(255, 255, 255, 0.95)'
                : 'rgba(255, 255, 255, 0.85)',
            },
          ]}>
          {/* Info Button */}
          <View className="absolute right-4 top-4 z-10">
            <TouchableOpacity
              onPress={onPress}
              activeOpacity={0.7}
              className="-mr-2 p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <InfoIcon size={24} color={isCurrent ? stage.color : '#ffffff'} />
            </TouchableOpacity>
          </View>

          {/* Stage Icon and Title */}
          <View className="mb-6 mt-8">
            <View className="mb-4 items-center">
              <View
                className="h-20 w-20 items-center justify-center rounded-full"
                style={{
                  backgroundColor: isCompleted || isCurrent ? stage.bgColor : 'rgba(255, 255, 255, 0.5)',
                  borderWidth: 3,
                  borderColor: isCompleted || isCurrent ? stage.color : 'rgba(255, 255, 255, 0.7)',
                }}>
                <Text className="text-4xl">{stage.icon}</Text>
              </View>
            </View>

            <Text
              className={combineClasses(
                typography.h3,
                'mb-2 text-center',
                isUpcoming ? 'text-gray-500' : 'text-gray-900'
              )}>
              {stage.title}
            </Text>

            {/* Status Badge */}
            {isCurrent && (
              <View
                className="mb-4 self-center rounded-full px-4 py-2"
                style={{ backgroundColor: stage.color }}>
                <Text className="text-sm font-semibold text-white">Current Step</Text>
              </View>
            )}
            {isCompleted && (
              <View className="mb-4 self-center rounded-full bg-green-600 px-4 py-2">
                <Text className="text-sm font-semibold text-white">Completed</Text>
              </View>
            )}
            {isUpcoming && (
              <View className="mb-4 self-center rounded-full bg-white/50 px-4 py-2">
                <Text className="text-sm font-semibold text-gray-600">Upcoming</Text>
              </View>
            )}
          </View>

          {/* Stage Description - only visible when centered */}
          <Animated.View style={[contentOpacity]} className="mb-6 flex-1">
            <Text
              className={combineClasses(
                typography.body.large,
                'mb-4 text-center leading-7',
                isUpcoming ? 'text-gray-400' : 'text-gray-700'
              )}>
              {stage.shortDescription}
            </Text>

            <Text
              className={combineClasses(
                typography.body.medium,
                'leading-6',
                isUpcoming ? 'text-gray-400' : 'text-gray-600'
              )}>
              {stage.description}
            </Text>
          </Animated.View>

          {/* Progress Indicator for Evaluation Stage */}
          {stage.id === 'evaluation' && isCurrent && checklist && (
            <Animated.View style={[contentOpacity]}>
              <EvaluationProgress checklist={checklist} stageColor={stage.color} />
            </Animated.View>
          )}

          {/* Stage-Specific Actions */}
          <Animated.View style={[contentOpacity]}>
            <StageActions
              stage={stage}
              index={index}
              status={status}
              currentStageIndex={currentStageIndex}
              patientStatus={patientStatus}
              onViewResults={onViewResults}
              onViewChecklist={onViewChecklist}
              onNavigateToQuestionnaire={onNavigateToQuestionnaire}
              onFindReferral={onFindReferral}
              onViewReferral={onViewReferral}
            />
          </Animated.View>

          {/* Stage Number Indicator */}
          <Animated.View style={[contentOpacity]} className="mt-4 items-center">
            <Text className="text-xs text-gray-500">
              Step {index + 1} of {PATHWAY_STAGES.length}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  connector: {
    position: 'absolute',
    top: -PATH_Y_POSITION + 10,
    width: 2,
    alignSelf: 'center',
  },
  card: {
    borderRadius: 24, // Softer, more rounded corners
    padding: 24,
    minHeight: 500,
    // Step 3: Remove hard shadows - use subtle glow instead
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
});

