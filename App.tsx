import { useState, useEffect } from 'react';
import { View, Alert, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { OnboardingScreen } from './src/pages/onboarding/OnboardingScreen';
import { PatientDetailsScreen1 } from './src/pages/onboarding/PatientDetailsScreen1';
import { PatientDetailsScreen2 } from './src/pages/onboarding/PatientDetailsScreen2';
import { MedicalQuestionsScreen } from './src/pages/onboarding/MedicalQuestionsScreen';
import { AssessmentIntroScreen } from './src/pages/transplant-assessment/AssessmentIntroScreen';
import { HomeScreen } from './src/pages/HomeScreen';
import { PathwayScreen } from './src/pages/PathwayScreen';
import { SettingsScreen } from './src/pages/SettingsScreen';
import { BottomTabBar } from './src/components/BottomTabBar';
import { TransplantQuestionnaire } from './src/pages/transplant-assessment/TransplantQuestionnaire';
import { FinancialIntroScreen } from './src/pages/financial-assessment/FinancialIntroScreen';
import { FinanceQuestionnaire } from './src/pages/financial-assessment/FinanceQuestionnaire';
import { ResultsDetailScreen } from './src/pages/ResultsDetailScreen';
import { ChecklistTimelineScreen } from './src/pages/checklist/ChecklistTimelineScreen';
import { ChecklistItemEditScreen } from './src/pages/checklist/ChecklistItemEditScreen';
import { ChecklistDocumentsScreen } from './src/pages/checklist/ChecklistDocumentsScreen';
import { StyleExamples } from './src/pages/StyleExamples';
import { TransplantAccessNavigator } from './src/pages/referral/TransplantAccessNavigator';
import { StatusBar } from 'expo-status-bar';
import { apiService, Patient } from './src/services/api';

import './src/styles/global.css';

type Screen =
  | 'onboarding'
  | 'patient-details-1'
  | 'patient-details-2'
  | 'medical-questions'
  | 'assessment-intro'
  | 'home'
  | 'questionnaire'
  | 'financial-intro'
  | 'financial-questionnaire'
  | 'results-detail'
  | 'checklist-timeline'
  | 'checklist-item-edit'
  | 'checklist-documents'
  | 'examples'
  | 'transplant-access-navigator';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFirstTimeFinancialFlow, setIsFirstTimeFinancialFlow] = useState(false);
  const [editingChecklistItem, setEditingChecklistItem] = useState<{
    itemId: string;
    item: any;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'pathway' | 'settings'>('pathway');

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

  const [patientDataMedical, setPatientDataMedical] = useState<{
    has_ckd_esrd?: boolean;
    last_gfr?: number;
    has_referral?: boolean;
  } | null>(null);

  const handleGetStarted = () => {
    setCurrentScreen('patient-details-1');
  };

  const handlePatientDetails1Next = (data: { name: string; email?: string; phone?: string }) => {
    setPatientDataPart1(data);
    setCurrentScreen('patient-details-2');
  };

  const handlePatientDetails2Next = (data: {
    date_of_birth: string;
    sex?: string;
    height?: number;
    weight?: number;
  }) => {
    if (!patientDataPart1) {
      console.error('Patient data part 1 is missing');
      return;
    }

    // Cache the data before proceeding to medical questions
    setPatientDataPart2(data);
    setCurrentScreen('medical-questions');
  };

  const handleMedicalQuestionsNext = async (data: {
    has_ckd_esrd?: boolean;
    last_gfr?: number;
    has_referral?: boolean;
  }) => {
    if (!patientDataPart1 || !patientDataPart2) {
      console.error('Patient data parts are missing');
      return;
    }

    // Cache the medical data
    setPatientDataMedical(data);

    setIsLoading(true);
    try {
      const patientData: Patient = {
        ...patientDataPart1,
        ...patientDataPart2,
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
      setPatientDataMedical(null); // Clear temporary data
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
    // Navigate to financial assessment intro (first-time flow)
    setIsFirstTimeFinancialFlow(true);
    setCurrentScreen('financial-intro');
  };

  const handleBeginFinancialAssessment = () => {
    if (patient?.id) {
      setCurrentScreen('financial-questionnaire');
    }
  };

  const handleEditFinancialAssessment = () => {
    if (patient?.id) {
      // Coming from home screen - this is editing, not first time
      setIsFirstTimeFinancialFlow(false);
      setCurrentScreen('financial-intro');
    }
  };

  const handleFinancialQuestionnaireComplete = () => {
    // Financial questionnaire is saved
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
              setPatientDataMedical(null);
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
      ) : currentScreen === 'medical-questions' ? (
        <MedicalQuestionsScreen
          onNext={handleMedicalQuestionsNext}
          onBack={() => setCurrentScreen('patient-details-2')}
          initialData={patientDataMedical || undefined}
        />
      ) : currentScreen === 'assessment-intro' ? (
        <AssessmentIntroScreen
          onBeginAssessment={handleBeginAssessment}
          onBack={() => {
            // Navigate back to home if patient exists (already onboarded), otherwise to medical questions
            if (patient?.id) {
              setCurrentScreen('home');
            } else {
              setCurrentScreen('medical-questions');
            }
          }}
        />
      ) : currentScreen === 'home' ? (
        <View className="flex-1">
          {activeTab === 'pathway' ? (
            <PathwayScreen
              patientName={patient?.name || 'Friend'}
              onViewResults={handleViewResults}
              onViewChecklist={handleViewChecklist}
              onNavigateToQuestionnaire={() => setCurrentScreen('assessment-intro')}
              onNavigateToFinancialAssessment={() => setCurrentScreen('financial-intro')}
              onDeletePatient={handleDeletePatient}
              onFindReferral={() => setCurrentScreen('transplant-access-navigator')}
            />
          ) : (
            <SettingsScreen
              patientName={patient?.name || 'Friend'}
              onViewResults={handleViewResults}
              onViewChecklist={handleViewChecklist}
              onNavigateToQuestionnaire={() => setCurrentScreen('assessment-intro')}
              onNavigateToFinancialAssessment={() => setCurrentScreen('financial-intro')}
              onDeletePatient={handleDeletePatient}
            />
          )}
          <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
        </View>
      ) : currentScreen === 'questionnaire' ? (
        <TransplantQuestionnaire
          patientId={patient?.id || ''}
          onComplete={handleQuestionnaireComplete}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToAssessmentIntro={() => setCurrentScreen('assessment-intro')}
        />
      ) : currentScreen === 'financial-intro' ? (
        <FinancialIntroScreen
          onBeginAssessment={handleBeginFinancialAssessment}
          onBack={() => {
            // Navigate back to assessment intro (if no financial profile exists)
            setCurrentScreen('assessment-intro');
          }}
          onNavigateToHome={() => {
            // Navigate to home (if financial profile exists)
            setCurrentScreen('home');
          }}
        />
      ) : currentScreen === 'financial-questionnaire' ? (
        <FinanceQuestionnaire
          patientId={patient?.id || ''}
          onComplete={() => {
            setIsFirstTimeFinancialFlow(false); // Reset after completion
            handleFinancialQuestionnaireComplete();
          }}
          onNavigateToHome={() => setCurrentScreen('home')}
          onNavigateToFinancialIntro={() => setCurrentScreen('financial-intro')}
          skipInitialLoad={isFirstTimeFinancialFlow}
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
            // Preserve editingChecklistItem when navigating to documents screen
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
      ) : currentScreen === 'examples' ? (
        <StyleExamples onNavigateToHome={() => setCurrentScreen('home')} />
      ) : currentScreen === 'transplant-access-navigator' ? (
        <TransplantAccessNavigator onNavigateBack={() => setCurrentScreen('home')} />
      ) : (
        <View className="flex-1 items-center justify-center bg-white">
          <Text>Screen not found</Text>
        </View>
      )}
      <StatusBar style="dark" />
    </SafeAreaProvider>
  );
}
