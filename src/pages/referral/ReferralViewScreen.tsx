import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Animated,
  StyleSheet,
  Modal,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { buttons, typography, cards, combineClasses, layout } from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { PathwayBackground } from '../../components/PathwayBackground';
import { apiService, PatientReferralState } from '../../services/api';
import { getWebPadding } from '../../utils/webStyles';
import { formatLocation, resolveZipCode } from '../../utils/zipCodeLookup';

type ReferralViewScreenProps = {
  onNavigateBack: () => void;
  onNavigateToFindCenters?: () => void;
};

export const ReferralViewScreen = ({
  onNavigateBack,
  onNavigateToFindCenters,
}: ReferralViewScreenProps) => {
  const [referralState, setReferralState] = useState<PatientReferralState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [editZipCode, setEditZipCode] = useState('');
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [isEditingReferralStatus, setIsEditingReferralStatus] = useState(false);
  const [isSavingReferralStatus, setIsSavingReferralStatus] = useState(false);
  const [isFindCentersModalOpen, setIsFindCentersModalOpen] = useState(false);
  const [findCentersZipCode, setFindCentersZipCode] = useState('');

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

      // Dev-only log for display label
      if (__DEV__ && state.location) {
        const displayLabel = formatLocation(state.location);
        console.log(
          '[ReferralView] Display label:',
          displayLabel,
          'from location:',
          state.location
        );
      }
    } catch (error: any) {
      console.error('Error fetching referral state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditLocation = () => {
    setEditZipCode(referralState?.location?.zip || '');
    setIsEditingLocation(true);
  };

  const handleSaveLocation = async () => {
    if (!referralState) return;
    setIsSavingLocation(true);
    try {
      // Resolve ZIP code to city/state
      const locationInfo = resolveZipCode(editZipCode);

      if (__DEV__) {
        console.log('[ReferralView] Resolved ZIP:', editZipCode, '→', locationInfo);
      }

      const updated = await apiService.updateReferralState({
        ...referralState,
        location: {
          ...referralState.location,
          zip: editZipCode,
          ...(locationInfo && { city: locationInfo.city, state: locationInfo.state }),
        },
      });
      setReferralState(updated);
      setIsEditingLocation(false);

      if (__DEV__ && updated.location) {
        const displayLabel = formatLocation(updated.location);
        console.log('[ReferralView] Updated display label:', displayLabel);
      }
    } catch (error: any) {
      console.error('Error updating location:', error);
      alert('Failed to update location. Please try again.');
    } finally {
      setIsSavingLocation(false);
    }
  };

  const handleChangeReferralStatus = async () => {
    if (!referralState) return;
    setIsSavingReferralStatus(true);
    try {
      const newHasReferral = !referralState.has_referral;
      const updated = await apiService.updateReferralState({
        ...referralState,
        has_referral: newHasReferral,
        referral_status: newHasReferral ? 'completed' : 'not_started',
      });

      // Invalidate all relevant caches so PathwayScreen updates
      apiService.clearCacheKey('referral_state');
      apiService.clearCacheKey('patient_status');
      apiService.clearCacheKey('checklist');

      setReferralState(updated);
      setIsEditingReferralStatus(false);

      if (__DEV__) {
        console.log(
          '[ReferralView] Referral status changed to:',
          newHasReferral ? 'RECEIVED' : 'NOT RECEIVED'
        );
      }

      // If marking as received and no location set, open find centers modal
      if (newHasReferral && !updated.location?.zip) {
        setTimeout(() => {
          setFindCentersZipCode('');
          setIsFindCentersModalOpen(true);
        }, 300);
      }
    } catch (error: any) {
      console.error('Error updating referral status:', error);
      alert('Failed to update referral status. Please try again.');
    } finally {
      setIsSavingReferralStatus(false);
    }
  };

  const handleOpenFindCenters = () => {
    setFindCentersZipCode(referralState?.location?.zip || '');
    setIsFindCentersModalOpen(true);
  };

  const handleFindCentersSubmit = () => {
    if (findCentersZipCode.trim().length === 0) {
      alert('Please enter a ZIP code');
      return;
    }
    setIsFindCentersModalOpen(false);
    if (onNavigateToFindCenters) {
      onNavigateToFindCenters();
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
            <Text
              className={combineClasses(typography.body.small, 'text-center text-white/90 shadow')}>
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
                <View className={combineClasses(cards.default.container, 'bg-white/95')}>
                  <View className="flex-row items-center justify-between">
                    <View className="flex-1">
                      <Text className={combineClasses(typography.h5, 'mb-2 text-green-900')}>
                        ✓ Referral Received
                      </Text>
                      {referralState.referral_status && (
                        <Text
                          className={combineClasses(
                            typography.body.small,
                            'leading-6 text-green-800'
                          )}>
                          Status: {referralState.referral_status.replace('_', ' ').toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => setIsEditingReferralStatus(true)}
                      activeOpacity={0.7}>
                      <Text className="text-sm font-semibold text-green-600">Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View className={combineClasses(cards.default.container, 'bg-white/95')}>
                  <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>
                    No Referral Yet
                  </Text>
                  <Text
                    className={combineClasses(typography.body.small, 'leading-6 text-blue-800')}>
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
                <Text
                  className={combineClasses(
                    typography.body.small,
                    'capitalize leading-6 text-blue-800'
                  )}>
                  {referralState.referral_source.replace('_', ' ')}
                </Text>
              </View>
            )}

            {/* Location */}
            {referralState.location &&
              (referralState.location.zip || referralState.location.state) && (
                <View className={combineClasses(cards.default.container, 'mb-8 bg-white/95')}>
                  <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>
                    Location
                  </Text>
                  <View className="space-y-2">
                    {referralState.location.zip && (
                      <Text
                        className={combineClasses(
                          typography.body.small,
                          'leading-6 text-blue-800'
                        )}>
                        ZIP Code: {referralState.location.zip}
                      </Text>
                    )}
                    {referralState.location.state && (
                      <Text
                        className={combineClasses(
                          typography.body.small,
                          'leading-6 text-blue-800'
                        )}>
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
                    <Text
                      className={combineClasses(
                        typography.body.small,
                        'mb-2 leading-6 text-blue-800'
                      )}>
                      {referralState.last_nephrologist.name}
                    </Text>
                  )}
                  {referralState.last_nephrologist.clinic && (
                    <Text
                      className={combineClasses(typography.body.small, 'leading-6 text-blue-800')}>
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
                <Text
                  className={combineClasses(typography.body.small, 'mb-2 leading-6 text-blue-800')}>
                  {referralState.dialysis_center.name}
                </Text>
                {referralState.dialysis_center.social_worker_contact && (
                  <Text
                    className={combineClasses(typography.body.small, 'leading-6 text-blue-800')}>
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

            {/* Find Centers Button */}
            {onNavigateToFindCenters && (
              <View className="mb-6">
                <TouchableOpacity
                  className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
                  onPress={handleOpenFindCenters}
                  activeOpacity={0.8}>
                  <Text className={buttons.outline.text}>
                    {referralState.location?.zip ? 'Update Center Location' : 'Find Centers'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>

        {/* Edit Referral Status Modal */}
        <Modal
          visible={isEditingReferralStatus}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsEditingReferralStatus(false)}>
          <View className="flex-1 items-center justify-center bg-black/50 px-4">
            <View className={combineClasses(cards.default.elevated, 'w-full max-w-md p-6')}>
              <Text className={combineClasses(typography.h4, 'mb-4 text-gray-900')}>
                {referralState?.has_referral ? 'Mark as Not Received?' : 'Mark as Received?'}
              </Text>
              <Text className={combineClasses(typography.body.small, 'mb-6 text-gray-700')}>
                {referralState?.has_referral
                  ? 'This will reset your referral status to "Not Received".'
                  : 'This will mark your referral as received and move you to the next stage.'}
              </Text>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={combineClasses(
                    buttons.outline.base,
                    buttons.outline.enabled,
                    'flex-1'
                  )}
                  onPress={() => setIsEditingReferralStatus(false)}
                  disabled={isSavingReferralStatus}
                  activeOpacity={0.8}>
                  <Text className={buttons.outline.text}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={combineClasses(
                    buttons.primary.base,
                    buttons.primary.enabled,
                    'flex-1'
                  )}
                  onPress={handleChangeReferralStatus}
                  disabled={isSavingReferralStatus}
                  activeOpacity={0.8}>
                  {isSavingReferralStatus ? (
                    <Text className={buttons.primary.text}>Updating...</Text>
                  ) : (
                    <Text className={buttons.primary.text}>
                      {referralState?.has_referral ? 'Reset' : 'Confirm'}
                    </Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Find Centers Modal */}
        <Modal
          visible={isFindCentersModalOpen}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsFindCentersModalOpen(false)}>
          <View className="flex-1 items-center justify-center bg-black/50 px-4">
            <View className={combineClasses(cards.default.elevated, 'w-full max-w-md p-6')}>
              <Text className={combineClasses(typography.h4, 'mb-4 text-gray-900')}>
                Find Transplant Centers
              </Text>
              <Text className={combineClasses(typography.body.small, 'mb-6 text-gray-700')}>
                Enter your ZIP code to search for transplant centers near you.
              </Text>

              <View className="mb-6">
                <Text
                  className={combineClasses(
                    typography.body.small,
                    'mb-2 font-semibold text-gray-700'
                  )}>
                  ZIP Code
                </Text>
                <TextInput
                  className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-base"
                  placeholder="Enter ZIP Code"
                  value={findCentersZipCode}
                  onChangeText={setFindCentersZipCode}
                  keyboardType="numeric"
                  maxLength={5}
                />
              </View>

              <View className="flex-row gap-3">
                <TouchableOpacity
                  className={combineClasses(
                    buttons.outline.base,
                    buttons.outline.enabled,
                    'flex-1'
                  )}
                  onPress={() => setIsFindCentersModalOpen(false)}
                  activeOpacity={0.8}>
                  <Text className={buttons.outline.text}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={combineClasses(
                    buttons.primary.base,
                    findCentersZipCode.trim().length > 0
                      ? buttons.primary.enabled
                      : buttons.primary.disabled,
                    'flex-1'
                  )}
                  onPress={handleFindCentersSubmit}
                  disabled={!findCentersZipCode.trim().length}
                  activeOpacity={0.8}>
                  <Text className={buttons.primary.text}>Continue</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
