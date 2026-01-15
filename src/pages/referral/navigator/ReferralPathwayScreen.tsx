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
      {/* Header */}
      <View className="mb-8">
        <Text className={combineClasses(typography.h2, 'mb-6 text-white shadow')}>
          Your Referral Pathway
        </Text>
        <View className="h-1 w-16 rounded-full bg-white shadow" />
        <Text className={combineClasses(typography.body.large, 'mt-4 text-white shadow')}>
          {pathway.guidance.title}
        </Text>
      </View>

      {/* Selected Center */}
      {selectedCenter && (
        <View
          className={combineClasses(
            cards.default.container,
            'mb-6 border-l-4 border-blue-500 bg-white/95'
          )}>
          <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>
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

