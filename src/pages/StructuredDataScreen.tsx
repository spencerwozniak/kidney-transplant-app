import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import { typography, combineClasses, layout, cards, buttons } from '../styles/theme';
import { NavigationBar } from '../components/NavigationBar';
import { PathwayBackground } from '../components/PathwayBackground';
import { apiService } from '../services/api';
import { getWebPadding } from '../utils/webStyles';

type StructuredDataScreenProps = {
  onBack: () => void;
};

export const StructuredDataScreen = ({ onBack }: StructuredDataScreenProps) => {
  const [fhirData, setFhirData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'json' | 'markdown'>('json');
  const [markdownContent, setMarkdownContent] = useState<string>('');
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

  useEffect(() => {
    fetchFhirData();
  }, []);

  const fetchFhirData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.exportFhirData();
      setFhirData(data);
    } catch (err: any) {
      console.error('Error fetching FHIR data:', err);
      setError(err?.message || 'Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <LinearGradient
        colors={['#90dcb5', '#57a67f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}>
        <PathwayBackground opacity={0.15} animate={false} />
        <SafeAreaView className="flex-1">
          <NavigationBar onBack={onBack} />
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#ffffff" />
            <Text className={combineClasses(typography.body.medium, 'mt-4 text-white shadow')}>
              Loading structured data...
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

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
              getWebPadding(24, 32),
            ]}
            className="px-6 py-8">
            {/* Header */}
            <View className="mb-8">
              <Text className={combineClasses(typography.h2, 'mb-6 text-white shadow')}>
                Structured Data
              </Text>
              <View className="h-1 w-16 rounded-full bg-white shadow" />
            </View>

            {/* Error State */}
            {error && (
              <View className={combineClasses(cards.default.container, 'mb-8 bg-white/95')}>
                <Text className={combineClasses(typography.h5, 'mb-2 text-red-900')}>Error</Text>
                <Text className={combineClasses(typography.body.small, 'leading-6 text-red-800')}>
                  {error}
                </Text>
              </View>
            )}

            {/* FHIR Data Display */}
            {fhirData && (
              <>
                {/* Full JSON Display */}
                <View className={combineClasses(cards.default.container, 'mb-6 bg-white/95')}>
                  <Text className={combineClasses(typography.h5, 'mb-4 text-blue-900')}>
                    Full FHIR Bundle (JSON)
                  </Text>
                  <View className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                    <ScrollView
                      horizontal={false}
                      showsVerticalScrollIndicator={true}
                      style={{ maxHeight: 600 }}>
                      <Text
                        className={combineClasses(typography.body.small, 'font-mono text-gray-800')}
                        style={{ fontSize: 11 }}>
                        {JSON.stringify(fhirData, null, 2)}
                      </Text>
                    </ScrollView>
                  </View>
                </View>
                {/* Resource Summary */}
                {fhirData.entry && fhirData.entry.length > 0 && (
                  <View className={combineClasses(cards.default.container, 'mb-8 bg-white/95')}>
                    <Text className={combineClasses(typography.h5, 'mb-4 text-blue-900')}>
                      Resources Included
                    </Text>
                    <View className="space-y-3">
                      {(() => {
                        const resourceCounts: Record<string, number> = {};
                        fhirData.entry.forEach((entry: any) => {
                          const resourceType = entry.resource?.resourceType || 'Unknown';
                          resourceCounts[resourceType] = (resourceCounts[resourceType] || 0) + 1;
                        });
                        return Object.entries(resourceCounts).map(([type, count]) => (
                          <View
                            key={type}
                            className="flex-row items-center justify-between rounded-lg bg-blue-50 p-3">
                            <Text
                              className={combineClasses(
                                typography.body.small,
                                'font-semibold text-blue-900'
                              )}>
                              {type}
                            </Text>
                            <Text
                              className={combineClasses(
                                typography.body.small,
                                'font-semibold text-blue-900'
                              )}>
                              {count}
                            </Text>
                          </View>
                        ));
                      })()}
                    </View>
                  </View>
                )}
              </>
            )}
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
