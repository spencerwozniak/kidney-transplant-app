/**
 * Assessment Flow Handlers
 * 
 * Handles navigation for the transplant assessment flow:
 * 1. AssessmentIntroScreen -> TransplantQuestionnaire
 * 2. TransplantQuestionnaire -> ResultsDetailScreen (after completion)
 */

import type { UseAppStateReturn } from '../useAppState';

type AssessmentHandlers = {
  handleBeginAssessment: () => void;
  handleQuestionnaireComplete: () => void;
};

export function createAssessmentHandlers(
  state: UseAppStateReturn
): AssessmentHandlers {
  const { patient, setCurrentScreen } = state;

  const handleBeginAssessment = () => {
    if (patient?.id) {
      setCurrentScreen('questionnaire');
    }
  };

  const handleQuestionnaireComplete = () => {
    // Questionnaire is saved, status will be computed on backend
    // Navigate to results detail screen to show the assessment results
    setCurrentScreen('results-detail');
  };

  return {
    handleBeginAssessment,
    handleQuestionnaireComplete,
  };
}

