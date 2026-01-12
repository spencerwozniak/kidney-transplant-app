/**
 * Assessment Flow Handlers
 * 
 * Handles navigation for the transplant assessment flow:
 * 1. AssessmentIntroScreen -> TransplantQuestionnaire
 * 2. TransplantQuestionnaire -> FinancialIntroScreen (after completion)
 */

import type { UseAppStateReturn } from '../useAppState';

type AssessmentHandlers = {
  handleBeginAssessment: () => void;
  handleQuestionnaireComplete: () => void;
};

export function createAssessmentHandlers(
  state: UseAppStateReturn
): AssessmentHandlers {
  const { patient, setCurrentScreen, setIsFirstTimeFinancialFlow } = state;

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

  return {
    handleBeginAssessment,
    handleQuestionnaireComplete,
  };
}

