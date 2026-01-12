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
import { NavigationBar } from '../../components/NavigationBar';
import { PathwayBackground } from '../../components/PathwayBackground';
import { Patient } from '../../services/api';

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

  const [errors, setErrors] = useState<{ name?: string }>({});
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

  const validate = (): boolean => {
    const newErrors: { name?: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
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
            style={{
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            }}
            className="mt-16 px-6 py-8">
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
                Full Name <Text className="text-red-200">*</Text>
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
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    emailInputRef.current?.focus();
                  }}
                />
              </View>
              {errors.name && <Text className="mt-1 text-xs text-red-200">{errors.name}</Text>}
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
                  autoComplete="email"
                  keyboardType="email-address"
                  inputAccessoryViewID={null}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    phoneInputRef.current?.focus();
                  }}
                />
              </View>
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
                  inputAccessoryViewID={
                    Platform.OS === 'ios' ? phoneInputAccessoryViewID : undefined
                  }
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    phoneInputRef.current?.blur();
                  }}
                />
              </View>
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
});
