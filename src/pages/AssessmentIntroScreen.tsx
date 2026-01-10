import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buttons, typography, cards, combineClasses, layout, decorative } from '../styles/theme';
import { NavigationBar } from '../components/NavigationBar';

type AssessmentIntroScreenProps = {
  onBeginAssessment: () => void;
  onBack?: () => void;
};

export const AssessmentIntroScreen = ({ onBeginAssessment, onBack }: AssessmentIntroScreenProps) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleBegin = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -30,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onBeginAssessment();
    });
  };

  return (
    <View className={layout.container.default}>
      <NavigationBar onBack={onBack} />
      <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="px-6 py-8">
          {/* Decorative Elements */}
          <View
            className={combineClasses(
              decorative.circles.small,
              decorative.circles.green,
              'absolute right-10 top-20 opacity-30'
            )}
          />

          {/* Header */}
          <View className="mb-6">
            <Text className={combineClasses(typography.h2, 'mb-3')}>
              Transplant Eligibility Self-Assessment
            </Text>
            <View className="h-1 w-16 rounded-full bg-green-500" />
          </View>

          {/* Description Card */}
          <View className={combineClasses(cards.default.container, 'mb-6')}>
            <Text className={combineClasses(typography.body.medium, 'mb-4 leading-6')}>
              This educational tool helps you understand whether you might be a candidate for
              transplant evaluation. It's designed to help you understand general criteria and
              identify whether you should discuss referral with your care team.
            </Text>

            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              What to expect:
            </Text>
            <View className="mb-2">
              <Text className={combineClasses(typography.body.small, 'mb-1')}>
                • Answer questions about your health and medical history
              </Text>
              <Text className={combineClasses(typography.body.small, 'mb-1')}>
                • Learn about absolute and relative contraindications
              </Text>
              <Text className={combineClasses(typography.body.small, 'mb-1')}>
                • Receive an assessment summary to discuss with your care team
              </Text>
            </View>

            <View className={combineClasses(cards.colored.blue, 'mt-4')}>
              <Text className="text-sm font-semibold text-blue-900">Important Note</Text>
              <Text className="mt-1 text-sm leading-5 text-blue-800">
                There is no absolute age limit for transplantation. Advanced age alone is not a
                contraindication. Patients over 70 can and do receive successful transplants with
                significant survival benefit.
              </Text>
            </View>
          </View>

          {/* Begin Assessment Button */}
          <TouchableOpacity
            className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
            onPress={handleBegin}
            activeOpacity={0.8}>
            <Text className={buttons.primary.text}>Begin Assessment</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

