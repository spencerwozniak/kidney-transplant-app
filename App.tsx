import { View, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Nunito_400Regular, Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { useAppState } from './src/navigation/useAppState';
import { ScreenRouter } from './src/navigation/ScreenRouter';
import {
  createOnboardingHandlers,
  createAssessmentHandlers,
  createFinancialHandlers,
  createChecklistHandlers,
  createPatientHandlers,
} from './src/navigation/handlers';
import { WebWrapper } from './src/components/WebWrapper';
import { enableWebMouseDrag } from './src/utils/enableWebMouseDrag';

import './src/styles/global.css';

/**
 * Main App Component
 *
 * This is the root component that:
 * 1. Manages app-wide state using useAppState hook
 * 2. Creates navigation handlers organized by flow
 * 3. Renders the appropriate screen based on navigation state
 *
 * The app flow is organized into distinct sections:
 * - Onboarding: Patient registration (3 screens)
 * - Assessment: Transplant eligibility questionnaire
 * - Financial: Financial assessment questionnaire
 * - Checklist: Pre-transplant checklist management
 * - Referral: Transplant center referral navigation
 * - Main: Home screen with pathway and settings tabs
 */
export default function App() {
  // Load Nunito font (skip JS font loader on web — web/index.html already requests fonts with display=swap)
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
  });

  // Enable mouse drag scrolling for all scrollable elements on web
  useEffect(() => {
    if (Platform.OS === 'web') {
      const cleanup = enableWebMouseDrag();
      return cleanup;
    }
  }, []);

  // Manage all app state (navigation, patient data, UI state)
  const appState = useAppState();

  // Show loading screen while fonts are loading
  // Avoid blocking initial render on fonts; render UI immediately and allow
  // fonts to load asynchronously to improve time-to-first-interactive.

  // Create navigation handlers organized by flow
  const onboardingHandlers = createOnboardingHandlers(appState);
  const assessmentHandlers = createAssessmentHandlers(appState);
  const financialHandlers = createFinancialHandlers(appState);
  const checklistHandlers = createChecklistHandlers(appState);
  const patientHandlers = createPatientHandlers(appState);

  const content = (
    <SafeAreaProvider>
      <View style={{ height: '100%', maxHeight: '100%', width: '100%' }}>
        {appState.isLoading ? (
          <View className="flex-1 items-center justify-center bg-white">
            {/* Loading indicator */}
          </View>
        ) : (
          <ScreenRouter
            state={appState}
            onboardingHandlers={onboardingHandlers}
            assessmentHandlers={assessmentHandlers}
            financialHandlers={financialHandlers}
            checklistHandlers={checklistHandlers}
            patientHandlers={patientHandlers}
          />
        )}
        <StatusBar style="dark" />
      </View>
    </SafeAreaProvider>
  );

  return <WebWrapper>{content}</WebWrapper>;
}
