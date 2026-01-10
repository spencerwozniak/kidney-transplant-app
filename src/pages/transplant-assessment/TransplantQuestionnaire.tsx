import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
  const [answers, setAnswers] = useState<AnswerType>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Animation values for button feedback
  const yesButtonScale = useRef(new Animated.Value(1)).current;
  const noButtonScale = useRef(new Animated.Value(1)).current;

  const infoModalContent = {
    heading: 'Transplant Eligibility Self-Assessment',
    description: `This assessment helps you understand whether you might be a candidate for transplant evaluation.`,
  };

  const handleAnswer = async (questionId: string, answer: 'yes' | 'no') => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

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
        // All questions answered, submit
        submitQuestionnaire(newAnswers);
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
      <View className={layout.container.default}>
        <NavigationBar onBack={onNavigateToHome} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className={combineClasses(typography.body.medium, 'mt-4 text-gray-600')}>
            Saving your assessment...
          </Text>
        </View>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <SafeAreaView className={layout.container.default}>
      <NavigationBar onBack={handleBack} infoModal={infoModalContent} />
      <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-2">
          {/* Progress Bar */}
          <View className="mb-6">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className={typography.body.small}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </Text>
              <Text className={typography.body.small}>{Math.round(progress)}%</Text>
            </View>
            <View className={progressStyles.container}>
              <View className={progressStyles.bar.primary} style={{ width: `${progress}%` }} />
            </View>
          </View>

          {/* Question */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h4, 'mb-4 leading-7')}>
              {currentQuestion.question}
            </Text>

            {currentQuestion.description && (
              <View className="mb-4">
                <Text className={typography.body.small}>{currentQuestion.description}</Text>
              </View>
            )}

            {/* Answer Buttons */}
            <View className="mt-6">
              <Animated.View
                style={{
                  transform: [{ scale: yesButtonScale }],
                }}
                className="mb-3">
                <TouchableOpacity
                  className={combineClasses(
                    buttons.answer.base,
                    answers[currentQuestion.id] === 'yes'
                      ? buttons.answer.selected
                      : buttons.answer.unselected
                  )}
                  onPress={() => handleAnswer(currentQuestion.id, 'yes')}
                  activeOpacity={1}
                  disabled={isSubmitting}>
                  <Text
                    className={combineClasses(
                      buttons.answer.text,
                      answers[currentQuestion.id] === 'yes'
                        ? buttons.answer.textSelected
                        : buttons.answer.textUnselected
                    )}>
                    Yes
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              <Animated.View
                style={{
                  transform: [{ scale: noButtonScale }],
                }}>
                <TouchableOpacity
                  className={combineClasses(
                    buttons.answer.base,
                    answers[currentQuestion.id] === 'no'
                      ? buttons.answer.selected
                      : buttons.answer.unselected
                  )}
                  onPress={() => handleAnswer(currentQuestion.id, 'no')}
                  activeOpacity={1}
                  disabled={isSubmitting}>
                  <Text
                    className={combineClasses(
                      buttons.answer.text,
                      answers[currentQuestion.id] === 'no'
                        ? buttons.answer.textSelected
                        : buttons.answer.textUnselected
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
  );
};
