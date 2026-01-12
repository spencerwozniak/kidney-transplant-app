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
import Markdown from 'react-native-markdown-display';
import { apiService } from '@/services/api';

type ChatMessage = {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  isLoading?: boolean;
};

type Conversation = {
  userMessage: ChatMessage;
  botResponse: string;
  isStreaming: boolean;
};

type ChatScreenProps = {
  patientName?: string;
};

const SendIcon = ({ size = 20, color = '#FFFFFF' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 4L12 20M12 4L6 10M12 4L18 10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const markdownStyles = {
  body: {
    fontSize: 16,
    color: '#111827',
    lineHeight: 24,
  },
  paragraph: {
    marginTop: 0,
    marginBottom: 8,
  },
  heading1: {
    fontSize: 24,
    fontWeight: 'bold' as const,
    marginTop: 8,
    marginBottom: 4,
  },
  heading2: {
    fontSize: 20,
    fontWeight: 'bold' as const,
    marginTop: 8,
    marginBottom: 4,
  },
  heading3: {
    fontSize: 18,
    fontWeight: 'bold' as const,
    marginTop: 8,
    marginBottom: 4,
  },
  code_inline: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
    fontFamily: 'monospace',
  },
  code_block: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    fontFamily: 'monospace',
  },
  list_item: {
    marginBottom: 4,
  },
  strong: {
    fontWeight: 'bold' as const,
  },
  em: {
    fontStyle: 'italic' as const,
  },
  link: {
    color: '#059669',
  },
};

export const ChatScreen = ({ patientName = 'Friend' }: ChatScreenProps) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [welcomeMessage, setWelcomeMessage] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [aiEnabled, setAiEnabled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [typingMessage, setTypingMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
    // Set welcome message in a chat bubble
    setWelcomeMessage(
      `Hello ${patientName}! I'm here to help answer your questions about your kidney transplant journey. What would you like to know?`
    );
    setConversations([]);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleStop = () => {
    // Cancel the streaming request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Finalize the current conversation with whatever we have
    if (typingMessage) {
      setConversations((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            botResponse: typingMessage,
            isStreaming: false,
          };
        }
        return updated;
      });
    }

    setIsTyping(false);
    setTypingMessage('');
    setIsLoading(false);
  };

  const handleSend = async () => {
    if (inputText.trim() === '' || isLoading || !aiEnabled) return;

    // If already typing, stop instead
    if (isTyping) {
      handleStop();
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    // Add new conversation with user message
    const newConversation: Conversation = {
      userMessage,
      botResponse: '',
      isStreaming: true,
    };

    setConversations((prev) => [...prev, newConversation]);
    setInputText('');
    setIsLoading(true);
    setIsTyping(true);
    setTypingMessage('');
    setError(null);
    scrollToBottom();

    // Create AbortController for this request
    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      let accumulatedResponse = '';

      // Call streaming AI API
      await apiService.queryAIAssistantStream(
        {
          query: userMessage.text,
        },
        (chunk: string) => {
          // Update typing message as chunks arrive
          accumulatedResponse += chunk;
          setTypingMessage(accumulatedResponse);
          scrollToBottom();
        },
        (errorMsg: string) => {
          console.error('Error getting AI response:', errorMsg);
          setError(errorMsg);
          setConversations((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0) {
              updated[lastIndex] = {
                ...updated[lastIndex],
                botResponse:
                  'I apologize, but I encountered an error processing your question. Please try again or contact support if the issue persists.',
                isStreaming: false,
              };
            }
            return updated;
          });
          setIsTyping(false);
          setTypingMessage('');
          setIsLoading(false);
        },
        () => {
          // On complete, finalize the conversation
          setConversations((prev) => {
            const updated = [...prev];
            const lastIndex = updated.length - 1;
            if (lastIndex >= 0) {
              updated[lastIndex] = {
                ...updated[lastIndex],
                botResponse: accumulatedResponse,
                isStreaming: false,
              };
            }
            return updated;
          });
          setIsTyping(false);
          setTypingMessage('');
          setIsLoading(false);
          scrollToBottom();
        }
      );
    } catch (err: any) {
      // Ignore abort errors
      if (err.name === 'AbortError') {
        return;
      }

      console.error('Error getting AI response:', err);
      setError(err.message || 'Failed to get AI response');
      setConversations((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (lastIndex >= 0) {
          updated[lastIndex] = {
            ...updated[lastIndex],
            botResponse:
              'I apologize, but I encountered an error processing your question. Please try again or contact support if the issue persists.',
            isStreaming: false,
          };
        }
        return updated;
      });
      setIsTyping(false);
      setTypingMessage('');
      setIsLoading(false);
      scrollToBottom();
    } finally {
      abortControllerRef.current = null;
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
          {/* Welcome Message in Chat Bubble */}
          {welcomeMessage && (
            <View className="mb-4 items-start">
              <View className="max-w-[80%] rounded-2xl rounded-tl-sm bg-gray-100 px-4 py-3">
                <Text className="text-sm text-gray-900">{welcomeMessage}</Text>
              </View>
            </View>
          )}

          {/* Conversations */}
          {conversations.map((conversation, index) => (
            <View key={conversation.userMessage.id} className="mb-6">
              {/* User Message */}
              <View className="mb-3 items-end">
                <View className="max-w-[80%] rounded-2xl rounded-tr-sm bg-green-600 px-4 py-3">
                  <Text className="text-sm text-white">{conversation.userMessage.text}</Text>
                </View>
              </View>

              {/* Bot Response - Full Width Text (Not in Bubble) */}
              <View className="px-2">
                {conversation.isStreaming && index === conversations.length - 1 ? (
                  typingMessage ? (
                    <Markdown style={markdownStyles}>{typingMessage}</Markdown>
                  ) : (
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <ActivityIndicator size="small" color="#6B7280" />
                      <Text className="text-sm text-gray-500">Thinking...</Text>
                    </View>
                  )
                ) : (
                  <Markdown style={markdownStyles}>{conversation.botResponse}</Markdown>
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
              disabled={inputText.trim() === '' || (!isTyping && !aiEnabled)}
              className={`rounded-full p-3 ${
                inputText.trim() === '' || (!isTyping && !aiEnabled)
                  ? 'bg-gray-300'
                  : 'bg-green-600'
              }`}
              activeOpacity={0.7}>
              {isTyping ? (
                <Text className="text-xs font-semibold text-white">Stop</Text>
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
