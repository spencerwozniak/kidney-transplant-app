/**
 * Onboarding Flow Handlers
 *
 * Handles navigation and data flow for the onboarding process:
 * 1. OnboardingScreen -> PatientDetailsScreen1
 * 2. PatientDetailsScreen1 -> PatientDetailsScreen2
 * 3. PatientDetailsScreen2 -> MedicalQuestionsScreen
 * 4. MedicalQuestionsScreen -> AssessmentIntroScreen (after saving patient)
 */

import { Alert } from 'react-native';
import { apiService, Patient } from '../../services/api';
import { Screen } from '../types';
import type { UseAppStateReturn } from '../useAppState';
import type { PatientDataPart1, PatientDataPart2, PatientDataMedical } from '../useAppState';

type OnboardingHandlers = {
  handleGetStarted: () => void;
  handlePatientDetails1Next: (data: PatientDataPart1) => void;
  handlePatientDetails2Next: (data: PatientDataPart2) => void;
  handleMedicalQuestionsNext: (data: PatientDataMedical) => Promise<void>;
};

export function createOnboardingHandlers(state: UseAppStateReturn): OnboardingHandlers {
  const {
    setCurrentScreen,
    setPatient,
    setPatientDataPart1,
    setPatientDataPart2,
    setPatientDataMedical,
    setIsLoading,
    clearPatientData,
  } = state;

  const handleGetStarted = () => {
    setCurrentScreen('patient-details-1');
  };

  const handlePatientDetails1Next = (data: PatientDataPart1) => {
    setPatientDataPart1(data);
    setCurrentScreen('patient-details-2');
  };

  const handlePatientDetails2Next = (data: PatientDataPart2) => {
    if (!state.patientDataPart1) {
      console.error('Patient data part 1 is missing');
      return;
    }

    // Cache the data before proceeding to medical questions
    setPatientDataPart2(data);
    setCurrentScreen('medical-questions');
  };

  const handleMedicalQuestionsNext = async (data: PatientDataMedical) => {
    if (!state.patientDataPart1 || !state.patientDataPart2) {
      console.error('Patient data parts are missing');
      return;
    }

    // Cache the medical data
    setPatientDataMedical(data);

    setIsLoading(true);
    try {
      const patientData: Patient = {
        ...state.patientDataPart1,
        ...state.patientDataPart2,
        ...data,
      };

      // Ensure height and weight are numbers, not strings
      if (patientData.height !== undefined) {
        patientData.height =
          typeof patientData.height === 'string'
            ? parseFloat(patientData.height)
            : patientData.height;
      }
      if (patientData.weight !== undefined) {
        patientData.weight =
          typeof patientData.weight === 'string'
            ? parseFloat(patientData.weight)
            : patientData.weight;
      }

      console.log('Saving patient data:', JSON.stringify(patientData, null, 2));
      console.log('[Onboarding] Clinical flags in payload:', {
        has_ckd_esrd: patientData.has_ckd_esrd,
        last_gfr: patientData.last_gfr,
        has_referral: patientData.has_referral,
      });
      const savedPatient = await apiService.createPatient(patientData);
      console.log('Patient saved successfully:', savedPatient);
      setPatient(savedPatient);
      clearPatientData(); // Clear temporary data
      // Checklist is automatically created on backend when patient is created
      // Initial status will be created when PathwayScreen fetches it
      // Navigate to home instead of assessment-intro
      setCurrentScreen('home');
    } catch (error: any) {
      console.error('Error saving patient:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response,
      });
      Alert.alert('Error', `Failed to save patient: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleGetStarted,
    handlePatientDetails1Next,
    handlePatientDetails2Next,
    handleMedicalQuestionsNext,
  };
}
