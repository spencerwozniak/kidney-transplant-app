/**
 * Chat Screen Component
 *
 * Chat interface for interacting with the AI assistant about the transplant journey.
 * Connects to backend AI service to provide personalized responses.
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { apiService } from '@/services/api';

type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
};

type ChatScreenProps = {
  patientName?: string;
};

const SendIcon = ({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ChatScreen = ({ patientName = 'Friend' }: ChatScreenProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  // Initialize chat with welcome message and check AI status
  useEffect(() => {
    checkAIStatus();
    initializeChat();
  }, []);

  const checkAIStatus = async () => {
    try {
      const status = await apiService.getAIStatus();
      setAiEnabled(status.enabled);
      if (!status.enabled) {
        setError('AI assistant is not configured. Please contact support.');
      }
    } catch (err: any) {
      console.error('Error checking AI status:', err);
      setAiEnabled(false);
      setError('Unable to connect to AI service. Please try again later.');
    }
  };

  const initializeChat = () => {
    const welcomeMessage: ChatMessage = {
      id: '1',
      text: `Hello ${patientName}! I'm here to help answer your questions about your kidney transplant journey. What would you like to know?`,
      isUser: false,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading || !aiEnabled) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // Add user message immediately
    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);
    scrollToBottom();

    // Add loading message
    const loadingMessageId = (Date.now() + 1).toString();
    const loadingMessage: ChatMessage = {
      id: loadingMessageId,
      text: '',
      isUser: false,
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);
    scrollToBottom();

    try {
      // Call AI API
      const response = await apiService.queryAIAssistant({
        query: userMessage.text,
        // provider and model will use backend defaults if not specified
      });

      // Remove loading message and add AI response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== loadingMessageId);
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            text: response.response,
            isUser: false,
            timestamp: new Date(),
          },
        ];
      });
      scrollToBottom();
    } catch (err: any) {
      console.error('Error getting AI response:', err);

      // Remove loading message and add error message
      setMessages((prev) => {
        const filtered = prev.filter((msg) => msg.id !== loadingMessageId);
        return [
          ...filtered,
          {
            id: (Date.now() + 2).toString(),
            text: 'I apologize, but I encountered an error processing your question. Please try again or contact support if the issue persists.',
            isUser: false,
            timestamp: new Date(),
          },
        ];
      });

      setError(err.message || 'Failed to get AI response');
      scrollToBottom();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        {/* Header */}
        <View className="border-b border-gray-200 bg-white px-4 py-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-lg font-semibold text-gray-900">Chat Assistant</Text>
              <Text className="text-sm text-gray-500">
                {aiEnabled === null
                  ? 'Checking status...'
                  : aiEnabled
                    ? 'Ask me anything about your transplant journey'
                    : 'AI assistant unavailable'}
              </Text>
            </View>
            {aiEnabled === false && <View className="ml-2 h-2 w-2 rounded-full bg-red-500" />}
            {aiEnabled === true && <View className="ml-2 h-2 w-2 rounded-full bg-green-500" />}
          </View>
          {error && (
            <View className="mt-2 rounded-lg bg-red-50 px-3 py-2">
              <Text className="text-xs text-red-600">{error}</Text>
            </View>
          )}
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          className="flex-1 px-4 py-4"
          onContentSizeChange={scrollToBottom}>
          {messages.map((message) => (
            <View
              key={message.id}
              className={`mb-4 ${message.isUser ? 'items-end' : 'items-start'}`}>
              <View
                className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                  message.isUser ? 'rounded-tr-sm bg-green-600' : 'rounded-tl-sm bg-gray-100'
                }`}>
                {message.isLoading ? (
                  <View className="flex-row items-center" style={{ gap: 8 }}>
                    <ActivityIndicator size="small" color="#6B7280" />
                    <Text className="text-sm text-gray-500">Thinking...</Text>
                  </View>
                ) : (
                  <Text className={`text-sm ${message.isUser ? 'text-white' : 'text-gray-900'}`}>
                    {message.text}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View className="border-t border-gray-200 bg-white px-4 py-3">
          <View className="flex-row items-center" style={{ gap: 8 }}>
            <TextInput
              className="flex-1 rounded-full border border-gray-300 bg-gray-50 px-4 py-3 text-gray-900"
              placeholder={!aiEnabled ? 'AI assistant is unavailable...' : 'Type your message...'}
              placeholderTextColor="#9CA3AF"
              value={inputText}
              onChangeText={setInputText}
              multiline
              maxLength={500}
              onSubmitEditing={handleSend}
              editable={aiEnabled === true && !isLoading}
            />
            <TouchableOpacity
              onPress={handleSend}
              disabled={inputText.trim() === '' || isLoading || !aiEnabled}
              className={`rounded-full p-3 ${
                inputText.trim() === '' || isLoading || !aiEnabled ? 'bg-gray-300' : 'bg-green-600'
              }`}
              activeOpacity={0.7}>
              {isLoading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <SendIcon
                  size={20}
                  color={inputText.trim() === '' || !aiEnabled ? '#9CA3AF' : '#FFFFFF'}
                />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
