/**
 * Important Reminder Component
 * 
 * Displays important disclaimer about the referral process
 */

import React from 'react';
import { View, Text } from 'react-native';
import { typography, cards, combineClasses } from '../../../styles/theme';

export const ImportantReminder = () => {
  return (
    <View className={combineClasses(cards.colored.amber, 'mb-6')}>
      <Text className={combineClasses(typography.h6, 'mb-2 text-amber-900')}>
        Important Reminder
      </Text>
      <Text className={combineClasses(typography.body.small, 'leading-6 text-amber-800')}>
        This tool helps you navigate the referral process. It does not guarantee acceptance or
        predict outcomes. Your care team will make the final decisions about your transplant
        evaluation.
      </Text>
    </View>
  );
};

