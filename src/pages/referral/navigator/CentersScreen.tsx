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
      <Text className={combineClasses(typography.h2, 'mb-2 text-left text-white shadow')}>
        Transplant Access Navigator
      </Text>
      <Text className={combineClasses(typography.body.medium, 'mb-6 text-left text-white/90 shadow')}>
        Find transplant centers near you and learn how to get a referral
      </Text>

      {/* Location Input */}
      <View className="mb-6">
        <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold text-white shadow')}>
          Your Location
        </Text>
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
            'rounded-full px-6 py-4 active:opacity-90',
            zipCode && zipCode.trim().length > 0
              ? 'bg-white'
              : 'bg-gray-200'
          )}
          onPress={onFindCenters}
          disabled={!zipCode || zipCode.trim().length === 0}
          activeOpacity={0.8}>
          {isSearching ? (
            <View className="flex-row items-center justify-center">
              <ActivityIndicator size="small" color="#57a67f" className="mr-2" />
              <Text className="text-center text-xl font-nunito-semibold text-gray-800">Searching...</Text>
            </View>
          ) : (
            <Text className="text-center text-xl font-nunito-semibold text-gray-800">Find Centers</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Centers List */}
      {centers.length > 0 && (
        <View className="mb-6">
          <Text className={combineClasses(typography.h5, 'mb-4 text-left text-white shadow')}>Centers Near You</Text>
          {centers.map((center) => (
            <CenterCard
              key={center.center_id}
              center={center}
              onSelect={() => onSelectCenter(center)}
            />
          ))}
        </View>
      )}
      
      {/* Empty state when search returns no results */}
      {!isSearching && centers.length === 0 && zipCode && zipCode.trim().length > 0 && (
        <View className={combineClasses(cards.default.container, 'mb-6 bg-white/95')}>
          <Text className={combineClasses(typography.body.medium, 'mb-2 text-center text-gray-700')}>
            No centers found for ZIP code {zipCode}
          </Text>
          <Text className={combineClasses(typography.body.small, 'text-center text-gray-600')}>
            Try a different ZIP code or check your entry.
          </Text>
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

