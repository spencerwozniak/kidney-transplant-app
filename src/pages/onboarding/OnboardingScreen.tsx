import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { buttons, typography, combineClasses } from '../../styles/theme';
import { KidneyIcon } from '../../components/KidneyIcon';
import { PathwayBackground } from '../../components/PathwayBackground';

type OnboardingScreenProps = {
  onGetStarted: () => void;
};

export const OnboardingScreen = ({ onGetStarted }: OnboardingScreenProps) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [buttonFadeAnim] = useState(new Animated.Value(0));
  const [showButton, setShowButton] = useState(false);
  const [pathwayComplete, setPathwayComplete] = useState(false);

  const handlePathwayComplete = () => {
    setPathwayComplete(true);
    // Show button immediately so it can animate with text
    setShowButton(true);
    // Animate text and button in simultaneously
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(buttonFadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
    <LinearGradient
      colors={['#90dcb5', '#57a67f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}>
      {/* Pathway Background Design */}
      <PathwayBackground opacity={0.15} onAnimationComplete={handlePathwayComplete} />
      <SafeAreaView className="flex-1">
        <View className="flex-1">
          {/* Header with Logo and Title */}
          {pathwayComplete && (
            <Animated.View
              style={{
                opacity: fadeAnim,
              }}
              className="flex-row items-center px-6 pt-4">
              <View className="mr-3">
                <KidneyIcon className="shadow-md" size={48} color="#ffffff" />
              </View>
              <Text className="text-2xl font-normal text-white shadow-md">Transplant Compass</Text>
            </Animated.View>
          )}

          {/* Main Content */}
          <View className="mb-10 flex-1 items-center justify-center px-10">
            {pathwayComplete && (
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  transform: [{ scale: scaleAnim }],
                }}
                className="items-center">
                {/* Main Text */}
                <Text
                  className={combineClasses(
                    typography.h2,
                    'mb-12 text-center font-semibold leading-tight text-white shadow-md'
                  )}>
                  Your personalized guide to navigating the transplant pathway
                </Text>
              </Animated.View>
            )}

            {/* Get Started Button */}
            {showButton && (
              <Animated.View
                style={{
                  opacity: buttonFadeAnim,
                  transform: [
                    {
                      translateY: buttonFadeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                  ],
                }}
                className="w-full max-w-sm">
                <TouchableOpacity
                  className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
                  onPress={handleGetStarted}
                  activeOpacity={0.8}>
                  <Text className={buttons.outline.text}>Get Started</Text>
                </TouchableOpacity>
              </Animated.View>
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
