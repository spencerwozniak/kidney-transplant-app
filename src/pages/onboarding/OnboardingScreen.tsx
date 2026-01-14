import React, { useState, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Platform, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { buttons, typography, combineClasses } from '../../styles/theme';
import { PathwayBackground } from '../../components/PathwayBackground';

type OnboardingScreenProps = {
  onGetStarted: () => void;
  message?: string | null;
};

export const OnboardingScreen = ({ onGetStarted, message }: OnboardingScreenProps) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(0.8));
  const [buttonFadeAnim] = useState(new Animated.Value(0));
  const [showButton, setShowButton] = useState(false);
  const [pathwayComplete, setPathwayComplete] = useState(false);
  const animationStartedRef = React.useRef(false);

  const handlePathwayComplete = React.useCallback(() => {
    // Prevent multiple calls
    if (animationStartedRef.current) {
      return;
    }
    animationStartedRef.current = true;

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
  }, [fadeAnim, scaleAnim, buttonFadeAnim]);

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
      <SafeAreaView className="flex-1" style={styles.safeArea}>
        <View className="flex-1" style={styles.contentContainer}>
          {/* Header with Logo and Title */}
          <Animated.View
            style={{
              opacity: pathwayComplete ? fadeAnim : 0,
            }}>
            <View
              className="flex-row items-center px-6 pt-4"
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <View
                style={{
                  marginRight: 12,
                  flexShrink: 0,
                }}>
                <Image
                  source={require('../../../assets/borders-3-stroke.png')}
                  style={{
                    width: 60,
                    height: 60,
                    // For web: use drop-shadow filter to follow image alpha channel (matches shadow-md)
                    ...(Platform.OS === 'web' && {
                      filter: 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))',
                    }),
                    // For native: shadow properties (iOS) - Android will need elevation on wrapper
                    ...(Platform.OS !== 'web' && {
                      shadowColor: '#000000',
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: 0.2,
                      shadowRadius: 3,
                    }),
                  }}
                  resizeMode="contain"
                />
              </View>
              <Text
                className={combineClasses(typography.h3, 'font-nunito-bold text-white shadow-md')}>
                Kare
              </Text>
            </View>
          </Animated.View>

          {/* Main Content */}
          <View className="mb-10 flex-1 items-center justify-center px-10">
            {message && (
              <View className="mb-4 px-4 py-2 rounded bg-white/20">
                <Text className={combineClasses(typography.body.small, 'text-white text-center')}>{message}</Text>
              </View>
            )}
            <Animated.View
              style={{
                opacity: pathwayComplete ? fadeAnim : 0,
                transform: [{ scale: pathwayComplete ? scaleAnim : 0.8 }],
              }}
              className="items-center">
              {/* Main Text */}
              <Text
                className={combineClasses(
                  typography.h2,
                  'mb-12 text-center font-semibold leading-tight text-white shadow-md'
                )}>
                Your Ally in the Fight for a New Kidney
              </Text>
            </Animated.View>

            {/* Get Started Button */}
            <Animated.View
              style={{
                opacity: showButton ? buttonFadeAnim : 0,
                transform: [
                  {
                    translateY: showButton
                      ? buttonFadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [20, 0],
                        })
                      : 20,
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
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
    }),
  },
  safeArea: {
    flex: 1,
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' && {
      minHeight: '100vh',
    }),
  },
  contentContainer: {
    flex: 1,
    width: '100%',
  },
});
