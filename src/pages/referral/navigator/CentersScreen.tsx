/**
 * Centers Screen Component
 *
 * Displays transplant centers search interface with:
 * - Location input (ZIP code)
 * - List of nearby centers
 * - Mark referral received button
 */

import React from 'react';
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { buttons, typography, cards, combineClasses } from '../../../styles/theme';
import type { CentersScreenProps } from './types';
import { CenterCard } from './CenterCard';
import { ReferralReceivedButton } from './ReferralReceivedButton';

export const CentersScreen = ({
  centers,
  zipCode,
  isSearching = false,
  referralState,
  isMarkingReferral = false,
  onZipCodeChange,
  onFindCenters,
  onSelectCenter,
  onMarkReferralReceived,
}: CentersScreenProps) => {
  const hasReferral = referralState?.has_referral === true;

  return (
    <View className="px-6 py-8">
      {/* Header */}
      <View className="mb-8">
        <Text className={combineClasses(typography.h2, 'mb-6 text-white shadow')}>
          Transplant Access Navigator
        </Text>
        <View className="h-1 w-16 rounded-full bg-white shadow" />
        <Text className={combineClasses(typography.body.large, 'mt-4 text-white shadow')}>
          Find transplant centers near you and learn how to get a referral
        </Text>
      </View>

      {/* Location Input */}
      <View className={combineClasses(cards.default.container, 'mb-6 bg-white/95')}>
        <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>Your Location</Text>
        <View className="mb-3">
          <TextInput
            className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-base"
            placeholder="Enter ZIP Code"
            value={zipCode}
            onChangeText={onZipCodeChange}
            keyboardType="numeric"
            maxLength={5}
            onSubmitEditing={onFindCenters}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity
          className={combineClasses(
            buttons.primary.base,
            zipCode && zipCode.trim().length > 0
              ? buttons.primary.enabled
              : buttons.primary.disabled
          )}
          onPress={onFindCenters}
          disabled={!zipCode || zipCode.trim().length === 0}
          activeOpacity={0.8}>
          {isSearching ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="white" className="mr-2" />
              <Text className={buttons.primary.text}>Searching...</Text>
            </View>
          ) : (
            <Text className={buttons.primary.text}>Find Centers</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Centers List */}
      {centers.length > 0 && (
        <View className="mb-6">
          <Text className={combineClasses(typography.h5, 'mb-4 text-white shadow')}>
            Centers Near You
          </Text>
          {centers.map((center) => (
            <CenterCard
              key={center.center_id}
              center={center}
              onSelect={() => onSelectCenter(center)}
            />
          ))}
        </View>
      )}

      {/* Mark Referral Received Section */}
      <ReferralReceivedButton
        hasReferral={hasReferral}
        isMarkingReferral={isMarkingReferral}
        onMarkReferralReceived={onMarkReferralReceived}
      />
    </View>
  );
};
