/**
 * Patient Management Handlers
 * 
 * Handles patient-related actions:
 * - Viewing results
 * - Deleting patient data
 * - Navigation to home
 */

import { Alert } from 'react-native';
import { apiService } from '../../services/api';
import type { UseAppStateReturn } from '../useAppState';

type PatientHandlers = {
  handleViewResults: () => void;
  handleDeletePatient: () => void;
  handleNavigateToHome: () => void;
};

export function createPatientHandlers(
  state: UseAppStateReturn
): PatientHandlers {
  const { setCurrentScreen, setIsLoading, clearAllState } = state;

  const handleViewResults = () => {
    // Navigate to results detail screen, which will fetch status from API
    setCurrentScreen('results-detail');
  };

  const handleDeletePatient = () => {
    // Confirm deletion
    Alert.alert(
      'Delete Patient Data',
      'Are you sure you want to delete all patient data? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await apiService.deletePatient();
              // Clear all state
              clearAllState();
              // Navigate back to onboarding
              setCurrentScreen('onboarding');
            } catch (error: any) {
              console.error('Error deleting patient:', error);
              Alert.alert(
                'Error',
                `Failed to delete patient: ${error?.message || 'Unknown error'}`
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleNavigateToHome = () => {
    setCurrentScreen('home');
  };

  return {
    handleViewResults,
    handleDeletePatient,
    handleNavigateToHome,
  };
}

