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

      // Ensure height_cm and weight_kg are numbers, not strings
      if (patientData.height_cm !== undefined) {
        patientData.height_cm =
          typeof patientData.height_cm === 'string'
            ? parseFloat(patientData.height_cm)
            : patientData.height_cm;
      }
      if (patientData.weight_kg !== undefined) {
        patientData.weight_kg =
          typeof patientData.weight_kg === 'string'
            ? parseFloat(patientData.weight_kg)
            : patientData.weight_kg;
      }

      // Dev logging for payload verification
      if (__DEV__) {
        console.log('[Onboarding][Dev] Personal Details Payload Mapping:');
        console.log('  • DOB (ISO):', patientData.date_of_birth);
        console.log('  • Sex:', patientData.sex);
        console.log('  • Height (cm):', patientData.height_cm);
        console.log('  • Weight (kg):', patientData.weight_kg);
        if (state.patientDataPart2?.weight_kg) {
          // Calculate weight_lbs from the kg value for verification
          const weight_lbs = Math.round(patientData.weight_kg! * 2.20462 * 10) / 10;
          console.log('  • Weight (lbs - original input):', weight_lbs);
        }
      }

      console.log('Saving patient data:', JSON.stringify(patientData, null, 2));
      console.log('[Onboarding] Clinical flags in payload:', {
        has_ckd_esrd: patientData.has_ckd_esrd,
        last_gfr: patientData.last_gfr,
        has_referral: patientData.has_referral,
      });
      
      const savedPatient = await apiService.createPatient(patientData);
      
      console.log('Patient saved successfully:', savedPatient);
      
      // Dev logging for persistence verification and prediction feature verification
      if (__DEV__) {
        let dataFlowStatus = '✅';
        const issues: string[] = [];

        console.log('[Onboarding][Dev] Persistence Verification:');
        console.log('  ✓ Saved DOB:', savedPatient.date_of_birth);
        console.log('  ✓ Saved Sex:', savedPatient.sex);
        console.log('  ✓ Saved Height (cm):', savedPatient.height_cm);
        console.log('  ✓ Saved Weight (kg):', savedPatient.weight_kg);
        
        // Verify values match what was sent
        const dobMatches = savedPatient.date_of_birth === patientData.date_of_birth;
        const sexMatches = savedPatient.sex === patientData.sex;
        const heightMatches = Math.abs((savedPatient.height_cm || 0) - (patientData.height_cm || 0)) < 0.1;
        const weightMatches = Math.abs((savedPatient.weight_kg || 0) - (patientData.weight_kg || 0)) < 0.01;
        
        if (!dobMatches) issues.push('DOB mismatch');
        if (!sexMatches) issues.push('Sex mismatch');
        if (!heightMatches) issues.push('Height mismatch');
        if (!weightMatches) issues.push('Weight mismatch');

        // Perform a follow-up GET to verify round-trip persistence
        try {
          console.log('[Onboarding][Dev] Performing round-trip GET...');
          const retrievedPatient = await apiService.getPatient();
          console.log('[Onboarding][Dev] Retrieved patient data:', {
            date_of_birth: retrievedPatient.date_of_birth,
            sex: retrievedPatient.sex,
            height_cm: retrievedPatient.height_cm,
            weight_kg: retrievedPatient.weight_kg,
          });
          
          const getMatches = 
            retrievedPatient.date_of_birth === patientData.date_of_birth &&
            retrievedPatient.sex === patientData.sex &&
            Math.abs((retrievedPatient.height_cm || 0) - (patientData.height_cm || 0)) < 0.1 &&
            Math.abs((retrievedPatient.weight_kg || 0) - (patientData.weight_kg || 0)) < 0.01;
          
          if (!getMatches) {
            dataFlowStatus = '⚠️';
            issues.push('Round-trip persistence mismatch');
          }
        } catch (getError) {
          dataFlowStatus = '⚠️';
          issues.push(`Round-trip error: ${getError}`);
        }

        // Prediction debug verification
        try {
          console.log('[Onboarding][Dev] Verifying prediction features...');
          const status = await apiService.getPatientStatusDebug();
          
          if (status && status.has_absolute !== undefined) {
            console.log('[Onboarding][Dev] Prediction features in status:', {
              has_absolute: status.has_absolute,
              has_relative: status.has_relative,
              absolute_count: status.absolute_contraindications?.length || 0,
              relative_count: status.relative_contraindications?.length || 0,
              ml_features: {
                date_of_birth: status.ml_input_date_of_birth || status.date_of_birth || null,
                sex: status.ml_input_sex || status.sex || null,
                height_cm: status.ml_input_height_cm || status.height_cm || null,
                weight_kg: status.ml_input_weight_kg || status.weight_kg || null,
              },
            });
            
            // Verify ML features match what we sent
            const mlDobMatches = (status.ml_input_date_of_birth || status.date_of_birth) === patientData.date_of_birth;
            const mlSexMatches = (status.ml_input_sex || status.sex) === patientData.sex;
            const mlHeightMatches = Math.abs((status.ml_input_height_cm || status.height_cm || 0) - (patientData.height_cm || 0)) < 0.1;
            const mlWeightMatches = Math.abs((status.ml_input_weight_kg || status.weight_kg || 0) - (patientData.weight_kg || 0)) < 0.01;
            
            if (!mlDobMatches || !mlSexMatches || !mlHeightMatches || !mlWeightMatches) {
              dataFlowStatus = '⚠️';
              issues.push('ML features mismatch');
            }
          } else {
            dataFlowStatus = '⚠️';
            issues.push('Prediction features not available');
          }
        } catch (predError) {
          dataFlowStatus = '⚠️';
          issues.push(`Prediction error: ${predError}`);
        }

        // Consolidated verification summary
        if (issues.length === 0) {
          console.log(`[Onboarding][Dev] ${dataFlowStatus} Data flow verified - canonical keys persisted and predictions computed`);
        } else {
          console.warn(`[Onboarding][Dev] ${dataFlowStatus} Data flow issues detected:`, issues);
        }
      }
      
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
