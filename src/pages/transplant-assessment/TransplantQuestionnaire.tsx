import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  buttons,
  typography,
  badges,
  progress as progressStyles,
  combineClasses,
  layout,
  getBadgeClasses,
} from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { PathwayBackground } from '../../components/PathwayBackground';
import questionsData from '../../data/questions.json';
import { apiService } from '../../services/api';

type QuestionType = {
  id: string;
  category: 'absolute' | 'relative' | 'general';
  question: string;
  description?: string;
};

type AnswerType = {
  [key: string]: 'yes' | 'no' | null;
};

// Use index-based answers to ensure each question has unique state
type IndexBasedAnswers = {
  [index: number]: 'yes' | 'no';
};

const questions = questionsData as QuestionType[];

type TransplantQuestionnaireProps = {
  patientId: string;
  onComplete: () => void;
  onNavigateToHome?: () => void;
  onNavigateToAssessmentIntro?: () => void;
};

export const TransplantQuestionnaire = ({
  patientId,
  onComplete,
  onNavigateToHome,
  onNavigateToAssessmentIntro,
}: TransplantQuestionnaireProps) => {
  // Store answers by question index to ensure uniqueness
  const [indexBasedAnswers, setIndexBasedAnswers] = useState<IndexBasedAnswers>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values for button feedback
  const yesButtonScale = useRef(new Animated.Value(1)).current;
  const noButtonScale = useRef(new Animated.Value(1)).current;

  const infoModalContent = {
    heading: 'Transplant Eligibility Self-Assessment',
    description: `This assessment helps you understand whether you might be a candidate for transplant evaluation.`,
  };

  const handleAnswer = async (answer: 'yes' | 'no') => {
    // Store answer by question index to ensure uniqueness
    const newIndexBasedAnswers = { ...indexBasedAnswers, [currentQuestionIndex]: answer };
    setIndexBasedAnswers(newIndexBasedAnswers);

    // Animate the clicked button
    const buttonScale = answer === 'yes' ? yesButtonScale : noButtonScale;

    // Scale animation: press down, then bounce back
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    // Wait for animation to complete before moving to next question
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        // Reset animations for next question
        yesButtonScale.setValue(1);
        noButtonScale.setValue(1);
      } else {
        // All questions answered, convert index-based answers to question ID-based format for submission
        const answersByQuestionId: AnswerType = {};
        questions.forEach((question, index) => {
          if (newIndexBasedAnswers[index] !== undefined) {
            answersByQuestionId[question.id] = newIndexBasedAnswers[index] as 'yes' | 'no';
          }
        });
        submitQuestionnaire(answersByQuestionId);
      }
    }, 300);
  };

  const submitQuestionnaire = async (finalAnswers: AnswerType) => {
    setIsSubmitting(true);
    try {
      // Only send answers - backend will compute status
      const submission = {
        patient_id: patientId,
        answers: finalAnswers as Record<string, string>,
      };

      await apiService.submitQuestionnaire(submission);
      // Status is computed and saved on backend
      // Navigate to home where status will be fetched
      onComplete();
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      // TODO: Show error message to user
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex === 0) {
      // On first question, go back to assessment intro
      onNavigateToAssessmentIntro?.();
    } else {
      // Otherwise, go to previous question
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  if (isSubmitting) {
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
              Saving your assessment...
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <LinearGradient
      colors={['#90dcb5', '#57a67f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}>
      <PathwayBackground opacity={0.15} animate={false} />
      <SafeAreaView className="flex-1">
        <NavigationBar onBack={handleBack} infoModal={infoModalContent} />
        <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
          <View className="px-6 pb-2">
            {/* Progress Bar */}
            <View className="mb-6">
              <View className="mb-2 flex-row items-center justify-between">
                <Text
                  className={combineClasses(
                    typography.body.medium,
                    'font-semibold text-white shadow'
                  )}>
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Text>
                <Text
                  className={combineClasses(
                    typography.body.medium,
                    'font-semibold text-white shadow'
                  )}>
                  {Math.round(progress)}%
                </Text>
              </View>
              <View className={progressStyles.container}>
                <View className={progressStyles.bar.primary} style={{ width: `${progress}%` }} />
              </View>
            </View>

            {/* Question */}
            <View className="mb-8">
              <Text className={combineClasses(typography.h4, 'mb-4 text-white shadow')}>
                {currentQuestion.question}
              </Text>

              {currentQuestion.description && (
                <View className="mb-4">
                  <Text className={combineClasses(typography.body.large, 'text-white shadow')}>
                    {currentQuestion.description}
                  </Text>
                </View>
              )}

              {/* Answer Buttons */}
              <View className="mt-6 gap-4">
                <Animated.View
                  key={`yes-${currentQuestionIndex}`}
                  style={{
                    transform: [{ scale: yesButtonScale }],
                  }}
                  className="mb-3">
                  <TouchableOpacity
                    className={combineClasses(
                      'flex-1 rounded-lg border-2 p-3',
                      indexBasedAnswers[currentQuestionIndex] === 'yes'
                        ? 'border-green-600 bg-green-100'
                        : 'border-gray-200 bg-white'
                    )}
                    onPress={() => handleAnswer('yes')}
                    activeOpacity={0.8}
                    disabled={isSubmitting}>
                    <Text
                      className={combineClasses(
                        'text-center text-lg font-semibold',
                        indexBasedAnswers[currentQuestionIndex] === 'yes'
                          ? 'font-bold text-green-600'
                          : 'text-green-700'
                      )}>
                      Yes
                    </Text>
                  </TouchableOpacity>
                </Animated.View>

                <Animated.View
                  key={`no-${currentQuestionIndex}`}
                  style={{
                    transform: [{ scale: noButtonScale }],
                  }}>
                  <TouchableOpacity
                    className={combineClasses(
                      'flex-1 rounded-lg border-2 p-3',
                      indexBasedAnswers[currentQuestionIndex] === 'no'
                        ? 'border-green-600 bg-green-100'
                        : 'border-gray-200 bg-white'
                    )}
                    onPress={() => handleAnswer('no')}
                    activeOpacity={0.8}
                    disabled={isSubmitting}>
                    <Text
                      className={combineClasses(
                        'text-center text-lg font-semibold',
                        indexBasedAnswers[currentQuestionIndex] === 'no'
                          ? 'font-bold text-green-600'
                          : 'text-green-700'
                      )}>
                      No
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </View>
          </View>
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
