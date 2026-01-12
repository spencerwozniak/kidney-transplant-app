/**
 * Stage Actions Component
 * 
 * Renders action buttons specific to each pathway stage
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { buttons, combineClasses } from '../../styles/theme';
import type { PathwayStageData, StageStatus } from './types';
import type { PatientStatus } from '../../services/api';

type StageActionsProps = {
  stage: PathwayStageData;
  index: number;
  status: StageStatus;
  currentStageIndex: number;
  patientStatus: PatientStatus | null;
  onViewResults?: () => void;
  onViewChecklist?: () => void;
  onNavigateToQuestionnaire?: () => void;
  onFindReferral?: () => void;
  onViewReferral?: () => void;
};

export const StageActions = ({
  stage,
  index,
  status,
  currentStageIndex,
  patientStatus,
  onViewResults,
  onViewChecklist,
  onNavigateToQuestionnaire,
  onFindReferral,
  onViewReferral,
}: StageActionsProps) => {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';

  // Evaluation Stage Actions
  if (stage.id === 'evaluation' && onViewChecklist && (isCurrent || isCompleted)) {
    return (
      <View className="mb-4">
        <TouchableOpacity
          className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
          onPress={(e) => {
            e.stopPropagation();
            onViewChecklist();
          }}
          activeOpacity={0.8}>
          <Text className={buttons.primary.text}>View Checklist</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Identification Stage Actions
  if (stage.id === 'identification') {
    return (
      <View className="mb-4">
        {patientStatus && onViewResults ? (
          // Has status (questionnaire completed) - show "View Transplant Status"
          <TouchableOpacity
            className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
            onPress={(e) => {
              e.stopPropagation();
              onViewResults();
            }}
            activeOpacity={0.8}>
            <Text className={buttons.outline.text}>View Transplant Status</Text>
          </TouchableOpacity>
        ) : onNavigateToQuestionnaire ? (
          // No status yet (questionnaire not completed) - show "Begin Assessment"
          <TouchableOpacity
            className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
            onPress={(e) => {
              e.stopPropagation();
              onNavigateToQuestionnaire();
            }}
            activeOpacity={0.8}>
            <Text className={buttons.primary.text}>Begin Assessment</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  // Referral Stage Actions
  if (stage.id === 'referral') {
    return (
      <View className="mb-4">
        {currentStageIndex > index && onViewReferral ? (
          // Past referral stage - show "View Referral" button
          <TouchableOpacity
            className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
            onPress={(e) => {
              e.stopPropagation();
              onViewReferral();
            }}
            activeOpacity={0.8}>
            <Text className={buttons.outline.text}>View Referral</Text>
          </TouchableOpacity>
        ) : index === currentStageIndex && onFindReferral ? (
          // Current referral stage only - show "Find a Referral" button
          <TouchableOpacity
            className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
            onPress={(e) => {
              e.stopPropagation();
              onFindReferral();
            }}
            activeOpacity={0.8}>
            <Text className={buttons.primary.text}>Find a Referral</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  // No actions for other stages
  return null;
};

