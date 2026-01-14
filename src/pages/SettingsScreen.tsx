import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { buttons, typography, combineClasses, layout, cards } from '../styles/theme';
import { NavigationBar } from '../components/NavigationBar';
import { PathwayBackground } from '../components/PathwayBackground';
import { apiService, PatientStatus } from '../services/api';
import { getWebPadding } from '../utils/webStyles';

type SettingsScreenProps = {
  patientName: string;
  onViewResults?: () => void;
  onViewChecklist?: () => void;
  onNavigateToQuestionnaire?: () => void;
  onNavigateToFinancialAssessment?: () => void;
  onDeletePatient?: () => void;
  onDeletePatientConfirmed?: () => Promise<void>; // For web modal
  onExportData?: () => void;
};

export const SettingsScreen = ({
  patientName,
  onViewResults,
  onViewChecklist,
  onNavigateToQuestionnaire,
  onNavigateToFinancialAssessment,
  onDeletePatient,
  onDeletePatientConfirmed,
  onExportData,
}: SettingsScreenProps) => {
  const [patientStatus, setPatientStatus] = useState<PatientStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [questionnaireCompleted, setQuestionnaireCompleted] = useState(false);
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
    fetchPatientStatus();
    fetchQuestionnaire();
  }, []);

  const fetchPatientStatus = async () => {
    setIsLoading(true);
    try {
      const status = await apiService.getPatientStatus();
      setPatientStatus(status);
    } catch (error: any) {
      if (!error.message?.includes('404') && !error.message?.includes('not found')) {
        console.error('Error fetching patient status:', error);
      }
      setPatientStatus(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchQuestionnaire = async () => {
    try {
      const questionnaire = await apiService.getQuestionnaire();
      setQuestionnaireCompleted(!!questionnaire);
    } catch (error) {
      setQuestionnaireCompleted(false);
    }
  };

  const currentStage = (patientStatus?.pathway_stage as string) || 'identification';

  const handleDeletePress = () => {
    if (Platform.OS === 'web') {
      // Show web modal
      setShowDeleteModal(true);
    } else {
      // Use native Alert on iOS/Android
      if (onDeletePatient) {
        onDeletePatient();
      }
    }
  };

  const handleConfirmDelete = async () => {
    setShowDeleteModal(false);
    // On web, use the confirmed handler directly (bypasses Alert)
    if (Platform.OS === 'web' && onDeletePatientConfirmed) {
      await onDeletePatientConfirmed();
    } else if (onDeletePatient) {
      // On native, this will trigger the Alert
      onDeletePatient();
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  return (
    <LinearGradient
      colors={['#90dcb5', '#57a67f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}>
      <PathwayBackground opacity={0.15} animate={false} />
      <SafeAreaView className="flex-1">
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
              <Text className={combineClasses(typography.h2, 'mb-6 text-white shadow')}>
                Account
              </Text>
              <View className="h-1 w-16 rounded-full bg-white shadow" />
            </View>

            {/* Patient Info */}
            <View className="mb-8">
              <View className={combineClasses(cards.default.container, 'mb-4 bg-white/95')}>
                <Text className={combineClasses(typography.body.small, 'mb-2 text-gray-500')}>
                  Patient Name
                </Text>
                <Text
                  className={combineClasses(typography.body.large, 'font-semibold text-blue-900')}>
                  {patientName}
                </Text>
              </View>
              <View className={combineClasses(cards.default.container, 'bg-white/95')}>
                <Text className={combineClasses(typography.body.small, 'mb-2 text-gray-500')}>
                  Current Pathway Stage
                </Text>
                <Text
                  className={combineClasses(
                    typography.body.large,
                    'font-semibold capitalize text-blue-900'
                  )}>
                  {currentStage.replace('-', ' ')}
                </Text>
              </View>
            </View>

            {/* Actions */}
            <View className="mb-8">
              <Text className={combineClasses(typography.h5, 'mb-4 text-left text-white shadow')}>
                Actions
              </Text>
              <View className="gap-3">
                {onExportData && (
                  <TouchableOpacity
                    className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
                    onPress={onExportData}
                    activeOpacity={0.8}>
                    <Text className={buttons.primary.text}>Export Data</Text>
                  </TouchableOpacity>
                )}

                {onNavigateToFinancialAssessment && (
                  <TouchableOpacity
                    className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
                    onPress={onNavigateToFinancialAssessment}
                    activeOpacity={0.8}>
                    <Text className={buttons.primary.text}>Financial Assessment</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Danger Zone */}
            {onDeletePatient && (
              <View className="mb-6">
                <Text className={combineClasses(typography.h5, 'mb-4 text-left text-white shadow')}>
                  Danger Zone
                </Text>
                <TouchableOpacity
                  className={combineClasses(buttons.danger.base, buttons.danger.enabled)}
                  onPress={handleDeletePress}
                  activeOpacity={0.8}>
                  <Text className={buttons.danger.text}>Delete Patient Data</Text>
                </TouchableOpacity>
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* Web Delete Confirmation Modal */}
      {Platform.OS === 'web' && (
        <Modal
          visible={showDeleteModal}
          transparent={true}
          animationType="fade"
          onRequestClose={handleCancelDelete}>
          <View className="flex-1 items-center justify-center bg-black/50 px-4 py-8">
            <View
              className={combineClasses(cards.default.elevated, 'w-full max-w-md p-6')}
              style={{ maxHeight: '80%' }}>
              {/* Modal Header */}
              <View className="mb-4">
                <Text className={combineClasses(typography.h4, 'mb-2 text-red-600')}>
                  Delete Patient Data
                </Text>
                <Text className={combineClasses(typography.body.medium, 'leading-6 text-gray-700')}>
                  Are you sure you want to delete all patient data? This action cannot be undone.
                </Text>
              </View>

              {/* Modal Actions */}
              <View className="mt-6 flex-row gap-3">
                <TouchableOpacity
                  className={combineClasses(
                    buttons.outline.base,
                    buttons.outline.enabled,
                    'flex-1'
                  )}
                  onPress={handleCancelDelete}
                  activeOpacity={0.8}>
                  <Text className={buttons.outline.text}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className={combineClasses(buttons.danger.base, buttons.danger.enabled, 'flex-1')}
                  onPress={handleConfirmDelete}
                  activeOpacity={0.8}>
                  <Text className={buttons.danger.text}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
