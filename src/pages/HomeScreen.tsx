import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  buttons,
  typography,
  dividers,
  decorative,
  cards,
  combineClasses,
  layout,
} from '../styles/theme';

type ResultsSummary = {
  hasAbsolute: boolean;
  hasRelative: boolean;
  absoluteContraindications: Array<{ id: string; question: string }>;
  relativeContraindications: Array<{ id: string; question: string }>;
};

type HomeScreenProps = {
  patientName: string;
  results?: ResultsSummary;
  onViewResults?: () => void;
  onNavigateToQuestionnaire?: () => void;
  onNavigateToExamples?: () => void;
};

export const HomeScreen = ({
  patientName,
  results,
  onViewResults,
  onNavigateToQuestionnaire,
  onNavigateToExamples,
}: HomeScreenProps) => {

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
            <View className="mb-6">
              <Text className="text-left text-3xl font-normal text-neutral-500">
                {patientName || 'Friend'}
              </Text>
            </View>

            {/* Transplant Status Card */}
            {results && (
              <TouchableOpacity
                className={combineClasses(
                  cards.default.container,
                  'mb-6 w-full',
                  results.hasAbsolute
                    ? 'border-l-4 border-red-500'
                    : results.hasRelative
                      ? 'border-l-4 border-yellow-500'
                      : 'border-l-4 border-green-500'
                )}
                onPress={onViewResults}
                activeOpacity={0.7}>
                <View className="mb-2 flex-row items-center justify-between">
                  <Text className={combineClasses(typography.h5, 'font-semibold')}>
                    Transplant Status
                  </Text>
                  <Text className="text-lg">→</Text>
                </View>
                {results.hasAbsolute ? (
                  <View>
                    <Text className={combineClasses(typography.body.small, 'mb-1 text-red-700')}>
                      ⚠️ Absolute contraindications identified
                    </Text>
                    <Text className="text-xs text-gray-600">
                      {results.absoluteContraindications.length} condition(s) require discussion with
                      your care team
                    </Text>
                  </View>
                ) : results.hasRelative ? (
                  <View>
                    <Text className={combineClasses(typography.body.small, 'mb-1 text-yellow-700')}>
                      ⚠️ Relative contraindications identified
                    </Text>
                    <Text className="text-xs text-gray-600">
                      {results.relativeContraindications.length} factor(s) may need to be addressed
                      before evaluation
                    </Text>
                  </View>
                ) : (
                  <View>
                    <Text className={combineClasses(typography.body.small, 'mb-1 text-green-700')}>
                      ✓ No contraindications identified
                    </Text>
                    <Text className="text-xs text-gray-600">
                      Based on your assessment, no absolute or relative contraindications were
                      identified
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            )}

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
              {onNavigateToQuestionnaire && (
                <TouchableOpacity
                  className={combineClasses(buttons.primary.base, buttons.primary.enabled, 'mb-3')}
                  onPress={onNavigateToQuestionnaire}
                  activeOpacity={0.8}>
                  <Text className={buttons.primary.text}>Start Eligibility Assessment</Text>
                </TouchableOpacity>
              )}

              {onNavigateToExamples && (
                <TouchableOpacity
                  className={combineClasses(buttons.outline.base, buttons.outline.enabled, 'mb-3')}
                  onPress={onNavigateToExamples}
                  activeOpacity={0.8}>
                  <Text className={buttons.outline.text}>View Style Examples</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
