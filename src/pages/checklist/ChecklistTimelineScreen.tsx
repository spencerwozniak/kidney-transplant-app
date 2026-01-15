import React, { useState, useEffect, useRef } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  LayoutChangeEvent,
  Animated,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  cards,
  typography,
  combineClasses,
  layout,
  progress as progressStyles,
} from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { PathwayBackground } from '../../components/PathwayBackground';
import { apiService, TransplantChecklist, ChecklistItem } from '../../services/api';
import { getWebPadding } from '../../utils/webStyles';

type ChecklistTimelineScreenProps = {
  onNavigateToHome?: () => void;
  onEditItem?: (itemId: string, item: ChecklistItem) => void;
};

export const ChecklistTimelineScreen = ({
  onNavigateToHome,
  onEditItem,
}: ChecklistTimelineScreenProps) => {
  const [checklist, setChecklist] = useState<TransplantChecklist | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cardHeights, setCardHeights] = useState<Record<string, number>>({});
  const [hasScrolledToCurrent, setHasScrolledToCurrent] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const scrollViewRef = useRef<ScrollView>(null);
  const itemRefs = useRef<Record<string, View | null>>({});
  const contentViewRef = useRef<View>(null);

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

  useEffect(() => {
    fetchChecklist();
  }, []);

  const fetchChecklist = async () => {
    setIsLoading(true);
    setHasScrolledToCurrent(false);
    itemRefs.current = {}; // Reset refs when fetching new checklist
    try {
      const checklistData = await apiService.getChecklist();
      setChecklist(checklistData);
    } catch (error: any) {
      console.error('Error fetching checklist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Scroll to current item when position is measured and progress > 0%
  useEffect(() => {
    if (!checklist || isLoading || hasScrolledToCurrent || !contentViewRef.current) return;

    const sortedItems = [...checklist.items].sort((a, b) => a.order - b.order);
    const completedSteps = sortedItems.filter((item) => item.is_complete).length;
    const totalSteps = sortedItems.length;
    const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

    // Only scroll if progress > 0%
    if (progressPercentage === 0) {
      setHasScrolledToCurrent(true);
      return;
    }

    const currentStepIndex = sortedItems.findIndex((item) => !item.is_complete);
    if (currentStepIndex < 0) {
      setHasScrolledToCurrent(true);
      return;
    }

    const currentItem = sortedItems[currentStepIndex];

    // Function to attempt scrolling
    const attemptScroll = (retryCount = 0) => {
      const currentItemRef = itemRefs.current[currentItem.id];

      if (!currentItemRef || !scrollViewRef.current || !contentViewRef.current) {
        // Retry if refs aren't ready yet (max 5 retries)
        if (retryCount < 5) {
          setTimeout(() => attemptScroll(retryCount + 1), 100);
        }
        return;
      }

      // Use a timeout to ensure layout is complete
      setTimeout(() => {
        const ref = itemRefs.current[currentItem.id];
        if (ref && contentViewRef.current && scrollViewRef.current) {
          // Measure the item's position relative to the content view
          ref.measureLayout(
            contentViewRef.current,
            (x, y, width, height) => {
              // Scroll to center the item (offset by ~250px to approximate viewport center)
              scrollViewRef.current?.scrollTo({
                y: Math.max(0, y - 250),
                animated: true,
              });
              setHasScrolledToCurrent(true);
            },
            () => {
              // Fallback: try scrolling after a longer delay
              console.warn('Error measuring layout, using fallback');
              setTimeout(() => {
                // Estimate position based on item index and average card height
                const estimatedY = 300 + currentStepIndex * 150; // Header + progress + items
                scrollViewRef.current?.scrollTo({
                  y: Math.max(0, estimatedY - 250),
                  animated: true,
                });
                setHasScrolledToCurrent(true);
              }, 300);
            }
          );
        }
      }, 200);
    };

    // Start attempting to scroll
    attemptScroll();
  }, [checklist, isLoading, hasScrolledToCurrent]);

  if (isLoading || !checklist) {
    return (
      <LinearGradient
        colors={['#90dcb5', '#57a67f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}>
        <PathwayBackground opacity={0.15} animate={false} />
        <SafeAreaView className="flex-1">
          <NavigationBar onBack={onNavigateToHome} />
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className={combineClasses(typography.body.medium, 'mt-4 text-white shadow')}>
              Loading checklist...
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  // Sort items by order
  const sortedItems = [...checklist.items].sort((a, b) => a.order - b.order);
  const completedSteps = sortedItems.filter((item) => item.is_complete).length;
  const totalSteps = sortedItems.length;
  const currentStepIndex = sortedItems.findIndex((item) => !item.is_complete);
  const currentStep = currentStepIndex >= 0 ? currentStepIndex + 1 : totalSteps;
  const progressPercentage = Math.round((completedSteps / totalSteps) * 100);

  return (
    <LinearGradient
      colors={['#90dcb5', '#57a67f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}>
      <PathwayBackground opacity={0.15} animate={false} />
      <SafeAreaView className="flex-1">
        <NavigationBar onBack={onNavigateToHome} />
        <ScrollView
          ref={scrollViewRef}
          className={layout.scrollView}
          showsVerticalScrollIndicator={false}>
          <Animated.View
            ref={contentViewRef}
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
              getWebPadding(24, 32),
            ]}
            className="px-6 py-8">
            {/* Header */}
            <View className="mb-8">
              <Text className={combineClasses(typography.h2, 'mb-6 text-white shadow')}>
                Pre-Transplant Checklist
              </Text>
              <View className="h-1 w-16 rounded-full bg-white shadow" />
              <Text className={combineClasses(typography.body.large, 'mt-4 text-white shadow')}>
                Track your progress through required evaluations and tests
              </Text>
            </View>

            {/* Progress Summary */}
            <View className={combineClasses(cards.default.container, 'mb-8 bg-white/95')}>
              <Text className={combineClasses(typography.h5, 'mb-2 text-blue-900')}>
                Overall Progress
              </Text>
              <Text className={combineClasses(typography.body.small, 'mb-3 text-blue-800')}>
                {completedSteps} of {totalSteps} steps completed
              </Text>
              {/* Progress Bar */}
              <View className={progressStyles.container}>
                <View
                  className={progressStyles.bar.primary}
                  style={{ width: `${progressPercentage}%` }}
                />
              </View>
              <Text className={combineClasses(typography.body.small, 'mt-2 text-blue-800')}>
                {progressPercentage}% Complete
              </Text>
            </View>

            {/* Timeline Items */}
            <View className="mb-8">
              {sortedItems.map((item, index) => {
                const isCurrent = item.order === currentStep;
                const isComplete = item.is_complete;
                const isFuture = item.order > currentStep && !isComplete;
                const currentCardHeight = cardHeights[item.id] || 0;
                const nextItem = sortedItems[index + 1];
                const nextCardHeight = nextItem ? cardHeights[nextItem.id] || 0 : 0;
                // Line starts from center of current card/circle and extends to center of next card/circle
                // With items-center, circle and card are centered together, so line goes from center to center
                const spacing = 24; // mb-6 = 24px spacing between items
                const lineHeight =
                  currentCardHeight > 0 && nextCardHeight > 0
                    ? currentCardHeight / 2 + spacing + nextCardHeight / 2 // from center of current card to center of next card
                    : 0;

                const handleCardLayout = (event: LayoutChangeEvent) => {
                  const { height } = event.nativeEvent.layout;
                  setCardHeights((prev) => ({
                    ...prev,
                    [item.id]: height,
                  }));
                };

                return (
                  <View
                    key={item.id}
                    ref={(ref) => {
                      itemRefs.current[item.id] = ref;
                    }}
                    className="mb-6">
                    {/* Timeline Line - extends from center of current card/circle to center of next card/circle */}
                    {index < sortedItems.length - 1 && lineHeight > 0 && (
                      <View
                        className={combineClasses(
                          'absolute left-6 w-0.5',
                          isComplete ? 'bg-green-500' : isFuture ? 'bg-gray-200' : 'bg-gray-300'
                        )}
                        style={{
                          top: currentCardHeight / 2, // Start from center of current card (where circle is centered)
                          height: lineHeight,
                        }}
                      />
                    )}

                    {/* Timeline Item */}
                    <View
                      className={combineClasses(
                        'flex-row items-center',
                        isFuture ? 'opacity-100' : ''
                      )}>
                      {/* Timeline Dot - centered vertically with card */}
                      <View className="mr-4">
                        <View
                          className={combineClasses(
                            'h-12 w-12 items-center justify-center rounded-full border-2',
                            isComplete
                              ? 'border-green-500 bg-green-100'
                              : isCurrent
                                ? 'border-blue-500 bg-blue-100'
                                : isFuture
                                  ? 'border-gray-200 bg-gray-50'
                                  : 'border-gray-300 bg-gray-100'
                          )}>
                          {isComplete ? (
                            <Text className="text-xl text-green-700">✓</Text>
                          ) : (
                            <Text
                              className={combineClasses(
                                'text-lg font-semibold',
                                isCurrent
                                  ? 'text-blue-700'
                                  : isFuture
                                    ? 'text-gray-400'
                                    : 'text-gray-500'
                              )}>
                              {item.order}
                            </Text>
                          )}
                        </View>
                      </View>

                      {/* Content Card */}
                      <View className="flex-1">
                        <TouchableOpacity
                          onPress={() => !isFuture && onEditItem?.(item.id, item)}
                          disabled={isFuture}
                          activeOpacity={isFuture ? 1 : 0.7}
                          onLayout={handleCardLayout}
                          className={combineClasses(
                            cards.default.container,
                            isCurrent ? 'border-l-4 border-blue-500 bg-white/95' : '',
                            isComplete ? 'border-l-4 border-green-500 bg-green-50/95' : '',
                            isFuture ? 'bg-gray-50/95 opacity-75' : 'bg-white/95'
                          )}>
                          <View className="mb-2 flex-row items-center justify-between">
                            <Text
                              className={combineClasses(
                                typography.h5,
                                isComplete
                                  ? 'text-green-900'
                                  : isCurrent
                                    ? 'text-blue-900'
                                    : isFuture
                                      ? 'text-gray-400'
                                      : 'text-gray-900'
                              )}>
                              {item.title}
                            </Text>
                          </View>

                          {item.description && (
                            <Text
                              className={combineClasses(
                                typography.body.small,
                                'mb-3 leading-6',
                                isComplete
                                  ? 'text-green-800'
                                  : isFuture
                                    ? 'text-gray-400'
                                    : 'text-gray-700'
                              )}>
                              {item.description}
                            </Text>
                          )}

                          {item.notes && (
                            <View className="mb-3 rounded-lg border border-gray-200 bg-white/80 p-3">
                              <Text
                                className={combineClasses(
                                  typography.body.small,
                                  'font-semibold text-gray-900'
                                )}>
                                Your Notes:
                              </Text>
                              <Text
                                className={combineClasses(
                                  typography.body.small,
                                  'mt-1 text-gray-700'
                                )}>
                                {item.notes}
                              </Text>
                            </View>
                          )}

                          {item.completed_at && (
                            <View className="mt-2 flex-row items-center">
                              <Text className="mr-2 text-green-600">✓</Text>
                              <Text
                                className={combineClasses(typography.body.small, 'text-green-700')}>
                                Completed: {new Date(item.completed_at).toLocaleDateString()}
                              </Text>
                            </View>
                          )}
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Information Card */}
            <View className={combineClasses(cards.default.container, 'mb-6 bg-white/95')}>
              <Text className={combineClasses(typography.h5, 'mb-2 text-amber-900')}>
                About This Checklist
              </Text>
              <Text className={combineClasses(typography.body.small, 'leading-6 text-amber-800')}>
                This checklist helps you track the evaluations and tests typically required before
                transplant listing. You can mark items as complete, add notes about where records
                are stored, and see your overall progress. Work with your transplant team to ensure
                all required evaluations are completed.
              </Text>
            </View>
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
});
