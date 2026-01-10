import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  buttons,
  cards,
  typography,
  badges,
  progress as progressStyles,
  combineClasses,
  layout,
  getBadgeClasses,
} from '../styles/theme';
import { NavigationBar } from '../components/NavigationBar';
import questionsData from '../data/questions.json';
import { apiService } from '../services/api';

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
  onComplete: (results: {
    hasAbsolute: boolean;
    hasRelative: boolean;
    absoluteContraindications: Array<{ id: string; question: string }>;
    relativeContraindications: Array<{ id: string; question: string }>;
  }) => void;
  onNavigateToHome?: () => void;
};

export const TransplantQuestionnaire = ({
  patientId,
  onComplete,
  onNavigateToHome,
}: TransplantQuestionnaireProps) => {
  const [answers, setAnswers] = useState<AnswerType>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const infoModalContent = {
    heading: 'About This Assessment',
    description: `Core Feature: Eligibility Self-Assessment

A guided questionnaire that helps patients understand whether they might be candidates for transplant evaluation.

This is an educational tool that helps patients understand the general criteria and identify whether they should be asking their care team about referral.

Absolute Contraindications

Patients with these conditions should not be referred:

• Metastatic cancer or active malignancy
• Decompensated cirrhosis
• Severe irreversible lung disease
• Severe uncorrectable cardiac disease
• Progressive central neurodegenerative disease
• Demonstrated non-compliance placing an organ at risk

Relative Contraindications

These factors can be addressed before evaluation:

• Unstable psychiatric conditions
• Active substance use disorder
• Severe obesity
• Limited social support
• Active symptomatic cardiac disease not yet evaluated
• Recent stroke or TIA

Important note: There is no absolute age limit for transplantation. Advanced age alone is not a contraindication. Patients over 70 can and do receive successful transplants with significant survival benefit.`,
  };

  const handleAnswer = async (questionId: string, answer: 'yes' | 'no') => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    // Move to next question or submit
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, submit
      await submitQuestionnaire(newAnswers);
    }
  };

  const submitQuestionnaire = async (finalAnswers: AnswerType) => {
    setIsSubmitting(true);
    try {
      const results = calculateResults(finalAnswers);
      const submission = {
        patient_id: patientId,
        answers: finalAnswers as Record<string, string>,
        results: {
          absoluteContraindications: results.absoluteContraindications.map((q) => ({
            id: q.id,
            question: q.question,
          })),
          relativeContraindications: results.relativeContraindications.map((q) => ({
            id: q.id,
            question: q.question,
          })),
          hasAbsolute: results.hasAbsolute,
          hasRelative: results.hasRelative,
        },
      };

      await apiService.submitQuestionnaire(submission);
      onComplete({
        hasAbsolute: results.hasAbsolute,
        hasRelative: results.hasRelative,
        absoluteContraindications: results.absoluteContraindications.map((q) => ({
          id: q.id,
          question: q.question,
        })),
        relativeContraindications: results.relativeContraindications.map((q) => ({
          id: q.id,
          question: q.question,
        })),
      });
    } catch (error) {
      console.error('Error submitting questionnaire:', error);
      // TODO: Show error message to user
      setIsSubmitting(false);
    }
  };

  const calculateResults = (answersToCalculate: AnswerType) => {
    const absoluteContraindications = questions
      .filter((q) => q.category === 'absolute')
      .filter((q) => answersToCalculate[q.id] === 'yes');

    const relativeContraindications = questions
      .filter((q) => q.category === 'relative')
      .filter((q) => answersToCalculate[q.id] === 'yes');

    return {
      absoluteContraindications,
      relativeContraindications,
      hasAbsolute: absoluteContraindications.length > 0,
      hasRelative: relativeContraindications.length > 0,
    };
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
      <NavigationBar onBack={onNavigateToHome} infoModal={infoModalContent} />
      <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
        <View className="px-6 py-8">
          {/* Header */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h3, 'mb-2')}>
              Transplant Eligibility Self-Assessment
            </Text>
            <View className={progressStyles.indicator} />
          </View>

          {/* Progress Bar */}
          <View className="mb-6">
            <View className="mb-2 flex-row items-center justify-between">
              <Text className={typography.body.small}>
                Question {currentQuestionIndex + 1} of {questions.length}
              </Text>
              <Text className={typography.body.small}>{Math.round(progress)}%</Text>
            </View>
            <View className={progressStyles.container}>
              <View className={progressStyles.bar.secondary} style={{ width: `${progress}%` }} />
            </View>
          </View>

          {/* Question Card */}
          <View className={combineClasses(cards.question.container, 'mb-6')}>
            <View className="mb-3">
              {currentQuestion.category === 'absolute' && (
                <View className={badges.absolute.container}>
                  <Text className={badges.absolute.text}>Absolute</Text>
                </View>
              )}
              {currentQuestion.category === 'relative' && (
                <View className={badges.relative.container}>
                  <Text className={badges.relative.text}>Relative</Text>
                </View>
              )}
            </View>

            <Text className={combineClasses(typography.h5, 'mb-3 leading-7')}>
              {currentQuestion.question}
            </Text>

            {currentQuestion.description && (
              <View className={cards.question.description}>
                <Text className={typography.body.small}>{currentQuestion.description}</Text>
              </View>
            )}

            {/* Answer Buttons */}
            <View className="mt-4">
              <TouchableOpacity
                className={combineClasses(
                  buttons.answer.base,
                  answers[currentQuestion.id] === 'yes'
                    ? buttons.answer.selected
                    : buttons.answer.unselected,
                  'mb-3'
                )}
                onPress={() => handleAnswer(currentQuestion.id, 'yes')}
                activeOpacity={0.7}>
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

              <TouchableOpacity
                className={combineClasses(
                  buttons.answer.base,
                  answers[currentQuestion.id] === 'no'
                    ? buttons.answer.selected
                    : buttons.answer.unselected
                )}
                onPress={() => handleAnswer(currentQuestion.id, 'no')}
                activeOpacity={0.7}>
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
            </View>
          </View>

          {/* Navigation */}
          {currentQuestionIndex > 0 && (
            <TouchableOpacity
              className={combineClasses(buttons.outline.base, buttons.outline.enabled, 'mb-4')}
              onPress={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
              activeOpacity={0.7}>
              <Text className={buttons.outline.text}>Previous Question</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
