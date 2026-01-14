/**
 * Script Card Component
 * 
 * Displays the script to use when speaking with providers
 */

import React from 'react';
import { View, Text } from 'react-native';
import { typography, cards, combineClasses } from '../../../styles/theme';

type ScriptCardProps = {
  script: string;
};

export const ScriptCard = ({ script }: ScriptCardProps) => {
  return (
    <View
      className={combineClasses(
        cards.default.container,
        'mb-6 border-l-4 border-green-500 bg-white/95'
      )}>
      <Text className={combineClasses(typography.h5, 'mb-3 text-green-900')}>Script to Use</Text>
      <Text className={combineClasses(typography.body.large, 'leading-7 text-green-800')}>
        "{script}"
      </Text>
      <Text className={combineClasses(typography.body.small, 'mt-3 text-green-700')}>
        You can copy this and use it when speaking with your provider
      </Text>
    </View>
  );
};

