/**
 * Document Text Viewer Screen
 *
 * Displays the extracted text content from an uploaded document
 */

import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, ActivityIndicator, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cards, typography, combineClasses, layout } from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { PathwayBackground } from '../../components/PathwayBackground';
import { apiService } from '../../services/api';
import { getWebPadding } from '../../utils/webStyles';

type DocumentTextViewerScreenProps = {
  documentPath: string;
  onNavigateBack?: () => void;
};

export const DocumentTextViewerScreen = ({
  documentPath,
  onNavigateBack,
}: DocumentTextViewerScreenProps) => {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
    fetchDocumentText();
  }, [documentPath]);

  const getFileName = (path: string): string => {
    const parts = path.split('/');
    return parts[parts.length - 1] || path;
  };

  const fetchDocumentText = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Document path format: documents/{patient_id}/{item_id}/{filename}
      // Text file is at: documents/{patient_id}/{item_id}/{filename}.txt
      // FastAPI's :path parameter handles URL encoding automatically, so we just need to
      // encode the path to handle special characters in filenames
      const textPath = documentPath + '.txt';
      // Use encodeURIComponent on the full path (same as ChecklistDocumentsScreen)
      const encodedPath = encodeURIComponent(textPath);
      const url = apiService.makeUrl(`/api/v1/documents/${encodedPath}`);

      // Get device ID (same logic as apiService)
      const getDeviceId = (): string => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage.getItem('device_id') || '';
          }
          return (globalThis as any).__DEVICE_ID__ || '';
        } catch {
          return '';
        }
      };
      const deviceId = getDeviceId();

      // Use fetch directly since we need to get text content, not JSON
      // But we still need to include the X-Device-ID header
      const response = await fetch(url, {
        headers: {
          'X-Device-ID': deviceId,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('Text content not available for this document.');
        } else if (response.status === 400) {
          setError('Invalid document path. Please try again.');
        } else {
          setError('Failed to load document text. Please try again.');
        }
        return;
      }

      const text = await response.text();
      setTextContent(text);
    } catch (error: any) {
      console.error('Error fetching document text:', error);
      setError('Failed to load document text. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#90dcb5', '#57a67f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}>
      <PathwayBackground opacity={0.15} animate={false} />
      <SafeAreaView className="flex-1">
        <NavigationBar onBack={onNavigateBack} />
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
            <View className="mb-6">
              <Text className={combineClasses(typography.h2, 'mb-4 text-white shadow')}>
                Uploaded Document
              </Text>
              <View className="h-1 w-16 rounded-full bg-white shadow" />
              <Text className={combineClasses(typography.body.medium, 'mt-4 text-white shadow')}>
                {getFileName(documentPath)}
              </Text>
            </View>

            {/* Loading State */}
            {isLoading && (
              <View className={combineClasses(cards.default.container, 'bg-white/95')}>
                <View className="items-center py-8">
                  <ActivityIndicator size="large" color="#3b82f6" />
                  <Text className={combineClasses(typography.body.small, 'mt-4 text-gray-600')}>
                    Loading document text...
                  </Text>
                </View>
              </View>
            )}

            {/* Error State */}
            {!isLoading && error && (
              <View
                className={combineClasses(
                  cards.default.container,
                  'border-l-4 border-red-500 bg-white/95'
                )}>
                <Text className={combineClasses(typography.h5, 'mb-2 text-red-900')}>
                  Unable to Load Text
                </Text>
                <Text className={combineClasses(typography.body.small, 'leading-6 text-red-800')}>
                  {error}
                </Text>
              </View>
            )}

            {/* Text Content */}
            {!isLoading && !error && textContent && (
              <View className={combineClasses(cards.default.container, 'bg-white/95')}>
                <Text
                  className={combineClasses(
                    typography.body.small,
                    'whitespace-pre-wrap leading-6 text-gray-800'
                  )}>
                  {textContent}
                </Text>
              </View>
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
