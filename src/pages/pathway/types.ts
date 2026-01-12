/**
 * Pathway Types
 * 
 * Type definitions for the transplant pathway system
 */

export type PathwayStage =
  | 'identification'
  | 'referral'
  | 'evaluation'
  | 'selection'
  | 'transplantation'
  | 'post-transplant';

export type PathwayStageData = {
  id: PathwayStage;
  title: string;
  description: string;
  shortDescription: string;
  icon: string;
  color: string;
  bgColor: string;
};

export type StageStatus = 'completed' | 'current' | 'upcoming';

export type PathwayScreenProps = {
  patientName: string;
  onViewResults?: () => void;
  onViewChecklist?: () => void;
  onNavigateToQuestionnaire?: () => void;
  onNavigateToFinancialAssessment?: () => void;
  onDeletePatient?: () => void;
  onFindReferral?: () => void;
  onViewReferral?: () => void;
  showActionButtons?: boolean; // For backward compatibility, but won't be used
};

