import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { buttons, typography, inputs, combineClasses, layout } from '../styles/theme';
import { NavigationBar } from '../components/NavigationBar';
import { Patient } from '../services/api';

type PatientDetailsScreenProps = {
  onNext: (patient: Patient) => void;
  onBack?: () => void;
};

export const PatientDetailsScreen = ({ onNext, onBack }: PatientDetailsScreenProps) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  const [formData, setFormData] = useState<{
    name: string;
    date_of_birth: string;
    sex: string;
    height: string;
    weight: string;
    email: string;
    phone: string;
  }>({
    name: '',
    date_of_birth: '',
    sex: '',
    height: '',
    weight: '',
    email: '',
    phone: '',
  });

  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHeightPicker, setShowHeightPicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Generate height values in cm (100-250 cm, reasonable range)
  const heightValues = Array.from({ length: 151 }, (_, i) => 100 + i);

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
    const newErrors: Partial<Record<string, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.date_of_birth.trim()) {
      newErrors.date_of_birth = 'Date of birth is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.date_of_birth)) {
      newErrors.date_of_birth = 'Please use format YYYY-MM-DD';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      const patientData: Patient = {
        name: formData.name.trim(),
        date_of_birth: formData.date_of_birth.trim(),
        sex: formData.sex || undefined,
        height: formData.height ? parseFloat(formData.height as any) : undefined,
        weight: formData.weight ? parseFloat(formData.weight as any) : undefined,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
      };

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
        onNext(patientData);
      });
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Initialize selected date from formData
  useEffect(() => {
    if (formData.date_of_birth) {
      const date = new Date(formData.date_of_birth);
      if (!isNaN(date.getTime())) {
        setSelectedDate(date);
      }
    }
  }, []);

  const handleDateChange = (event: any, date?: Date) => {
    if (Platform.OS === 'ios') {
      if (date) {
        setSelectedDate(date);
        const formattedDate = date.toISOString().split('T')[0];
        updateField('date_of_birth', formattedDate);
      }
      if (event.type === 'dismissed') {
        setShowDatePicker(false);
      }
    } else {
      if (event.type === 'set' && date) {
        const formattedDate = date.toISOString().split('T')[0];
        updateField('date_of_birth', formattedDate);
        setShowDatePicker(false);
      } else {
        setShowDatePicker(false);
      }
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
          <Text className={combineClasses(typography.h2, 'mb-2')}>Basic Information</Text>
          <Text className={combineClasses(typography.body.medium, 'mb-6 text-gray-600')}>
            Please provide your basic details to get started
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

          {/* Date of Birth - Required */}
          <View className="mb-4">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Date of Birth <Text className="text-red-500">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className={inputs.default.container}
              activeOpacity={0.7}>
              <View className={inputs.default.input}>
                <Text
                  className={combineClasses(
                    'text-lg',
                    !formData.date_of_birth ? 'text-gray-400' : 'text-gray-900'
                  )}>
                  {formData.date_of_birth || 'Select date of birth'}
                </Text>
              </View>
            </TouchableOpacity>
            {errors.date_of_birth && (
              <Text className="mt-1 text-xs text-red-500">{errors.date_of_birth}</Text>
            )}

            {/* Native iOS Date Picker - appears like keyboard */}
            {showDatePicker && (
              <DateTimePicker
                value={selectedDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'default' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </View>

          {/* Sex - Optional */}
          <View className="mb-4">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Sex Assigned at Birth
            </Text>
            <View className="flex-row gap-2">
              {['male', 'female'].map((option) => (
                <TouchableOpacity
                  key={option}
                  className={combineClasses(
                    'flex-1 rounded-lg border-2 p-3',
                    formData.sex === option
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 bg-white'
                  )}
                  onPress={() => updateField('sex', option)}>
                  <Text
                    className={combineClasses(
                      'text-center capitalize',
                      formData.sex === option ? 'font-semibold text-green-700' : 'text-gray-700'
                    )}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Height - Optional */}
          <View className="mb-4">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Height (cm)
            </Text>
            <TouchableOpacity
              onPress={() => setShowHeightPicker(!showHeightPicker)}
              className={inputs.default.container}
              activeOpacity={0.7}>
              <View className={inputs.default.input}>
                <Text
                  className={combineClasses(
                    'text-lg',
                    !formData.height ? 'text-gray-400' : 'text-gray-900'
                  )}>
                  {formData.height ? `${formData.height} cm` : 'Select height'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Native iOS Picker */}
            {showHeightPicker && (
              <Picker
                selectedValue={formData.height || ''}
                onValueChange={(value: string) => {
                  if (value) {
                    updateField('height', value.toString());
                  }
                  setShowHeightPicker(false);
                }}
                style={{ height: Platform.OS === 'ios' ? 216 : 50, backgroundColor: 'white' }}>
                <Picker.Item label="Select height" value="" />
                {heightValues.map((height) => (
                  <Picker.Item key={height} label={`${height} cm`} value={height.toString()} />
                ))}
              </Picker>
            )}
          </View>

          {/* Weight - Optional */}
          <View className="mb-4">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Weight (kg)
            </Text>
            <View className={inputs.default.container}>
              <TextInput
                className={inputs.default.input}
                placeholder="Enter weight in kilograms"
                placeholderTextColor={inputs.default.placeholder}
                value={formData.weight as string}
                onChangeText={(value) => updateField('weight', value)}
                keyboardType="numeric"
              />
            </View>
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
