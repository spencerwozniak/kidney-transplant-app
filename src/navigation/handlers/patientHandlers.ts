/**
 * Patient Management Handlers
 * 
 * Handles patient-related actions:
 * - Viewing results
 * - Deleting patient data
 * - Navigation to home
 */

import { Alert, Platform } from 'react-native';
import { apiService } from '../../services/api';
import type { UseAppStateReturn } from '../useAppState';

type PatientHandlers = {
  handleViewResults: () => void;
  handleDeletePatient: () => void;
  handleDeletePatientConfirmed: () => Promise<void>; // For web modal to call directly
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

  // Actual deletion logic (used by both web modal and native alert)
  const performDelete = async () => {
    setIsLoading(true);
    try {
      await apiService.deletePatient();
      // Clear all state
      clearAllState();
      // Navigate back to onboarding
      setCurrentScreen('onboarding');
    } catch (error: any) {
      console.error('Error deleting patient:', error);
      const errorMessage = `Failed to delete patient: ${error?.message || 'Unknown error'}`;
      
      // Show error alert (works on both platforms)
      if (Platform.OS === 'web') {
        // On web, use window.alert as fallback
        if (typeof window !== 'undefined') {
          window.alert(errorMessage);
        }
      } else {
        Alert.alert('Error', errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePatient = () => {
    if (Platform.OS === 'web') {
      // On web, the SettingsScreen will show a modal
      // This handler is called but the modal in SettingsScreen intercepts it
      // So we don't show Alert on web - the modal handles it
      return;
    }
    
    // On native (iOS/Android), use Alert
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
          onPress: performDelete,
        },
      ]
    );
  };

  // Expose the deletion function for web modal to call directly
  const handleDeletePatientConfirmed = performDelete;

  const handleNavigateToHome = () => {
    setCurrentScreen('home');
  };

  return {
    handleViewResults,
    handleDeletePatient,
    handleDeletePatientConfirmed,
    handleNavigateToHome,
  };
}

