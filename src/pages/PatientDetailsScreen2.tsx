import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Animated, Modal, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { buttons, typography, inputs, combineClasses, layout } from '../styles/theme';
import { NavigationBar } from '../components/NavigationBar';
import { Patient } from '../services/api';

type PatientDetailsScreen2Props = {
  onNext: (data: {
    date_of_birth: string;
    sex?: string;
    height?: number;
    weight?: number;
  }) => void;
  onBack?: () => void;
  initialData?: {
    date_of_birth?: string;
    sex?: string;
    height?: number;
    weight?: number;
  };
};

export const PatientDetailsScreen2 = ({
  onNext,
  onBack,
  initialData,
}: PatientDetailsScreen2Props) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));

  // Parse initial DOB if provided
  const parseDOB = (dob?: string) => {
    if (!dob || !/^\d{4}-\d{2}-\d{2}$/.test(dob)) {
      return new Date(new Date().getFullYear() - 50, 0, 1);
    }
    const [year, month, day] = dob.split('-').map(Number);
    return new Date(year, month - 1, day);
  };

  const [formData, setFormData] = useState({
    dateOfBirth: parseDOB(initialData?.date_of_birth),
    sex: initialData?.sex || '',
    feet: Math.floor((initialData?.height || 0) / 30.48) || 5,
    inches: Math.round(((initialData?.height || 0) % 30.48) / 2.54) || 0,
    weightLbs: initialData?.weight ? Math.round(initialData.weight * 2.20462).toString() : '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHeightPicker, setShowHeightPicker] = useState(false);
  const [errors, setErrors] = useState<{ date_of_birth?: string }>({});

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

  // Generate arrays for height pickers
  const feet = Array.from({ length: 4 }, (_, i) => i + 4); // 4-7 feet
  const inches = Array.from({ length: 12 }, (_, i) => i); // 0-11 inches

  const validate = (): boolean => {
    const newErrors: { date_of_birth?: string } = {};

    if (!formData.dateOfBirth || formData.dateOfBirth > new Date()) {
      newErrors.date_of_birth = 'Please enter a valid date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      const date_of_birth = `${formData.dateOfBirth.getFullYear()}-${String(
        formData.dateOfBirth.getMonth() + 1
      ).padStart(2, '0')}-${String(formData.dateOfBirth.getDate()).padStart(2, '0')}`;

      // Convert height from ft/in to cm
      const heightInCm = formData.feet * 30.48 + formData.inches * 2.54;

      // Convert weight from lbs to kg
      const weightInKg = formData.weightLbs
        ? parseFloat(formData.weightLbs) / 2.20462
        : undefined;

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
          date_of_birth,
          sex: formData.sex || undefined,
          height: heightInCm > 0 ? heightInCm : undefined,
          weight: weightInKg,
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

  const formatDate = (date: Date) => {
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const formatHeight = () => {
    return `${formData.feet}' ${formData.inches}"`;
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
          <Text className={combineClasses(typography.h2, 'mb-2')}>Personal Details</Text>
          <Text className={combineClasses(typography.body.medium, 'mb-6 text-gray-600')}>
            Please provide your personal information
          </Text>

          {/* Date of Birth - Required */}
          <View className="mb-6">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Date of Birth <Text className="text-red-500">*</Text>
            </Text>
            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className={inputs.default.container}>
              <Text
                className={combineClasses(
                  inputs.default.input,
                  !formData.dateOfBirth ? 'text-gray-400' : 'text-gray-900'
                )}>
                {formData.dateOfBirth ? formatDate(formData.dateOfBirth) : 'Select date of birth'}
              </Text>
            </TouchableOpacity>
            {errors.date_of_birth && (
              <Text className="mt-1 text-xs text-red-500">{errors.date_of_birth}</Text>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={formData.dateOfBirth}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (selectedDate) {
                    updateField('dateOfBirth', selectedDate);
                  }
                }}
              />
            )}
            {Platform.OS === 'ios' && showDatePicker && (
              <View className="mt-2 flex-row justify-end gap-2">
                <TouchableOpacity
                  onPress={() => setShowDatePicker(false)}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2">
                  <Text className="text-gray-700">Done</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Sex - Optional */}
          <View className="mb-6">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Sex Assigned at Birth
            </Text>
            <View className="flex-row gap-2">
              {['male', 'female', 'other'].map((option) => (
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
          <View className="mb-6">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Height
            </Text>
            <TouchableOpacity
              onPress={() => setShowHeightPicker(true)}
              className={inputs.default.container}>
              <Text
                className={combineClasses(
                  inputs.default.input,
                  formData.feet === 0 && formData.inches === 0 ? 'text-gray-400' : 'text-gray-900'
                )}>
                {formatHeight()}
              </Text>
            </TouchableOpacity>
            <Text className="mt-2 text-xs text-gray-500">
              {Math.round((formData.feet * 30.48 + formData.inches * 2.54) * 10) / 10} cm
            </Text>

            {/* Height Picker Modal */}
            <Modal
              visible={showHeightPicker}
              transparent={true}
              animationType="slide"
              onRequestClose={() => setShowHeightPicker(false)}>
              <View className="flex-1 justify-end bg-black/50">
                <View className="rounded-t-3xl bg-white p-6">
                  <View className="mb-4 flex-row items-center justify-between">
                    <Text className={combineClasses(typography.h5, 'font-semibold')}>Select Height</Text>
                    <TouchableOpacity
                      onPress={() => setShowHeightPicker(false)}
                      className="rounded-lg bg-green-500 px-4 py-2">
                      <Text className="font-semibold text-white">Done</Text>
                    </TouchableOpacity>
                  </View>
                  <View className="flex-row gap-4">
                    <View className="flex-1">
                      <Text className="mb-2 text-center text-sm text-gray-600">Feet</Text>
                      <View className="h-48">
                        <ScrollView
                          showsVerticalScrollIndicator={false}
                          snapToInterval={44}
                          decelerationRate="fast">
                          {feet.map((ft) => (
                            <TouchableOpacity
                              key={ft}
                              onPress={() => updateField('feet', ft)}
                              className={combineClasses(
                                'h-11 items-center justify-center rounded-lg',
                                formData.feet === ft ? 'bg-green-100' : ''
                              )}>
                              <Text
                                className={combineClasses(
                                  'text-lg',
                                  formData.feet === ft ? 'font-bold text-green-600' : 'text-gray-700'
                                )}>
                                {ft}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                    <View className="flex-1">
                      <Text className="mb-2 text-center text-sm text-gray-600">Inches</Text>
                      <View className="h-48">
                        <ScrollView
                          showsVerticalScrollIndicator={false}
                          snapToInterval={44}
                          decelerationRate="fast">
                          {inches.map((inch) => (
                            <TouchableOpacity
                              key={inch}
                              onPress={() => updateField('inches', inch)}
                              className={combineClasses(
                                'h-11 items-center justify-center rounded-lg',
                                formData.inches === inch ? 'bg-green-100' : ''
                              )}>
                              <Text
                                className={combineClasses(
                                  'text-lg',
                                  formData.inches === inch
                                    ? 'font-bold text-green-600'
                                    : 'text-gray-700'
                                )}>
                                {inch}
                              </Text>
                            </TouchableOpacity>
                          ))}
                        </ScrollView>
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </Modal>
          </View>

          {/* Weight - Optional */}
          <View className="mb-6">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Weight
            </Text>
            <View className={inputs.default.container}>
              <TextInput
                className={inputs.default.input}
                placeholder="Enter weight in pounds (lbs)"
                placeholderTextColor={inputs.default.placeholder}
                value={formData.weightLbs}
                onChangeText={(value) => updateField('weightLbs', value)}
                keyboardType="numeric"
              />
            </View>
            {formData.weightLbs && (
              <Text className="mt-2 text-xs text-gray-500">
                {Math.round((parseFloat(formData.weightLbs) / 2.20462) * 10) / 10} kg
              </Text>
            )}
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
