import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  buttons,
  typography,
  cards,
  combineClasses,
  layout,
} from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { PathwayBackground } from '../../components/PathwayBackground';
import { apiService, PatientReferralState } from '../../services/api';
import { getWebPadding } from '../../utils/webStyles';

type ReferralViewScreenProps = {
  onNavigateBack: () => void;
};

export const ReferralViewScreen = ({ onNavigateBack }: ReferralViewScreenProps) => {
  const [referralState, setReferralState] = useState<PatientReferralState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      <LinearGradient
        colors={['#90dcb5', '#57a67f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}>
        <PathwayBackground opacity={0.15} animate={false} />
        <SafeAreaView className="flex-1">
          <NavigationBar onBack={onNavigateBack} />
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className={combineClasses(typography.body.medium, 'mt-4 text-white shadow')}>
              Loading referral information...
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!referralState) {
    return (
      <LinearGradient
        colors={['#90dcb5', '#57a67f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}>
        <PathwayBackground opacity={0.15} animate={false} />
        <SafeAreaView className="flex-1">
          <NavigationBar onBack={onNavigateBack} />
          <View className="flex-1 items-center justify-center px-6">
            <Text className={combineClasses(typography.h5, 'mb-2 text-center text-white shadow')}>
              No Referral Information
            </Text>
            <Text className={combineClasses(typography.body.small, 'text-center text-white/90 shadow')}>
              No referral information found.
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#90dcb5', '#57a67f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}>
      <PathwayBackground opacity={0.15} animate={false} />
      <SafeAreaView className="flex-1">
        <NavigationBar onBack={onNavigateBack} />
        <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
              getWebPadding(24, 32), // px-6 py-8
            ]}
            className="px-6 py-8">
            {/* Header */}
            <View className="mb-8">
              <Text className={combineClasses(typography.h2, 'mb-6 text-white shadow')}>
                Referral Information
              </Text>
              <View className="h-1 w-16 rounded-full bg-white shadow" />
              <Text className={combineClasses(typography.body.large, 'mt-4 text-white shadow')}>
                View your referral status and related information
              </Text>
            </View>

            {/* Referral Status */}
            <View className="mb-6">
              {referralState.has_referral ? (
                <View
                  className={combineClasses(
                    cards.default.container,
                    'mb-6 border-l-4 border-green-500 bg-white/95'
                  )}>
                  <Text className={combineClasses(typography.h5, 'mb-2 text-green-900')}>
                    ✓ Referral Received
                  </Text>
                  {referralState.referral_status && (
                    <Text className={combineClasses(typography.body.small, 'leading-6 text-green-800')}>
                      Status: {referralState.referral_status.replace('_', ' ').toUpperCase()}
                    </Text>
                  )}
                </View>
              ) : (
                <View
                  className={combineClasses(
                    cards.default.container,
                    'mb-6 border-l-4 border-blue-500 bg-white/95'
                  )}>
                  <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>
                    No Referral Yet
                  </Text>
                  <Text className={combineClasses(typography.body.small, 'leading-6 text-blue-800')}>
                    No referral has been received at this time.
                  </Text>
                </View>
              )}
            </View>

            {/* Referral Source */}
            {referralState.referral_source && (
              <View
                className={combineClasses(
                  cards.default.container,
                  'mb-6 border-l-4 border-blue-500 bg-white/95'
                )}>
                <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>
                  Referral Source
                </Text>
                <Text className={combineClasses(typography.body.small, 'leading-6 text-blue-800 capitalize')}>
                  {referralState.referral_source.replace('_', ' ')}
                </Text>
              </View>
            )}

            {/* Location */}
            {referralState.location && (referralState.location.zip || referralState.location.state) && (
              <View
                className={combineClasses(
                  cards.default.container,
                  'mb-6 border-l-4 border-blue-500 bg-white/95'
                )}>
                <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>Location</Text>
                <View className="space-y-2">
                  {referralState.location.zip && (
                    <Text className={combineClasses(typography.body.small, 'leading-6 text-blue-800')}>
                      ZIP Code: {referralState.location.zip}
                    </Text>
                  )}
                  {referralState.location.state && (
                    <Text className={combineClasses(typography.body.small, 'leading-6 text-blue-800')}>
                      State: {referralState.location.state}
                    </Text>
                  )}
                </View>
              </View>
            )}

            {/* Nephrologist Information */}
            {referralState.last_nephrologist &&
              (referralState.last_nephrologist.name || referralState.last_nephrologist.clinic) && (
                <View
                  className={combineClasses(
                    cards.default.container,
                    'mb-6 border-l-4 border-blue-500 bg-white/95'
                  )}>
                  <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>
                    Nephrologist
                  </Text>
                  {referralState.last_nephrologist.name && (
                    <Text className={combineClasses(typography.body.small, 'mb-2 leading-6 text-blue-800')}>
                      {referralState.last_nephrologist.name}
                    </Text>
                  )}
                  {referralState.last_nephrologist.clinic && (
                    <Text className={combineClasses(typography.body.small, 'leading-6 text-blue-800')}>
                      {referralState.last_nephrologist.clinic}
                    </Text>
                  )}
                </View>
              )}

            {/* Dialysis Center Information */}
            {referralState.dialysis_center && referralState.dialysis_center.name && (
              <View
                className={combineClasses(
                  cards.default.container,
                  'mb-6 border-l-4 border-blue-500 bg-white/95'
                )}>
                <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>
                  Dialysis Center
                </Text>
                <Text className={combineClasses(typography.body.small, 'mb-2 leading-6 text-blue-800')}>
                  {referralState.dialysis_center.name}
                </Text>
                {referralState.dialysis_center.social_worker_contact && (
                  <Text className={combineClasses(typography.body.small, 'leading-6 text-blue-800')}>
                    Social Worker: {referralState.dialysis_center.social_worker_contact}
                  </Text>
                )}
              </View>
            )}

            {/* Preferred Centers */}
            {referralState.preferred_centers && referralState.preferred_centers.length > 0 && (
              <View
                className={combineClasses(
                  cards.default.container,
                  'mb-6 border-l-4 border-blue-500 bg-white/95'
                )}>
                <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>
                  Preferred Centers
                </Text>
                <View className="space-y-2">
                  {referralState.preferred_centers.map((centerId, index) => (
                    <View key={index} className="flex-row">
                      <Text className="mr-2 text-blue-800">•</Text>
                      <Text
                        className={combineClasses(
                          typography.body.small,
                          'flex-1 leading-6 text-blue-800'
                        )}>
                        {centerId}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});

