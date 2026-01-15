/**
 * Navigation types and screen definitions
 * 
 * This file defines all possible screens in the app and their types.
 * The screens are organized by flow:
 * - Onboarding: Initial patient setup
 * - Assessment: Transplant eligibility assessment
 * - Financial: Financial assessment
 * - Checklist: Pre-transplant checklist management
 * - Referral: Transplant center referral
 * - Main: Home and settings
 */

export type Screen =
  // Onboarding Flow
  | 'onboarding'
  | 'patient-details-1'
  | 'patient-details-2'
  | 'medical-questions'
  // Assessment Flow
  | 'assessment-intro'
  | 'questionnaire'
  // Financial Flow
  | 'financial-intro'
  | 'financial-questionnaire'
  // Main App
  | 'home'
  | 'results-detail'
  // Checklist Flow
  | 'checklist-timeline'
  | 'checklist-item-edit'
  | 'checklist-documents'
  // Referral Flow
  | 'transplant-access-navigator'
  | 'referral-view'
  // Data Export
  | 'export'
  | 'clinical-summary'
  | 'structured-data'
  // Development
  | 'examples';

export type Tab = 'pathway' | 'chat' | 'account';

export type ChecklistEditingItem = {
  itemId: string;
  item: any;
};

