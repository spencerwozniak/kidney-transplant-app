import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  Animated,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  cards,
  typography,
  progress as progressStyles,
  combineClasses,
  layout,
  buttons,
} from '../styles/theme';
import { NavigationBar } from '../components/NavigationBar';
import { PathwayBackground } from '../components/PathwayBackground';
import { apiService, PatientStatus, Patient, QuestionnaireSubmission } from '../services/api';
import { getWebPadding } from '../utils/webStyles';

type ResultsDetailScreenProps = {
  onNavigateToHome?: () => void;
  onNavigateToQuestionnaire?: () => void;
};

export const ResultsDetailScreen = ({
  onNavigateToHome,
  onNavigateToQuestionnaire,
}: ResultsDetailScreenProps) => {
  const [patientStatus, setPatientStatus] = useState<PatientStatus | null>(null);
  const [patient, setPatient] = useState<Patient | null>(null);
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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
      <LinearGradient
        colors={['#90dcb5', '#57a67f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}>
        <PathwayBackground opacity={0.15} animate={false} />
        <SafeAreaView className="flex-1">
          <NavigationBar onBack={onNavigateToHome} />
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className={combineClasses(typography.body.medium, 'mt-4 text-white shadow')}>
              Loading results...
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  if (!patientStatus || !patient) {
    return (
      <LinearGradient
        colors={['#90dcb5', '#57a67f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}>
        <PathwayBackground opacity={0.15} animate={false} />
        <SafeAreaView className="flex-1">
          <NavigationBar onBack={onNavigateToHome} />
          <View className="flex-1 items-center justify-center px-6">
            <Text className={combineClasses(typography.h5, 'mb-2 text-center text-white shadow')}>
              No Status Available
            </Text>
            <Text
              className={combineClasses(typography.body.small, 'text-center text-white/90 shadow')}>
              Please complete the eligibility assessment to view your transplant status.
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
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
  const hasNoQuestionnaires = questionnaire === null;

  return (
    <LinearGradient
      colors={['#90dcb5', '#57a67f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}>
      <PathwayBackground opacity={0.15} animate={false} />
      <SafeAreaView className="flex-1">
        <NavigationBar onBack={onNavigateToHome} />
        <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
              getWebPadding(24, 32), // px-6 py-8
            ]}
            className="px-6 py-8">
            {/* Header */}
            <View className="mb-8">
              <Text className={combineClasses(typography.h2, 'mb-6 text-white shadow')}>
                Transplant Status
              </Text>
              <View className="h-1 w-16 rounded-full bg-white shadow" />
            </View>

            {/* Qualification Status */}
            <View className="mb-8">
              {hasCKDESRD ? (
                <View className={combineClasses(cards.default.container, 'bg-white/95')}>
                  <Text className={combineClasses(typography.h5, 'mb-2 text-green-900')}>
                    ✓ Qualifies for Transplant Evaluation
                  </Text>
                  <Text
                    className={combineClasses(typography.body.small, 'leading-6 text-green-800')}>
                    You have been diagnosed with Chronic Kidney Disease (CKD) or End-Stage Renal
                    Disease (ESRD), which qualifies you for kidney transplant evaluation.
                  </Text>
                </View>
              ) : (
                <View className={combineClasses(cards.default.container, 'bg-white/95')}>
                  <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>
                    Qualification Status
                  </Text>
                  <Text
                    className={combineClasses(typography.body.small, 'leading-6 text-blue-800')}>
                    You have not been diagnosed with CKD or ESRD. Kidney transplant evaluation is
                    typically for patients with advanced kidney disease. Please discuss with your
                    healthcare provider if you have concerns about your kidney function.
                  </Text>
                </View>
              )}
            </View>

            {/* GFR Information */}
            {gfr !== undefined && gfr !== null && (
              <View className={combineClasses(cards.default.container, 'mb-8 bg-white/95')}>
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

            {/* Show button if no questionnaires, otherwise show contraindications and next steps */}
            {!hasNoQuestionnaires && (
              <>
                {/* Absolute Contraindications */}
                <View className="mb-8">
                  {results.hasAbsolute ? (
                    <View className={combineClasses(cards.default.container, 'bg-white/95')}>
                      <Text className={combineClasses(typography.h5, 'mb-3 text-red-900')}>
                        Absolute Contraindications
                      </Text>
                      <Text
                        className={combineClasses(
                          typography.body.small,
                          'mb-4 leading-6 text-red-800'
                        )}>
                        The following conditions were identified:
                      </Text>
                      <View className="mb-4 space-y-2">
                        {results.absoluteContraindications.map((q) => (
                          <View key={q.id} className="rounded-lg bg-red-50 p-3">
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
                        Please discuss these with your care team. Patients with these conditions
                        should not be referred for transplant evaluation at this time.
                      </Text>
                    </View>
                  ) : (
                    <View className={combineClasses(cards.default.container, 'bg-white/95')}>
                      <Text className={combineClasses(typography.h5, 'mb-2 text-green-900')}>
                        ✓ No Absolute Contraindications
                      </Text>
                      <Text
                        className={combineClasses(
                          typography.body.small,
                          'leading-6 text-green-800'
                        )}>
                        Based on your responses, no absolute contraindications were identified.
                      </Text>
                    </View>
                  )}
                </View>

                {/* Relative Contraindications */}
                <View className="mb-8">
                  {results.hasRelative ? (
                    <View className={combineClasses(cards.default.container, 'bg-white/95')}>
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
                          <View key={q.id} className="rounded-lg bg-yellow-50 p-3">
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
                        These factors can often be addressed with treatment and support. Discuss
                        with your care team to develop a plan.
                      </Text>
                    </View>
                  ) : (
                    <View className={combineClasses(cards.default.container, 'bg-white/95')}>
                      <Text className={combineClasses(typography.h5, 'mb-2 text-green-900')}>
                        ✓ No Relative Contraindications
                      </Text>
                      <Text
                        className={combineClasses(
                          typography.body.small,
                          'leading-6 text-green-800'
                        )}>
                        No relative contraindications that need to be addressed were identified.
                      </Text>
                    </View>
                  )}
                </View>

                {/* Age Information - Only show if age_concern is "yes" */}
                {questionnaire?.answers?.age_concern === 'yes' && (
                  <View className={combineClasses(cards.default.container, 'mb-8 bg-white/95')}>
                    <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>
                      About Age
                    </Text>
                    <Text
                      className={combineClasses(typography.body.small, 'leading-6 text-blue-800')}>
                      There is no absolute age limit for kidney transplantation. Advanced age alone
                      is not a contraindication. Patients over 70 can receive successful
                      transplants. Your care team will evaluate your overall health and fitness, not
                      just your age.
                    </Text>
                  </View>
                )}

                {/* Next Steps */}
                <View className={combineClasses(cards.default.container, 'mb-6 bg-white/95')}>
                  <Text className={combineClasses(typography.h5, 'mb-4 text-gray-900')}>
                    Next Steps
                  </Text>
                  <View className="space-y-3">
                    <Text
                      className={combineClasses(typography.body.small, 'leading-6 text-gray-700')}>
                      1. Review these results with your nephrologist or primary care physician
                    </Text>
                    <Text
                      className={combineClasses(typography.body.small, 'leading-6 text-gray-700')}>
                      2. Discuss whether transplant evaluation referral is appropriate for you
                    </Text>
                    <Text
                      className={combineClasses(typography.body.small, 'leading-6 text-gray-700')}>
                      3. If you have relative contraindications, work with your care team to address
                      them
                    </Text>
                    <Text
                      className={combineClasses(typography.body.small, 'leading-6 text-gray-700')}>
                      4. Remember: This assessment is educational only. Your medical team will make
                      the final determination.
                    </Text>
                  </View>
                </View>
              </>
            )}
            <View className="mb-8">
              <View className={combineClasses(cards.default.container, 'bg-white/95')}>
                <Text className={combineClasses(typography.h5, 'mb-4 text-center text-gray-900')}>
                  Complete Eligibility Assessment
                </Text>
                <Text
                  className={combineClasses(
                    typography.body.small,
                    'mb-6 text-center leading-6 text-gray-700'
                  )}>
                  To identify your transplant status and contraindications, please complete the
                  eligibility self-assessment.
                </Text>
                {onNavigateToQuestionnaire && (
                  <TouchableOpacity
                    className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
                    onPress={onNavigateToQuestionnaire}
                    activeOpacity={0.8}>
                    <Text className={buttons.primary.text}>Begin Eligibility Assessment</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
