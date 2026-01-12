/**
 * Transplant Access Navigator Component
 * 
 * Main orchestrator component that manages:
 * - Data loading (referral state, pathway, centers)
 * - Screen navigation (centers, pathway, next-steps)
 * - State management for the navigator flow
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { typography, combineClasses, layout } from '../../../styles/theme';
import { NavigationBar } from '../../../components/NavigationBar';
import { apiService, TransplantCenter, PatientReferralState, ReferralPathway } from '../../../services/api';
import type { NavigatorScreen, TransplantAccessNavigatorProps } from './types';
import { CentersScreen } from './CentersScreen';
import { ReferralPathwayScreen } from './ReferralPathwayScreen';
import { NextStepsScreen } from './NextStepsScreen';

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
    try {
      setIsSearchingCenters(true);
      const nearbyCenters = await apiService.findNearbyCenters({
        state: stateCode,
      });
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

    try {
      setIsSearchingCenters(true);
      const nearbyCenters = await apiService.findNearbyCenters({
        zip_code: zipToUse,
      });
      setCenters(nearbyCenters);
    } catch (error: any) {
      console.error('Error loading centers:', error);
      setCenters([]); // Clear centers on error
    } finally {
      setIsSearchingCenters(false);
    }
  };

  const handleFindCenters = async () => {
    // Load CA centers by default (location-based logic will be added later)
    await loadCentersByState('CA');

    // Update referral state with location if ZIP code is provided
    if (zipCode && zipCode.trim().length > 0 && referralState) {
      try {
        await apiService.updateReferralState({
          ...referralState,
          location: {
            ...referralState.location,
            zip: zipCode,
          },
        });
      } catch (error: any) {
        console.error('Error updating referral state:', error);
        // Don't block the UI if state update fails
      }
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
        // Reload referral state to get updated data
        const updatedState = await apiService.getReferralState();
        setReferralState(updatedState);
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
      <SafeAreaView className={layout.container.default}>
        <NavigationBar onBack={onNavigateBack} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className={combineClasses(typography.body.medium, 'mt-4 text-gray-600')}>
            Loading...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={layout.container.default}>
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
  );
};

