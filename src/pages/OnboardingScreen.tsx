import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buttons, typography, decorative, combineClasses, layout } from '../styles/theme';
import { KidneyIcon } from '../components/KidneyIcon';

type OnboardingScreenProps = {
  onGetStarted: () => void;
};

export const OnboardingScreen = ({ onGetStarted }: OnboardingScreenProps) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Initial fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Show button after animation completes
      setTimeout(() => setShowButton(true), 300);
    });
  }, []);

  const handleGetStarted = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onGetStarted();
    });
  };

  return (
    <SafeAreaView className={combineClasses(layout.container.default, 'bg-white')}>
      <View className="flex-1 items-center justify-center px-6">
        {/* Decorative Elements */}
        <View
          className={combineClasses(
            decorative.circles.large,
            decorative.circles.green,
            'absolute right-0 top-20 opacity-20'
          )}
        />
        <View
          className={combineClasses(
            decorative.circles.medium,
            decorative.circles.orange,
            'absolute bottom-40 left-0 opacity-20'
          )}
        />

        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          }}
          className="-mt-10 items-center">
          {/* Logo/Icon Placeholder */}
          <View className="mb-8 h-24 w-24 items-center justify-center rounded-full bg-green-100">
            <KidneyIcon size={48} color="#22c55e" />
          </View>

          {/* Welcome Text */}
          <Text className={combineClasses(typography.h2, 'mb-4 text-center')}>
            Welcome to Kidney Transplant Navigator
          </Text>

          <Text className={combineClasses(typography.body.large, 'mb-8 text-center text-gray-600')}>
            Your personalized guide to understanding and navigating the transplant pathway
          </Text>
        </Animated.View>

        {/* Get Started Button */}
        {showButton && (
          <Animated.View
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: fadeAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            }}
            className="absolute bottom-12 w-full max-w-sm">
            <TouchableOpacity
              className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
              onPress={handleGetStarted}
              activeOpacity={0.8}>
              <Text className={buttons.primary.text}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
        )}
      </View>
    </SafeAreaView>
  );
};
