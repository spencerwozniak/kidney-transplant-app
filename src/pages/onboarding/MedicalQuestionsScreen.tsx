import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Animated,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { buttons, typography, inputs, combineClasses, layout } from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { PathwayBackground } from '../../components/PathwayBackground';
import { getWebPadding } from '../../utils/webStyles';

type MedicalQuestionsScreenProps = {
  onNext: (data: { has_ckd_esrd?: boolean; last_gfr?: number; has_referral?: boolean }) => void;
  onBack?: () => void;
  initialData?: {
    has_ckd_esrd?: boolean;
    last_gfr?: number;
    has_referral?: boolean;
  };
};

export const MedicalQuestionsScreen = ({
  onNext,
  onBack,
  initialData,
}: MedicalQuestionsScreenProps) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const [formData, setFormData] = useState({
    hasCkdEsrd: initialData?.has_ckd_esrd ?? (undefined as boolean | undefined),
    lastGfr: initialData?.last_gfr?.toString() || '',
    hasReferral: initialData?.has_referral ?? (undefined as boolean | undefined),
  });

  const [errors, setErrors] = useState<{
    has_ckd_esrd?: string;
    last_gfr?: string;
    has_referral?: string;
  }>({});

  React.useEffect(() => {
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

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // CKD/ESRD question is required
    if (formData.hasCkdEsrd === undefined) {
      newErrors.has_ckd_esrd = 'Please answer this question';
    }

    // If they have CKD/ESRD, GFR is optional but should be valid if provided
    if (formData.hasCkdEsrd === true && formData.lastGfr) {
      const gfr = parseFloat(formData.lastGfr);
      if (isNaN(gfr) || gfr < 0 || gfr > 200) {
        newErrors.last_gfr = 'Please enter a valid GFR value (0-200)';
      }
    }

    // Referral question is required
    if (formData.hasReferral === undefined) {
      newErrors.has_referral = 'Please answer this question';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -50,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onNext({
          has_ckd_esrd: formData.hasCkdEsrd,
          last_gfr: formData.lastGfr ? parseFloat(formData.lastGfr) : undefined,
          has_referral: formData.hasReferral,
        });
      });
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
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
        <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
              styles.contentContainer,
              getWebPadding(24, 32), // px-6 py-8
            ]}
            className="px-6 py-8">
            <Text className={combineClasses(typography.h2, 'text-white shadow')}>
              Medical Information
            </Text>
            <Text className={combineClasses(typography.body.large, 'mb-6 text-white shadow')}>
              Please provide information about your kidney condition
            </Text>

            {/* CKD/ESRD Question */}
            <View className="mb-6">
              <Text
                className={combineClasses(
                  typography.body.large,
                  'mb-3 font-semibold text-white shadow'
                )}>
                Do you have Chronic Kidney Disease (CKD) or End-Stage Renal Disease (ESRD)?{' '}
                <Text className="text-red-200">*</Text>
              </Text>
              <View className="flex-row gap-2">
                {[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    className={combineClasses(
                      'flex-1 rounded-lg border-2 p-3',
                      formData.hasCkdEsrd === option.value
                        ? 'border-green-600 bg-green-100'
                        : 'border-gray-200 bg-white'
                    )}
                    onPress={() => updateField('hasCkdEsrd', option.value)}>
                    <Text
                      className={combineClasses(
                        'text-center',
                        formData.hasCkdEsrd === option.value
                          ? 'font-bold text-green-600'
                          : 'text-green-700'
                      )}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.has_ckd_esrd && (
                <Text className="mt-1 text-xs text-red-200">{errors.has_ckd_esrd}</Text>
              )}
            </View>

            {/* Last GFR - Optional, shown only if they have CKD/ESRD */}
            {formData.hasCkdEsrd === true && (
              <View className="mb-6">
                <Text
                  className={combineClasses(
                    typography.body.large,
                    'font-semibold text-white shadow'
                  )}>
                  Last Known GFR (Glomerular Filtration Rate)
                </Text>
                <Text className={combineClasses(typography.body.small, 'mb-2 text-white shadow')}>
                  If you know your most recent GFR value, please enter it here
                </Text>
                <View className={inputs.default.container}>
                  <TextInput
                    className={inputs.default.input}
                    placeholder="Enter GFR (e.g., 45)"
                    placeholderTextColor={inputs.default.placeholder}
                    value={formData.lastGfr}
                    onChangeText={(value) => updateField('lastGfr', value)}
                    keyboardType="numeric"
                  />
                </View>
                {errors.last_gfr && (
                  <Text className="mt-1 text-xs text-red-200">{errors.last_gfr}</Text>
                )}
                {formData.lastGfr && !errors.last_gfr && (
                  <Text className="mt-2 text-xs text-white/80">
                    GFR stages: Stage 1 (≥90), Stage 2 (60-89), Stage 3a (45-59), Stage 3b (30-44),
                    Stage 4 (15-29), Stage 5/ESRD (&lt;15)
                  </Text>
                )}
              </View>
            )}

            {/* Referral Question */}
            <View className="mb-6">
              <Text
                className={combineClasses(
                  typography.body.large,
                  'mb-3 font-semibold text-white shadow'
                )}>
                Do you already have a referral to a transplant center?{' '}
                <Text className="text-red-200">*</Text>
              </Text>
              <View className="flex-row gap-2">
                {[
                  { value: true, label: 'Yes' },
                  { value: false, label: 'No' },
                ].map((option) => (
                  <TouchableOpacity
                    key={option.label}
                    className={combineClasses(
                      'flex-1 rounded-lg border-2 p-3',
                      formData.hasReferral === option.value
                        ? 'border-green-600 bg-green-100'
                        : 'border-gray-200 bg-white'
                    )}
                    onPress={() => updateField('hasReferral', option.value)}>
                    <Text
                      className={combineClasses(
                        'text-center',
                        formData.hasReferral === option.value
                          ? 'font-bold text-green-600'
                          : 'text-green-700'
                      )}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {errors.has_referral && (
                <Text className="mt-1 text-xs text-red-200">{errors.has_referral}</Text>
              )}
            </View>

            {/* Next Button */}
            <TouchableOpacity
              className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
              onPress={handleNext}
              activeOpacity={0.8}>
              <Text className={buttons.outline.text}>Next</Text>
            </TouchableOpacity>
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
  contentContainer: {
    paddingHorizontal: 24, // px-6 = 1.5rem = 24px
    paddingVertical: 32, // py-8 = 2rem = 32px
  },
});
