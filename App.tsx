import { View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useAppState } from './src/navigation/useAppState';
import { ScreenRouter } from './src/navigation/ScreenRouter';
import {
  createOnboardingHandlers,
  createAssessmentHandlers,
  createFinancialHandlers,
  createChecklistHandlers,
  createPatientHandlers,
} from './src/navigation/handlers';

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
  // Manage all app state (navigation, patient data, UI state)
  const appState = useAppState();

  // Create navigation handlers organized by flow
  const onboardingHandlers = createOnboardingHandlers(appState);
  const assessmentHandlers = createAssessmentHandlers(appState);
  const financialHandlers = createFinancialHandlers(appState);
  const checklistHandlers = createChecklistHandlers(appState);
  const patientHandlers = createPatientHandlers(appState);

  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}
