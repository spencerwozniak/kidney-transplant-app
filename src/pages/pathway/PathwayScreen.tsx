/**
 * Pathway Screen Component
 * 
 * Main screen displaying the transplant pathway with swipeable stage cards.
 * Orchestrates data fetching, stage navigation, and renders sub-components.
 */

import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, layout, combineClasses } from '../../styles/theme';
import { PathwayBackground } from '../../components/PathwayBackground';
import { apiService, PatientStatus, TransplantChecklist } from '../../services/api';
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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<PathwayStageData | null>(null);
  const flatListRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Fetch pathway data on mount
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

  // Determine current stage from status
  const currentStage: PathwayStage =
    (patientStatus?.pathway_stage as PathwayStage) || 'identification';
  const currentStageIndex = PATHWAY_STAGES.findIndex((stage) => stage.id === currentStage);
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

  // Determine stage status (completed, current, or upcoming)
  const getStageStatus = (stageIndex: number): StageStatus => {
    if (stageIndex < safeCurrentStageIndex) {
      return 'completed';
    } else if (stageIndex === safeCurrentStageIndex) {
      return 'current';
    } else {
      return 'upcoming';
    }
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
        onPress={() => setSelectedStage(stage)}
        onViewResults={onViewResults}
        onViewChecklist={onViewChecklist}
        onNavigateToQuestionnaire={onNavigateToQuestionnaire}
        onFindReferral={onFindReferral}
        onViewReferral={onViewReferral}
        cardWidth={CARD_WIDTH}
        cardSpacing={CARD_SPACING}
      />
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <LinearGradient
        colors={['#90dcb5', '#57a67f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}>
        <PathwayBackground opacity={0.15} animate={false} />
        <SafeAreaView className="flex-1">
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className={combineClasses(typography.body.medium, 'mt-4 text-white shadow')}>
              Loading pathway...
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
        <View className="flex-1">
          <PathwayHeader />

          <StageIndicatorDots currentIndex={currentIndex} currentStageIndex={safeCurrentStageIndex} />

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
            onScrollToIndexFailed={(info) => {
              // Fallback if scroll to index fails
              setTimeout(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: false });
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

