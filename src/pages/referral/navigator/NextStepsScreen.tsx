/**
 * Next Steps Screen Component
 * 
 * Displays detailed next steps for securing a referral:
 * - Contact information for selected center
 * - Detailed step-by-step guidance
 * - Script to use
 * - Important reminders
 */

import React from 'react';
import { View, Text } from 'react-native';
import { typography, cards, combineClasses } from '../../../styles/theme';
import type { NextStepsScreenProps } from './types';
import { SelectedCenterInfo } from './SelectedCenterInfo';
import { DetailedSteps } from './DetailedSteps';
import { ScriptCard } from './ScriptCard';
import { ImportantReminder } from './ImportantReminder';

export const NextStepsScreen = ({
  pathway,
  selectedCenter,
  referralState,
  onBack,
  onUpdateReferralState,
  onNavigateBack,
}: NextStepsScreenProps) => {
  return (
    <View className="px-6 py-8">
      {/* Header */}
      <View className="mb-8">
        <Text className={combineClasses(typography.h2, 'mb-6 text-white shadow')}>
          What to Do Next
        </Text>
        <View className="h-1 w-16 rounded-full bg-white shadow" />
        <Text className={combineClasses(typography.body.large, 'mt-4 text-white shadow')}>
          Clear, actionable steps to secure your referral
        </Text>
      </View>

      {/* Selected Center Contact Information */}
      {selectedCenter && <SelectedCenterInfo center={selectedCenter} />}

      {/* Detailed Steps */}
      {pathway.guidance.steps && <DetailedSteps steps={pathway.guidance.steps} />}

      {/* Script Card */}
      {pathway.guidance.script && <ScriptCard script={pathway.guidance.script} />}

      {/* Important Reminder */}
      <ImportantReminder />
    </View>
  );
};

