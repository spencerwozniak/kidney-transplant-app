import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Animated,
  Modal,
  Platform,
  InputAccessoryView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { buttons, typography, inputs, combineClasses, layout } from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { Patient } from '../../services/api';

type PatientDetailsScreen2Props = {
  onNext: (data: { date_of_birth: string; sex?: string; height?: number; weight?: number }) => void;
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

  const initialDOB = parseDOB(initialData?.date_of_birth);

  const [formData, setFormData] = useState({
    dateOfBirth: initialDOB,
    sex: initialData?.sex || '',
    heightFeet: initialData?.height ? Math.floor(initialData.height / 30.48).toString() : '',
    heightInches: initialData?.height
      ? Math.round((initialData.height % 30.48) / 2.54).toString()
      : '',
    weightLbs: initialData?.weight ? Math.round(initialData.weight * 2.20462).toString() : '',
  });

  const [errors, setErrors] = useState<{ date_of_birth?: string }>({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showHeightPicker, setShowHeightPicker] = useState(false);
  const weightInputRef = useRef<TextInput>(null);
  const inputAccessoryViewID = 'weightInputAccessoryView';

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
  const feetOptions = Array.from({ length: 8 }, (_, i) => i + 1);
  const inchesOptions = Array.from({ length: 12 }, (_, i) => i);

  const validate = (): boolean => {
    const newErrors: { date_of_birth?: string } = {};

    const date = formData.dateOfBirth;
    const isValid = date && date <= new Date() && date.getTime() > 0;

    if (!isValid) {
      newErrors.date_of_birth = 'Please enter a valid date';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validate()) {
      const date = formData.dateOfBirth;
      const date_of_birth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
        date.getDate()
      ).padStart(2, '0')}`;

      // Convert height from ft/in to cm
      let heightInCm: number | undefined = undefined;
      if (formData.heightFeet || formData.heightInches) {
        const feet = parseFloat(formData.heightFeet) || 0;
        const inches = parseFloat(formData.heightInches) || 0;
        if (feet > 0 || inches > 0) {
          heightInCm = feet * 30.48 + inches * 2.54;
        }
      }

      // Convert weight from lbs to kg
      const weightInKg = formData.weightLbs ? parseFloat(formData.weightLbs) / 2.20462 : undefined;

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
          height: heightInCm && heightInCm > 0 ? heightInCm : undefined,
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
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  const formatHeight = () => {
    if (!formData.heightFeet && !formData.heightInches) {
      return 'Select height';
    }
    const feet = formData.heightFeet || '0';
    const inches = formData.heightInches || '0';
    return `${feet} ft ${inches} in`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'ios') {
      if (selectedDate) {
        updateField('dateOfBirth', selectedDate);
      }
    } else {
      setShowDatePicker(false);
      if (selectedDate) {
        updateField('dateOfBirth', selectedDate);
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
              className={combineClasses(inputs.default.container, 'justify-center')}
              onPress={() => setShowDatePicker(true)}>
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
          </View>

          {/* Sex - Optional */}
          <View className="mb-6">
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
          <View className="mb-6">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Height
            </Text>
            <TouchableOpacity
              className={combineClasses(inputs.default.container, 'justify-center')}
              onPress={() => setShowHeightPicker(true)}>
              <Text
                className={combineClasses(
                  inputs.default.input,
                  !formData.heightFeet && !formData.heightInches ? 'text-gray-400' : 'text-gray-900'
                )}>
                {formatHeight()}
              </Text>
            </TouchableOpacity>
            {(formData.heightFeet || formData.heightInches) && (
              <Text className="mt-2 text-xs text-gray-500">
                {Math.round(
                  ((parseFloat(formData.heightFeet) || 0) * 30.48 +
                    (parseFloat(formData.heightInches) || 0) * 2.54) *
                    10
                ) / 10}{' '}
                cm
              </Text>
            )}
          </View>

          {/* Weight - Optional */}
          <View className="mb-6">
            <Text className={combineClasses(typography.body.small, 'mb-2 font-semibold')}>
              Weight
            </Text>
            <View className={inputs.default.container}>
              <TextInput
                ref={weightInputRef}
                className={inputs.default.input}
                placeholder="Enter weight in pounds (lbs)"
                placeholderTextColor={inputs.default.placeholder}
                value={formData.weightLbs as string}
                onChangeText={(value) => updateField('weightLbs', value)}
                keyboardType="numeric"
                inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
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

      {/* Date Picker Modal */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}>
          <View className="flex-1 justify-end bg-black/50">
            <View className="overflow-hidden rounded-t-3xl bg-white">
              <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text className="text-xl text-blue-500">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-xl font-semibold">Date of Birth</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowDatePicker(false);
                  }}>
                  <Text className="text-xl font-semibold text-blue-500">Done</Text>
                </TouchableOpacity>
              </View>
              <View className="items-center">
                <DateTimePicker
                  value={formData.dateOfBirth}
                  mode="date"
                  display="spinner"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                  textColor="#000000"
                  style={{ width: '100%', height: 280, transform: [{ scale: 1.05 }] }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Height Picker Modal */}
      {Platform.OS === 'ios' && (
        <Modal
          visible={showHeightPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowHeightPicker(false)}>
          <View className="flex-1 justify-end bg-black/50">
            <View className="rounded-t-3xl bg-white">
              <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
                <TouchableOpacity onPress={() => setShowHeightPicker(false)}>
                  <Text className="text-xl text-blue-500">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-xl font-semibold">Height</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowHeightPicker(false);
                  }}>
                  <Text className="text-xl font-semibold text-blue-500">Done</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row">
                <View className="flex-1">
                  <Text className="py-2 text-center text-gray-600">Feet</Text>
                  <Picker
                    selectedValue={formData.heightFeet || '1'}
                    onValueChange={(value: string | number) =>
                      updateField('heightFeet', value.toString())
                    }
                    style={{ height: 200 }}>
                    {feetOptions.map((feet, index) => (
                      <Picker.Item
                        key={`feet-${index}`}
                        label={feet.toString()}
                        value={feet.toString()}
                      />
                    ))}
                  </Picker>
                </View>
                <View className="flex-1">
                  <Text className="py-2 text-center text-gray-600">Inches</Text>
                  <Picker
                    selectedValue={formData.heightInches || '0'}
                    onValueChange={(value: string | number) =>
                      updateField('heightInches', value.toString())
                    }
                    style={{ height: 200 }}>
                    {inchesOptions.map((inches, index) => (
                      <Picker.Item
                        key={`inches-${index}`}
                        label={inches.toString()}
                        value={inches.toString()}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* Input Accessory View for Weight Keyboard */}
      {Platform.OS === 'ios' && (
        <InputAccessoryView nativeID={inputAccessoryViewID}>
          <View className="flex-row items-center justify-end border-t border-gray-200 bg-gray-100 px-4 py-2">
            <TouchableOpacity
              onPress={() => {
                weightInputRef.current?.blur();
              }}>
              <Text className="text-xl font-semibold text-blue-500">Done</Text>
            </TouchableOpacity>
          </View>
        </InputAccessoryView>
      )}
    </SafeAreaView>
  );
};
