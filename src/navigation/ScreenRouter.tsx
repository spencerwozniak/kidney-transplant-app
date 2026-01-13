/**
 * Screen Router Component
 * 
 * Handles rendering of all screens based on current navigation state.
 * This component centralizes all screen rendering logic, making it easy
 * to see the complete app flow at a glance.
 */

import { View, Text } from 'react-native';
import { OnboardingScreen } from '../pages/onboarding/OnboardingScreen';
import { PatientDetailsScreen1 } from '../pages/onboarding/PatientDetailsScreen1';
import { PatientDetailsScreen2 } from '../pages/onboarding/PatientDetailsScreen2';
import { MedicalQuestionsScreen } from '../pages/onboarding/MedicalQuestionsScreen';
import { AssessmentIntroScreen } from '../pages/transplant-assessment/AssessmentIntroScreen';
import { PathwayScreen } from '../pages/pathway';
import { SettingsScreen } from '../pages/SettingsScreen';
import { ChatScreen } from '../pages/ChatScreen';
import { BottomTabBar } from '../components/BottomTabBar';
import { TransplantQuestionnaire } from '../pages/transplant-assessment/TransplantQuestionnaire';
import { FinancialIntroScreen } from '../pages/financial-assessment/FinancialIntroScreen';
import { FinanceQuestionnaire } from '../pages/financial-assessment/FinanceQuestionnaire';
import { ResultsDetailScreen } from '../pages/ResultsDetailScreen';
import { ChecklistTimelineScreen } from '../pages/checklist/ChecklistTimelineScreen';
import { ChecklistItemEditScreen } from '../pages/checklist/ChecklistItemEditScreen';
import { ChecklistDocumentsScreen } from '../pages/checklist/ChecklistDocumentsScreen';
import { StyleExamples } from '../pages/StyleExamples';
import { TransplantAccessNavigator } from '../pages/referral/navigator';
import { ReferralViewScreen } from '../pages/referral/ReferralViewScreen';
import type { UseAppStateReturn } from './useAppState';
import {
  createOnboardingHandlers,
  createAssessmentHandlers,
  createFinancialHandlers,
  createChecklistHandlers,
  createPatientHandlers,
} from './handlers';

type ScreenRouterProps = {
  state: UseAppStateReturn;
  onboardingHandlers: ReturnType<typeof createOnboardingHandlers>;
  assessmentHandlers: ReturnType<typeof createAssessmentHandlers>;
  financialHandlers: ReturnType<typeof createFinancialHandlers>;
  checklistHandlers: ReturnType<typeof createChecklistHandlers>;
  patientHandlers: ReturnType<typeof createPatientHandlers>;
};

export function ScreenRouter({
  state,
  onboardingHandlers,
  assessmentHandlers,
  financialHandlers,
  checklistHandlers,
  patientHandlers,
}: ScreenRouterProps) {
  const {
    currentScreen,
    patient,
    activeTab,
    setActiveTab,
    setCurrentScreen,
    editingChecklistItem,
    isFirstTimeFinancialFlow,
    setIsFirstTimeFinancialFlow,
    patientDataPart1,
    patientDataPart2,
    patientDataMedical,
  } = state;

  // ============================================================================
  // ONBOARDING FLOW
  // ============================================================================
  if (currentScreen === 'onboarding') {
    return <OnboardingScreen onGetStarted={onboardingHandlers.handleGetStarted} />;
  }

  if (currentScreen === 'patient-details-1') {
    return (
      <PatientDetailsScreen1
        onNext={onboardingHandlers.handlePatientDetails1Next}
        onBack={() => setCurrentScreen('onboarding')}
        initialData={patientDataPart1 || undefined}
      />
    );
  }

  if (currentScreen === 'patient-details-2') {
    return (
      <PatientDetailsScreen2
        onNext={onboardingHandlers.handlePatientDetails2Next}
        onBack={() => setCurrentScreen('patient-details-1')}
        initialData={patientDataPart2 || undefined}
      />
    );
  }

  if (currentScreen === 'medical-questions') {
    return (
      <MedicalQuestionsScreen
        onNext={onboardingHandlers.handleMedicalQuestionsNext}
        onBack={() => setCurrentScreen('patient-details-2')}
        initialData={patientDataMedical || undefined}
      />
    );
  }

  // ============================================================================
  // ASSESSMENT FLOW
  // ============================================================================
  if (currentScreen === 'assessment-intro') {
    return (
      <AssessmentIntroScreen
        onBeginAssessment={assessmentHandlers.handleBeginAssessment}
        onBack={() => {
          // Navigate back to home if patient exists (already onboarded), otherwise to medical questions
          if (patient?.id) {
            setCurrentScreen('home');
          } else {
            setCurrentScreen('medical-questions');
          }
        }}
      />
    );
  }

  if (currentScreen === 'questionnaire') {
    return (
      <TransplantQuestionnaire
        patientId={patient?.id || ''}
        onComplete={assessmentHandlers.handleQuestionnaireComplete}
        onNavigateToHome={() => setCurrentScreen('home')}
        onNavigateToAssessmentIntro={() => setCurrentScreen('assessment-intro')}
      />
    );
  }

  // ============================================================================
  // FINANCIAL FLOW
  // ============================================================================
  if (currentScreen === 'financial-intro') {
    return (
      <FinancialIntroScreen
        onBeginAssessment={financialHandlers.handleBeginFinancialAssessment}
        onBack={() => {
          // Navigate back to assessment intro (if no financial profile exists)
          setCurrentScreen('assessment-intro');
        }}
        onNavigateToHome={() => {
          // Navigate to home (if financial profile exists)
          setCurrentScreen('home');
        }}
      />
    );
  }

  if (currentScreen === 'financial-questionnaire') {
    return (
      <FinanceQuestionnaire
        patientId={patient?.id || ''}
        onComplete={() => {
          setIsFirstTimeFinancialFlow(false); // Reset after completion
          financialHandlers.handleFinancialQuestionnaireComplete();
        }}
        onNavigateToHome={() => setCurrentScreen('home')}
        onNavigateToFinancialIntro={() => setCurrentScreen('financial-intro')}
        skipInitialLoad={isFirstTimeFinancialFlow}
      />
    );
  }

  // ============================================================================
  // MAIN APP (HOME)
  // ============================================================================
  if (currentScreen === 'home') {
    return (
      <View className="flex-1">
        {activeTab === 'pathway' ? (
          <PathwayScreen
            patientName={patient?.name || 'Friend'}
            onViewResults={patientHandlers.handleViewResults}
            onViewChecklist={checklistHandlers.handleViewChecklist}
            onNavigateToQuestionnaire={() => setCurrentScreen('assessment-intro')}
            onNavigateToFinancialAssessment={financialHandlers.handleEditFinancialAssessment}
            onDeletePatient={patientHandlers.handleDeletePatient}
            onFindReferral={() => setCurrentScreen('transplant-access-navigator')}
            onViewReferral={() => setCurrentScreen('referral-view')}
          />
        ) : activeTab === 'chat' ? (
          <ChatScreen patientName={patient?.name || 'Friend'} />
        ) : (
          <SettingsScreen
            patientName={patient?.name || 'Friend'}
            onViewResults={patientHandlers.handleViewResults}
            onViewChecklist={checklistHandlers.handleViewChecklist}
            onNavigateToQuestionnaire={() => setCurrentScreen('assessment-intro')}
            onNavigateToFinancialAssessment={financialHandlers.handleEditFinancialAssessment}
            onDeletePatient={patientHandlers.handleDeletePatient}
            onDeletePatientConfirmed={patientHandlers.handleDeletePatientConfirmed}
          />
        )}
        <BottomTabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </View>
    );
  }

  if (currentScreen === 'results-detail') {
    return <ResultsDetailScreen onNavigateToHome={patientHandlers.handleNavigateToHome} />;
  }

  // ============================================================================
  // CHECKLIST FLOW
  // ============================================================================
  if (currentScreen === 'checklist-timeline') {
    return (
      <ChecklistTimelineScreen
        onNavigateToHome={patientHandlers.handleNavigateToHome}
        onEditItem={checklistHandlers.handleEditChecklistItem}
      />
    );
  }

  if (currentScreen === 'checklist-item-edit' && editingChecklistItem) {
    return (
      <ChecklistItemEditScreen
        itemId={editingChecklistItem.itemId}
        initialItem={editingChecklistItem.item}
        onSave={checklistHandlers.handleSaveChecklistItem}
        onNavigateBack={checklistHandlers.handleNavigateBackFromChecklistItem}
        onRequestDocuments={checklistHandlers.handleRequestDocuments}
      />
    );
  }

  if (currentScreen === 'checklist-documents' && editingChecklistItem) {
    return (
      <ChecklistDocumentsScreen
        checklistItem={editingChecklistItem.item}
        onNavigateBack={checklistHandlers.handleNavigateBackFromDocuments}
      />
    );
  }

  // ============================================================================
  // REFERRAL FLOW
  // ============================================================================
  if (currentScreen === 'transplant-access-navigator') {
    return <TransplantAccessNavigator onNavigateBack={() => setCurrentScreen('home')} />;
  }

  if (currentScreen === 'referral-view') {
    return <ReferralViewScreen onNavigateBack={() => setCurrentScreen('home')} />;
  }

  // ============================================================================
  // DEVELOPMENT
  // ============================================================================
  if (currentScreen === 'examples') {
    return <StyleExamples onNavigateToHome={patientHandlers.handleNavigateToHome} />;
  }

  // ============================================================================
  // FALLBACK
  // ============================================================================
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text>Screen not found</Text>
    </View>
  );
}

