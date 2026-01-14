import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Platform,
  InputAccessoryView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { buttons, typography, inputs, combineClasses, layout } from '../../styles/theme';
import { ViewStyle, TextStyle } from 'react-native';
import { NavigationBar } from '../../components/NavigationBar';
import { PathwayBackground } from '../../components/PathwayBackground';
import { Patient } from '../../services/api';
import { getWebPadding } from '../../utils/webStyles';

type PatientDetailsScreen1Props = {
  onNext: (data: { name: string; email?: string; phone?: string }) => void;
  onBack?: () => void;
  initialData?: { name?: string; email?: string; phone?: string };
};

export const PatientDetailsScreen1 = ({
  onNext,
  onBack,
  initialData,
}: PatientDetailsScreen1Props) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
  });

  const [errors, setErrors] = useState<{ name?: string; email?: string; phone?: string }>({});
  const [touched, setTouched] = useState<{ name?: boolean; email?: boolean; phone?: boolean }>({});
  const nameInputRef = useRef<TextInput>(null);
  const emailInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const nameInputAccessoryViewID = 'nameInputAccessoryView';
  const emailInputAccessoryViewID = 'emailInputAccessoryView';
  const phoneInputAccessoryViewID = 'phoneInputAccessoryView';
  const previousNameRef = useRef<string>(initialData?.name || '');
  const previousEmailRef = useRef<string>(initialData?.email || '');
  const previousPhoneRef = useRef<string>(initialData?.phone || '');

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

  // Reusable field error / helper text component
  const FieldError = ({
    message,
    colorClass,
  }: {
    message?: string | null;
    colorClass?: string;
  }) => {
    const color = colorClass || 'text-black';
    // Use className to match existing theme utility classes for color/size
    return (
      <View style={styles.errorWrapper} accessible accessibilityLiveRegion="polite">
        <Text className={combineClasses('mt-1', 'text-xs', color)}>{message || ' '}</Text>
      </View>
    );
  };

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string; phone?: string } = {};

    // Name: required, min 2 chars
    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters';
    }

    // Email: required, basic email regex
    const email = formData.email.trim();
    const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRe.test(email)) {
      newErrors.email = 'Enter a valid email address';
    }

    // Phone: required, digits only (allow leading +), length 8-15
    const phone = formData.phone.trim();
    const phoneRe = /^\+?\d{8,15}$/;
    if (!phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!phoneRe.test(phone)) {
      newErrors.phone = 'Enter a valid phone (digits only, 8-15 characters, + allowed)';
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
          name: formData.name.trim(),
          email: formData.email || undefined,
          phone: formData.phone || undefined,
        });
      });
    }
  };

  const updateField = (field: 'name' | 'email' | 'phone', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
    // mark touched when user types (helpful for immediate validation UX)
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleNameChange = (value: string) => {
    const previousValue = previousNameRef.current;
    previousNameRef.current = value;
    updateField('name', value);

    // Detect autocomplete: if value changed significantly (likely autocomplete was used)
    // Check if it went from empty/short to a longer complete value
    const wasShort = !previousValue || previousValue.length < 2;
    const isComplete = value.length >= 3 && (value.includes(' ') || value.length > 8);

    if (wasShort && isComplete && value.length > (previousValue?.length || 0) + 2) {
      setTimeout(() => {
        emailInputRef.current?.focus();
      }, 0);
    }
  };

  const handleBlur = (field: 'name' | 'email' | 'phone') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    // validate single field on blur
    validate();
  };

  const handleEmailChange = (value: string) => {
    const previousValue = previousEmailRef.current;
    previousEmailRef.current = value;
    updateField('email', value);

    // Detect autocomplete: if value changed significantly to include @ and .
    const wasShort = !previousValue || previousValue.length < 3;
    const isComplete = value.includes('@') && value.includes('.');

    if (wasShort && isComplete && value.length > (previousValue?.length || 0) + 5) {
      setTimeout(() => {
        phoneInputRef.current?.focus();
      }, 0);
    }
  };

  const handlePhoneChange = (value: string) => {
    const previousValue = previousPhoneRef.current;
    previousPhoneRef.current = value;
    updateField('phone', value);

    // Detect autocomplete: if value changed significantly to a complete phone number
    const wasShort = !previousValue || previousValue.length < 3;
    const isComplete = value.length >= 10;

    if (wasShort && isComplete && value.length > (previousValue?.length || 0) + 5) {
      setTimeout(() => {
        phoneInputRef.current?.blur();
      }, 0);
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
            className="mt-16">
            <Text className={combineClasses(typography.h2, 'text-white shadow-md')}>
              Contact Information
            </Text>
            <Text className={combineClasses(typography.body.large, 'mb-6 text-white shadow')}>
              Let's start with your basic contact details
            </Text>

            {/* Name - Required */}
            <View className="mb-4">
              <Text
                className={combineClasses(
                  typography.body.large,
                  'mb-2 font-semibold text-white shadow'
                )}>
                Full Name
              </Text>
              <View className={inputs.default.container}>
                <TextInput
                  ref={nameInputRef}
                  className={inputs.default.input}
                  placeholder="Enter your full name"
                  placeholderTextColor={inputs.default.placeholder}
                  value={formData.name}
                  onChangeText={handleNameChange}
                  textContentType="name"
                  autoComplete="name"
                  inputAccessoryViewID={null}
                  onBlur={() => handleBlur('name')}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    emailInputRef.current?.focus();
                  }}
                />
              </View>
              <FieldError message={touched.name && errors.name ? errors.name : undefined} />
            </View>

            {/* Email - Optional */}
            <View className="mb-4">
              <Text
                className={combineClasses(
                  typography.body.large,
                  'mb-2 font-semibold text-white shadow'
                )}>
                Email Address
              </Text>
              <View className={inputs.default.container}>
                <TextInput
                  ref={emailInputRef}
                  className={inputs.default.input}
                  placeholder="Enter your email"
                  placeholderTextColor={inputs.default.placeholder}
                  value={formData.email}
                  onChangeText={handleEmailChange}
                  textContentType="emailAddress"
                  inputAccessoryViewID={null}
                  autoCapitalize="none"
                  onBlur={() => handleBlur('email')}
                  {...(Platform.OS === 'web' ? ({ inputMode: 'email' } as any) : {})}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    phoneInputRef.current?.focus();
                  }}
                />
              </View>
              <FieldError message={touched.email && errors.email ? errors.email : undefined} />
            </View>

            {/* Phone - Optional */}
            <View className="mb-6">
              <Text
                className={combineClasses(
                  typography.body.large,
                  'mb-2 font-semibold text-white shadow'
                )}>
                Phone Number
              </Text>
              <View className={inputs.default.container}>
                <TextInput
                  ref={phoneInputRef}
                  className={inputs.default.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor={inputs.default.placeholder}
                  value={formData.phone}
                  onChangeText={handlePhoneChange}
                  textContentType="telephoneNumber"
                  autoComplete="tel"
                  keyboardType="phone-pad"
                  inputAccessoryViewID={Platform.OS === 'ios' ? phoneInputAccessoryViewID : undefined}
                  onBlur={() => handleBlur('phone')}
                  {...(Platform.OS === 'web' ? ({ inputMode: 'tel' } as any) : {})}
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    phoneInputRef.current?.blur();
                  }}
                />
              </View>
              <FieldError message={touched.phone && errors.phone ? errors.phone : undefined} />
            </View>

            {/* Next Button */}
            <TouchableOpacity
              className={combineClasses(
                buttons.outline.base,
                // show disabled look when not valid
                // reuse enabled class only when all fields valid
                (formData.name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) && /^\+?\d{8,15}$/.test(formData.phone.trim()))
                  ? buttons.outline.enabled
                  : buttons.outline.disabled
              )}
              onPress={handleNext}
              activeOpacity={0.8}
              disabled={!(formData.name.trim().length >= 2 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()) && /^\+?\d{8,15}$/.test(formData.phone.trim()))}
            >
              <Text className={buttons.outline.text}>Next</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Input Accessory Views for Keyboard Toolbars */}
        {Platform.OS === 'ios' && (
          <>
            {/* Phone Input Accessory View */}
            <InputAccessoryView nativeID={phoneInputAccessoryViewID}>
              <View className="flex-row items-center justify-end border-t border-gray-200 bg-gray-100 px-4 py-2">
                <TouchableOpacity
                  onPress={() => {
                    phoneInputRef.current?.blur();
                  }}>
                  <Text className="text-xl font-semibold text-blue-500">Done</Text>
                </TouchableOpacity>
              </View>
            </InputAccessoryView>
          </>
        )}
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
  errorWrapper: {
    minHeight: 22,
    marginTop: 12,
    paddingLeft: 20,
  } as ViewStyle,
  errorText: {
    fontSize: 13,
    lineHeight: 18,
  } as TextStyle,
});
