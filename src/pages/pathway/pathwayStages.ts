/**
 * Pathway Stages Data
 * 
 * Defines all stages in the transplant pathway with their metadata
 */

import type { PathwayStageData } from './types';

export const PATHWAY_STAGES: PathwayStageData[] = [
  {
    id: 'identification',
    title: 'Identification & Awareness',
    description:
      'Patient recognizes they have CKD or ESRD and learns that transplant is an option worth exploring.',
    shortDescription: 'Learning about transplant as an option',
    icon: '🔍',
    color: '#3b82f6', // blue
    bgColor: '#dbeafe',
  },
  {
    id: 'referral',
    title: 'Referral',
    description:
      'Patient gets referred to a transplant center for evaluation. Ideally happens 6-12 months before anticipated dialysis, but can occur when medically stable if already on dialysis.',
    shortDescription: 'Getting referred to a transplant center',
    icon: '📋',
    color: '#8b5cf6', // purple
    bgColor: '#ede9fe',
  },
  {
    id: 'evaluation',
    title: 'Evaluation',
    description: 'Multidisciplinary assessment that typically takes weeks to several months.',
    shortDescription: 'Comprehensive medical and psychosocial assessment',
    icon: '🏥',
    color: '#f59e0b', // amber
    bgColor: '#fef3c7',
  },
  {
    id: 'selection',
    title: 'Selection & Waitlisting',
    description:
      'Transplant committee decides to list, defer, or deny. If listed, patient begins accruing wait time (starts at dialysis initiation under 2014 rules).',
    shortDescription: 'Committee decision and waitlist placement',
    icon: '⏳',
    color: '#f97316', // orange
    bgColor: '#ffedd5',
  },
  {
    id: 'transplantation',
    title: 'Transplantation',
    description: 'Surgery and immediate post-operative recovery.',
    shortDescription: 'Surgery and immediate recovery',
    icon: '⚕️',
    color: '#22c55e', // green
    bgColor: '#dcfce7',
  },
  {
    id: 'post-transplant',
    title: 'Post-Transplant Life',
    description:
      'Lifelong immunosuppression and monitoring, but return to near-normal physiology and lifestyle.',
    shortDescription: 'Lifelong care and monitoring',
    icon: '💚',
    color: '#10b981', // emerald
    bgColor: '#d1fae5',
  },
];

