import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { buttons, typography, cards, combineClasses, layout, decorative } from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { PathwayBackground } from '../../components/PathwayBackground';

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
    <LinearGradient
      colors={['#90dcb5', '#57a67f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}>
      <PathwayBackground opacity={0.15} animate={false} />
      <SafeAreaView className="flex-1">
        <NavigationBar onBack={onBack} />
        <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
              styles.contentContainer,
              getWebPadding(24, 32), // px-6 py-8
            ]}
            className="mt-16 px-6 py-8">
            {/* Header */}
            <View className="mb-6">
              <Text className={combineClasses(typography.h2, 'mb-6 text-white shadow')}>
                Transplant Eligibility Self-Assessment
              </Text>
              <View className="h-1 w-16 rounded-full bg-white shadow" />
            </View>

            {/* Description Card */}
            <View className={combineClasses('mb-6')}>
              <Text
                className={combineClasses(
                  typography.body.xlarge,
                  'mb-4 font-bold leading-6 text-white shadow'
                )}>
                This assessment helps you understand whether you might be a candidate for transplant
                evaluation.
              </Text>

              <Text
                className={combineClasses(
                  typography.body.large,
                  'mb-2 font-bold text-white shadow'
                )}>
                What to expect:
              </Text>
              <View className="mb-2">
                <Text
                  className={combineClasses(
                    typography.body.large,
                    'mb-1 font-semibold text-white shadow'
                  )}>
                  • Questions about medical conditions
                </Text>
                <Text
                  className={combineClasses(
                    typography.body.large,
                    'mb-1 font-semibold text-white shadow'
                  )}>
                  • Questions about lifestyle factors
                </Text>
                <Text
                  className={combineClasses(
                    typography.body.large,
                    'mb-1 font-semibold text-white shadow'
                  )}>
                  • Questions about social situation
                </Text>
                <Text
                  className={combineClasses(
                    typography.body.large,
                    'mb-1 font-semibold text-white shadow'
                  )}>
                  • Identification of contraindications
                </Text>
              </View>
            </View>

            {/* Begin Assessment Button */}
            <TouchableOpacity
              className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
              onPress={handleBegin}
              activeOpacity={0.8}>
              <Text className={buttons.outline.text}>Begin Assessment</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 24, // px-6 = 1.5rem = 24px
    paddingVertical: 32, // py-8 = 2rem = 32px
  },
});
