/**
 * App State Management Hook
 * 
 * Manages all application state including:
 * - Current screen navigation
 * - Patient data
 * - Temporary form data during onboarding
 * - UI state (loading, tabs, etc.)
 */

import { useState, useEffect } from 'react';
import { apiService, Patient } from '../services/api';
import { Screen, Tab, ChecklistEditingItem } from './types';

export type PatientDataPart1 = {
  name: string;
  email?: string;
  phone?: string;
};

export type PatientDataPart2 = {
  date_of_birth: string;
  sex?: string;
  height?: number;
  weight?: number;
};

export type PatientDataMedical = {
  has_ckd_esrd?: boolean;
  last_gfr?: number;
  has_referral?: boolean;
};

export function useAppState() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstTimeFinancialFlow, setIsFirstTimeFinancialFlow] = useState(false);
  const [editingChecklistItem, setEditingChecklistItem] = useState<ChecklistEditingItem | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('pathway');

  // Temporary onboarding data
  const [patientDataPart1, setPatientDataPart1] = useState<PatientDataPart1 | null>(null);
  const [patientDataPart2, setPatientDataPart2] = useState<PatientDataPart2 | null>(null);
  const [patientDataMedical, setPatientDataMedical] = useState<PatientDataMedical | null>(null);

  // Check if patient exists on mount
  useEffect(() => {
    checkExistingPatient();
  }, []);

  const checkExistingPatient = async () => {
    try {
      const existingPatient = await apiService.getPatient();
      setPatient(existingPatient);
      // If patient exists, navigate to home
      if (existingPatient.id) {
        setCurrentScreen('home');
      }
    } catch (error) {
      // No patient exists, start with onboarding
      setCurrentScreen('onboarding');
    }
  };

  const clearPatientData = () => {
    setPatientDataPart1(null);
    setPatientDataPart2(null);
    setPatientDataMedical(null);
  };

  const clearAllState = () => {
    setPatient(null);
    clearPatientData();
    setEditingChecklistItem(null);
    setIsFirstTimeFinancialFlow(false);
  };

  return {
    // Screen navigation
    currentScreen,
    setCurrentScreen,
    
    // Patient data
    patient,
    setPatient,
    
    // Loading state
    isLoading,
    setIsLoading,
    
    // Financial flow state
    isFirstTimeFinancialFlow,
    setIsFirstTimeFinancialFlow,
    
    // Checklist state
    editingChecklistItem,
    setEditingChecklistItem,
    
    // Tab state
    activeTab,
    setActiveTab,
    
    // Temporary onboarding data
    patientDataPart1,
    setPatientDataPart1,
    patientDataPart2,
    setPatientDataPart2,
    patientDataMedical,
    setPatientDataMedical,
    
    // Utility functions
    clearPatientData,
    clearAllState,
  };
}

export type UseAppStateReturn = ReturnType<typeof useAppState>;

