import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { cards, typography, combineClasses, layout } from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { apiService, TransplantChecklist, ChecklistItem } from '../../services/api';

type ChecklistTimelineScreenProps = {
  onNavigateToHome?: () => void;
  onEditItem?: (itemId: string, item: ChecklistItem) => void;
};

export const ChecklistTimelineScreen = ({
  onNavigateToHome,
  onEditItem,
}: ChecklistTimelineScreenProps) => {
  const [checklist, setChecklist] = useState<TransplantChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChecklist();
  }, []);

  const fetchChecklist = async () => {
    setIsLoading(true);
    try {
      const checklistData = await apiService.getChecklist();
      setChecklist(checklistData);
    } catch (error: any) {
      console.error('Error fetching checklist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !checklist) {
    return (
      <SafeAreaView className={layout.container.default}>
        <NavigationBar onBack={onNavigateToHome} />
        <View className="flex-1 items-center justify-center">
          <Text>Loading checklist...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Sort items by order
  const sortedItems = [...checklist.items].sort((a, b) => a.order - b.order);
  const completedSteps = sortedItems.filter((item) => item.is_complete).length;
  const totalSteps = sortedItems.length;
  const currentStepIndex = sortedItems.findIndex((item) => !item.is_complete);
  const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : totalSteps;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <SafeAreaView className={layout.container.default}>
      <NavigationBar onBack={onNavigateToHome} />
      <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-2">
          {/* Header */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h3, 'mb-2')}>Pre-Transplant Checklist</Text>
            <Text className={combineClasses(typography.body.small, 'text-gray-600')}>
              Track your progress through required evaluations and tests
            </Text>
          </View>

          {/* Progress Summary */}
          <View className={combineClasses(cards.colored.blue, 'mb-8')}>
            <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>
              Overall Progress
            </Text>
            <Text className={combineClasses(typography.body.small, 'mb-3 text-blue-800')}>
              {completedSteps} of {totalSteps} steps completed
            </Text>
            {/* Progress Bar */}
            <View className="h-3 w-full rounded-full bg-white/50">
              <View
                className="h-full rounded-full bg-blue-600"
                style={{ width: `${progressPercentage}%` }}
              />
            </View>
            <Text className={combineClasses(typography.body.small, 'mt-2 text-blue-800')}>
              {progressPercentage}% Complete
            </Text>
          </View>

          {/* Timeline Items */}
          <View className="mb-8">
            {sortedItems.map((item, index) => {
              const isCurrent = item.order === currentStep;
              const isComplete = item.is_complete;

              return (
                <View key={item.id} className="mb-6">
                  {/* Timeline Line */}
                  {index < sortedItems.length - 1 && (
                    <View
                      className={combineClasses(
                        'absolute left-6 top-12 w-0.5',
                        isComplete ? 'bg-green-500' : 'bg-gray-300'
                      )}
                      style={{ height: 80 }}
                    />
                  )}

                  {/* Timeline Item */}
                  <View className="flex-row">
                    {/* Timeline Dot */}
                    <View className="mr-4">
                      <View
                        className={combineClasses(
                          'h-12 w-12 items-center justify-center rounded-full border-2',
                          isComplete
                            ? 'border-green-500 bg-green-100'
                            : isCurrent
                              ? 'border-blue-500 bg-blue-100'
                              : 'border-gray-300 bg-gray-100'
                        )}>
                        {isComplete ? (
                          <Text className="text-xl text-green-700">✓</Text>
                        ) : (
                          <Text
                            className={combineClasses(
                              'text-lg font-semibold',
                              isCurrent ? 'text-blue-700' : 'text-gray-500'
                            )}>
                            {item.order}
                          </Text>
                        )}
                      </View>
                    </View>

                    {/* Content Card */}
                    <View className="flex-1">
                      <TouchableOpacity
                        onPress={() => onEditItem?.(item.id, item)}
                        activeOpacity={0.7}
                        className={combineClasses(
                          cards.default.container,
                          isCurrent ? 'border-l-4 border-blue-500' : '',
                          isComplete ? 'bg-green-50' : ''
                        )}>
                        <View className="mb-2 flex-row items-center justify-between">
                          <Text
                            className={combineClasses(
                              typography.h5,
                              isComplete ? 'text-green-900' : isCurrent ? 'text-blue-900' : ''
                            )}>
                            {item.title}
                          </Text>
                        </View>

                        {item.description && (
                          <Text
                            className={combineClasses(
                              typography.body.small,
                              'mb-3 leading-6',
                              isComplete ? 'text-green-800' : 'text-gray-700'
                            )}>
                            {item.description}
                          </Text>
                        )}

                        {item.notes && (
                          <View className="mb-3 rounded-lg bg-white/70 p-3">
                            <Text
                              className={combineClasses(
                                typography.body.small,
                                'font-semibold text-gray-900'
                              )}>
                              Your Notes:
                            </Text>
                            <Text
                              className={combineClasses(
                                typography.body.small,
                                'mt-1 text-gray-700'
                              )}>
                              {item.notes}
                            </Text>
                          </View>
                        )}

                        {item.completed_at && (
                          <Text className={combineClasses(typography.body.small, 'text-green-700')}>
                            Completed: {new Date(item.completed_at).toLocaleDateString()}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Information Card */}
          <View className={combineClasses(cards.colored.amber, 'mb-6')}>
            <Text className={combineClasses(typography.h5, 'mb-2 text-amber-900')}>
              About This Checklist
            </Text>
            <Text className={combineClasses(typography.body.small, 'leading-6 text-amber-800')}>
              This checklist helps you track the evaluations and tests typically required before
              transplant listing. You can mark items as complete, add notes about where records are
              stored, and see your overall progress. Work with your transplant team to ensure all
              required evaluations are completed.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
