import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buttons, typography, cards, combineClasses, layout, decorative } from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { apiService } from '../../services/api';

type FinancialIntroScreenProps = {
  onBeginAssessment: () => void;
  onBack?: () => void;
  onNavigateToHome?: () => void;
};

export const FinancialIntroScreen = ({
  onBeginAssessment,
  onBack,
  onNavigateToHome,
}: FinancialIntroScreenProps) => {
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

  const handleBack = async () => {
    // Only check for financial profile when back button is pressed (lazy check)
    // This avoids unnecessary API calls for first-time users
    try {
      await apiService.getFinancialProfile();
      // If profile exists, navigate to home
      if (onNavigateToHome) {
        onNavigateToHome();
        return;
      }
    } catch (error: any) {
      // If profile not found (404), that's okay - user hasn't completed it yet
      // Use default onBack behavior
      if (!error.message?.includes('404') && !error.message?.includes('not found')) {
        console.error('Error checking financial profile:', error);
      }
    }

    // Default: navigate back to previous screen (assessment intro)
    if (onBack) {
      onBack();
    }
  };

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
      <NavigationBar onBack={handleBack} />
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
          <View className="mb-6 mt-[100px]">
            <Text className={combineClasses(typography.h2, 'mb-3')}>Financial Assessment</Text>
            <View className="h-1 w-16 rounded-full bg-green-500" />
          </View>

          {/* Description Card */}
          <View className={combineClasses('mb-6')}>
            <Text className={combineClasses(typography.body.xlarge, 'mb-4 leading-6')}>
              This assessment helps us understand your financial situation and insurance coverage to
              better support you through the transplant evaluation process.
            </Text>

            <Text className={combineClasses(typography.body.large, 'mb-2 font-semibold')}>
              What to expect:
            </Text>
            <View className="mb-2">
              <Text className={combineClasses(typography.body.large, 'mb-1')}>
                • Questions about insurance coverage
              </Text>
              <Text className={combineClasses(typography.body.large, 'mb-1')}>
                • Questions about location and travel
              </Text>
              <Text className={combineClasses(typography.body.large, 'mb-1')}>
                • Questions about caregiver support
              </Text>
              <Text className={combineClasses(typography.body.large, 'mb-1')}>
                • Questions about housing and relocation
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
