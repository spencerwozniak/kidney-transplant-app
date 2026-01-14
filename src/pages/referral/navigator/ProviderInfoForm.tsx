/**
 * Provider Information Form Component
 * 
 * Displays forms for entering nephrologist or dialysis center information
 * based on the referral pathway type
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { buttons, typography, cards, combineClasses } from '../../../styles/theme';
import type { ReferralPathway, PatientReferralState } from '../../../services/api';

type ProviderInfoFormProps = {
  pathway: ReferralPathway;
  referralState: PatientReferralState | null;
  onUpdateReferralState: (updates: Partial<PatientReferralState>) => Promise<void>;
};

export const ProviderInfoForm = ({
  pathway,
  referralState,
  onUpdateReferralState,
}: ProviderInfoFormProps) => {
  const [nephrologistName, setNephrologistName] = useState(
    referralState?.last_nephrologist?.name || ''
  );
  const [nephrologistClinic, setNephrologistClinic] = useState(
    referralState?.last_nephrologist?.clinic || ''
  );
  const [dialysisCenterName, setDialysisCenterName] = useState(
    referralState?.dialysis_center?.name || ''
  );

  const handleSaveProviderInfo = async () => {
    await onUpdateReferralState({
      last_nephrologist:
        nephrologistName || nephrologistClinic
          ? {
              name: nephrologistName || null,
              clinic: nephrologistClinic || null,
            }
          : null,
      dialysis_center: dialysisCenterName
        ? {
            name: dialysisCenterName,
            social_worker_contact: null,
          }
        : null,
    });
  };

  if (pathway.pathway === 'nephrologist_referral') {
    return (
      <View
        className={combineClasses(
          cards.default.container,
          'mb-6 border-l-4 border-blue-500 bg-white/95'
        )}>
        <Text className={combineClasses(typography.h5, 'mb-4 text-blue-900')}>
          Provider Information
        </Text>
        <View className="mb-4">
          <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold text-blue-800')}>
            Nephrologist Name
          </Text>
          <TextInput
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base"
            placeholder="Dr. Smith"
            value={nephrologistName}
            onChangeText={setNephrologistName}
          />
        </View>
        <View className="mb-4">
          <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold text-blue-800')}>
            Clinic/Office Name
          </Text>
          <TextInput
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base"
            placeholder="Kidney Care Clinic"
            value={nephrologistClinic}
            onChangeText={setNephrologistClinic}
          />
        </View>
        <TouchableOpacity
          className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
          onPress={handleSaveProviderInfo}
          activeOpacity={0.8}>
          <Text className={buttons.primary.text}>Save Provider Info</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (pathway.pathway === 'dialysis_center_referral') {
    return (
      <View
        className={combineClasses(
          cards.default.container,
          'mb-6 border-l-4 border-blue-500 bg-white/95'
        )}>
        <Text className={combineClasses(typography.h5, 'mb-4 text-blue-900')}>
          Dialysis Center Information
        </Text>
        <View className="mb-4">
          <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold text-blue-800')}>
            Dialysis Center Name
          </Text>
          <TextInput
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base"
            placeholder="Dialysis Center Name"
            value={dialysisCenterName}
            onChangeText={setDialysisCenterName}
          />
        </View>
        <TouchableOpacity
          className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
          onPress={handleSaveProviderInfo}
          activeOpacity={0.8}>
          <Text className={buttons.primary.text}>Save Dialysis Center Info</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

