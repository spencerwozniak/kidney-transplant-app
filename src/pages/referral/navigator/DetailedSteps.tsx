/**
 * Detailed Steps Component
 * 
 * Displays step-by-step guidance in card format
 */

import React from 'react';
import { View, Text } from 'react-native';
import { typography, cards, combineClasses } from '../../../styles/theme';

type DetailedStepsProps = {
  steps: string[];
};

export const DetailedSteps = ({ steps }: DetailedStepsProps) => {
  return (
    <View className="mb-6">
      {steps.map((step, index) => (
        <View
          key={index}
          className={combineClasses(
            cards.default.container,
            'mb-4 border-l-4 border-blue-500 bg-white/95'
          )}>
          <View className="mb-2 flex-row items-center">
            <View className="mr-3 h-8 w-8 items-center justify-center rounded-full bg-green-100">
              <Text className="text-base font-semibold text-green-700">{index + 1}</Text>
            </View>
            <Text className={combineClasses(typography.h5, 'flex-1 text-blue-900')}>
              Step {index + 1}
            </Text>
          </View>
          <Text className={combineClasses(typography.body.small, 'leading-6 text-blue-800')}>
            {step}
          </Text>
        </View>
      ))}
    </View>
  );
};

