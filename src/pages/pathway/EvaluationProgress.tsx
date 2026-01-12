/**
 * Evaluation Progress Component
 * 
 * Displays progress bar for evaluation stage checklist completion
 */

import React from 'react';
import { View, Text } from 'react-native';
import type { TransplantChecklist } from '../../services/api';

type EvaluationProgressProps = {
  checklist: TransplantChecklist;
  stageColor: string;
};

export const EvaluationProgress = ({ checklist, stageColor }: EvaluationProgressProps) => {
  const completedCount = checklist.items.filter((item) => item.is_complete).length;
  const totalCount = checklist.items.length;
  const percentage = Math.round((completedCount / totalCount) * 100);

  return (
    <View className="mb-4">
      <View className="mb-2 flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-gray-800">Evaluation Progress</Text>
        <Text className="text-sm font-semibold text-gray-800">{percentage}%</Text>
      </View>
      <View className="h-3 w-full rounded-full bg-gray-200">
        <View
          className="h-full rounded-full"
          style={{
            width: `${percentage}%`,
            backgroundColor: stageColor || '#57a67f',
          }}
        />
      </View>
    </View>
  );
};

