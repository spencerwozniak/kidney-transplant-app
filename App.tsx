import { useState, useEffect } from 'react';
import { View } from 'react-native';
import { OnboardingScreen } from './src/pages/OnboardingScreen';
import { PatientDetailsScreen1 } from './src/pages/PatientDetailsScreen1';
import { PatientDetailsScreen2 } from './src/pages/PatientDetailsScreen2';
import { AssessmentIntroScreen } from './src/pages/AssessmentIntroScreen';
import { HomeScreen } from './src/pages/HomeScreen';
import { TransplantQuestionnaire } from './src/pages/TransplantQuestionnaire';
import { ResultsDetailScreen } from './src/pages/ResultsDetailScreen';
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
  | 'examples';

type ResultsSummary = {
  hasAbsolute: boolean;
  hasRelative: boolean;
  absoluteContraindications: Array<{ id: string; question: string }>;
  relativeContraindications: Array<{ id: string; question: string }>;
};

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('onboarding');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [results, setResults] = useState<ResultsSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check if patient exists on mount
  useEffect(() => {
    checkExistingPatient();
  }, []);

  const checkExistingPatient = async () => {
    try {
      const existingPatient = await apiService.getPatient();
      setPatient(existingPatient);
      // If patient exists, check for existing questionnaire results
      if (existingPatient.id) {
        // TODO: Fetch latest questionnaire submission and set results
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

    setIsLoading(true);
    try {
      const patientData: Patient = {
        ...patientDataPart1,
        ...data,
      };
      
      // Ensure height and weight are numbers, not strings
      if (patientData.height !== undefined) {
        patientData.height = typeof patientData.height === 'string' 
          ? parseFloat(patientData.height) 
          : patientData.height;
      }
      if (patientData.weight !== undefined) {
        patientData.weight = typeof patientData.weight === 'string' 
          ? parseFloat(patientData.weight) 
          : patientData.weight;
      }
      
      console.log('Saving patient data:', JSON.stringify(patientData, null, 2));
      const savedPatient = await apiService.createPatient(patientData);
      console.log('Patient saved successfully:', savedPatient);
      setPatient(savedPatient);
      setPatientDataPart1(null); // Clear temporary data
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

  const handleQuestionnaireComplete = (questionnaireResults: ResultsSummary) => {
    // Results are saved and passed back, set them and navigate to home
    setResults(questionnaireResults);
    setCurrentScreen('home');
  };

  const handleViewResults = () => {
    if (results) {
      setCurrentScreen('results-detail');
    }
  };

  return (
    <>
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
        />
      ) : currentScreen === 'assessment-intro' ? (
        <AssessmentIntroScreen
          onBeginAssessment={handleBeginAssessment}
          onBack={() => setCurrentScreen('patient-details-2')}
        />
      ) : currentScreen === 'home' ? (
        <HomeScreen
          patientName={patient?.name || 'Friend'}
          results={results || undefined}
          onViewResults={handleViewResults}
          onNavigateToQuestionnaire={() => setCurrentScreen('questionnaire')}
          onNavigateToExamples={() => setCurrentScreen('examples')}
        />
      ) : currentScreen === 'questionnaire' ? (
        <TransplantQuestionnaire
          patientId={patient?.id || ''}
          onComplete={handleQuestionnaireComplete}
          onNavigateToHome={() => setCurrentScreen('home')}
        />
      ) : currentScreen === 'results-detail' ? (
        <ResultsDetailScreen results={results!} onNavigateToHome={() => setCurrentScreen('home')} />
      ) : (
        <StyleExamples onNavigateToHome={() => setCurrentScreen('home')} />
      )}
      <StatusBar style="dark" />
    </>
  );
}
