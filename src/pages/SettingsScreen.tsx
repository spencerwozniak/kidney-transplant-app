import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buttons, typography, combineClasses, layout } from '../styles/theme';
import { apiService, PatientStatus } from '../services/api';

type SettingsScreenProps = {
  patientName: string;
  onViewResults?: () => void;
  onViewChecklist?: () => void;
  onNavigateToQuestionnaire?: () => void;
  onNavigateToFinancialAssessment?: () => void;
  onDeletePatient?: () => void;
};

export const SettingsScreen = ({
  patientName,
  onViewResults,
  onViewChecklist,
  onNavigateToQuestionnaire,
  onNavigateToFinancialAssessment,
  onDeletePatient,
}: SettingsScreenProps) => {
  const [patientStatus, setPatientStatus] = useState<PatientStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchPatientStatus();
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

  const currentStage = (patientStatus?.pathway_stage as string) || 'identification';
  return (
    <SafeAreaView className={layout.container.default}>
      <ScrollView
        className={layout.scrollView}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}>
        <View className="flex-1 px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h2, 'mb-2 text-left')}>Settings</Text>
            <Text className={combineClasses(typography.body.medium, 'text-left text-gray-600')}>
              Manage your account and preferences
            </Text>
          </View>

          {/* Patient Info */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h5, 'mb-4 text-left')}>Account</Text>
            <View className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
              <Text className={combineClasses(typography.body.small, 'mb-1 text-gray-500')}>
                Patient Name
              </Text>
              <Text className={combineClasses(typography.body.large, 'font-semibold')}>
                {patientName}
              </Text>
            </View>
            <View className="rounded-2xl bg-white p-4 shadow-sm">
              <Text className={combineClasses(typography.body.small, 'mb-1 text-gray-500')}>
                Current Pathway Stage
              </Text>
              <Text className={combineClasses(typography.body.large, 'font-semibold capitalize')}>
                {currentStage.replace('-', ' ')}
              </Text>
            </View>
          </View>

          {/* Actions */}
          <View className="mb-6">
            <Text className={combineClasses(typography.h5, 'mb-4 text-left')}>Actions</Text>
            <View className="gap-3">
              {currentStage === 'identification' && onNavigateToQuestionnaire && (
                <TouchableOpacity
                  className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
                  onPress={onNavigateToQuestionnaire}
                  activeOpacity={0.8}>
                  <Text className={buttons.primary.text}>Begin Eligibility Assessment</Text>
                </TouchableOpacity>
              )}

              {currentStage === 'evaluation' && onViewChecklist && (
                <TouchableOpacity
                  className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
                  onPress={onViewChecklist}
                  activeOpacity={0.8}>
                  <Text className={buttons.primary.text}>View Evaluation Checklist</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
                onPress={onViewResults}
                activeOpacity={0.8}
                disabled={!onViewResults}>
                <Text className={buttons.outline.text}>View Transplant Status</Text>
              </TouchableOpacity>

              {onNavigateToFinancialAssessment && (
                <TouchableOpacity
                  className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
                  onPress={onNavigateToFinancialAssessment}
                  activeOpacity={0.8}>
                  <Text className={buttons.outline.text}>Financial Assessment</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Danger Zone */}
          {onDeletePatient && (
            <View className="mb-6">
              <Text className={combineClasses(typography.h5, 'mb-4 text-left text-red-600')}>
                Danger Zone
              </Text>
              <TouchableOpacity
                className={combineClasses(buttons.danger.base, buttons.danger.enabled)}
                onPress={onDeletePatient}
                activeOpacity={0.8}>
                <Text className={buttons.danger.text}>Delete Patient Data</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

