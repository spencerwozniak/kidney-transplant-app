/**
 * Transplant Access Navigator Component
 *
 * Main orchestrator component that manages:
 * - Data loading (referral state, pathway, centers)
 * - Screen navigation (centers, pathway, next-steps)
 * - State management for the navigator flow
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, combineClasses, layout } from '../../../styles/theme';
import { NavigationBar } from '../../../components/NavigationBar';
import { PathwayBackground } from '../../../components/PathwayBackground';
import {
  apiService,
  TransplantCenter,
  PatientReferralState,
  ReferralPathway,
} from '../../../services/api';
import type { NavigatorScreen, TransplantAccessNavigatorProps } from './types';
import { CentersScreen } from './CentersScreen';
import { ReferralPathwayScreen } from './ReferralPathwayScreen';
import { NextStepsScreen } from './NextStepsScreen';
import { resolveZipCode } from '../../../utils/zipCodeLookup';

export const TransplantAccessNavigator = ({ onNavigateBack }: TransplantAccessNavigatorProps) => {
  const [currentScreen, setCurrentScreen] = useState<NavigatorScreen>('centers');
  const [centers, setCenters] = useState<TransplantCenter[]>([]);
  const [referralState, setReferralState] = useState<PatientReferralState | null>(null);
  const [referralPathway, setReferralPathway] = useState<ReferralPathway | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearchingCenters, setIsSearchingCenters] = useState(false);
  const [selectedCenter, setSelectedCenter] = useState<TransplantCenter | null>(null);
  const [zipCode, setZipCode] = useState('');
  const [isMarkingReferral, setIsMarkingReferral] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      // Load referral state
      const state = await apiService.getReferralState();
      setReferralState(state);
      setZipCode(state.location?.zip || '');

      // Load referral pathway
      const pathway = await apiService.getReferralPathway();
      setReferralPathway(pathway);

      // Centers will be loaded when user clicks "Find Centers" button
    } catch (error: any) {
      console.error('Error loading navigator data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCentersByState = async (stateCode: string) => {
    const IS_DEBUG =
      (typeof __DEV__ !== 'undefined' && (__DEV__ as boolean)) ||
      (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production');

    try {
      setIsSearchingCenters(true);

      if (IS_DEBUG) {
        console.log('[Centers][debug] Searching by state:', stateCode);
      }

      const nearbyCenters = await apiService.findNearbyCenters({
        state: stateCode,
      });

      if (IS_DEBUG) {
        console.log('[Centers][debug] Response:', {
          count: nearbyCenters.length,
          centers: nearbyCenters.slice(0, 2).map((c) => ({ name: c.name, city: c.city })),
        });
      }

      setCenters(nearbyCenters);
    } catch (error: any) {
      console.error('Error loading centers:', error);
      setCenters([]); // Clear centers on error
    } finally {
      setIsSearchingCenters(false);
    }
  };

  const loadCenters = async (zip?: string) => {
    const zipToUse = zip || zipCode;
    if (!zipToUse || zipToUse.trim().length === 0) {
      return;
    }

    const IS_DEBUG =
      (typeof __DEV__ !== 'undefined' && (__DEV__ as boolean)) ||
      (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production');

    try {
      setIsSearchingCenters(true);

      if (IS_DEBUG) {
        console.log('[Centers][debug] Searching by ZIP:', zipToUse);
      }

      const nearbyCenters = await apiService.findNearbyCenters({
        zip_code: zipToUse,
      });

      if (IS_DEBUG) {
        console.log('[Centers][debug] Response:', {
          count: nearbyCenters.length,
          centers: nearbyCenters.slice(0, 2).map((c) => ({ name: c.name, city: c.city })),
        });
      }

      setCenters(nearbyCenters);
    } catch (error: any) {
      console.error('Error loading centers:', error);
      setCenters([]); // Clear centers on error
    } finally {
      setIsSearchingCenters(false);
    }
  };

  const handleFindCenters = async () => {
    const IS_DEBUG =
      (typeof __DEV__ !== 'undefined' && (__DEV__ as boolean)) ||
      (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production');

    if (IS_DEBUG) {
      console.log('[TransplantNavigator] handleFindCenters called, zipCode:', zipCode);
    }

    try {
      // Use ZIP code if provided, otherwise load CA centers
      if (zipCode && zipCode.trim().length > 0) {
        if (IS_DEBUG) {
          console.log('[TransplantNavigator] Loading centers by ZIP:', zipCode);
        }
        await loadCenters(zipCode);
      } else {
        if (IS_DEBUG) {
          console.log('[TransplantNavigator] Loading centers by state: CA');
        }
        await loadCentersByState('CA');
      }

      // Update referral state with location if ZIP code is provided
      if (zipCode && zipCode.trim().length > 0 && referralState) {
        try {
          // Resolve ZIP code to city/state
          const locationInfo = resolveZipCode(zipCode);

          if (IS_DEBUG) {
            console.log('[TransplantNavigator] Resolved ZIP:', zipCode, '→', locationInfo);
          }

          const updatedLocation = {
            ...referralState.location,
            zip: zipCode,
            ...(locationInfo && { city: locationInfo.city, state: locationInfo.state }),
          };

          await apiService.updateReferralState({
            ...referralState,
            location: updatedLocation,
          });
        } catch (error: any) {
          console.error('Error updating referral state:', error);
          // Don't block the UI if state update fails
        }
      }
    } catch (error: any) {
      console.error('[TransplantNavigator] Error in handleFindCenters:', error);
      // Show user-friendly error message
      alert('Failed to load centers. Please try again.');
    }
  };

  const handleSelectCenter = (center: TransplantCenter) => {
    setSelectedCenter(center);
    setCurrentScreen('pathway');
  };

  const handleMarkReferralReceived = async () => {
    setIsMarkingReferral(true);
    try {
      if (referralState) {
        await apiService.updateReferralState({
          ...referralState,
          has_referral: true,
          referral_status: 'completed',
        });

        // Invalidate all relevant caches so PathwayScreen refreshes
        apiService.clearCacheKey('referral_state');
        apiService.clearCacheKey('patient_status');
        apiService.clearCacheKey('checklist');

        // Reload referral state to get updated data
        const updatedState = await apiService.getReferralState();
        setReferralState(updatedState);

        // Dev log
        const IS_DEBUG =
          (typeof __DEV__ !== 'undefined' && (__DEV__ as boolean)) ||
          (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production');
        if (IS_DEBUG) {
          console.log('[Referral][debug] Marked referral as received, caches cleared');
        }
      }
      // Show success message and navigate back after a moment
      setTimeout(() => {
        onNavigateBack();
      }, 1500);
    } catch (error: any) {
      console.error('Error updating referral status:', error);
      alert('Failed to update referral status. Please try again.');
    } finally {
      setIsMarkingReferral(false);
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
              Loading...
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
          {currentScreen === 'centers' && (
            <CentersScreen
              centers={centers}
              zipCode={zipCode}
              isSearching={isSearchingCenters}
              referralState={referralState}
              isMarkingReferral={isMarkingReferral}
              onZipCodeChange={setZipCode}
              onFindCenters={handleFindCenters}
              onSelectCenter={handleSelectCenter}
              onMarkReferralReceived={handleMarkReferralReceived}
            />
          )}

          {currentScreen === 'pathway' && referralPathway && (
            <ReferralPathwayScreen
              pathway={referralPathway}
              selectedCenter={selectedCenter}
              referralState={referralState}
              onBack={() => setCurrentScreen('centers')}
              onNextSteps={() => setCurrentScreen('next-steps')}
              onUpdateReferralState={async (updates) => {
                if (referralState) {
                  const updated = await apiService.updateReferralState({
                    ...referralState,
                    ...updates,
                  });
                  setReferralState(updated);
                }
              }}
            />
          )}

          {currentScreen === 'next-steps' && referralPathway && (
            <NextStepsScreen
              pathway={referralPathway}
              selectedCenter={selectedCenter}
              referralState={referralState}
              onBack={() => setCurrentScreen('pathway')}
              onUpdateReferralState={async (updates) => {
                if (referralState) {
                  const updated = await apiService.updateReferralState({
                    ...referralState,
                    ...updates,
                  });
                  setReferralState(updated);
                  // Reload pathway data to reflect changes
                  await loadInitialData();
                }
              }}
              onNavigateBack={onNavigateBack}
            />
          )}
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
