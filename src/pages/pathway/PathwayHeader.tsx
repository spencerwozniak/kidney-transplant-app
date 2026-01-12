/**
 * Pathway Header Component
 * 
 * Displays the header section of the pathway screen
 */

import React from 'react';
import { View, Text } from 'react-native';
import { typography, combineClasses } from '../../styles/theme';

export const PathwayHeader = () => {
  return (
    <View className="px-6 pb-2 pt-12">
      <Text className={combineClasses(typography.h2, 'mb-1 text-center text-white shadow-md')}>
        Your Transplant Pathway
      </Text>
      <Text className={combineClasses(typography.body.small, 'text-center text-white/90 shadow')}>
        Swipe left or right to explore stages
      </Text>
    </View>
  );
};

