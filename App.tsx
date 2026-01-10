import { useState, useEffect } from 'react';
import { View, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingScreen } from './src/pages/onboarding/OnboardingScreen';
import { PatientDetailsScreen1 } from './src/pages/onboarding/PatientDetailsScreen1';
import { PatientDetailsScreen2 } from './src/pages/onboarding/PatientDetailsScreen2';
import { AssessmentIntroScreen } from './src/pages/assessment/AssessmentIntroScreen';
import { HomeScreen } from './src/pages/HomeScreen';
import { TransplantQuestionnaire } from './src/pages/assessment/TransplantQuestionnaire';
import { ResultsDetailScreen } from './src/pages/ResultsDetailScreen';
import { ChecklistTimelineScreen } from './src/pages/checklist/ChecklistTimelineScreen';
import { ChecklistItemEditScreen } from './src/pages/checklist/ChecklistItemEditScreen';
import { ChecklistDocumentsScreen } from './src/pages/checklist/ChecklistDocumentsScreen';
import { StyleExamples } from './src/pages/StyleExamples';
import { StatusBar } from 'expo-status-bar';
import { apiService, Patient } from './src/services/api';

import './src/styles/global.css';

type Screen =
  | 'onboarding'
  | 'patient-details-1'
  | 'patient-details-2'
  | 'assessment-intro'
  | 'home'
  | 'questionnaire'
  | 'results-detail'
  | 'checklist-timeline'
  | 'checklist-item-edit'
  | 'checklist-documents'
  | 'examples';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [editingChecklistItem, setEditingChecklistItem] = useState<{
    itemId: string;
    item: any;
  } | null>(null);

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

  const [patientDataPart1, setPatientDataPart1] = useState<{
    name: string;
    email?: string;
    phone?: string;
  } | null>(null);

  const [patientDataPart2, setPatientDataPart2] = useState<{
    date_of_birth: string;
    sex?: string;
    height?: number;
    weight?: number;
  } | null>(null);

  const handleGetStarted = () => {
    setCurrentScreen('patient-details-1');
  };

  const handlePatientDetails1Next = (data: { name: string; email?: string; phone?: string }) => {
    setPatientDataPart1(data);
    setCurrentScreen('patient-details-2');
  };

  const handlePatientDetails2Next = async (data: {
    date_of_birth: string;
    sex?: string;
    height?: number;
    weight?: number;
  }) => {
    if (!patientDataPart1) {
      console.error('Patient data part 1 is missing');
      return;
    }

    // Cache the data before proceeding
    setPatientDataPart2(data);

    setIsLoading(true);
    try {
      const patientData: Patient = {
        ...patientDataPart1,
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
      const savedPatient = await apiService.createPatient(patientData);
      console.log('Patient saved successfully:', savedPatient);
      setPatient(savedPatient);
      setPatientDataPart1(null); // Clear temporary data
      setPatientDataPart2(null); // Clear temporary data
      // Checklist is automatically created on backend when patient is created
      setCurrentScreen('assessment-intro');
    } catch (error: any) {
      console.error('Error saving patient:', error);
      console.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        response: error?.response,
      });
      // TODO: Show error message to user
      alert(`Failed to save patient: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBeginAssessment = () => {
    if (patient?.id) {
      setCurrentScreen('questionnaire');
    }
  };

  const handleQuestionnaireComplete = () => {
    // Questionnaire is saved, status will be computed on backend
    // Navigate to home where status will be fetched
    setCurrentScreen('home');
  };

  const handleViewResults = () => {
    // Navigate to results detail screen, which will fetch status from API
    setCurrentScreen('results-detail');
  };

  const handleViewChecklist = () => {
    setCurrentScreen('checklist-timeline');
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
              setPatient(null);
              setPatientDataPart1(null);
              setPatientDataPart2(null);
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

  return (
    <SafeAreaProvider>
      {isLoading ? (
        <View className="flex-1 items-center justify-center bg-white">
          {/* Loading indicator */}
        </View>
      ) : currentScreen === 'onboarding' ? (
        <OnboardingScreen onGetStarted={handleGetStarted} />
      ) : currentScreen === 'patient-details-1' ? (
        <PatientDetailsScreen1
          onNext={handlePatientDetails1Next}
          onBack={() => setCurrentScreen('onboarding')}
          initialData={patientDataPart1 || undefined}
        />
      ) : currentScreen === 'patient-details-2' ? (
        <PatientDetailsScreen2
          onNext={handlePatientDetails2Next}
          onBack={() => setCurrentScreen('patient-details-1')}
          initialData={patientDataPart2 || undefined}
        />
      ) : currentScreen === 'assessment-intro' ? (
        <AssessmentIntroScreen
          onBeginAssessment={handleBeginAssessment}
          onBack={() => {
            // Navigate back to home if patient exists (already onboarded), otherwise to patient details
            if (patient?.id) {
              setCurrentScreen('home');
            } else {
              setCurrentScreen('patient-details-2');
            }
          }}
        />
      ) : currentScreen === 'home' ? (
        <HomeScreen
          patientName={patient?.name || 'Friend'}
          onViewResults={handleViewResults}
          onViewChecklist={handleViewChecklist}
          onNavigateToQuestionnaire={() => setCurrentScreen('assessment-intro')}
          onNavigateToExamples={() => setCurrentScreen('examples')}
          onDeletePatient={handleDeletePatient}
        />
      ) : currentScreen === 'questionnaire' ? (
        <TransplantQuestionnaire
          patientId={patient?.id || ''}
          onComplete={handleQuestionnaireComplete}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToAssessmentIntro={() => setCurrentScreen('assessment-intro')}
        />
      ) : currentScreen === 'results-detail' ? (
        <ResultsDetailScreen onNavigateToHome={() => setCurrentScreen('home')} />
      ) : currentScreen === 'checklist-timeline' ? (
        <ChecklistTimelineScreen
          onNavigateToHome={() => setCurrentScreen('home')}
          onEditItem={(itemId, item) => {
            setEditingChecklistItem({ itemId, item });
            setCurrentScreen('checklist-item-edit');
          }}
        />
      ) : currentScreen === 'checklist-item-edit' && editingChecklistItem ? (
        <ChecklistItemEditScreen
          itemId={editingChecklistItem.itemId}
          initialItem={editingChecklistItem.item}
          onSave={() => {
            setEditingChecklistItem(null);
            setCurrentScreen('checklist-timeline');
          }}
          onNavigateBack={() => {
            setEditingChecklistItem(null);
            setCurrentScreen('checklist-timeline');
          }}
          onRequestDocuments={() => {
            setCurrentScreen('checklist-documents');
          }}
        />
      ) : currentScreen === 'checklist-documents' && editingChecklistItem ? (
        <ChecklistDocumentsScreen
          checklistItem={editingChecklistItem.item}
          onNavigateBack={() => {
            setCurrentScreen('checklist-item-edit');
          }}
        />
      ) : (
        <StyleExamples onNavigateToHome={() => setCurrentScreen('home')} />
      )}
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
