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
import { View, Text, TouchableOpacity, Linking, Alert } from 'react-native';
import { typography, cards, combineClasses, buttons } from '../../../styles/theme';
import type { NextStepsScreenProps } from './types';

export const NextStepsScreen = ({ selectedCenter }: NextStepsScreenProps) => {
  const handleOpenWebsite = async () => {
    if (!selectedCenter?.contact?.website) return;

    try {
      const url = selectedCenter.contact.website;
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to open website. Please check the URL.');
      }
    } catch (error) {
      console.error('Error opening website:', error);
      Alert.alert('Error', 'Failed to open website. Please try again.');
    }
  };

  return (
    <View className="px-6 py-8">
      {/* Header */}
      <View className="mb-8">
        <Text className={combineClasses(typography.h2, 'mb-6 text-white shadow')}>
          What to Do Next
        </Text>
        <View className="h-1 w-16 rounded-full bg-white shadow" />
      </View>

      {/* Selected Center Contact Information */}
      {selectedCenter && (
        <View
          className={combineClasses(
            cards.default.container,
            'border-l-4 border-green-500 bg-white/95'
          )}>
          <Text className={combineClasses(typography.h5, 'mb-2 !font-nunito-bold text-green-900')}>
            {selectedCenter.name}
          </Text>

          {selectedCenter.location && (
            <View className="mb-4">
              <Text className={combineClasses(typography.body.small, 'text-green-800')}>
                {selectedCenter.location.city}, {selectedCenter.location.state}
              </Text>
            </View>
          )}

          <View className="mb-3">
            <Text
              className={combineClasses(
                typography.body.small,
                'mb-1 font-semibold text-green-900'
              )}>
              Referral Phone:
            </Text>
            <Text className={combineClasses(typography.body.medium, 'text-green-700')}>
              {selectedCenter.contact.referral_phone}
            </Text>
          </View>

          {selectedCenter.contact.referral_fax && (
            <View className="mb-3">
              <Text
                className={combineClasses(
                  typography.body.small,
                  'mb-1 font-semibold text-green-900'
                )}>
                Fax:
              </Text>
              <Text className={combineClasses(typography.body.medium, 'text-green-700')}>
                {selectedCenter.contact.referral_fax}
              </Text>
            </View>
          )}

          {selectedCenter.contact.website && (
            <View className="mb-1">
              <TouchableOpacity
                className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
                onPress={handleOpenWebsite}
                activeOpacity={0.8}>
                <Text className={buttons.primary.text}>Visit Website</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* How to Get a Referral Explanation */}
          <View
            className={combineClasses(
              cards.default.container,
              'mb-2 mt-4 border-l-4 border-blue-500 bg-white/95'
            )}>
            <Text className={combineClasses(typography.h5, 'mb-3 text-blue-900')}>
              How to Get a Referral
            </Text>
            <Text className={combineClasses(typography.body.small, 'mb-2 leading-6 text-blue-800')}>
              To get a referral to {selectedCenter?.name || 'this transplant center'}, you'll need
              to contact your healthcare provider (nephrologist or primary care physician) and ask
              them to send a referral on your behalf.
            </Text>
          </View>
        </View>
      )}
    </View>
  );
};
