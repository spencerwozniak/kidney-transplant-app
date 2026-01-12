/**
 * Selected Center Info Component
 * 
 * Displays contact information for the selected transplant center
 */

import React from 'react';
import { View, Text } from 'react-native';
import { typography, cards, combineClasses } from '../../../styles/theme';
import type { TransplantCenter } from '../../../services/api';

type SelectedCenterInfoProps = {
  center: TransplantCenter;
};

export const SelectedCenterInfo = ({ center }: SelectedCenterInfoProps) => {
  return (
    <View className={combineClasses(cards.colored.blue, 'mb-6')}>
      <Text className={combineClasses(typography.h6, 'mb-2 text-blue-900')}>
        Contact Information
      </Text>
      <Text className={combineClasses(typography.body.medium, 'mb-1 text-blue-800')}>
        {center.name}
      </Text>
      <Text className={combineClasses(typography.body.small, 'text-blue-700')}>
        Referral Phone: {center.contact.referral_phone}
      </Text>
      {center.contact.referral_fax && (
        <Text className={combineClasses(typography.body.small, 'text-blue-700')}>
          Fax: {center.contact.referral_fax}
        </Text>
      )}
      {center.contact.website && (
        <Text className={combineClasses(typography.body.small, 'mt-1 text-blue-700')}>
          Website: {center.contact.website}
        </Text>
      )}
    </View>
  );
};

