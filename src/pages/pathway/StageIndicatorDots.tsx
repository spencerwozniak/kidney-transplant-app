/**
 * Stage Indicator Dots Component
 * 
 * Displays visual indicators showing which stage is currently visible
 */

import React from 'react';
import { View } from 'react-native';
import { PATHWAY_STAGES } from './pathwayStages';

type StageIndicatorDotsProps = {
  currentIndex: number;
  currentStageIndex: number;
};

export const StageIndicatorDots = ({ currentIndex, currentStageIndex }: StageIndicatorDotsProps) => {
  return (
    <View className="mb-4 flex-row justify-center gap-2">
      {PATHWAY_STAGES.map((_, index) => (
        <View
          key={index}
          className="h-2 rounded-full"
          style={{
            width: currentIndex === index ? 24 : 8,
            backgroundColor:
              currentIndex === index
                ? PATHWAY_STAGES[currentStageIndex]?.color || '#3b82f6'
                : '#d1d5db',
          }}
        />
      ))}
    </View>
  );
};

