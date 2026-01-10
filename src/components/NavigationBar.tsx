import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buttons, typography, cards, combineClasses, layout } from '../styles/theme';
import { InfoIcon } from './InfoIcon';

type NavigationBarProps = {
  onBack?: () => void;
  infoModal?: {
    heading: string;
    description: string;
  };
};

export const NavigationBar = ({ onBack, infoModal }: NavigationBarProps) => {
  const [showInfoModal, setShowInfoModal] = useState(false);

  return (
    <>
      <SafeAreaView edges={['top']} className="bg-white">
        <View className="flex-row items-center justify-between px-4 py-3">
          {/* Back Button */}
          {onBack ? (
            <TouchableOpacity onPress={onBack} activeOpacity={0.7} className="-ml-2 p-2">
              <Text className="text-2xl text-gray-700">←</Text>
            </TouchableOpacity>
          ) : (
            <View className="w-10" />
          )}

          {/* Info Button */}
          {infoModal ? (
            <TouchableOpacity
              onPress={() => setShowInfoModal(true)}
              activeOpacity={0.7}
              className="-mr-2 p-2">
              <InfoIcon size={24} color="#525252" />
            </TouchableOpacity>
          ) : (
            <View className="w-10" />
          )}
        </View>
      </SafeAreaView>

      {/* Info Modal */}
      {infoModal && (
        <Modal
          visible={showInfoModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowInfoModal(false)}>
          <View className="flex-1 items-center justify-center bg-black/50 px-4">
            <View className={combineClasses(cards.default.elevated, 'max-h-[80%] w-full max-w-md')}>
              {/* Modal Header */}
              <View className="mb-4 flex-row items-center justify-between">
                <Text className={combineClasses(typography.h4, 'flex-1')}>{infoModal.heading}</Text>
                <TouchableOpacity
                  onPress={() => setShowInfoModal(false)}
                  activeOpacity={0.7}
                  className="-mr-2 p-2">
                  <Text className="text-2xl text-gray-500">×</Text>
                </TouchableOpacity>
              </View>

              {/* Modal Content */}
              <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
                <Text
                  className={combineClasses(
                    typography.body.medium,
                    'whitespace-pre-line leading-7'
                  )}>
                  {infoModal.description}
                </Text>
              </ScrollView>

              {/* Modal Footer */}
              <View className="mt-4 border-t border-gray-200 pt-4">
                <TouchableOpacity
                  className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
                  onPress={() => setShowInfoModal(false)}
                  activeOpacity={0.8}>
                  <Text className={buttons.primary.text}>Close</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </>
  );
};

