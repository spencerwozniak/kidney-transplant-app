/**
 * Stage Card Component
 *
 * Renders an individual pathway stage card with status, actions, and progress
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { buttons, typography, cards, combineClasses } from '../../styles/theme';
import { InfoIcon } from '../../components/InfoIcon';
import type { PathwayStageData, StageStatus } from './types';
import type { PatientStatus, TransplantChecklist } from '../../services/api';
import { PATHWAY_STAGES } from './pathwayStages';
import { EvaluationProgress } from './EvaluationProgress';
import { StageActions } from './StageActions';

type StageCardProps = {
  stage: PathwayStageData;
  index: number;
  status: StageStatus;
  currentStageIndex: number;
  patientStatus: PatientStatus | null;
  checklist: TransplantChecklist | null;
  onPress: () => void;
  onViewResults?: () => void;
  onViewChecklist?: () => void;
  onNavigateToQuestionnaire?: () => void;
  onFindReferral?: () => void;
  onViewReferral?: () => void;
  cardWidth: number;
  cardSpacing: number;
};

export const StageCard = ({
  stage,
  index,
  status,
  currentStageIndex,
  patientStatus,
  checklist,
  onPress,
  onViewResults,
  onViewChecklist,
  onNavigateToQuestionnaire,
  onFindReferral,
  onViewReferral,
  cardWidth,
  cardSpacing,
}: StageCardProps) => {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  const isUpcoming = status === 'upcoming';

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
          minHeight: 500,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}>
        {/* Info Button - Top Right */}
        <View className="absolute right-4 top-4 z-10">
          <TouchableOpacity
            onPress={onPress}
            activeOpacity={0.7}
            className="-mr-2 p-2"
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <InfoIcon size={24} color="#ffffff" />
          </TouchableOpacity>
        </View>

        {/* Stage Icon and Title */}
        <View className="mb-6">
          <View className="mb-4 items-center">
            <View
              className="h-24 w-24 items-center justify-center rounded-full"
              style={{
                backgroundColor: isCompleted || isCurrent ? stage.bgColor : 'rgba(255, 255, 255, 0.5)',
                borderWidth: 3,
                borderColor: isCompleted || isCurrent ? stage.color : 'rgba(255, 255, 255, 0.7)',
              }}>
              <Text className="text-5xl">{stage.icon}</Text>
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
            <View className="mb-4 self-center rounded-full bg-green-500 px-4 py-2">
              <Text className="text-sm font-semibold text-white">Current Stage</Text>
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

        {/* Stage Description */}
        <View className="mb-6 flex-1">
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
        </View>

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
          onViewResults={onViewResults}
          onViewChecklist={onViewChecklist}
          onNavigateToQuestionnaire={onNavigateToQuestionnaire}
          onFindReferral={onFindReferral}
          onViewReferral={onViewReferral}
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
