/**
 * Transplant Access Navigator Types
 * 
 * Type definitions for the transplant access navigator system
 */

import type { TransplantCenter, PatientReferralState, ReferralPathway } from '../../../services/api';

export type NavigatorScreen = 'centers' | 'pathway' | 'next-steps';

export type TransplantAccessNavigatorProps = {
  onNavigateBack: () => void;
};

export type CentersScreenProps = {
  centers: TransplantCenter[];
  zipCode: string;
  isSearching?: boolean;
  referralState: PatientReferralState | null;
  isMarkingReferral?: boolean;
  onZipCodeChange: (zip: string) => void;
  onFindCenters: () => void;
  onSelectCenter: (center: TransplantCenter) => void;
  onMarkReferralReceived: () => void;
};

export type ReferralPathwayScreenProps = {
  pathway: ReferralPathway;
  selectedCenter: TransplantCenter | null;
  referralState: PatientReferralState | null;
  onBack: () => void;
  onNextSteps: () => void;
  onUpdateReferralState: (updates: Partial<PatientReferralState>) => Promise<void>;
};

export type NextStepsScreenProps = {
  pathway: ReferralPathway;
  selectedCenter: TransplantCenter | null;
  referralState: PatientReferralState | null;
  onBack: () => void;
  onUpdateReferralState: (updates: Partial<PatientReferralState>) => Promise<void>;
  onNavigateBack: () => void;
};

