/**
 * Financial Assessment Flow Handlers
 * 
 * Handles navigation for the financial assessment flow:
 * 1. FinancialIntroScreen -> FinanceQuestionnaire
 * 2. FinanceQuestionnaire -> home (after completion)
 * 
 * Supports both first-time flow (from assessment) and edit flow (from home)
 */

import type { UseAppStateReturn } from '../useAppState';

type FinancialHandlers = {
  handleBeginFinancialAssessment: () => void;
  handleEditFinancialAssessment: () => void;
  handleFinancialQuestionnaireComplete: () => void;
};

export function createFinancialHandlers(
  state: UseAppStateReturn
): FinancialHandlers {
  const { patient, setCurrentScreen, setIsFirstTimeFinancialFlow } = state;

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

  return {
    handleBeginFinancialAssessment,
    handleEditFinancialAssessment,
    handleFinancialQuestionnaireComplete,
  };
}

