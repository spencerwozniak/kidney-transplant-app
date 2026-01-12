/**
 * Pathway Guidance Component
 * 
 * Displays guidance information from the referral pathway:
 * - Next steps
 * - Script to use
 * - What to send
 * - Available pathways
 */

import React from 'react';
import { View, Text } from 'react-native';
import { typography, cards, combineClasses } from '../../../styles/theme';
import type { ReferralPathway } from '../../../services/api';

type PathwayGuidanceProps = {
  pathway: ReferralPathway;
};

export const PathwayGuidance = ({ pathway }: PathwayGuidanceProps) => {
  return (
    <>
      {/* Next Steps */}
      {pathway.guidance.steps && (
        <View className="mb-6">
          <Text className={combineClasses(typography.h5, 'mb-4 text-left')}>Next Steps</Text>
          {pathway.guidance.steps.map((step, index) => (
            <View key={index} className="mb-3 flex-row">
              <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-green-100">
                <Text className="text-sm font-semibold text-green-700">{index + 1}</Text>
              </View>
              <Text className={combineClasses(typography.body.medium, 'flex-1')}>{step}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Script */}
      {pathway.guidance.script && (
        <View className={combineClasses(cards.colored.green, 'mb-6')}>
          <Text className={combineClasses(typography.h6, 'mb-2 text-green-900')}>What to Say</Text>
          <Text className={combineClasses(typography.body.medium, 'leading-6 text-green-800')}>
            "{pathway.guidance.script}"
          </Text>
        </View>
      )}

      {/* What to Send */}
      {pathway.guidance.what_to_send && (
        <View className="mb-6">
          <Text className={combineClasses(typography.h5, 'mb-4 text-left')}>What to Send</Text>
          {pathway.guidance.what_to_send.map((item, index) => (
            <View key={index} className="mb-2 flex-row">
              <Text className="mr-2 text-green-600">✓</Text>
              <Text className={combineClasses(typography.body.medium, 'flex-1')}>{item}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Available Pathways */}
      {pathway.guidance.paths && (
        <View className="mb-6">
          <Text className={combineClasses(typography.h5, 'mb-4 text-left')}>
            Available Pathways
          </Text>
          {pathway.guidance.paths.map((path, index) => (
            <View key={index} className={combineClasses(cards.default.container, 'mb-4')}>
              <Text className={combineClasses(typography.h6, 'mb-2')}>{path.name}</Text>
              <Text className={combineClasses(typography.body.small, 'mb-3 text-gray-600')}>
                {path.description}
              </Text>
              <Text
                className={combineClasses(typography.body.small, 'font-semibold text-green-700')}>
                {path.action}
              </Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
};

