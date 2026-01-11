import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView } from 'react-native';
import {
  cards,
  typography,
  progress as progressStyles,
  combineClasses,
  layout,
} from '../styles/theme';
import { NavigationBar } from '../components/NavigationBar';
import { apiService, PatientStatus, Patient, QuestionnaireSubmission } from '../services/api';

type ResultsDetailScreenProps = {
  onNavigateToHome?: () => void;
};

export const ResultsDetailScreen = ({ onNavigateToHome }: ResultsDetailScreenProps) => {
  const [patientStatus, setPatientStatus] = useState<PatientStatus | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [status, patientData, questionnaireData] = await Promise.all([
        apiService.getPatientStatus(),
        apiService.getPatient(),
        apiService.getQuestionnaire().catch(() => null), // Questionnaire might not exist yet
      ]);
      setPatientStatus(status);
      setPatient(patientData);
      setQuestionnaire(questionnaireData);
    } catch (error: any) {
      console.error('Error fetching data:', error);
      // If status not found, show error message
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className={layout.container.default}>
        <NavigationBar onBack={onNavigateToHome} />
        <View className="flex-1 items-center justify-center">
          <Text>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!patientStatus || !patient) {
    return (
      <SafeAreaView className={layout.container.default}>
        <NavigationBar onBack={onNavigateToHome} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className={combineClasses(typography.h5, 'mb-2 text-center')}>
            No Status Available
          </Text>
          <Text className={combineClasses(typography.body.small, 'text-center text-gray-600')}>
            Please complete the eligibility assessment to view your transplant status.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const results = {
    hasAbsolute: patientStatus.has_absolute,
    hasRelative: patientStatus.has_relative,
    absoluteContraindications: patientStatus.absolute_contraindications,
    relativeContraindications: patientStatus.relative_contraindications,
  };

  const hasCKDESRD = patient.has_ckd_esrd === true;
  const gfr = patient.last_gfr;

  return (
    <SafeAreaView className={layout.container.default}>
      <NavigationBar onBack={onNavigateToHome} />
      <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-2">
          {/* Header */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h3, 'mb-2')}>Transplant Status</Text>
            <View className={progressStyles.indicator} />
          </View>

          {/* Qualification Status */}
          <View className="mb-8">
            {hasCKDESRD ? (
              <View className={cards.colored.green}>
                <Text className={combineClasses(typography.h5, 'mb-2 text-green-900')}>
                  ✓ Qualifies for Transplant Evaluation
                </Text>
                <Text className={combineClasses(typography.body.small, 'leading-6 text-green-800')}>
                  You have been diagnosed with Chronic Kidney Disease (CKD) or End-Stage Renal
                  Disease (ESRD), which qualifies you for kidney transplant evaluation.
                </Text>
              </View>
            ) : (
              <View className={cards.colored.blue}>
                <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>
                  Qualification Status
                </Text>
                <Text className={combineClasses(typography.body.small, 'leading-6 text-blue-800')}>
                  You have not been diagnosed with CKD or ESRD. Kidney transplant evaluation is
                  typically for patients with advanced kidney disease. Please discuss with your
                  healthcare provider if you have concerns about your kidney function.
                </Text>
              </View>
            )}
          </View>

          {/* GFR Information */}
          {gfr !== undefined && gfr !== null && (
            <View className={combineClasses(cards.colored.blue, 'mb-8')}>
              <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>
                Glomerular Filtration Rate (GFR)
              </Text>
              <Text
                className={combineClasses(
                  typography.body.large,
                  'mb-2 font-semibold text-blue-900'
                )}>
                {gfr} mL/min/1.73m²
              </Text>
              <Text className={combineClasses(typography.body.small, 'leading-6 text-blue-800')}>
                {gfr >= 90
                  ? 'Your GFR indicates normal or high kidney function.'
                  : gfr >= 60
                    ? 'Your GFR indicates mildly decreased kidney function (Stage 2 CKD).'
                    : gfr >= 45
                      ? 'Your GFR indicates mildly to moderately decreased kidney function (Stage 3a CKD).'
                      : gfr >= 30
                        ? 'Your GFR indicates moderately to severely decreased kidney function (Stage 3b CKD).'
                        : gfr >= 15
                          ? 'Your GFR indicates severely decreased kidney function (Stage 4 CKD).'
                          : 'Your GFR indicates kidney failure (Stage 5 CKD/ESRD).'}
              </Text>
            </View>
          )}

          {/* Absolute Contraindications */}
          <View className="mb-8">
            {results.hasAbsolute ? (
              <View className={cards.colored.red}>
                <Text className={combineClasses(typography.h5, 'mb-3 text-red-900')}>
                  Absolute Contraindications
                </Text>
                <Text
                  className={combineClasses(typography.body.small, 'mb-4 leading-6 text-red-800')}>
                  The following conditions were identified:
                </Text>
                <View className="mb-4 space-y-2">
                  {results.absoluteContraindications.map((q) => (
                    <View key={q.id} className="rounded-lg bg-white/50 p-3">
                      <Text
                        className={combineClasses(
                          typography.body.small,
                          'font-semibold text-red-900'
                        )}>
                        • {q.question}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text
                  className={combineClasses(
                    typography.body.small,
                    'font-semibold leading-6 text-red-900'
                  )}>
                  Please discuss these with your care team. Patients with these conditions should
                  not be referred for transplant evaluation at this time.
                </Text>
              </View>
            ) : (
              <View className={cards.colored.green}>
                <Text className={combineClasses(typography.h5, 'mb-2 text-green-900')}>
                  ✓ No Absolute Contraindications
                </Text>
                <Text className={combineClasses(typography.body.small, 'leading-6 text-green-800')}>
                  Based on your responses, no absolute contraindications were identified.
                </Text>
              </View>
            )}
          </View>

          {/* Relative Contraindications */}
          <View className="mb-8">
            {results.hasRelative ? (
              <View className={cards.colored.yellow}>
                <Text className={combineClasses(typography.h5, 'mb-3 text-yellow-900')}>
                  Relative Contraindications
                </Text>
                <Text
                  className={combineClasses(
                    typography.body.small,
                    'mb-4 leading-6 text-yellow-800'
                  )}>
                  The following factors may need to be addressed:
                </Text>
                <View className="mb-4 space-y-2">
                  {results.relativeContraindications.map((q) => (
                    <View key={q.id} className="rounded-lg bg-white/50 p-3">
                      <Text
                        className={combineClasses(
                          typography.body.small,
                          'font-semibold text-yellow-900'
                        )}>
                        • {q.question}
                      </Text>
                    </View>
                  ))}
                </View>
                <Text
                  className={combineClasses(
                    typography.body.small,
                    'font-semibold leading-6 text-yellow-900'
                  )}>
                  These factors can often be addressed with treatment and support. Discuss with your
                  care team to develop a plan.
                </Text>
              </View>
            ) : (
              <View className={cards.colored.green}>
                <Text className={combineClasses(typography.h5, 'mb-2 text-green-900')}>
                  ✓ No Relative Contraindications
                </Text>
                <Text className={combineClasses(typography.body.small, 'leading-6 text-green-800')}>
                  No relative contraindications that need to be addressed were identified.
                </Text>
              </View>
            )}
          </View>

          {/* Age Information - Only show if age_concern is "yes" */}
          {questionnaire?.answers?.age_concern === 'yes' && (
            <View className={combineClasses(cards.colored.blue, 'mb-8')}>
              <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>About Age</Text>
              <Text className={combineClasses(typography.body.small, 'leading-6 text-blue-800')}>
                There is no absolute age limit for kidney transplantation. Advanced age alone is not
                a contraindication. Patients over 70 can receive successful transplants. Your care
                team will evaluate your overall health and fitness, not just your age.
              </Text>
            </View>
          )}

          {/* Next Steps */}
          <View className={combineClasses(cards.default.container, 'mb-6')}>
            <Text className={combineClasses(typography.h5, 'mb-4')}>Next Steps</Text>
            <View className="space-y-3">
              <Text className={combineClasses(typography.body.small, 'leading-6')}>
                1. Review these results with your nephrologist or primary care physician
              </Text>
              <Text className={combineClasses(typography.body.small, 'leading-6')}>
                2. Discuss whether transplant evaluation referral is appropriate for you
              </Text>
              <Text className={combineClasses(typography.body.small, 'leading-6')}>
                3. If you have relative contraindications, work with your care team to address them
              </Text>
              <Text className={combineClasses(typography.body.small, 'leading-6')}>
                4. Remember: This assessment is educational only. Your medical team will make the
                final determination.
              </Text>
            </View>
          </View>

          {/* Disclaimer - Moved to End */}
          <View className={combineClasses(cards.colored.amber, 'mb-8')}>
            <Text className={combineClasses(typography.h5, 'mb-2 text-amber-900')}>
              Important Disclaimer
            </Text>
            <Text className={combineClasses(typography.body.small, 'leading-6 text-amber-800')}>
              This is an educational tool only. It is not a substitute for professional medical
              evaluation. Please discuss your results with your healthcare team.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
