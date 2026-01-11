import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
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
import { apiService } from '../../services/api';

type QuestionType = {
  id: string;
  question: string;
  description?: string;
  type: 'multiple-choice' | 'text' | 'yes-no-uncertain' | 'yes-no' | 'picker';
  options?: string[];
  placeholder?: string;
};

// US States list
const US_STATES = [
  'Alabama',
  'Alaska',
  'Arizona',
  'Arkansas',
  'California',
  'Colorado',
  'Connecticut',
  'Delaware',
  'Florida',
  'Georgia',
  'Hawaii',
  'Idaho',
  'Illinois',
  'Indiana',
  'Iowa',
  'Kansas',
  'Kentucky',
  'Louisiana',
  'Maine',
  'Maryland',
  'Massachusetts',
  'Michigan',
  'Minnesota',
  'Mississippi',
  'Missouri',
  'Montana',
  'Nebraska',
  'Nevada',
  'New Hampshire',
  'New Jersey',
  'New Mexico',
  'New York',
  'North Carolina',
  'North Dakota',
  'Ohio',
  'Oklahoma',
  'Oregon',
  'Pennsylvania',
  'Rhode Island',
  'South Carolina',
  'South Dakota',
  'Tennessee',
  'Texas',
  'Utah',
  'Vermont',
  'Virginia',
  'Washington',
  'West Virginia',
  'Wisconsin',
  'Wyoming',
  'District of Columbia',
];

const questions: QuestionType[] = [
  {
    id: 'insurance_type',
    question: 'What type of insurance do you have?',
    description: 'Select the option that best describes your primary insurance coverage.',
    type: 'multiple-choice',
    options: [
      'Medicare (Original)',
      'Medicare Advantage',
      'Medicaid',
      'Employer / Private',
      'Dual eligible (Medicare + Medicaid)',
    ],
  },
  {
    id: 'state_of_residence',
    question: 'What state do you currently reside in?',
    description: 'Select your state of residence from the list below.',
    type: 'picker',
    options: US_STATES,
  },
  {
    id: 'location',
    question: 'What is your location?',
    description: 'Enter your ZIP code or address.',
    type: 'text',
    placeholder: 'ZIP code or address',
  },
  {
    id: 'caregiver_availability',
    question: 'Do you have expected caregiver availability?',
    description: 'A caregiver is someone who can help you during and after the transplant process.',
    type: 'yes-no',
  },
  {
    id: 'income_band',
    question: 'What is your approximate annual household income?',
    description: 'This information is optional but helps us provide better financial guidance.',
    type: 'multiple-choice',
    options: [
      'Under $25,000',
      '$25,000 - $50,000',
      '$50,000 - $75,000',
      '$75,000 - $100,000',
      '$100,000 - $150,000',
      'Over $150,000',
    ],
  },
  {
    id: 'housing_stability',
    question: 'What is your housing situation during evaluation?',
    description: 'Select the option that best describes your housing situation.',
    type: 'multiple-choice',
    options: ['Local (near transplant center)', 'Travel needed'],
  },
  {
    id: 'willingness_to_relocate',
    question: 'Are you willing to relocate temporarily if needed?',
    description:
      'Some transplant centers may require temporary relocation during the evaluation and transplant process.',
    type: 'yes-no',
  },
];

type AnswerType = {
  [key: string]: string | null;
};

type FinanceQuestionnaireProps = {
  patientId: string;
  onComplete: () => void;
  onNavigateToHome?: () => void;
  onNavigateToFinancialIntro?: () => void;
  skipInitialLoad?: boolean; // Skip loading existing profile (for first-time users)
};

export const FinanceQuestionnaire = ({
  patientId,
  onComplete,
  onNavigateToHome,
  onNavigateToFinancialIntro,
  skipInitialLoad = false,
}: FinanceQuestionnaireProps) => {
  const [answers, setAnswers] = useState<AnswerType>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingExisting, setIsLoadingExisting] = useState(!skipInitialLoad);
  const textInputRef = useRef<TextInput>(null);

  // Animation values for button feedback
  const buttonScale = useRef(new Animated.Value(1)).current;

  const infoModalContent = {
    heading: 'Financial Assessment',
    description: `This assessment helps us understand your financial situation and insurance coverage to better support you through the transplant evaluation process.`,
  };

  // Load existing financial profile on mount (only if not skipping initial load)
  useEffect(() => {
    // Skip loading if this is a first-time user
    if (skipInitialLoad) {
      setIsLoadingExisting(false);
      return;
    }

    const loadExistingProfile = async () => {
      setIsLoadingExisting(true);
      try {
        const existingProfile = await apiService.getFinancialProfile();
        if (existingProfile && existingProfile.answers) {
          // Pre-fill answers, converting null values to null (they're already null or strings)
          const preFilledAnswers: AnswerType = {};
          Object.keys(existingProfile.answers).forEach((key) => {
            preFilledAnswers[key] = existingProfile.answers[key];
          });
          setAnswers(preFilledAnswers);

          // Find the first unanswered question, or start at the beginning
          const firstUnansweredIndex = questions.findIndex(
            (q) => !preFilledAnswers[q.id] || preFilledAnswers[q.id] === null
          );
          if (firstUnansweredIndex >= 0) {
            setCurrentQuestionIndex(firstUnansweredIndex);
          }
        }
      } catch (error: any) {
        // If profile not found (404), that's okay - user is starting fresh
        if (!error.message?.includes('404') && !error.message?.includes('not found')) {
          console.error('Error loading existing financial profile:', error);
        }
      } finally {
        setIsLoadingExisting(false);
      }
    };

    if (patientId) {
      loadExistingProfile();
    } else {
      setIsLoadingExisting(false);
    }
  }, [patientId, skipInitialLoad]);

  // Auto-save progress whenever answers change (but skip if we're still loading existing data)
  useEffect(() => {
    // Don't auto-save while loading existing data
    if (isLoadingExisting) {
      return;
    }

    const saveProgress = async () => {
      if (Object.keys(answers).length > 0) {
        setIsSaving(true);
        try {
          await apiService.saveFinancialProfile({
            patient_id: patientId,
            answers: answers as Record<string, string | null>,
          });
        } catch (error) {
          console.error('Error saving progress:', error);
          // Don't show error to user for auto-save failures
        } finally {
          setIsSaving(false);
        }
      }
    };

    // Debounce auto-save
    const timeoutId = setTimeout(saveProgress, 1000);
    return () => clearTimeout(timeoutId);
  }, [answers, patientId, isLoadingExisting]);

  const handleAnswer = async (questionId: string, answer: string) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    // Animate the clicked button
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
        buttonScale.setValue(1);
      } else {
        // All questions answered, submit
        submitQuestionnaire(newAnswers);
      }
    }, 300);
  };

  const handleTextAnswer = (questionId: string, text: string) => {
    const newAnswers = { ...answers, [questionId]: text.trim() || null };
    setAnswers(newAnswers);
  };

  const handleTextSubmit = (questionId: string) => {
    const answer = answers[questionId];
    if (answer && answer.trim()) {
      // Move to next question if text is entered
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        submitQuestionnaire(answers);
      }
    }
  };

  const submitQuestionnaire = async (finalAnswers: AnswerType) => {
    setIsSubmitting(true);
    try {
      const submission = {
        patient_id: patientId,
        answers: finalAnswers as Record<string, string | null>,
      };

      await apiService.submitFinancialProfile(submission);
      onComplete();
    } catch (error) {
      console.error('Error submitting financial profile:', error);
      // TODO: Show error message to user
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex === 0) {
      // On first question, go back to financial intro
      onNavigateToFinancialIntro?.();
    } else {
      // Otherwise, go to previous question
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSkip = () => {
    // "I don't know" option - set answer to null and move forward
    const currentQuestion = questions[currentQuestionIndex];
    const newAnswers = { ...answers, [currentQuestion.id]: null };
    setAnswers(newAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      submitQuestionnaire(newAnswers);
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

  if (isLoadingExisting) {
    return (
      <View className={layout.container.default}>
        <NavigationBar onBack={onNavigateToFinancialIntro} />
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#22c55e" />
          <Text className={combineClasses(typography.body.medium, 'mt-4 text-gray-600')}>
            Loading your information...
          </Text>
        </View>
      </View>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const currentAnswer = answers[currentQuestion.id];

  return (
    <SafeAreaView className={layout.container.default}>
      <NavigationBar onBack={handleBack} infoModal={infoModalContent} />
      {isSaving && (
        <View className="bg-blue-50 px-4 py-2">
          <Text className={combineClasses(typography.body.small, 'text-blue-600')}>
            Saving progress...
          </Text>
        </View>
      )}
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

            {/* Answer Options */}
            <View className="mt-6">
              {currentQuestion.type === 'multiple-choice' && currentQuestion.options && (
                <>
                  {currentQuestion.options.map((option, index) => (
                    <Animated.View
                      key={index}
                      style={{
                        transform: [{ scale: buttonScale }],
                      }}
                      className="mb-3">
                      <TouchableOpacity
                        className={combineClasses(
                          buttons.answer.base,
                          currentAnswer === option
                            ? buttons.answer.selected
                            : buttons.answer.unselected
                        )}
                        onPress={() => handleAnswer(currentQuestion.id, option)}
                        activeOpacity={1}
                        disabled={isSubmitting}>
                        <Text
                          className={combineClasses(
                            buttons.answer.text,
                            currentAnswer === option
                              ? buttons.answer.textSelected
                              : buttons.answer.textUnselected
                          )}>
                          {option}
                        </Text>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </>
              )}

              {currentQuestion.type === 'text' && (
                <View className="mb-3">
                  <TextInput
                    ref={textInputRef}
                    className={combineClasses(
                      'rounded-lg border-2 border-gray-300 bg-white px-4 py-3 text-base',
                      currentAnswer ? 'border-green-500' : ''
                    )}
                    placeholder={currentQuestion.placeholder || 'Enter your answer'}
                    value={currentAnswer || ''}
                    onChangeText={(text) => handleTextAnswer(currentQuestion.id, text)}
                    onSubmitEditing={() => handleTextSubmit(currentQuestion.id)}
                    returnKeyType="next"
                    autoCapitalize="words"
                  />
                  <TouchableOpacity
                    className={combineClasses(
                      buttons.primary.base,
                      currentAnswer && currentAnswer.trim()
                        ? buttons.primary.enabled
                        : buttons.primary.disabled,
                      'mt-3'
                    )}
                    onPress={() => handleTextSubmit(currentQuestion.id)}
                    disabled={!currentAnswer || !currentAnswer.trim()}>
                    <Text className={buttons.primary.text}>Continue</Text>
                  </TouchableOpacity>
                </View>
              )}

              {currentQuestion.type === 'picker' && currentQuestion.options && (
                <View className="mb-3">
                  <View
                    className={combineClasses(
                      'rounded-lg border-2 bg-white',
                      currentAnswer ? 'border-green-500' : 'border-gray-300'
                    )}>
                    <Picker
                      selectedValue={currentAnswer || ''}
                      onValueChange={(value: string) => {
                        if (value) {
                          // Update answer without auto-navigating (user clicks Continue)
                          const newAnswers = { ...answers, [currentQuestion.id]: value };
                          setAnswers(newAnswers);
                        }
                      }}
                      style={{ height: 200 }}>
                      <Picker.Item label="Select a state..." value="" />
                      {currentQuestion.options.map((option, index) => (
                        <Picker.Item key={index} label={option} value={option} />
                      ))}
                    </Picker>
                  </View>
                  {currentAnswer && (
                    <TouchableOpacity
                      className={combineClasses(
                        buttons.primary.base,
                        buttons.primary.enabled,
                        'mt-3'
                      )}
                      onPress={() => {
                        if (currentQuestionIndex < questions.length - 1) {
                          setCurrentQuestionIndex(currentQuestionIndex + 1);
                        } else {
                          submitQuestionnaire(answers);
                        }
                      }}
                      activeOpacity={0.8}>
                      <Text className={buttons.primary.text}>Continue</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {currentQuestion.type === 'yes-no-uncertain' && (
                <>
                  <Animated.View
                    style={{
                      transform: [{ scale: buttonScale }],
                    }}
                    className="mb-3">
                    <TouchableOpacity
                      className={combineClasses(
                        buttons.answer.base,
                        currentAnswer === 'yes'
                          ? buttons.answer.selected
                          : buttons.answer.unselected
                      )}
                      onPress={() => handleAnswer(currentQuestion.id, 'yes')}
                      activeOpacity={1}
                      disabled={isSubmitting}>
                      <Text
                        className={combineClasses(
                          buttons.answer.text,
                          currentAnswer === 'yes'
                            ? buttons.answer.textSelected
                            : buttons.answer.textUnselected
                        )}>
                        Yes
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>

                  <Animated.View
                    style={{
                      transform: [{ scale: buttonScale }],
                    }}
                    className="mb-3">
                    <TouchableOpacity
                      className={combineClasses(
                        buttons.answer.base,
                        currentAnswer === 'no' ? buttons.answer.selected : buttons.answer.unselected
                      )}
                      onPress={() => handleAnswer(currentQuestion.id, 'no')}
                      activeOpacity={1}
                      disabled={isSubmitting}>
                      <Text
                        className={combineClasses(
                          buttons.answer.text,
                          currentAnswer === 'no'
                            ? buttons.answer.textSelected
                            : buttons.answer.textUnselected
                        )}>
                        No
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>

                  <Animated.View
                    style={{
                      transform: [{ scale: buttonScale }],
                    }}
                    className="mb-3">
                    <TouchableOpacity
                      className={combineClasses(
                        buttons.answer.base,
                        currentAnswer === 'uncertain'
                          ? buttons.answer.selected
                          : buttons.answer.unselected
                      )}
                      onPress={() => handleAnswer(currentQuestion.id, 'uncertain')}
                      activeOpacity={1}
                      disabled={isSubmitting}>
                      <Text
                        className={combineClasses(
                          buttons.answer.text,
                          currentAnswer === 'uncertain'
                            ? buttons.answer.textSelected
                            : buttons.answer.textUnselected
                        )}>
                        Uncertain
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </>
              )}

              {currentQuestion.type === 'yes-no' && (
                <>
                  <Animated.View
                    style={{
                      transform: [{ scale: buttonScale }],
                    }}
                    className="mb-3">
                    <TouchableOpacity
                      className={combineClasses(
                        buttons.answer.base,
                        currentAnswer === 'yes'
                          ? buttons.answer.selected
                          : buttons.answer.unselected
                      )}
                      onPress={() => handleAnswer(currentQuestion.id, 'yes')}
                      activeOpacity={1}
                      disabled={isSubmitting}>
                      <Text
                        className={combineClasses(
                          buttons.answer.text,
                          currentAnswer === 'yes'
                            ? buttons.answer.textSelected
                            : buttons.answer.textUnselected
                        )}>
                        Yes
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>

                  <Animated.View
                    style={{
                      transform: [{ scale: buttonScale }],
                    }}
                    className="mb-3">
                    <TouchableOpacity
                      className={combineClasses(
                        buttons.answer.base,
                        currentAnswer === 'no' ? buttons.answer.selected : buttons.answer.unselected
                      )}
                      onPress={() => handleAnswer(currentQuestion.id, 'no')}
                      activeOpacity={1}
                      disabled={isSubmitting}>
                      <Text
                        className={combineClasses(
                          buttons.answer.text,
                          currentAnswer === 'no'
                            ? buttons.answer.textSelected
                            : buttons.answer.textUnselected
                        )}>
                        No
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                </>
              )}

              {/* "I don't know" option - always available */}
              <Animated.View
                style={{
                  transform: [{ scale: buttonScale }],
                }}
                className="mt-4">
                <TouchableOpacity
                  className={combineClasses(
                    buttons.answer.base,
                    currentAnswer === null ? buttons.answer.selected : buttons.answer.unselected
                  )}
                  onPress={handleSkip}
                  activeOpacity={1}
                  disabled={isSubmitting}>
                  <Text
                    className={combineClasses(
                      buttons.answer.text,
                      currentAnswer === null
                        ? buttons.answer.textSelected
                        : buttons.answer.textUnselected
                    )}>
                    I don't know
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
