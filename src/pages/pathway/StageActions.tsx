/**
 * Stage Actions Component
 * 
 * Renders action buttons specific to each pathway stage
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { buttons, combineClasses } from '../../styles/theme';
import type { PathwayStageData, StageStatus } from './types';
import type { PatientStatus, PatientReferralState } from '../../services/api';

type StageActionsProps = {
  stage: PathwayStageData;
  index: number;
  status: StageStatus;
  currentStageIndex: number;
  patientStatus: PatientStatus | null;
  referralState: PatientReferralState | null;
  onViewResults?: () => void;
  onViewChecklist?: () => void;
  onNavigateToQuestionnaire?: () => void;
  onFindReferral?: () => void;
  onViewReferral?: () => void;
  questionnaireCompleted?: boolean;
};

export const StageActions = ({
  stage,
  index,
  status,
  currentStageIndex,
  patientStatus,
  referralState,
  onViewResults,
  onViewChecklist,
  onNavigateToQuestionnaire,
  onFindReferral,
  onViewReferral,
  questionnaireCompleted,
}: StageActionsProps) => {
  const isCompleted = status === 'completed';
  const isCurrent = status === 'current';
  
  // Check if referral is received/completed
  const hasReferral = referralState?.has_referral === true || referralState?.referral_status === 'completed';

  // Evaluation Stage Actions
  if (stage.id === 'evaluation' && onViewChecklist && (isCurrent || isCompleted)) {
    return (
      <View className="mb-4">
        <TouchableOpacity
          className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
          onPress={(e) => {
            e.stopPropagation();
            onViewChecklist();
          }}
          activeOpacity={0.8}>
          <Text className={buttons.outline.text}>View Checklist</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Identification Stage Actions
  if (stage.id === 'identification') {
    const hasQuestionnaire = !!questionnaireCompleted;
    return (
      <View className="mb-4">
        {onNavigateToQuestionnaire && (
          <TouchableOpacity
            className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
            onPress={(e) => {
              e.stopPropagation();
              onNavigateToQuestionnaire();
            }}
            activeOpacity={0.8}>
            <Text className={buttons.outline.text}>
              {hasQuestionnaire ? 'Edit Eligibility Assessment' : 'Begin Eligibility Assessment'}
            </Text>
          </TouchableOpacity>
        )}
        {patientStatus && onViewResults && (
          <View className="mt-3">
            <TouchableOpacity
              className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
              onPress={(e) => {
                e.stopPropagation();
                onViewResults();
              }}
              activeOpacity={0.8}>
              <Text className={buttons.outline.text}>View Transplant Status</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }

  // Referral Stage Actions
  if (stage.id === 'referral') {
    return (
      <View className="mb-4">
        {(hasReferral || currentStageIndex > index) && onViewReferral ? (
          // Referral received or past referral stage - show "View Referral" button
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
          // Current referral stage without referral - show "Find a Referral" button
          <TouchableOpacity
            className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
            onPress={(e) => {
              e.stopPropagation();
              onFindReferral();
            }}
            activeOpacity={0.8}>
            <Text className={buttons.outline.text}>Find a Referral</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    );
  }

  // No actions for other stages
  return null;
};

