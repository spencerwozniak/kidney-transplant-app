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
      <Text className={combineClasses(typography.h2, 'mb-2 text-left')}>What to Do Next</Text>
      <Text className={combineClasses(typography.body.medium, 'mb-6 text-left text-gray-600')}>
        Clear, actionable steps to secure your referral
      </Text>

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

