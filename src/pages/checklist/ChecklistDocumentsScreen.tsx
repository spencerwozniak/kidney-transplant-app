import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView } from 'react-native';
import { cards, typography, combineClasses, layout } from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { ChecklistItem } from '../../services/api';

type ChecklistDocumentsScreenProps = {
  checklistItem: ChecklistItem;
  onNavigateBack?: () => void;
};

const DOCUMENTS_CONTENT: Record<string, { title: string; description: string; requests: string[]; why: string; specialNote?: string }> = {
  physical_exam: {
    title: 'Complete Physical Examination',
    description: 'Comprehensive medical evaluation by transplant team',
    requests: [
      'Full clinic note / H&P (History & Physical)',
      'Problem list (active + historical diagnoses)',
      'Medication list (with doses, routes, start dates)',
      'Provider contact info (clinic name, physician, NPI if available)',
    ],
    why: 'Transplant centers will not accept "verbal summaries." They need documented clinical judgment.\n\n"Let everything be established by the testimony of two or three witnesses." (2 Corinthians 13:1)',
  },
  lab_work: {
    title: 'Laboratory Work & Viral Serology',
    description: 'Hepatitis profile, HIV, CMV, tissue typing, viral panel (repeated annually while waitlisted)',
    requests: [
      'Complete lab result reports, not just "normal/abnormal"',
      'With:\n  • Test name\n  • Value\n  • Units\n  • Reference range\n  • Date/time drawn',
      'Serology reports (PDF or structured data)',
      'Blood type & tissue typing results (HLA typing if done)',
      'Historical trend reports if labs were repeated',
    ],
    specialNote: 'Because labs are repeated annually, patients should request:\n\nA chronological lab history, not isolated snapshots\n\n"Remember the former things." (Isaiah 46:9)',
    why: 'Complete lab reports provide the detailed information transplant centers need for evaluation.',
  },
  cardiac_eval: {
    title: 'Cardiac Evaluation',
    description: '12-lead ECG for all candidates, stress testing especially for diabetics and those over 50',
    requests: [
      '12-lead ECG',
      'Preferably both: PDF image and Raw waveform file (if available)',
      'Stress test report',
      'Narrative interpretation',
      'Exercise tolerance (METs)',
      'Ischemia findings',
      'Cardiology clearance note',
      'Explicit statement: "Cleared for transplant evaluation"',
      'Echocardiogram report (if performed)',
    ],
    why: 'Transplant centers often reject summaries and want the original cardiology interpretation.\n\n"The heart is deceitful above all things… who can understand it?" (Jeremiah 17:9)',
  },
  cancer_screening: {
    title: 'Cancer Screening',
    description: 'Colonoscopy for age over 50, PSA for men over 45, age-appropriate screenings',
    requests: [
      'Procedure report (not just pathology)',
      'Colonoscopy findings',
      'Completeness of exam',
      'Bowel prep adequacy',
      'Pathology reports',
      'Polyp histology, margins, staging if relevant',
      'PSA lab reports (actual values + dates)',
      'Imaging reports (mammogram, CT, etc. if applicable)',
    ],
    why: 'Ask explicitly for pathology PDFs — these are often stored separately and forgotten.\n\n"Bring the cloak… and the books, especially the parchments." (2 Timothy 4:13)',
  },
  pulmonary_tests: {
    title: 'Pulmonary Function Tests',
    description: 'Lung capacity and respiratory evaluation',
    requests: [
      'Full PFT report',
      'FEV1, FVC, DLCO, ratios',
      'Pre/post bronchodilator results',
      'Pulmonologist interpretation',
      'Any clearance letter if required',
    ],
    why: 'Numbers alone are insufficient — interpretation matters for transplant risk stratification.',
  },
  psychosocial_eval: {
    title: 'Psychosocial Evaluation',
    description: 'Assessment by social worker and transplant coordinator covering adherence potential, social support, financial clearance',
    requests: [
      'Psychosocial assessment note',
      'Adherence assessment',
      'Social support summary',
      'Transportation plan',
      'Housing stability',
      'Financial clearance documentation',
      'Insurance verification',
      'Coverage limits',
      'Coordinator contact info',
      'Explicit statement of psychosocial clearance (if given)',
    ],
    why: 'Comprehensive psychosocial documentation helps transplant centers assess readiness and support systems.',
  },
};

export const ChecklistDocumentsScreen = ({
  checklistItem,
  onNavigateBack,
}: ChecklistDocumentsScreenProps) => {
  const content = DOCUMENTS_CONTENT[checklistItem.id];

  if (!content) {
    return (
      <SafeAreaView className={layout.container.default}>
        <NavigationBar onBack={onNavigateBack} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className={combineClasses(typography.h5, 'mb-2 text-center')}>
            Document Information Not Available
          </Text>
          <Text className={combineClasses(typography.body.small, 'text-center text-gray-600')}>
            Document request information for this checklist item is not available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={layout.container.default}>
      <NavigationBar onBack={onNavigateBack} />
      <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-2">
          {/* Header */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h3, 'mb-2')}>
              {content.title}
            </Text>
            <Text className={combineClasses(typography.body.small, 'text-gray-600')}>
              {content.description}
            </Text>
          </View>

          {/* Patient Should Request */}
          <View className={combineClasses(cards.colored.blue, 'mb-6')}>
            <Text className={combineClasses(typography.h5, 'mb-3 text-blue-900')}>
              Patient should request:
            </Text>
            <View className="space-y-2">
              {content.requests.map((request, index) => (
                <View key={index} className="flex-row">
                  <Text className="mr-2 text-blue-800">•</Text>
                  <Text
                    className={combineClasses(
                      typography.body.small,
                      'flex-1 leading-6 text-blue-800'
                    )}>
                    {request}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Special Note (if exists) */}
          {content.specialNote && (
            <View className={combineClasses(cards.colored.amber, 'mb-6')}>
              <Text className={combineClasses(typography.h5, 'mb-2 text-amber-900')}>
                Special Note
              </Text>
              <Text className={combineClasses(typography.body.small, 'leading-6 text-amber-800')}>
                {content.specialNote}
              </Text>
            </View>
          )}

          {/* Why This Matters */}
          <View className={combineClasses(cards.colored.green, 'mb-6')}>
            <Text className={combineClasses(typography.h5, 'mb-2 text-green-900')}>
              Why this matters:
            </Text>
            <Text className={combineClasses(typography.body.small, 'leading-6 text-green-800')}>
              {content.why}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

