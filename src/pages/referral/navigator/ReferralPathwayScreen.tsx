/**
 * Referral Pathway Screen Component
 * 
 * Displays the referral pathway guidance with:
 * - Selected center information
 * - Provider/dialysis center information forms
 * - Next steps, scripts, and what to send
 * - Available pathways
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { buttons, typography, cards, combineClasses } from '../../../styles/theme';
import type { ReferralPathwayScreenProps } from './types';
import { ProviderInfoForm } from './ProviderInfoForm';
import { PathwayGuidance } from './PathwayGuidance';

export const ReferralPathwayScreen = ({
  pathway,
  selectedCenter,
  referralState,
  onBack,
  onNextSteps,
  onUpdateReferralState,
}: ReferralPathwayScreenProps) => {
  return (
    <View className="px-6 py-8">
      <Text className={combineClasses(typography.h2, 'mb-2 text-left')}>Your Referral Pathway</Text>
      <Text className={combineClasses(typography.body.medium, 'mb-6 text-left text-gray-600')}>
        {pathway.guidance.title}
      </Text>

      {/* Selected Center */}
      {selectedCenter && (
        <View className={combineClasses(cards.colored.blue, 'mb-6')}>
          <Text className={combineClasses(typography.h6, 'mb-2 text-blue-900')}>
            Selected Center
          </Text>
          <Text className={combineClasses(typography.body.medium, 'text-blue-800')}>
            {selectedCenter.name}
          </Text>
          <Text className={combineClasses(typography.body.small, 'mt-1 text-blue-700')}>
            {selectedCenter.contact.referral_phone}
          </Text>
        </View>
      )}

      {/* Provider Information Forms */}
      <ProviderInfoForm
        pathway={pathway}
        referralState={referralState}
        onUpdateReferralState={onUpdateReferralState}
      />

      {/* Pathway Guidance */}
      <PathwayGuidance pathway={pathway} />

      {/* Next Steps Button */}
      <TouchableOpacity
        className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
        onPress={onNextSteps}
        activeOpacity={0.8}>
        <Text className={buttons.primary.text}>View Detailed Next Steps</Text>
      </TouchableOpacity>
    </View>
  );
};

