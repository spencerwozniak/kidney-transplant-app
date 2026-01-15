import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, combineClasses, layout, cards, buttons } from '../styles/theme';
import { NavigationBar } from '../components/NavigationBar';
import { PathwayBackground } from '../components/PathwayBackground';
import { apiService, Patient, PatientStatus } from '../services/api';
import { getWebPadding } from '../utils/webStyles';

type ExportScreenProps = {
  onBack: () => void;
  onExportClinicalSummary?: () => void;
  onExportStructuredData?: () => void;
};

export const ExportScreen = ({
  onBack,
  onExportClinicalSummary,
  onExportStructuredData,
}: ExportScreenProps) => {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [patientStatus, setPatientStatus] = useState<PatientStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    setError(null);
    try {
      const [patientData, statusData] = await Promise.all([
        apiService.getPatient().catch(() => null),
        apiService.getPatientStatus().catch(() => null),
      ]);
      setPatient(patientData);
      setPatientStatus(statusData);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err?.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number | null => {
    if (!dateOfBirth) return null;
    try {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch {
      return dateString;
    }
  };

  const formatPathwayStage = (stage: string | undefined): string => {
    if (!stage) return 'Not specified';
    return stage
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
          <NavigationBar onBack={onBack} />
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className={combineClasses(typography.body.medium, 'mt-4 text-white shadow')}>
              Loading your data...
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#90dcb5', '#57a67f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}>
      <PathwayBackground opacity={0.15} animate={false} />
      <SafeAreaView className="flex-1">
        <NavigationBar onBack={onBack} />
        <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
              getWebPadding(24, 32),
            ]}
            className="px-6 py-8">
            {/* Header */}
            <View className="mb-8">
              <Text className={combineClasses(typography.h2, 'mb-3 text-white shadow')}>
                Export Data
              </Text>
              <Text className={combineClasses(typography.body.medium, 'mb-6 text-white/90 shadow')}>
                A structured summary you can take to any provider or transplant center.
              </Text>
              <View className="h-1 w-16 rounded-full bg-white shadow" />
            </View>

            {/* Error State */}
            {error && (
              <View className={combineClasses(cards.default.container, 'mb-8 bg-white/95')}>
                <Text className={combineClasses(typography.h5, 'mb-2 text-red-900')}>Error</Text>
                <Text className={combineClasses(typography.body.small, 'leading-6 text-red-800')}>
                  {error}
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            <View className="mb-8">
              <View className="gap-3">
                {onExportClinicalSummary && (
                  <TouchableOpacity
                    className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
                    onPress={onExportClinicalSummary}
                    activeOpacity={0.8}>
                    <Text className={buttons.outline.text}>Export Clinical Summary</Text>
                  </TouchableOpacity>
                )}

                {onExportStructuredData && (
                  <TouchableOpacity
                    className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
                    onPress={onExportStructuredData}
                    activeOpacity={0.8}>
                    <Text className={buttons.outline.text}>Export Structured Data</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Clinical Summary - Human Readable */}
            {patient && patientStatus && (
              <View className={combineClasses(cards.default.container, 'mb-8 bg-white/95')}>
                <Text className={combineClasses(typography.h5, 'mb-6 text-blue-900')}>
                  Transplant Evaluation Summary
                </Text>

                {/* Patient */}
                <View className="mb-4">
                  <Text
                    className={combineClasses(
                      typography.body.small,
                      'mb-2 font-semibold text-gray-700'
                    )}>
                    Patient
                  </Text>
                  <Text className={combineClasses(typography.body.medium, 'text-blue-900')}>
                    {patient.sex
                      ? patient.sex.charAt(0).toUpperCase() + patient.sex.slice(1)
                      : 'N/A'}
                    , {calculateAge(patient.date_of_birth) || 'N/A'} years old
                  </Text>
                  {patient.has_ckd_esrd && (
                    <Text className={combineClasses(typography.body.small, 'mt-1 text-blue-800')}>
                      ESRD (CKD stage confirmed)
                    </Text>
                  )}
                </View>

                {/* Current Pathway Stage */}
                <View className="mb-4">
                  <Text
                    className={combineClasses(
                      typography.body.small,
                      'mb-2 font-semibold text-gray-700'
                    )}>
                    Current Pathway Stage
                  </Text>
                  <Text className={combineClasses(typography.body.medium, 'text-blue-900')}>
                    {formatPathwayStage(patientStatus.pathway_stage)}
                  </Text>
                </View>

                {/* Key Observations */}
                {(patient.height || patient.weight || patient.last_gfr) && (
                  <View className="mb-4">
                    <Text
                      className={combineClasses(
                        typography.body.small,
                        'mb-2 font-semibold text-gray-700'
                      )}>
                      Key Observations
                    </Text>
                    <View className="space-y-1">
                      {patient.height && (
                        <Text className={combineClasses(typography.body.small, 'text-blue-900')}>
                          Height: {patient.height} cm
                        </Text>
                      )}
                      {patient.weight && (
                        <Text className={combineClasses(typography.body.small, 'text-blue-900')}>
                          Weight: {patient.weight} kg
                        </Text>
                      )}
                      {patient.last_gfr && (
                        <Text className={combineClasses(typography.body.small, 'text-blue-900')}>
                          GFR: {patient.last_gfr} mL/min/1.73m²
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Contraindication Screening */}
                <View className="mb-4">
                  <Text
                    className={combineClasses(
                      typography.body.small,
                      'mb-2 font-semibold text-gray-700'
                    )}>
                    Contraindication Screening
                  </Text>
                  {patientStatus.has_absolute || patientStatus.has_relative ? (
                    <View className="space-y-1">
                      {patientStatus.has_absolute && (
                        <Text className={combineClasses(typography.body.small, 'text-red-800')}>
                          Absolute contraindications identified (
                          {patientStatus.absolute_contraindications.length})
                        </Text>
                      )}
                      {patientStatus.has_relative && (
                        <Text className={combineClasses(typography.body.small, 'text-yellow-800')}>
                          Relative contraindications identified (
                          {patientStatus.relative_contraindications.length})
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text className={combineClasses(typography.body.small, 'text-green-800')}>
                      No active contraindications identified
                    </Text>
                  )}
                </View>

                {/* Last Update */}
                <View>
                  <Text
                    className={combineClasses(
                      typography.body.small,
                      'mb-2 font-semibold text-gray-700'
                    )}>
                    Last Update
                  </Text>
                  <Text className={combineClasses(typography.body.small, 'text-blue-900')}>
                    {formatDate(patientStatus.updated_at)}
                  </Text>
                </View>
              </View>
            )}
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
