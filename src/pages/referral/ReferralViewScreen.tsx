import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  buttons,
  typography,
  cards,
  combineClasses,
  layout,
} from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { apiService, PatientReferralState } from '../../services/api';

type ReferralViewScreenProps = {
  onNavigateBack: () => void;
};

export const ReferralViewScreen = ({ onNavigateBack }: ReferralViewScreenProps) => {
  const [referralState, setReferralState] = useState<PatientReferralState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReferralState();
  }, []);

  const fetchReferralState = async () => {
    setIsLoading(true);
    try {
      const state = await apiService.getReferralState();
      setReferralState(state);
    } catch (error: any) {
      console.error('Error fetching referral state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className={layout.container.default}>
        <NavigationBar onBack={onNavigateBack} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className={combineClasses(typography.body.medium, 'mt-4 text-gray-600')}>
            Loading referral information...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!referralState) {
    return (
      <SafeAreaView className={layout.container.default}>
        <NavigationBar onBack={onNavigateBack} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className={combineClasses(typography.h5, 'mb-2 text-center')}>
            No Referral Information
          </Text>
          <Text className={combineClasses(typography.body.small, 'text-center text-gray-600')}>
            No referral information found.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={layout.container.default}>
      <NavigationBar onBack={onNavigateBack} />
      <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-2">
          {/* Header */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h3, 'mb-2')}>Referral Information</Text>
          </View>

          {/* Referral Status */}
          <View className={combineClasses(cards.colored.green, 'mb-6')}>
            <Text className={combineClasses(typography.h5, 'mb-2 text-green-900')}>
              Referral Status
            </Text>
            <Text className={combineClasses(typography.body.medium, 'mb-2 font-semibold text-green-800')}>
              {referralState.has_referral ? '✓ Referral Received' : 'No Referral Yet'}
            </Text>
            {referralState.referral_status && (
              <Text className={combineClasses(typography.body.small, 'text-green-700')}>
                Status: {referralState.referral_status.replace('_', ' ').toUpperCase()}
              </Text>
            )}
          </View>

          {/* Referral Source */}
          {referralState.referral_source && (
            <View className={combineClasses(cards.default.container, 'mb-6')}>
              <Text className={combineClasses(typography.h5, 'mb-4')}>Referral Source</Text>
              <Text className={combineClasses(typography.body.medium, 'capitalize')}>
                {referralState.referral_source.replace('_', ' ')}
              </Text>
            </View>
          )}

          {/* Location */}
          {referralState.location && (referralState.location.zip || referralState.location.state) && (
            <View className={combineClasses(cards.default.container, 'mb-6')}>
              <Text className={combineClasses(typography.h5, 'mb-4')}>Location</Text>
              <View className="space-y-2">
                {referralState.location.zip && (
                  <Text className={combineClasses(typography.body.medium)}>
                    ZIP Code: {referralState.location.zip}
                  </Text>
                )}
                {referralState.location.state && (
                  <Text className={combineClasses(typography.body.medium)}>
                    State: {referralState.location.state}
                  </Text>
                )}
              </View>
            </View>
          )}

          {/* Nephrologist Information */}
          {referralState.last_nephrologist &&
            (referralState.last_nephrologist.name || referralState.last_nephrologist.clinic) && (
              <View className={combineClasses(cards.default.container, 'mb-6')}>
                <Text className={combineClasses(typography.h5, 'mb-4')}>Nephrologist</Text>
                {referralState.last_nephrologist.name && (
                  <Text className={combineClasses(typography.body.medium, 'mb-2')}>
                    {referralState.last_nephrologist.name}
                  </Text>
                )}
                {referralState.last_nephrologist.clinic && (
                  <Text className={combineClasses(typography.body.small, 'text-gray-600')}>
                    {referralState.last_nephrologist.clinic}
                  </Text>
                )}
              </View>
            )}

          {/* Dialysis Center Information */}
          {referralState.dialysis_center && referralState.dialysis_center.name && (
            <View className={combineClasses(cards.default.container, 'mb-6')}>
              <Text className={combineClasses(typography.h5, 'mb-4')}>Dialysis Center</Text>
              <Text className={combineClasses(typography.body.medium, 'mb-2')}>
                {referralState.dialysis_center.name}
              </Text>
              {referralState.dialysis_center.social_worker_contact && (
                <Text className={combineClasses(typography.body.small, 'text-gray-600')}>
                  Social Worker: {referralState.dialysis_center.social_worker_contact}
                </Text>
              )}
            </View>
          )}

          {/* Preferred Centers */}
          {referralState.preferred_centers && referralState.preferred_centers.length > 0 && (
            <View className={combineClasses(cards.default.container, 'mb-6')}>
              <Text className={combineClasses(typography.h5, 'mb-4')}>Preferred Centers</Text>
              {referralState.preferred_centers.map((centerId, index) => (
                <Text key={index} className={combineClasses(typography.body.medium, 'mb-2')}>
                  • {centerId}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

