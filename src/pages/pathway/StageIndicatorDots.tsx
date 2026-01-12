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
                ? '#ffffff'
                : 'rgba(255, 255, 255, 0.5)',
            shadowColor: currentIndex === index ? '#000' : undefined,
            shadowOffset: currentIndex === index ? { width: 0, height: 2 } : undefined,
            shadowOpacity: currentIndex === index ? 0.3 : undefined,
            shadowRadius: currentIndex === index ? 3 : undefined,
            elevation: currentIndex === index ? 3 : undefined,
          }}
        />
      ))}
    </View>
  );
};

