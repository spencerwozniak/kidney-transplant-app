/**
 * Style Usage Examples
 * This file demonstrates how to use the predefined styles throughout the app
 */

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import {
  buttons,
  cards,
  typography,
  badges,
  inputs,
  progress as progressStyles,
  dividers,
  decorative,
  combineClasses,
  getButtonClasses,
  getCardClasses,
  getBadgeClasses,
  layout,
} from '../styles/theme';
import { NavigationBar } from '../components/NavigationBar';

type StyleExamplesProps = {
  onNavigateToHome?: () => void;
};

export const StyleExamples = ({ onNavigateToHome }: StyleExamplesProps) => {
  const buttonStyles = getButtonClasses('primary', 'enabled');
  const cardStyles = getCardClasses('green');
  const badgeStyles = getBadgeClasses('absolute');

  return (
    <SafeAreaView className={layout.container.default}>
      <NavigationBar onBack={onNavigateToHome} />
      <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Header */}
          <Text className={combineClasses(typography.h1, 'mb-4')}>Style Examples</Text>
          <View className={progressStyles.indicator} />

          {/* Typography Examples */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h3, 'mb-4')}>Typography</Text>
            <Text className={typography.h1}>Heading 1</Text>
            <Text className={typography.h3}>Heading 3</Text>
            <Text className={typography.body.medium}>Body text</Text>
            <Text className={typography.link}>Link text</Text>
          </View>

          {/* Button Examples */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h3, 'mb-4')}>Buttons</Text>
            <View className="mb-3">
              <TouchableOpacity
                className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
                activeOpacity={0.8}>
                <Text className={buttons.primary.text}>Primary Button</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-3">
              <TouchableOpacity
                className={combineClasses(buttons.secondary.base, buttons.secondary.enabled)}
                activeOpacity={0.8}>
                <Text className={buttons.secondary.text}>Secondary Button</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-3">
              <TouchableOpacity
                className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
                activeOpacity={0.8}>
                <Text className={buttons.outline.text}>Outline Button</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-3">
              <TouchableOpacity className={buttonStyles.container} activeOpacity={0.8}>
                <Text className={buttonStyles.text}>Using Helper Function</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Card Examples */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h3, 'mb-4')}>Cards</Text>
            <View className={combineClasses(cards.default.container, 'mb-4')}>
              <Text className={typography.h5}>Default Card</Text>
              <Text className={typography.body.small}>Card content goes here</Text>
            </View>

            <View className={combineClasses(cards.colored.green, 'mb-4')}>
              <Text className="text-lg font-bold text-green-900">Success Card</Text>
              <Text className="text-sm text-green-800">This is a success message</Text>
            </View>

            <View className={cardStyles}>
              <Text className="text-lg font-bold text-green-900">Using Helper Function</Text>
            </View>
          </View>

          {/* Badge Examples */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h3, 'mb-4')}>Badges</Text>
            <View className="mb-4 flex-row flex-wrap gap-2">
              <View className={badges.absolute.container}>
                <Text className={badges.absolute.text}>Absolute</Text>
              </View>
              <View className={badges.relative.container}>
                <Text className={badges.relative.text}>Relative</Text>
              </View>
              <View className={badgeStyles.container}>
                <Text className={badgeStyles.text}>Using Helper</Text>
              </View>
            </View>
          </View>

          {/* Input Examples */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h3, 'mb-4')}>Inputs</Text>
            <View className={inputs.default.container}>
              <TextInput
                className={inputs.default.input}
                placeholder="Enter text"
                placeholderTextColor={inputs.default.placeholder}
              />
            </View>
          </View>

          {/* Progress Bar Examples */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h3, 'mb-4')}>Progress Bars</Text>
            <View className={progressStyles.container}>
              <View className={progressStyles.bar.primary} style={{ width: '60%' }} />
            </View>
            <View className="mt-2">
              <View className={progressStyles.container}>
                <View className={progressStyles.bar.secondary} style={{ width: '40%' }} />
              </View>
            </View>
          </View>

          {/* Divider Examples */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h3, 'mb-4')}>Dividers</Text>
            <View className={dividers.full.container}>
              <View className={dividers.horizontal.default} />
              <View className={dividers.dot.container}>
                <View className={dividers.dot.dot} />
              </View>
              <View className={dividers.horizontal.default} />
            </View>
          </View>

          {/* Decorative Elements */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h3, 'mb-4')}>Decorative Elements</Text>
            <View className="relative h-32">
              <View
                className={combineClasses(
                  decorative.circles.small,
                  decorative.circles.green,
                  'absolute right-10 top-0'
                )}
              />
              <View
                className={combineClasses(
                  decorative.circles.medium,
                  decorative.circles.orange,
                  'absolute bottom-0 left-8'
                )}
              />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
