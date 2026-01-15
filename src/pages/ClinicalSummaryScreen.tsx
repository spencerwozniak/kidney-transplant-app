import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Animated, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Markdown from 'react-native-markdown-display';
import { typography, combineClasses, layout, cards } from '../styles/theme';
import { NavigationBar } from '../components/NavigationBar';
import { PathwayBackground } from '../components/PathwayBackground';
import { apiService } from '../services/api';
import { getWebPadding } from '../utils/webStyles';

type ClinicalSummaryScreenProps = {
  onBack: () => void;
};

export const ClinicalSummaryScreen = ({ onBack }: ClinicalSummaryScreenProps) => {
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const scrollViewRef = React.useRef<ScrollView>(null);

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
    fetchClinicalSummary();
  }, []);

  // Auto-scroll to bottom as content streams in
  useEffect(() => {
    if (isStreaming && summary && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [summary, isStreaming]);

  const fetchClinicalSummary = async () => {
    setIsLoading(true);
    setIsStreaming(false);
    setError(null);
    setSummary('');
    
    try {
      let accumulatedSummary = '';
      
      await apiService.exportClinicalSummaryStream(
        (chunk: string) => {
          // Update summary as chunks arrive
          accumulatedSummary += chunk;
          setSummary(accumulatedSummary);
          setIsStreaming(true);
          setIsLoading(false); // Stop showing spinner once first chunk arrives
        },
        () => {
          // On complete
          setIsStreaming(false);
          setIsLoading(false);
        },
        (errorMsg: string) => {
          // On error
          console.error('Error streaming clinical summary:', errorMsg);
          setError(errorMsg || 'Failed to generate clinical summary');
          setIsStreaming(false);
          setIsLoading(false);
        }
      );
    } catch (err: any) {
      console.error('Error fetching clinical summary:', err);
      setError(err?.message || 'Failed to generate clinical summary');
      setIsLoading(false);
      setIsStreaming(false);
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
        <NavigationBar onBack={onBack} />
        <ScrollView 
          ref={scrollViewRef}
          className={layout.scrollView} 
          showsVerticalScrollIndicator={false}>
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
                Clinical Summary
              </Text>
              <View className="h-1 w-16 rounded-full bg-white shadow" />
            </View>

            {/* Loading State - Only show if not streaming yet */}
            {isLoading && !isStreaming && (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className={combineClasses(typography.body.medium, 'mt-4 text-white shadow')}>
                  Generating clinical summary...
                </Text>
              </View>
            )}

            {/* Error State */}
            {error && (
              <View className={combineClasses(cards.default.container, 'mb-8 bg-white/95')}>
                <Text className={combineClasses(typography.h5, 'mb-2 text-red-900')}>Error</Text>
                <Text className={combineClasses(typography.body.small, 'leading-6 text-red-800')}>
                  {error}
                </Text>
              </View>
            )}

            {/* Clinical Summary Content - Show as it streams */}
            {(summary || isStreaming) && (
              <View className={combineClasses(cards.default.container, 'mb-6 bg-white/95 p-6')}>
                {summary ? (
                  <Markdown style={markdownStyles}>{summary}</Markdown>
                ) : (
                  <View className="items-center py-4">
                    <ActivityIndicator size="small" color="#3b82f6" />
                    <Text className={combineClasses(typography.body.small, 'mt-2 text-gray-600')}>
                      Starting generation...
                    </Text>
                  </View>
                )}
                {isStreaming && (
                  <View className="mt-4 flex-row items-center">
                    <ActivityIndicator size="small" color="#3b82f6" />
                    <Text className={combineClasses(typography.body.small, 'ml-2 text-gray-600')}>
                      Generating...
                    </Text>
                  </View>
                )}
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const markdownStyles = {
  body: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 12,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginTop: 16,
    marginBottom: 8,
    color: '#1F2937',
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginTop: 14,
    marginBottom: 6,
    color: '#1F2937',
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginTop: 12,
    marginBottom: 4,
    color: '#1F2937',
  },
  code_inline: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  code_block: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: 'monospace',
    fontSize: 14,
  },
  list_item: {
    marginBottom: 6,
  },
  bullet_list: {
    marginBottom: 8,
  },
  ordered_list: {
    marginBottom: 8,
  },
  strong: {
    fontWeight: 'bold' as const,
  },
  em: {
    fontStyle: 'italic' as const,
  },
  link: {
    color: '#059669',
    textDecorationLine: 'underline' as const,
  },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#D1D5DB',
    paddingLeft: 12,
    marginVertical: 8,
    fontStyle: 'italic' as const,
    color: '#4B5563',
  },
  table: {
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 4,
  },
  thead: {
    backgroundColor: '#F9FAFB',
  },
  th: {
    padding: 8,
    fontWeight: 'bold' as const,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  td: {
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  hr: {
    backgroundColor: '#E5E7EB',
    height: 1,
    marginVertical: 16,
  },
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
});
