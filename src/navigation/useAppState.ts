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
import { apiService, Patient, PatientStatus, TransplantChecklist, isPatientNotFoundError } from '../services/api';
import { Screen, Tab, ChecklistEditingItem } from './types';

export type PatientDataPart1 = {
  name: string;
  email?: string;
  phone?: string;
};

export type PatientDataPart2 = {
  date_of_birth: string;
  sex?: string;
  height_cm?: number;
  weight_kg?: number;
};

export type PatientDataMedical = {
  has_ckd_esrd?: boolean;
  last_gfr?: number;
  has_referral?: boolean;
};

export function useAppState() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientStatus, setPatientStatus] = useState<PatientStatus | null>(null);
  const [checklist, setChecklist] = useState<TransplantChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstTimeFinancialFlow, setIsFirstTimeFinancialFlow] = useState(false);
  const [editingChecklistItem, setEditingChecklistItem] = useState<ChecklistEditingItem | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('pathway');
  const [onboardingMessage, setOnboardingMessage] = useState<string | null>(null);

  // Temporary onboarding data
  const [patientDataPart1, setPatientDataPart1] = useState<PatientDataPart1 | null>(null);
  const [patientDataPart2, setPatientDataPart2] = useState<PatientDataPart2 | null>(null);
  const [patientDataMedical, setPatientDataMedical] = useState<PatientDataMedical | null>(null);

  // Check if patient exists on mount
  useEffect(() => {
    checkExistingPatient();
  }, []);

  const checkExistingPatient = async () => {
    console.time('app:init');
    // Fast-path: rehydrate from local cache for instant UI
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const cached = typeof window !== 'undefined' ? window.localStorage.getItem('patient') : null;
      if (cached) {
        try {
          const p = JSON.parse(cached) as Patient;
          setPatient(p);
          if (p?.id) setCurrentScreen('home');
        } catch (e) {
          // ignore parse errors
        }
      }
    } catch (e) {
      // ignore
    }

    // Rehydrate patient-status and checklist from cache (non-blocking)
    try {
      const statusCache = apiService.loadCached<PatientStatus>('patient_status');
      if (statusCache.data && !statusCache.expired) {
        setPatientStatus(statusCache.data);
      }
      const checklistCache = apiService.loadCached<TransplantChecklist>('checklist');
      if (checklistCache.data && !checklistCache.expired) {
        setChecklist(checklistCache.data);
      }
    } catch (e) {
      // ignore
    }

    // Background refresh to ensure we have up-to-date data
    try {
      const existingPatient = await apiService.getPatient();
      setPatient(existingPatient);
      if (existingPatient.id) setCurrentScreen('home');

      // Only refresh status/checklist if cache expired or missing
      const statusCache = apiService.loadCached<PatientStatus>('patient_status');
      const checklistCache = apiService.loadCached<TransplantChecklist>('checklist');

      const shouldFetchStatus = !statusCache.data || statusCache.expired;
      const shouldFetchChecklist = !checklistCache.data || checklistCache.expired;

      if (shouldFetchStatus || shouldFetchChecklist) {
        // Fetch in parallel but don't block navigation
        Promise.allSettled([
          shouldFetchStatus ? apiService.getPatientStatus() : Promise.resolve(statusCache.data),
          shouldFetchChecklist ? apiService.getChecklist() : Promise.resolve(checklistCache.data),
        ])
          .then((results) => {
            const [statusResult, checklistResult] = results;

            // Handle patient-status result
            if (statusResult.status === 'fulfilled') {
              setPatientStatus(statusResult.value as PatientStatus);
            } else if (statusResult.status === 'rejected') {
              const reason = (statusResult as PromiseRejectedResult).reason;
              if (isPatientNotFoundError(reason)) {
                setOnboardingMessage('We could not find your patient on the server. Please create a new profile.');
                setCurrentScreen('onboarding');
                return;
              }
              console.error('Error fetching patient status:', reason);
            }

            // Handle checklist result
            if (checklistResult.status === 'fulfilled') {
              setChecklist(checklistResult.value as TransplantChecklist);
            } else if (checklistResult.status === 'rejected') {
              const reason = (checklistResult as PromiseRejectedResult).reason;
              if (isPatientNotFoundError(reason)) {
                setOnboardingMessage('We could not find your patient on the server. Please create a new profile.');
                setCurrentScreen('onboarding');
                return;
              }
              console.error('Error fetching checklist:', reason);
            }
          })
          .finally(() => {
            console.timeEnd('app:init');
          });
      } else {
        // Nothing to fetch
        console.timeEnd('app:init');
      }
    } catch (error) {
      // No patient exists, ensure onboarding
      setCurrentScreen('onboarding');
      console.timeEnd('app:init');
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
    // Patient status and checklist (rehydrated from cache)
    patientStatus,
    setPatientStatus,
    checklist,
    setChecklist,
    
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
    // Onboarding message when routing back to onboarding due to server state
    onboardingMessage,
    setOnboardingMessage,
  };
}

export type UseAppStateReturn = ReturnType<typeof useAppState>;

