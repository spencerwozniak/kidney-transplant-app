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
          <Text className={combineClasses(typography.h5, 'mb-4 text-white shadow')}>
            Next Steps
          </Text>
          {pathway.guidance.steps.map((step, index) => (
            <View
              key={index}
              className={combineClasses(
                cards.default.container,
                'mb-3 border-l-4 border-blue-500 bg-white/95'
              )}>
              <View className="mb-2 flex-row items-center">
                <View className="mr-3 h-6 w-6 items-center justify-center rounded-full bg-green-100">
                  <Text className="text-sm font-semibold text-green-700">{index + 1}</Text>
                </View>
                <Text className={combineClasses(typography.body.small, 'flex-1 text-blue-800')}>
                  {step}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Script */}
      {pathway.guidance.script && (
        <View
          className={combineClasses(
            cards.default.container,
            'mb-6 border-l-4 border-green-500 bg-white/95'
          )}>
          <Text className={combineClasses(typography.h5, 'mb-2 text-green-900')}>What to Say</Text>
          <Text className={combineClasses(typography.body.small, 'leading-6 text-green-800')}>
            "{pathway.guidance.script}"
          </Text>
        </View>
      )}

      {/* What to Send */}
      {pathway.guidance.what_to_send && (
        <View
          className={combineClasses(
            cards.default.container,
            'mb-6 border-l-4 border-blue-500 bg-white/95'
          )}>
          <Text className={combineClasses(typography.h5, 'mb-4 text-blue-900')}>
            What to Send
          </Text>
          {pathway.guidance.what_to_send.map((item, index) => (
            <View key={index} className="mb-2 flex-row">
              <Text className="mr-2 text-green-600">✓</Text>
              <Text
                className={combineClasses(typography.body.small, 'flex-1 leading-6 text-blue-800')}>
                {item}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Available Pathways */}
      {pathway.guidance.paths && (
        <View className="mb-6">
          <Text className={combineClasses(typography.h5, 'mb-4 text-white shadow')}>
            Available Pathways
          </Text>
          {pathway.guidance.paths.map((path, index) => (
            <View
              key={index}
              className={combineClasses(
                cards.default.container,
                'mb-4 border-l-4 border-blue-500 bg-white/95'
              )}>
              <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>
                {path.name}
              </Text>
              <Text className={combineClasses(typography.body.small, 'mb-3 leading-6 text-blue-800')}>
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

