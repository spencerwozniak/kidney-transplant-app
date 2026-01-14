/**
 * Pathway Screen Component
 *
 * Main screen displaying the transplant pathway with swipeable stage cards.
 * Orchestrates data fetching, stage navigation, and renders sub-components.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, layout, combineClasses } from '../../styles/theme';
import { PathwayBackground } from '../../components/PathwayBackground';
import {
  apiService,
  PatientStatus,
  TransplantChecklist,
  QuestionnaireSubmission,
  PatientReferralState,
} from '../../services/api';
import type { PathwayStage, PathwayStageData, PathwayScreenProps, StageStatus } from './types';
import { PATHWAY_STAGES } from './pathwayStages';
import { CARD_WIDTH, CARD_SPACING, SNAP_INTERVAL } from './constants';
import { PathwayHeader } from './PathwayHeader';
import { StageIndicatorDots } from './StageIndicatorDots';
import { StageCard } from './StageCard';
import { StageDetailModal } from './StageDetailModal';
import { WebScrollableFlatList } from '../../components/WebScrollableFlatList';

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
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireSubmission | null>(null);
  const [referralState, setReferralState] = useState<PatientReferralState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<PathwayStageData | null>(null);
  // Typed ref for the scrollable list
  const flatListRef = useRef<FlatList<PathwayStageData> | null>(null);
  const hasInitialScroll = useRef(false);
  const flatListLayoutReady = useRef(false);

  // Calculate initial stage index from cached data if available
  const getInitialStageIndex = (): number => {
    try {
      const statusCache = apiService.loadCached<PatientStatus>('patient_status');
      if (statusCache.data && statusCache.data.pathway_stage) {
        const stageIndex = PATHWAY_STAGES.findIndex(
          (stage) => stage.id === (statusCache.data!.pathway_stage as PathwayStage)
        );
        return stageIndex >= 0 ? stageIndex : 0;
      }
    } catch (e) {
      // ignore cache errors
    }
    return 0;
  };

  const [currentIndex, setCurrentIndex] = useState(getInitialStageIndex());

  // Fetch pathway data on mount and when screen comes into focus
  useEffect(() => {
    // Rehydrate from cache first for instant UI
    try {
      const statusCache = apiService.loadCached<PatientStatus>('patient_status');
      const checklistCache = apiService.loadCached<TransplantChecklist>('checklist');

      if (statusCache.data && !statusCache.expired) setPatientStatus(statusCache.data);
      if (checklistCache.data && !checklistCache.expired) setChecklist(checklistCache.data);

      // Only fetch if cache missing or expired
      const shouldFetchStatus = !statusCache.data || statusCache.expired;
      const shouldFetchChecklist = !checklistCache.data || checklistCache.expired;

      if (shouldFetchStatus || shouldFetchChecklist) {
        setIsLoading(true);
        console.time('fetchPathwayData');
        Promise.allSettled([
          shouldFetchStatus ? apiService.getPatientStatus() : Promise.resolve(statusCache.data),
          shouldFetchChecklist ? apiService.getChecklist() : Promise.resolve(checklistCache.data),
          apiService.getQuestionnaire().catch(() => null),
          apiService.getReferralState().catch(() => null),
        ])
          .then((results) => {
            const [statusResult, checklistResult, questionnaireResult, referralStateResult] =
              results;
            if (statusResult.status === 'fulfilled') {
              setPatientStatus(statusResult.value as PatientStatus);
            }
            if (checklistResult.status === 'fulfilled') {
              setChecklist(checklistResult.value as TransplantChecklist);
            }
            if (questionnaireResult.status === 'fulfilled') {
              setQuestionnaire(
                (questionnaireResult.value as QuestionnaireSubmission | null) ?? null
              );
            }
            if (referralStateResult.status === 'fulfilled') {
              setReferralState((referralStateResult.value as PatientReferralState | null) ?? null);
            }
          })
          .catch((e) => console.error('Error refreshing pathway data:', e))
          .finally(() => {
            console.timeEnd('fetchPathwayData');
            setIsLoading(false);
          });
      } else {
        // If all data is cached and fresh, still check questionnaire and referral state
        Promise.allSettled([
          apiService.getQuestionnaire().catch(() => null),
          apiService.getReferralState().catch(() => null),
        ]).then(([questionnaireResult, referralStateResult]) => {
          if (questionnaireResult.status === 'fulfilled') {
            setQuestionnaire(questionnaireResult.value as QuestionnaireSubmission | null);
          }
          if (referralStateResult.status === 'fulfilled') {
            setReferralState(referralStateResult.value as PatientReferralState | null);
          }
        });
      }
    } catch (e) {
      // ignore cache/read errors and fall back to network
      fetchPathwayData();
    }
  }, []);

  const fetchPathwayData = async () => {
    setIsLoading(true);
    try {
      console.time('fetchPathwayData');
      const [statusResult, checklistResult, questionnaireResult, referralStateResult] =
        await Promise.allSettled([
          apiService.getPatientStatus(),
          apiService.getChecklist(),
          apiService.getQuestionnaire().catch(() => null),
          apiService.getReferralState().catch(() => null),
        ]);

      if (statusResult.status === 'fulfilled') {
        setPatientStatus(statusResult.value as PatientStatus);
      }

      if (checklistResult.status === 'fulfilled') {
        setChecklist(checklistResult.value as TransplantChecklist);
      }

      if (questionnaireResult.status === 'fulfilled') {
        setQuestionnaire((questionnaireResult.value as QuestionnaireSubmission | null) ?? null);
      }

      if (referralStateResult.status === 'fulfilled') {
        setReferralState((referralStateResult.value as PatientReferralState | null) ?? null);
      }
      console.timeEnd('fetchPathwayData');
    } catch (e) {
      console.error('fetchPathwayData failed:', e);
    } finally {
      setIsLoading(false);
    }
  };

  // Determine current stage from status
  const currentStage: PathwayStage =
    (patientStatus?.pathway_stage as PathwayStage) || 'identification';
  const currentStageIndex = PATHWAY_STAGES.findIndex((stage) => stage.id === currentStage);
  const safeCurrentStageIndex = currentStageIndex >= 0 ? currentStageIndex : 0;

  // Update currentIndex when patientStatus changes
  useEffect(() => {
    if (patientStatus) {
      setCurrentIndex(safeCurrentStageIndex);
    }
  }, [patientStatus, safeCurrentStageIndex]);

  // Log pathway data once after a load cycle completes (transition from loading -> not loading)
  const prevLoadingRef = React.useRef<boolean>(true);
  React.useEffect(() => {
    if (prevLoadingRef.current && !isLoading) {
      try {
        // Gate pathway debug logs to dev only
        const IS_DEBUG =
          (typeof __DEV__ !== 'undefined' && (__DEV__ as boolean)) ||
          (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production');
        if (IS_DEBUG) {
          console.log(
            '[Pathway][debug] patientStatus.pathway_stage =',
            patientStatus?.pathway_stage
          );
          console.log('[Pathway][debug] patientStatus =', patientStatus);
          const totalItems = checklist?.items?.length ?? 0;
          const completed = checklist?.items?.filter((i) => i.is_complete).length ?? 0;
          console.log(
            `[Pathway][debug] checklist summary: total=${totalItems} completed=${completed}`,
            checklist
          );
          console.log('[Pathway][debug] referralState =', {
            has_referral: referralState?.has_referral,
            referral_status: referralState?.referral_status,
          });
        }
      } catch (e) {
        // ignore logging issues
      }
    }
    prevLoadingRef.current = isLoading;
  }, [isLoading, patientStatus, checklist]);

  // Scroll to current stage when data loads and FlatList is ready (only on first load)
  useEffect(() => {
    if (
      !isLoading &&
      patientStatus &&
      flatListRef.current &&
      flatListLayoutReady.current &&
      !hasInitialScroll.current
    ) {
      const scrollToStage = () => {
        try {
          flatListRef.current?.scrollToIndex({
            index: safeCurrentStageIndex,
            animated: false,
          });
          setCurrentIndex(safeCurrentStageIndex);
          hasInitialScroll.current = true;
        } catch (e) {
          // If scrollToIndex fails, try using scrollToOffset as fallback
          const offset = safeCurrentStageIndex * SNAP_INTERVAL;
          flatListRef.current?.scrollToOffset({
            offset,
            animated: false,
          });
          setCurrentIndex(safeCurrentStageIndex);
          hasInitialScroll.current = true;
        }
      };

      // Small delay to ensure FlatList is fully ready
      const timeoutId = setTimeout(scrollToStage, 150);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, patientStatus, safeCurrentStageIndex]);

  // Determine stage status (completed, current, or upcoming)
  const getStageStatus = (stageIndex: number): StageStatus => {
    // Completion is derived solely from backend `patientStatus.pathway_stage`.
    const backendStage = patientStatus?.pathway_stage;
    const hasBackendStage = typeof backendStage === 'string' && backendStage.trim().length > 0;

    if (!hasBackendStage) {
      // No explicit backend stage — Identification is current, others are upcoming.
      return stageIndex === 0 ? 'current' : 'upcoming';
    }

    const currentIdx = PATHWAY_STAGES.findIndex((s) => s.id === (backendStage as PathwayStage));
    const resolvedIdx = currentIdx >= 0 ? currentIdx : 0;

    if (stageIndex < resolvedIdx) return 'completed';
    if (stageIndex === resolvedIdx) return 'current';
    return 'upcoming';
  };

  // Handle scroll to track current visible card
  const handleScroll = (event: any) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const index = Math.round(scrollPosition / SNAP_INTERVAL);
    setCurrentIndex(index);
  };

  // Render individual stage card
  const renderStageCard = ({ item: stage, index }: { item: PathwayStageData; index: number }) => {
    const status = getStageStatus(index);

    return (
      <StageCard
        stage={stage}
        index={index}
        status={status}
        currentStageIndex={safeCurrentStageIndex}
        patientStatus={patientStatus}
        checklist={checklist}
        referralState={referralState}
        onPress={() => setSelectedStage(stage)}
        onViewResults={onViewResults}
        onViewChecklist={onViewChecklist}
        onNavigateToQuestionnaire={onNavigateToQuestionnaire}
        onFindReferral={onFindReferral}
        onViewReferral={onViewReferral}
        questionnaireCompleted={!!questionnaire}
        cardWidth={CARD_WIDTH}
        cardSpacing={CARD_SPACING}
      />
    );
  };

  // Don't block initial render — show skeleton-ish placeholders instead

  return (
    <LinearGradient
      colors={['#90dcb5', '#57a67f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}>
      <PathwayBackground opacity={0.15} animate={false} />
      <SafeAreaView className="flex-1" style={{ height: '100%', maxHeight: '100%' }}>
        <View className="flex-1" style={{ height: '100%', maxHeight: '100%' }}>
          <PathwayHeader />

          <StageIndicatorDots
            currentIndex={currentIndex}
            currentStageIndex={safeCurrentStageIndex}
          />

          {/* Inline lightweight loading indicator / skeleton prompt */}
          {isLoading && (!patientStatus || !checklist) && (
            <View className="items-center px-4 py-2">
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className={combineClasses(typography.body.small, 'mt-2 text-white')}>
                Loading pathway...
              </Text>
            </View>
          )}

          {/* Swipeable Stage Cards */}
          <WebScrollableFlatList
            ref={flatListRef}
            data={PATHWAY_STAGES}
            renderItem={renderStageCard}
            keyExtractor={(item) => item.id}
            horizontal
            pagingEnabled={false}
            snapToInterval={SNAP_INTERVAL}
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={patientStatus ? safeCurrentStageIndex : 0}
            contentContainerStyle={{
              paddingHorizontal: CARD_SPACING,
              paddingVertical: 20,
            }}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            getItemLayout={(_, index) => ({
              length: SNAP_INTERVAL,
              offset: SNAP_INTERVAL * index,
              index,
            })}
            onLayout={() => {
              // Mark FlatList as ready for scrolling
              flatListLayoutReady.current = true;
            }}
            onScrollToIndexFailed={(info) => {
              // Fallback if scroll to index fails - use scrollToOffset instead
              const offset = info.index * SNAP_INTERVAL;
              setTimeout(() => {
                flatListRef.current?.scrollToOffset({
                  offset,
                  animated: false,
                });
                setCurrentIndex(info.index);
              }, 100);
            }}
          />
        </View>

        <StageDetailModal stage={selectedStage} onClose={() => setSelectedStage(null)} />
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
