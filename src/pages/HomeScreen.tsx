import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  buttons,
  typography,
  dividers,
  decorative,
  cards,
  combineClasses,
  layout,
} from '../styles/theme';
import { apiService, PatientStatus, TransplantChecklist } from '../services/api';

type ChecklistSummary = {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  currentStepTitle: string;
  progressPercentage: number;
};

type HomeScreenProps = {
  patientName: string;
  onViewResults?: () => void;
  onViewChecklist?: () => void;
  onNavigateToQuestionnaire?: () => void;
  onNavigateToExamples?: () => void;
  onDeletePatient?: () => void;
};

export const HomeScreen = ({
  patientName,
  onViewResults,
  onViewChecklist,
  onNavigateToQuestionnaire,
  onNavigateToExamples,
  onDeletePatient,
}: HomeScreenProps) => {
  const [patientStatus, setPatientStatus] = useState<PatientStatus | null>(null);
  const [checklist, setChecklist] = useState<ChecklistSummary | null>(null);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [isLoadingChecklist, setIsLoadingChecklist] = useState(true);

  useEffect(() => {
    fetchPatientStatus();
    fetchChecklist();
  }, []);

  const fetchPatientStatus = async () => {
    setIsLoadingStatus(true);
    try {
      const status = await apiService.getPatientStatus();
      setPatientStatus(status);
    } catch (error: any) {
      // If status not found (404), that's okay - patient hasn't completed questionnaire yet
      if (error.message?.includes('404') || error.message?.includes('not found')) {
        setPatientStatus(null);
      } else {
        console.error('Error fetching patient status:', error);
      }
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const fetchChecklist = async () => {
    setIsLoadingChecklist(true);
    try {
      const checklistData = await apiService.getChecklist();
      const sortedItems = [...checklistData.items].sort((a, b) => a.order - b.order);
      const completedSteps = sortedItems.filter((item) => item.is_complete).length;
      const totalSteps = sortedItems.length;
      const currentStepIndex = sortedItems.findIndex((item) => !item.is_complete);
      const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : totalSteps;
      const currentStepItem = sortedItems.find((item) => item.order === currentStep);

      setChecklist({
        currentStep,
        totalSteps,
        completedSteps,
        currentStepTitle: currentStepItem?.title || 'All Complete',
        progressPercentage: Math.round((completedSteps / totalSteps) * 100),
      });
    } catch (error: any) {
      console.error('Error fetching checklist:', error);
      setChecklist(null);
    } finally {
      setIsLoadingChecklist(false);
    }
  };
  return (
    <SafeAreaView className={layout.container.default}>
      <ScrollView
        className={layout.scrollView}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}>
        <View className="flex-1 items-center justify-center px-6 py-12">
          {/* Decorative Circle Elements - Using predefined styles */}
          <View
            className={combineClasses(
              decorative.circles.small,
              decorative.circles.green,
              'absolute right-10 top-20'
            )}
          />
          <View
            className={combineClasses(
              decorative.circles.medium,
              decorative.circles.orange,
              'absolute bottom-40 left-8'
            )}
          />

          {/* Main Content */}
          <View className="items-left w-full">
            {/* Welcome Text - Using typography styles */}
            <Text className={combineClasses(typography.h1, 'mb-1 text-left')}>Welcome</Text>

            {/* Name Display */}
            <View className="mb-6">
              <Text className="text-left text-3xl font-normal text-neutral-500">
                {patientName || 'Friend'}
              </Text>
            </View>

            {/* Transplant Status Card */}
            {!isLoadingStatus && patientStatus && onViewResults && (
              <TouchableOpacity
                className={combineClasses(
                  cards.default.container,
                  'mb-6 w-full',
                  patientStatus.has_absolute
                    ? 'border-l-4 border-red-500'
                    : patientStatus.has_relative
                      ? 'border-l-4 border-yellow-500'
                      : 'border-l-4 border-green-500'
                )}
                onPress={onViewResults}
                activeOpacity={0.7}>
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className={combineClasses(typography.h5, 'font-semibold')}>
                    Transplant Status
                  </Text>
                  <Text className="text-lg">→</Text>
                </View>
                {patientStatus.has_absolute ? (
                  <View>
                    <Text className={combineClasses(typography.body.small, 'mb-1 text-red-700')}>
                      ⚠️ Absolute contraindications identified
                    </Text>
                    <Text className="text-xs text-gray-600">
                      {patientStatus.absolute_contraindications.length} condition(s) require
                      discussion with your care team
                    </Text>
                  </View>
                ) : patientStatus.has_relative ? (
                  <View>
                    <Text className={combineClasses(typography.body.small, 'mb-1 text-yellow-700')}>
                      ⚠️ Relative contraindications identified
                    </Text>
                    <Text className="text-xs text-gray-600">
                      {patientStatus.relative_contraindications.length} factor(s) may need to be
                      addressed before evaluation
                    </Text>
                  </View>
                ) : (
                  <View>
                    <Text className={combineClasses(typography.body.small, 'mb-1 text-green-700')}>
                      ✓ No contraindications identified
                    </Text>
                    <Text className="text-xs text-gray-600">
                      Based on your assessment, no absolute or relative contraindications were
                      identified
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

            {/* Transplant Checklist Card */}
            {checklist && onViewChecklist && (
              <TouchableOpacity
                className={combineClasses(
                  cards.default.container,
                  'mb-6 w-full border-l-4 border-blue-500'
                )}
                onPress={onViewChecklist}
                activeOpacity={0.7}>
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className={combineClasses(typography.h5, 'font-semibold')}>
                    Transplant Checklist
                  </Text>
                  <Text className="text-lg">→</Text>
                </View>
                <View className="mb-2">
                  <Text className={combineClasses(typography.body.small, 'mb-1 text-blue-700')}>
                    Step {checklist.currentStep} of {checklist.totalSteps}:{' '}
                    {checklist.currentStepTitle}
                  </Text>
                  <Text className="text-xs text-gray-600">
                    {checklist.completedSteps} of {checklist.totalSteps} steps completed (
                    {checklist.progressPercentage}%)
                  </Text>
                </View>
                {/* Progress Bar */}
                <View className="h-2 w-full rounded-full bg-gray-200">
                  <View
                    className="h-full rounded-full bg-blue-500"
                    style={{ width: `${checklist.progressPercentage}%` }}
                  />
                </View>
              </TouchableOpacity>
            )}

            {/* Decorative Divider - Using divider styles */}
            <View className={dividers.full.container}>
              <View className={dividers.horizontal.default} />
              <View className={dividers.dot.container}>
                <View className={dividers.dot.dot} />
              </View>
              <View className={dividers.horizontal.default} />
            </View>

            {/* Action Buttons - Using button styles */}
            <View className="w-full max-w-sm">
              {onNavigateToQuestionnaire && (
                <TouchableOpacity
                  className={combineClasses(buttons.primary.base, buttons.primary.enabled, 'mb-3')}
                  onPress={onNavigateToQuestionnaire}
                  activeOpacity={0.8}>
                  <Text className={buttons.primary.text}>Retake Eligibility Assessment</Text>
                </TouchableOpacity>
              )}

              {onNavigateToExamples && (
                <TouchableOpacity
                  className={combineClasses(buttons.outline.base, buttons.outline.enabled, 'mb-3')}
                  onPress={onNavigateToExamples}
                  activeOpacity={0.8}>
                  <Text className={buttons.outline.text}>View Style Examples</Text>
                </TouchableOpacity>
              )}

              {onDeletePatient && (
                <TouchableOpacity
                  className={combineClasses(buttons.danger.base, buttons.danger.enabled, 'mb-3')}
                  onPress={onDeletePatient}
                  activeOpacity={0.8}>
                  <Text className={buttons.danger.text}>Delete Patient Data</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
