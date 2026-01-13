import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { buttons, typography, cards, combineClasses, layout, decorative } from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { PathwayBackground } from '../../components/PathwayBackground';
import { apiService } from '../../services/api';
import { getWebPadding } from '../../utils/webStyles';

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
    <LinearGradient
      colors={['#90dcb5', '#57a67f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}>
      <PathwayBackground opacity={0.15} animate={false} />
      <SafeAreaView className="flex-1">
        <NavigationBar onBack={handleBack} />
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
                Financial Assessment
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
                This assessment helps us understand your financial situation and insurance coverage to
                better support you through the transplant evaluation process.
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
                  • Questions about insurance coverage
                </Text>
                <Text
                  className={combineClasses(
                    typography.body.large,
                    'mb-1 font-semibold text-white shadow'
                  )}>
                  • Questions about location and travel
                </Text>
                <Text
                  className={combineClasses(
                    typography.body.large,
                    'mb-1 font-semibold text-white shadow'
                  )}>
                  • Questions about caregiver support
                </Text>
                <Text
                  className={combineClasses(
                    typography.body.large,
                    'mb-1 font-semibold text-white shadow'
                  )}>
                  • Questions about housing and relocation
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
