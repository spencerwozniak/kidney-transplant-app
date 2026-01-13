/**
 * Stage Detail Modal Component
 * 
 * Displays detailed information about a pathway stage in a modal
 */

import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { buttons, typography, cards, combineClasses } from '../../styles/theme';
import type { PathwayStageData } from './types';

type StageDetailModalProps = {
  stage: PathwayStageData | null;
  onClose: () => void;
};

export const StageDetailModal = ({ stage, onClose }: StageDetailModalProps) => {
  if (!stage) return null;

  return (
    <Modal
      visible={stage !== null}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center bg-black/50 px-4 py-8">
        <View
          className={combineClasses(cards.default.elevated, 'w-full max-w-md p-6')}
          style={{ maxHeight: '80%' }}>
          {/* Modal Header */}
          <View className="mb-4 flex-row items-center justify-between">
            <View className="flex-1 flex-row items-center">
              <View className="mr-3">{stage.icon}</View>
              <Text className={combineClasses(typography.h4, 'flex-1')}>{stage.title}</Text>
            </View>
            <TouchableOpacity onPress={onClose} activeOpacity={0.7} className="-mr-2 p-2">
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
              {stage.description}
            </Text>
          </View>

          {/* Modal Footer */}
          <View className="mt-4 border-t border-gray-200 pt-4">
            <TouchableOpacity
              className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
              onPress={onClose}
              activeOpacity={0.8}>
              <Text className={buttons.primary.text}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

