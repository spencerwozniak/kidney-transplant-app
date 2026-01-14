/**
 * Stage Card Component
 *
 * Renders an individual pathway stage card with status, actions, and progress
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { buttons, typography, cards, combineClasses } from '../../styles/theme';
import { InfoIcon } from '../../components/InfoIcon';
import type { PathwayStageData, StageStatus } from './types';
import type { PatientStatus, TransplantChecklist, PatientReferralState } from '../../services/api';
import { PATHWAY_STAGES } from './pathwayStages';
import { EvaluationProgress } from './EvaluationProgress';
import { StageActions } from './StageActions';
import { getWebShadow } from '../../utils/webStyles';

type StageCardProps = {
  stage: PathwayStageData;
  index: number;
  status: StageStatus;
  currentStageIndex: number;
  patientStatus: PatientStatus | null;
  checklist: TransplantChecklist | null;
  referralState: PatientReferralState | null;
  onPress: () => void;
  onViewResults?: () => void;
  onViewChecklist?: () => void;
  onNavigateToQuestionnaire?: () => void;
  onFindReferral?: () => void;
  onViewReferral?: () => void;
  cardWidth: number;
  cardSpacing: number;
  questionnaireCompleted?: boolean;
};

export const StageCard = ({
  stage,
  index,
  status,
  currentStageIndex,
  patientStatus,
  checklist,
  referralState,
  onPress,
  onViewResults,
  onViewChecklist,
  onNavigateToQuestionnaire,
  onFindReferral,
  onViewReferral,
  cardWidth,
  cardSpacing,
  questionnaireCompleted,
}: StageCardProps) => {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const isUpcoming = status === 'upcoming';

  // Get window dimensions for responsive layout
  const [windowHeight, setWindowHeight] = useState(Dimensions.get('window').height);
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowHeight(window.height);
    });

    return () => subscription?.remove();
  }, []);

  // Thresholds for responsive behavior
  const SMALL_HEIGHT_THRESHOLD = 780; // Below this, use compact layout
  const HIDE_DESCRIPTION_THRESHOLD = 500; // Below this on web, hide description

  const isSmallHeight = windowHeight < SMALL_HEIGHT_THRESHOLD;
  const shouldHideDescription = isWeb && windowHeight < HIDE_DESCRIPTION_THRESHOLD;

  // Scale icon size based on height
  const iconSize = isSmallHeight ? 64 : 96;

  // Scale minHeight based on window height
  const baseMinHeight = 500;
  const heightScale = Math.max(0.7, Math.min(1.0, windowHeight / baseMinHeight));
  const minCardHeight = baseMinHeight * heightScale;

  // StageCard no longer logs on every render — debug logging is centralized in PathwayScreen after load.

  return (
    <View
      style={{
        width: cardWidth,
        marginHorizontal: cardSpacing / 2,
      }}>
      <View
        className={combineClasses(cards.default.elevated, 'flex-1 justify-between p-8')}
        style={{
          borderWidth: isCurrent ? 3 : 2,
          borderColor: isCurrent ? '#ffffff' : isCompleted ? '#ffffff' : 'rgba(255, 255, 255, 0.5)',
          backgroundColor: isCurrent ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.9)',
          ...getWebShadow('#000', { width: 0, height: 4 }, 0.3, 8),
        }}>
        {/* Info Button - Top Right */}
        <View className="absolute right-4 top-4 z-10">
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="-mr-2 p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <InfoIcon size={24} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Stage Icon and Title */}
        <View className={isSmallHeight ? 'flex-row items-center' : 'mb-6'}>
          <View className={isSmallHeight ? 'mr-4' : 'mb-4 items-center'}>
            <View
              className="items-center justify-center rounded-full"
              style={{
                width: iconSize,
                height: iconSize,
                backgroundColor: isSmallHeight
                  ? 'transparent'
                  : isCompleted || isCurrent
                    ? stage.bgColor
                    : 'rgba(255, 255, 255, 0.5)',
                borderWidth: isSmallHeight ? 0 : 3,
                borderColor: isSmallHeight
                  ? 'transparent'
                  : isCompleted || isCurrent
                    ? stage.color
                    : 'rgba(255, 255, 255, 0.7)',
              }}>
              {stage.icon}
            </View>
          </View>

          <View className={isSmallHeight ? 'flex-1' : ''}>
            <Text
              className={combineClasses(
                typography.h3,
                isSmallHeight ? 'mb-2 text-left' : 'mb-2 text-center',
                isUpcoming ? 'text-gray-500' : 'text-gray-900'
              )}>
              {stage.title}
            </Text>
          </View>
        </View>

        {/* Status Badge */}
        {isCurrent && (
          <View className="mb-2 self-center rounded-full bg-green-500 px-4 py-2">
            <Text className="text-sm font-semibold text-white">Current Stage</Text>
          </View>
        )}
        {isCompleted && (
          <View className="mb-2 mb-4 self-center rounded-full bg-green-600 px-4 py-2">
            <Text className="text-sm font-semibold text-white">Completed</Text>
          </View>
        )}
        {isUpcoming && (
          <View className="mb-2 self-center rounded-full bg-white/50 px-4 py-2">
            <Text className="text-sm font-semibold text-gray-600">Upcoming</Text>
          </View>
        )}

        {/* Stage Description */}
        {!shouldHideDescription && (
          <View className="mb-6 flex-1">
            <Text
              className={combineClasses(
                typography.body.large,
                'mb-4 text-center leading-7',
                isUpcoming ? 'text-gray-400' : 'text-gray-700'
              )}>
              {stage.shortDescription}
            </Text>
          </View>
        )}

        {/* Progress Indicator for Evaluation Stage Only */}
        {stage.id === 'evaluation' && isCurrent && checklist && (
          <EvaluationProgress checklist={checklist} stageColor={stage.color} />
        )}

        {/* Stage-Specific Actions */}
        <StageActions
          stage={stage}
          index={index}
          status={status}
          currentStageIndex={currentStageIndex}
          patientStatus={patientStatus}
          referralState={referralState}
          onViewResults={onViewResults}
          onViewChecklist={onViewChecklist}
          onNavigateToQuestionnaire={onNavigateToQuestionnaire}
          onFindReferral={onFindReferral}
          onViewReferral={onViewReferral}
          questionnaireCompleted={questionnaireCompleted}
        />

        {/* Stage Number Indicator */}
        <View className="mt-4 items-center">
          <Text className="text-xs text-gray-500">
            Stage {index + 1} of {PATHWAY_STAGES.length}
          </Text>
        </View>
      </View>
    </View>
  );
};
