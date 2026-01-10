import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { buttons, typography, inputs, combineClasses, layout } from '../styles/theme';
import { NavigationBar } from '../components/NavigationBar';
import { Patient } from '../services/api';

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

  return (
    <SafeAreaView className={layout.container.default}>
      <NavigationBar onBack={onBack} />
      <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
          className="px-6 py-8">
          <Text className={combineClasses(typography.h2, 'mb-2')}>Contact Information</Text>
          <Text className={combineClasses(typography.body.medium, 'mb-6 text-gray-600')}>
            Let's start with your basic contact details
          </Text>

          {/* Name - Required */}
          <View className="mb-4">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Full Name <Text className="text-red-500">*</Text>
            </Text>
            <View className={inputs.default.container}>
              <TextInput
                className={inputs.default.input}
                placeholder="Enter your full name"
                placeholderTextColor={inputs.default.placeholder}
                value={formData.name}
                onChangeText={(value) => updateField('name', value)}
              />
            </View>
            {errors.name && <Text className="mt-1 text-xs text-red-500">{errors.name}</Text>}
          </View>

          {/* Email - Optional */}
          <View className="mb-4">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Email Address
            </Text>
            <View className={inputs.default.container}>
              <TextInput
                className={inputs.default.input}
                placeholder="Enter your email"
                placeholderTextColor={inputs.default.placeholder}
                value={formData.email}
                onChangeText={(value) => updateField('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          {/* Phone - Optional */}
          <View className="mb-6">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Phone Number
            </Text>
            <View className={inputs.default.container}>
              <TextInput
                className={inputs.default.input}
                placeholder="Enter your phone number"
                placeholderTextColor={inputs.default.placeholder}
                value={formData.phone}
                onChangeText={(value) => updateField('phone', value)}
                keyboardType="phone-pad"
              />
            </View>
          </View>

          {/* Next Button */}
          <TouchableOpacity
            className={combineClasses(buttons.primary.base, buttons.primary.enabled)}
            onPress={handleNext}
            activeOpacity={0.8}>
            <Text className={buttons.primary.text}>Next</Text>
          </TouchableOpacity>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

