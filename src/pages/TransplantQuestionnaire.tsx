import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
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

type QuestionType = {
  id: string;
  category: 'absolute' | 'relative' | 'general';
  question: string;
  description?: string;
};

type AnswerType = {
  [key: string]: 'yes' | 'no' | null;
};

const questions: QuestionType[] = [
  // Absolute Contraindications
  {
    id: 'metastatic_cancer',
    category: 'absolute',
    question: 'Do you have metastatic cancer or active malignancy?',
    description:
      'Cancer that has spread to other parts of the body or active cancer that is currently being treated',
  },
  {
    id: 'decompensated_cirrhosis',
    category: 'absolute',
    question: 'Do you have decompensated cirrhosis?',
    description:
      'Advanced liver disease with complications such as fluid buildup, confusion, or bleeding',
  },
  {
    id: 'severe_lung_disease',
    category: 'absolute',
    question: 'Do you have severe irreversible lung disease?',
    description: 'Lung conditions that significantly limit your breathing and cannot be improved',
  },
  {
    id: 'severe_cardiac_disease',
    category: 'absolute',
    question: 'Do you have severe uncorrectable cardiac disease?',
    description: 'Serious heart conditions that cannot be fixed and would make surgery too risky',
  },
  {
    id: 'neurodegenerative',
    category: 'absolute',
    question: 'Do you have progressive central neurodegenerative disease?',
    description:
      'Conditions like advanced dementia or progressive neurological disorders affecting the brain',
  },
  {
    id: 'non_compliance',
    category: 'absolute',
    question: 'Have you demonstrated non-compliance that would place an organ at risk?',
    description:
      'History of not following medical instructions or treatment plans that could endanger a transplanted organ',
  },
  // Relative Contraindications
  {
    id: 'psychiatric',
    category: 'relative',
    question: 'Do you have unstable psychiatric conditions?',
    description: 'Mental health conditions that are not currently well-managed',
  },
  {
    id: 'substance_use',
    category: 'relative',
    question: 'Do you have an active substance use disorder?',
    description: 'Current problematic use of alcohol, drugs, or other substances',
  },
  {
    id: 'severe_obesity',
    category: 'relative',
    question: 'Do you have severe obesity?',
    description:
      'Body Mass Index (BMI) of 40 or higher, or BMI of 35+ with obesity-related health problems',
  },
  {
    id: 'social_support',
    category: 'relative',
    question: 'Do you have limited social support?',
    description: 'Lack of family, friends, or caregivers who can help with post-transplant care',
  },
  {
    id: 'symptomatic_cardiac',
    category: 'relative',
    question: 'Do you have active symptomatic cardiac disease that has not yet been evaluated?',
    description:
      'Heart-related symptoms (chest pain, shortness of breath, irregular heartbeat) that need medical evaluation',
  },
  {
    id: 'recent_stroke',
    category: 'relative',
    question: 'Have you had a recent stroke or TIA (transient ischemic attack)?',
    description: 'Stroke or mini-stroke within the past 6 months',
  },
  // General/Informational
  {
    id: 'age_concern',
    category: 'general',
    question: 'Are you concerned about your age affecting transplant eligibility?',
    description:
      'Note: There is no absolute age limit. Patients over 70 can receive successful transplants.',
  },
];

type TransplantQuestionnaireProps = {
  onNavigateToHome?: () => void;
};

export const TransplantQuestionnaire = ({
  onNavigateToHome,
}: TransplantQuestionnaireProps = {}) => {
  const [answers, setAnswers] = useState<AnswerType>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

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

  const handleAnswer = (questionId: string, answer: 'yes' | 'no') => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));

    // Move to next question or show results
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const resetQuestionnaire = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setShowResults(false);
  };

  const calculateResults = () => {
    const absoluteContraindications = questions
      .filter((q) => q.category === 'absolute')
      .filter((q) => answers[q.id] === 'yes');

    const relativeContraindications = questions
      .filter((q) => q.category === 'relative')
      .filter((q) => answers[q.id] === 'yes');

    return {
      absoluteContraindications,
      relativeContraindications,
      hasAbsolute: absoluteContraindications.length > 0,
      hasRelative: relativeContraindications.length > 0,
    };
  };

  if (showResults) {
    const results = calculateResults();
    return (
      <SafeAreaView className={layout.container.default}>
        <NavigationBar onBack={onNavigateToHome} />
        <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
          <View className="px-6 py-8">
            {/* Header */}
            <View className="mb-8">
              <Text className={combineClasses(typography.h3, 'mb-2')}>Assessment Results</Text>
              <View className={progressStyles.indicator} />
            </View>

            {/* Important Disclaimer */}
            <View className={combineClasses(cards.colored.amber, 'mb-6')}>
              <Text className="mb-2 text-sm font-bold text-amber-900">Important Disclaimer</Text>
              <Text className="text-sm leading-5 text-amber-800">
                This is an educational tool only. It is not a substitute for professional medical
                evaluation. Please discuss your results with your healthcare team to determine if
                transplant evaluation is appropriate for you.
              </Text>
            </View>

            {/* Absolute Contraindications */}
            {results.hasAbsolute ? (
              <View className={combineClasses(cards.colored.red, 'mb-6')}>
                <Text className="mb-3 text-lg font-bold text-red-900">
                  Absolute Contraindications Identified
                </Text>
                <Text className="mb-3 text-sm leading-5 text-red-800">
                  Based on your responses, you indicated the following conditions that are
                  considered absolute contraindications:
                </Text>
                {results.absoluteContraindications.map((q) => (
                  <View key={q.id} className={cards.result.container}>
                    <Text className="text-sm font-semibold text-red-900">{q.question}</Text>
                  </View>
                ))}
                <Text className="mt-3 text-sm font-semibold leading-5 text-red-900">
                  Recommendation: Please discuss these conditions with your care team. Patients with
                  these conditions should not be referred for transplant evaluation at this time.
                </Text>
              </View>
            ) : (
              <View className={combineClasses(cards.colored.green, 'mb-6')}>
                <Text className="mb-2 text-lg font-bold text-green-900">
                  ✓ No Absolute Contraindications
                </Text>
                <Text className="text-sm leading-5 text-green-800">
                  Based on your responses, you did not indicate any absolute contraindications for
                  kidney transplant evaluation.
                </Text>
              </View>
            )}

            {/* Relative Contraindications */}
            {results.hasRelative ? (
              <View className={combineClasses(cards.colored.yellow, 'mb-6')}>
                <Text className="mb-3 text-lg font-bold text-yellow-900">
                  Relative Contraindications Identified
                </Text>
                <Text className="mb-3 text-sm leading-5 text-yellow-800">
                  You indicated the following factors that may need to be addressed before
                  evaluation:
                </Text>
                {results.relativeContraindications.map((q) => (
                  <View key={q.id} className={cards.result.container}>
                    <Text className="text-sm font-semibold text-yellow-900">{q.question}</Text>
                  </View>
                ))}
                <Text className="mt-3 text-sm font-semibold leading-5 text-yellow-900">
                  Recommendation: These factors can often be addressed with appropriate treatment
                  and support. Discuss these with your care team to develop a plan before transplant
                  evaluation.
                </Text>
              </View>
            ) : (
              <View className={combineClasses(cards.colored.green, 'mb-6')}>
                <Text className="mb-2 text-lg font-bold text-green-900">
                  ✓ No Relative Contraindications
                </Text>
                <Text className="text-sm leading-5 text-green-800">
                  You did not indicate any relative contraindications that need to be addressed.
                </Text>
              </View>
            )}

            {/* Age Information */}
            <View className={combineClasses(cards.colored.blue, 'mb-6')}>
              <Text className="mb-2 text-lg font-bold text-blue-900">About Age</Text>
              <Text className="text-sm leading-5 text-blue-800">
                There is no absolute age limit for kidney transplantation. Advanced age alone is not
                a contraindication. Patients over 70 can and do receive successful transplants with
                significant survival benefit. Your care team will evaluate your overall health and
                fitness, not just your age.
              </Text>
            </View>

            {/* Next Steps */}
            <View className={combineClasses(cards.default.container, 'mb-6')}>
              <Text className={combineClasses(typography.h5, 'mb-3')}>Next Steps</Text>
              <Text className={combineClasses(typography.body.small, 'mb-2')}>
                1. Review these results with your nephrologist or primary care physician
              </Text>
              <Text className={combineClasses(typography.body.small, 'mb-2')}>
                2. Discuss whether transplant evaluation referral is appropriate for you
              </Text>
              <Text className={combineClasses(typography.body.small, 'mb-2')}>
                3. If you have relative contraindications, work with your care team to address them
              </Text>
              <Text className={typography.body.small}>
                4. Remember: This assessment is educational only. Your medical team will make the
                final determination about transplant candidacy.
              </Text>
            </View>

            {/* Action Buttons */}
            <View className="mt-4">
              <TouchableOpacity
                className={combineClasses(buttons.primary.base, buttons.primary.enabled, 'mb-3')}
                onPress={resetQuestionnaire}
                activeOpacity={0.8}>
                <Text className={buttons.primary.text}>Retake Assessment</Text>
              </TouchableOpacity>
              {onNavigateToHome && (
                <TouchableOpacity
                  className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
                  onPress={onNavigateToHome}
                  activeOpacity={0.8}>
                  <Text className={buttons.outline.text}>Back to Home</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
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
