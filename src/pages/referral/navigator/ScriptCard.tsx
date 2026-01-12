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
    <View className={combineClasses(cards.colored.green, 'mb-6')}>
      <Text className={combineClasses(typography.h6, 'mb-3 text-green-900')}>Script to Use</Text>
      <Text className={combineClasses(typography.body.large, 'leading-7 text-green-800')}>
        "{script}"
      </Text>
      <Text className={combineClasses(typography.body.small, 'mt-3 text-green-700')}>
        You can copy this and use it when speaking with your provider
      </Text>
    </View>
  );
};

