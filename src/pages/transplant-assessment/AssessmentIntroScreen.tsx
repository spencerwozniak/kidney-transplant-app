import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buttons, typography, cards, combineClasses, layout, decorative } from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';

type AssessmentIntroScreenProps = {
  onBeginAssessment: () => void;
  onBack?: () => void;
};

export const AssessmentIntroScreen = ({
  onBeginAssessment,
  onBack,
}: AssessmentIntroScreenProps) => {
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
    <SafeAreaView className={layout.container.default}>
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
              'top-30 absolute right-10 opacity-30'
            )}
          />

          {/* Header */}
          <View className="mb-6 mt-[80px]">
            <Text className={combineClasses(typography.h2, 'mb-3')}>
              Transplant Eligibility Self-Assessment
            </Text>
            <View className="h-1 w-16 rounded-full bg-green-500" />
          </View>

          {/* Description Card */}
          <View className={combineClasses('mb-6')}>
            <Text className={combineClasses(typography.body.xlarge, 'mb-4 leading-6')}>
              This assessment helps you understand whether you might be a candidate for transplant
              evaluation.
            </Text>

            <Text className={combineClasses(typography.body.large, 'mb-2 font-semibold')}>
              What to expect:
            </Text>
            <View className="mb-2">
              <Text className={combineClasses(typography.body.large, 'mb-1')}>
                • Questions about medical conditions
              </Text>
              <Text className={combineClasses(typography.body.large, 'mb-1')}>
                • Questions about lifestyle factors
              </Text>
              <Text className={combineClasses(typography.body.large, 'mb-1')}>
                • Questions about social situation
              </Text>
              <Text className={combineClasses(typography.body.large, 'mb-1')}>
                • Identification of contraindications
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
    </SafeAreaView>
  );
};
