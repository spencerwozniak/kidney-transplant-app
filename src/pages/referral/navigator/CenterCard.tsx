/**
 * Center Card Component
 * 
 * Displays individual transplant center information
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { typography, cards, combineClasses } from '../../../styles/theme';
import type { TransplantCenter } from '../../../services/api';

type CenterCardProps = {
  center: TransplantCenter;
  onSelect: () => void;
};

export const CenterCard = ({ center, onSelect }: CenterCardProps) => {
  return (
    <TouchableOpacity
      className={combineClasses(
        cards.default.container,
        'mb-4 border-l-4 border-blue-500 bg-white/95'
      )}
      onPress={onSelect}
      activeOpacity={0.7}>
      <View className="mb-2 flex-row items-start justify-between">
        <View className="flex-1">
          <Text className={combineClasses(typography.h6, 'mb-1 text-blue-900')}>
            {center.name}
          </Text>
          <Text className={combineClasses(typography.body.small, 'text-blue-800')}>
            {center.location.city}, {center.location.state}
            {center.distance_miles && ` • ${center.distance_miles} miles away`}
          </Text>
        </View>
      </View>
      <View className="mt-2 flex-row flex-wrap gap-2">
        {center.referral_required && (
          <View className="rounded-full bg-blue-100 px-3 py-1">
            <Text className="text-xs font-semibold text-blue-700">Referral Required</Text>
          </View>
        )}
        {center.insurance_compatible && (
          <View className="rounded-full bg-green-100 px-3 py-1">
            <Text className="text-xs font-semibold text-green-700">Insurance Compatible</Text>
          </View>
        )}
      </View>
      <Text className="mt-2 text-xs text-blue-700">Tap to view referral pathway →</Text>
    </TouchableOpacity>
  );
};

