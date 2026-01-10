import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buttons, typography, dividers, decorative, combineClasses, layout } from '../styles/theme';

type HomeScreenProps = {
  onNavigateToQuestionnaire: () => void;
  onNavigateToExamples?: () => void;
};

export const HomeScreen = ({
  onNavigateToQuestionnaire,
  onNavigateToExamples,
}: HomeScreenProps) => {
  const [name] = useState('John Doe');

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
            <View className="mb-8">
              <Text className="text-left text-3xl font-normal text-neutral-500">
                {name || 'Friend'}
              </Text>
            </View>

            {/* Subtitle - Using typography styles */}
            <Text className={combineClasses(typography.body.large, 'mb-12 text-left')}>
              We're excited to have you here!
            </Text>

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
              <TouchableOpacity
                className={combineClasses(buttons.primary.base, buttons.primary.enabled, 'mb-3')}
                onPress={onNavigateToQuestionnaire}
                activeOpacity={0.8}>
                <Text className={buttons.primary.text}>Start Eligibility Assessment</Text>
              </TouchableOpacity>

              {onNavigateToExamples && (
                <TouchableOpacity
                  className={combineClasses(buttons.outline.base, buttons.outline.enabled, 'mb-3')}
                  onPress={onNavigateToExamples}
                  activeOpacity={0.8}>
                  <Text className={buttons.outline.text}>View Style Examples</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
                activeOpacity={0.8}>
                <Text className={buttons.outline.text}>Explore More</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
