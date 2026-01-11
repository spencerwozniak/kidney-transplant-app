import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Modal,
  LayoutChangeEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buttons, typography, cards, combineClasses, layout } from '../styles/theme';
import { apiService, PatientStatus, TransplantChecklist } from '../services/api';

export type PathwayStage =
  | 'identification'
  | 'referral'
  | 'evaluation'
  | 'selection'
  | 'transplantation'
  | 'post-transplant';

export type PathwayStageData = {
  id: PathwayStage;
  title: string;
  description: string;
  shortDescription: string;
  icon: string;
  color: string;
  bgColor: string;
};

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

type PathwayScreenProps = {
  patientName: string;
  onViewResults?: () => void;
  onViewChecklist?: () => void;
  onNavigateToQuestionnaire?: () => void;
  onNavigateToFinancialAssessment?: () => void;
  onDeletePatient?: () => void;
  onFindReferral?: () => void;
  onViewReferral?: () => void;
  showActionButtons?: boolean; // For backward compatibility, but won't be used
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9; // 90% of screen width
const CARD_SPACING = 16;
const SNAP_INTERVAL = CARD_WIDTH + CARD_SPACING;

export const PathwayScreen = ({
  patientName,
  onViewResults,
  onViewChecklist,
  onNavigateToQuestionnaire,
  onNavigateToFinancialAssessment,
  onDeletePatient,
  onFindReferral,
  onViewReferral,
}: PathwayScreenProps) => {
  const [patientStatus, setPatientStatus] = useState<PatientStatus | null>(null);
  const [checklist, setChecklist] = useState<TransplantChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<PathwayStageData | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchPathwayData();
  }, []);

  const fetchPathwayData = async () => {
    setIsLoading(true);
    try {
      // Fetch status (includes pathway_stage computed by backend)
      try {
        const status = await apiService.getPatientStatus();
        setPatientStatus(status);
      } catch (error: any) {
        if (!error.message?.includes('404') && !error.message?.includes('not found')) {
          console.error('Error fetching patient status:', error);
        }
        setPatientStatus(null);
      }

      // Fetch checklist (for progress display)
      try {
        const checklistData = await apiService.getChecklist();
        setChecklist(checklistData);
      } catch (error: any) {
        console.error('Error fetching checklist:', error);
        setChecklist(null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Use pathway_stage from backend, default to 'identification' if not available
  const currentStage: PathwayStage =
    (patientStatus?.pathway_stage as PathwayStage) || 'identification';
  const currentStageIndex = PATHWAY_STAGES.findIndex((stage) => stage.id === currentStage);
  // Safety check: if stage not found, default to first stage
  const safeCurrentStageIndex = currentStageIndex >= 0 ? currentStageIndex : 0;

  // Scroll to current stage when data loads
  useEffect(() => {
    if (!isLoading && flatListRef.current) {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: safeCurrentStageIndex,
          animated: false,
        });
        setCurrentIndex(safeCurrentStageIndex);
      }, 100);
    }
  }, [isLoading, safeCurrentStageIndex]);

  const getStageStatus = (stageIndex: number): 'completed' | 'current' | 'upcoming' => {
    if (stageIndex < safeCurrentStageIndex) {
      return 'completed';
    } else if (stageIndex === safeCurrentStageIndex) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };

  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SNAP_INTERVAL);
    setCurrentIndex(index);
  };

  const renderStageCard = ({ item: stage, index }: { item: PathwayStageData; index: number }) => {
    const status = getStageStatus(index);
    const isCompleted = status === 'completed';
    const isCurrent = status === 'current';
    const isUpcoming = status === 'upcoming';

    return (
      <View
        style={{
          width: CARD_WIDTH,
          marginHorizontal: CARD_SPACING / 2,
        }}>
        <TouchableOpacity
          onPress={() => setSelectedStage(stage)}
          activeOpacity={0.9}
          className="flex-1">
          <View
            className={combineClasses(cards.default.elevated, 'flex-1 justify-between p-8')}
            style={{
              borderWidth: isCurrent ? 3 : 1,
              borderColor: isCurrent ? stage.color : isCompleted ? stage.color : '#e5e7eb',
              backgroundColor: isCurrent ? stage.bgColor + '80' : 'white',
              minHeight: 500,
            }}>
            {/* Stage Icon and Title */}
            <View className="mb-6">
              <View className="mb-4 items-center">
                <View
                  className="h-24 w-24 items-center justify-center rounded-full"
                  style={{
                    backgroundColor: isCompleted || isCurrent ? stage.bgColor : '#f3f4f6',
                    borderWidth: 3,
                    borderColor: isCompleted || isCurrent ? stage.color : '#d1d5db',
                  }}>
                  <Text className="text-5xl">{stage.icon}</Text>
                </View>
              </View>

              <Text
                className={combineClasses(
                  typography.h3,
                  'mb-2 text-center',
                  isUpcoming ? 'text-gray-400' : 'text-gray-900'
                )}>
                {stage.title}
              </Text>

              {/* Status Badge */}
              {isCurrent && (
                <View className="mb-4 self-center rounded-full bg-green-100 px-4 py-2">
                  <Text className="text-sm font-semibold text-green-700">Current Stage</Text>
                </View>
              )}
              {isCompleted && (
                <View className="mb-4 self-center rounded-full bg-blue-100 px-4 py-2">
                  <Text className="text-sm font-semibold text-blue-700">Completed</Text>
                </View>
              )}
              {isUpcoming && (
                <View className="mb-4 self-center rounded-full bg-gray-100 px-4 py-2">
                  <Text className="text-sm font-semibold text-gray-600">Upcoming</Text>
                </View>
              )}
            </View>

            {/* Stage Description */}
            <View className="mb-6 flex-1">
              <Text
                className={combineClasses(
                  typography.body.large,
                  'mb-4 text-center leading-7',
                  isUpcoming ? 'text-gray-400' : 'text-gray-700'
                )}>
                {stage.shortDescription}
              </Text>

              <Text
                className={combineClasses(
                  typography.body.medium,
                  'leading-6',
                  isUpcoming ? 'text-gray-400' : 'text-gray-600'
                )}>
                {stage.description}
              </Text>
            </View>

            {/* Progress Indicator for Evaluation Stage Only */}
            {stage.id === 'evaluation' && isCurrent && checklist && (
              <View className="mb-4">
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className="text-sm font-semibold text-gray-700">Evaluation Progress</Text>
                  <Text className="text-sm font-semibold text-gray-700">
                    {Math.round(
                      (checklist.items.filter((item) => item.is_complete).length /
                        checklist.items.length) *
                        100
                    )}
                    %
                  </Text>
                </View>
                <View className="h-3 w-full rounded-full bg-gray-200">
                  <View
                    className="h-full rounded-full"
                    style={{
                      width: `${
                        (checklist.items.filter((item) => item.is_complete).length /
                          checklist.items.length) *
                        100
                      }%`,
                      backgroundColor: stage.color,
                    }}
                  />
                </View>
              </View>
            )}

            {/* Action Button for Evaluation Stage - Only show if current or completed */}
            {stage.id === 'evaluation' && onViewChecklist && (isCurrent || isCompleted) && (
              <View className="mb-4">
                <TouchableOpacity
                  className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
                  onPress={(e) => {
                    e.stopPropagation();
                    onViewChecklist();
                  }}
                  activeOpacity={0.8}>
                  <Text className={buttons.primary.text}>View Checklist</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Action Button for Identification Stage */}
            {stage.id === 'identification' && onViewResults && patientStatus && (
              <View className="mb-4">
                <TouchableOpacity
                  className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
                  onPress={(e) => {
                    e.stopPropagation();
                    onViewResults();
                  }}
                  activeOpacity={0.8}>
                  <Text className={buttons.outline.text}>View Transplant Status</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Action Button for Referral Stage */}
            {stage.id === 'referral' && (
              <View className="mb-4">
                {safeCurrentStageIndex > index && onViewReferral ? (
                  // Past referral stage - show "View Referral" button
                  <TouchableOpacity
                    className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
                    onPress={(e) => {
                      e.stopPropagation();
                      onViewReferral();
                    }}
                    activeOpacity={0.8}>
                    <Text className={buttons.outline.text}>View Referral</Text>
                  </TouchableOpacity>
                ) : (
                  // Current or upcoming referral stage - show "Find a Referral" button
                  onFindReferral && (
                    <TouchableOpacity
                      className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
                      onPress={(e) => {
                        e.stopPropagation();
                        onFindReferral();
                      }}
                      activeOpacity={0.8}>
                      <Text className={buttons.primary.text}>Find a Referral</Text>
                    </TouchableOpacity>
                  )
                )}
              </View>
            )}

            {/* Stage Number Indicator */}
            <View className="mt-4 items-center">
              <Text className="text-xs text-gray-400">
                Stage {index + 1} of {PATHWAY_STAGES.length}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className={layout.container.default}>
        <View className="flex-1 items-center justify-center">
          <Text className={typography.body.medium}>Loading pathway...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={layout.container.default}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pb-2 pt-12 ">
          <Text className={combineClasses(typography.h2, 'mb-1 text-center')}>
            Your Transplant Pathway
          </Text>
          <Text className={combineClasses(typography.body.small, 'text-center text-gray-500')}>
            Swipe left or right to explore stages
          </Text>
        </View>

        {/* Stage Indicator Dots */}
        <View className="mb-4 flex-row justify-center gap-2">
          {PATHWAY_STAGES.map((_, index) => (
            <View
              key={index}
              className="h-2 rounded-full"
              style={{
                width: currentIndex === index ? 24 : 8,
                backgroundColor:
                  currentIndex === index
                    ? PATHWAY_STAGES[safeCurrentStageIndex]?.color || '#3b82f6'
                    : '#d1d5db',
              }}
            />
          ))}
        </View>

        {/* Swipeable Cards */}
        <FlatList
          ref={flatListRef}
          data={PATHWAY_STAGES}
          renderItem={renderStageCard}
          keyExtractor={(item) => item.id}
          horizontal
          pagingEnabled={false}
          snapToInterval={SNAP_INTERVAL}
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: (SCREEN_WIDTH - CARD_WIDTH) / 2,
            paddingVertical: 20,
          }}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          getItemLayout={(_, index) => ({
            length: SNAP_INTERVAL,
            offset: SNAP_INTERVAL * index,
            index,
          })}
          onScrollToIndexFailed={(info) => {
            // Fallback if scroll to index fails
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
            }, 100);
          }}
        />
      </View>

      {/* Stage Detail Modal */}
      <Modal
        visible={selectedStage !== null}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedStage(null)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-4 py-8">
          <View
            className={combineClasses(cards.default.elevated, 'w-full max-w-md p-6')}
            style={{ maxHeight: '80%' }}>
            {selectedStage && (
              <>
                {/* Modal Header */}
                <View className="mb-4 flex-row items-center justify-between">
                  <View className="flex-1 flex-row items-center">
                    <Text className="mr-3 text-3xl">{selectedStage.icon}</Text>
                    <Text className={combineClasses(typography.h4, 'flex-1')}>
                      {selectedStage.title}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedStage(null)}
                    activeOpacity={0.7}
                    className="-mr-2 p-2">
                    <Text className="text-2xl text-gray-500">×</Text>
                  </TouchableOpacity>
                </View>

                {/* Modal Content */}
                <View style={{ maxHeight: 400 }}>
                  <Text
                    className={combineClasses(
                      typography.body.medium,
                      'whitespace-pre-line leading-7 text-gray-700'
                    )}>
                    {selectedStage.description}
                  </Text>
                </View>

                {/* Modal Footer */}
                <View className="mt-4 border-t border-gray-200 pt-4">
                  <TouchableOpacity
                    className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
                    onPress={() => setSelectedStage(null)}
                    activeOpacity={0.8}>
                    <Text className={buttons.primary.text}>Close</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
