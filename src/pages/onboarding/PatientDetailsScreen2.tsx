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
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { buttons, typography, inputs, combineClasses, layout } from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { PathwayBackground } from '../../components/PathwayBackground';
import { Patient } from '../../services/api';
import { getWebPadding } from '../../utils/webStyles';
import { WheelPicker } from '../../components/WheelPicker';
import { WheelDatePicker } from '../../components/WheelDatePicker';

type PatientDetailsScreen2Props = {
  onNext: (data: { date_of_birth: string; sex?: string; height_cm?: number; weight_kg?: number }) => void;
  onBack?: () => void;
  initialData?: {
    date_of_birth?: string;
    sex?: string;
    height_cm?: number;
    weight_kg?: number;
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
    heightFeet: initialData?.height_cm ? Math.floor(initialData.height_cm / 30.48).toString() : '',
    heightInches: initialData?.height_cm
      ? Math.round((initialData.height_cm % 30.48) / 2.54).toString()
      : '',
    weightLbs: initialData?.weight_kg ? Math.round(initialData.weight_kg * 2.20462).toString() : '',
  });

  const [errors, setErrors] = useState<{
    dateOfBirth?: string;
    sex?: string;
    height?: string;
    weight?: string;
  }>({});
  const [touched, setTouched] = useState<{
    dateOfBirth?: boolean;
    sex?: boolean;
    height?: boolean;
    weight?: boolean;
  }>({});
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

  // Convert to wheel picker format
  const feetPickerItems = feetOptions.map((feet) => ({
    label: feet.toString(),
    value: feet.toString(),
  }));
  const inchesPickerItems = inchesOptions.map((inches) => ({
    label: inches.toString(),
    value: inches.toString(),
  }));

  const validate = (): boolean => {
    const newErrors: {
      dateOfBirth?: string;
      sex?: string;
      height?: string;
      weight?: string;
    } = {};

    // Date of Birth validation
    const date = formData.dateOfBirth;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (!date) {
      newErrors.dateOfBirth = 'Date of birth is required.';
    } else if (date >= today) {
      newErrors.dateOfBirth = 'Enter a valid date of birth.';
    } else {
      // Check if age <= 120 years
      const age = today.getFullYear() - date.getFullYear();
      if (age > 120) {
        newErrors.dateOfBirth = 'Enter a valid date of birth.';
      }
    }

    // Sex validation
    if (!formData.sex || formData.sex.trim() === '') {
      newErrors.sex = 'Please select sex assigned at birth.';
    }

    // Height validation
    if (!formData.heightFeet || formData.heightFeet === '') {
      newErrors.height = 'Height is required.';
    }

    // Weight validation
    const weightStr = formData.weightLbs.trim();
    if (!weightStr) {
      newErrors.weight = 'Weight is required.';
    } else if (!/^\d+(\.\d+)?$/.test(weightStr)) {
      newErrors.weight = 'Enter weight as a number.';
    } else {
      const weight = parseFloat(weightStr);
      if (weight <= 0 || weight < 50 || weight > 700) {
        newErrors.weight = 'Enter a valid weight in lbs.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateField = (field: keyof typeof formData) => {
    const newErrors = { ...errors };

    if (field === 'dateOfBirth') {
      const date = formData.dateOfBirth;
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (!date) {
        newErrors.dateOfBirth = 'Date of birth is required.';
      } else if (date >= today) {
        newErrors.dateOfBirth = 'Enter a valid date of birth.';
      } else {
        const age = today.getFullYear() - date.getFullYear();
        if (age > 120) {
          newErrors.dateOfBirth = 'Enter a valid date of birth.';
        } else {
          delete newErrors.dateOfBirth;
        }
      }
    }

    if (field === 'sex') {
      if (!formData.sex || formData.sex.trim() === '') {
        newErrors.sex = 'Please select sex assigned at birth.';
      } else {
        delete newErrors.sex;
      }
    }

    if (field === 'heightFeet' || field === 'heightInches') {
      if (!formData.heightFeet || formData.heightFeet === '') {
        newErrors.height = 'Height is required.';
      } else {
        delete newErrors.height;
      }
    }

    if (field === 'weightLbs') {
      const weightStr = formData.weightLbs.trim();
      if (!weightStr) {
        newErrors.weight = 'Weight is required.';
      } else if (!/^\d+(\.\d+)?$/.test(weightStr)) {
        newErrors.weight = 'Enter weight as a number.';
      } else {
        const weight = parseFloat(weightStr);
        if (weight <= 0 || weight < 50 || weight > 700) {
          newErrors.weight = 'Enter a valid weight in lbs.';
        } else {
          delete newErrors.weight;
        }
      }
    }

    setErrors(newErrors);
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
      const weightLbs = formData.weightLbs ? parseFloat(formData.weightLbs) : undefined;
      const weightInKg = weightLbs ? weightLbs / 2.20462 : undefined;

      // Dev logging for conversion verification
      if (__DEV__) {
        console.log('[PersonalDetails][Dev] Form Data Conversion:');
        console.log('  Input:');
        console.log('    • DOB selected:', date);
        console.log('    • Sex selected:', formData.sex);
        console.log('    • Height entered:', formData.heightFeet, 'ft', formData.heightInches, 'in');
        console.log('    • Weight entered:', weightLbs, 'lbs');
        console.log('  Output:');
        console.log('    • DOB (ISO):', date_of_birth);
        console.log('    • Sex:', formData.sex);
        console.log('    • Height (cm):', heightInCm?.toFixed(2));
        console.log('    • Weight (kg):', weightInKg?.toFixed(2));
      }

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
          height_cm: heightInCm && heightInCm > 0 ? heightInCm : undefined,
          weight_kg: weightInKg,
        });
      });
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing/selecting
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const isFormValid = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Check DOB
    if (!formData.dateOfBirth || formData.dateOfBirth >= today) {
      return false;
    }
    const age = today.getFullYear() - formData.dateOfBirth.getFullYear();
    if (age > 120) {
      return false;
    }

    // Check sex
    if (!formData.sex || formData.sex.trim() === '') {
      return false;
    }

    // Check height
    if (!formData.heightFeet || formData.heightFeet === '') {
      return false;
    }

    // Check weight
    const weightStr = formData.weightLbs.trim();
    if (!weightStr || !/^\d+(\.\d+)?$/.test(weightStr)) {
      return false;
    }
    const weight = parseFloat(weightStr);
    if (weight <= 0 || weight < 50 || weight > 700) {
      return false;
    }

    return true;
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
    } else if (Platform.OS === 'web') {
      // On web, update the date but don't close the modal
      // User must click Cancel or Done to close
      if (selectedDate) {
        updateField('dateOfBirth', selectedDate);
      }
    } else {
      // On Android, close the picker after selection
      setShowDatePicker(false);
      if (selectedDate) {
        updateField('dateOfBirth', selectedDate);
      }
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
              Personal Details
            </Text>
            <Text className={combineClasses(typography.body.large, 'mb-6 text-white shadow')}>
              Please provide your personal information
            </Text>

            {/* Date of Birth - Required */}
            <View className="mb-6">
              <Text
                className={combineClasses(
                  typography.body.large,
                  'mb-2 font-semibold text-white shadow'
                )}>
                Date of Birth <Text className="text-red-200">*</Text>
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
              {(touched.dateOfBirth || errors.dateOfBirth) && errors.dateOfBirth && (
                <Text className="mt-1 text-xs text-red-200">{errors.dateOfBirth}</Text>
              )}
            </View>

            {/* Sex - Required */}
            <View className="mb-6">
              <Text
                className={combineClasses(
                  typography.body.large,
                  'mb-2 font-semibold text-white shadow'
                )}>
                Sex Assigned at Birth <Text className="text-red-200">*</Text>
              </Text>
              <View className="flex-row gap-2">
                {['male', 'female'].map((option) => (
                  <TouchableOpacity
                    key={option}
                    className={combineClasses(
                      'flex-1 rounded-lg border-2 p-3',
                      formData.sex === option
                        ? 'border-green-600 bg-green-100'
                        : 'border-gray-200 bg-white'
                    )}
                    onPress={() => {
                      updateField('sex', option);
                      handleBlur('sex');
                    }}>
                    <Text
                      className={combineClasses(
                        'text-center capitalize',
                        formData.sex === option ? 'font-bold text-green-600' : 'text-green-700'
                      )}>
                      {option}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {(touched.sex || errors.sex) && errors.sex && (
                <Text className="mt-1 text-xs text-red-200">{errors.sex}</Text>
              )}
            </View>

            {/* Height - Required */}
            <View className="mb-6">
              <Text
                className={combineClasses(
                  typography.body.large,
                  'mb-2 font-semibold text-white shadow'
                )}>
                Height <Text className="text-red-200">*</Text>
              </Text>
              <TouchableOpacity
                className={combineClasses(inputs.default.container, 'justify-center')}
                onPress={() => setShowHeightPicker(true)}>
                <Text
                  className={combineClasses(
                    inputs.default.input,
                    !formData.heightFeet && !formData.heightInches
                      ? 'text-gray-400'
                      : 'text-gray-900'
                  )}>
                  {formatHeight()}
                </Text>
              </TouchableOpacity>
              {(touched.height || errors.height) && errors.height && (
                <Text className="mt-1 text-xs text-red-200">{errors.height}</Text>
              )}
              {(formData.heightFeet || formData.heightInches) && !errors.height && (
                <Text className="mt-2 text-xs text-white/80">
                  {Math.round(
                    ((parseFloat(formData.heightFeet) || 0) * 30.48 +
                      (parseFloat(formData.heightInches) || 0) * 2.54) *
                      10
                  ) / 10}{' '}
                  cm
                </Text>
              )}
            </View>

            {/* Weight - Required */}
            <View className="mb-6">
              <Text
                className={combineClasses(
                  typography.body.large,
                  'mb-2 font-semibold text-white shadow'
                )}>
                Weight <Text className="text-red-200">*</Text>
              </Text>
              <View className={inputs.default.container}>
                <TextInput
                  ref={weightInputRef}
                  className={inputs.default.input}
                  placeholder="Enter weight in pounds (lbs)"
                  placeholderTextColor={inputs.default.placeholder}
                  value={formData.weightLbs as string}
                  onChangeText={(value) => updateField('weightLbs', value)}
                  onBlur={() => handleBlur('weightLbs')}
                  keyboardType="numeric"
                  inputAccessoryViewID={Platform.OS === 'ios' ? inputAccessoryViewID : undefined}
                />
              </View>
              {(touched.weight || errors.weight) && errors.weight && (
                <Text className="mt-1 text-xs text-red-200">{errors.weight}</Text>
              )}
              {formData.weightLbs && !errors.weight && (
                <Text className="mt-2 text-xs text-white/80">
                  {Math.round((parseFloat(formData.weightLbs) / 2.20462) * 10) / 10} kg
                </Text>
              )}
            </View>

            {/* Next Button */}
            <TouchableOpacity
              className={combineClasses(
                buttons.outline.base,
                isFormValid() ? buttons.outline.enabled : buttons.outline.disabled
              )}
              onPress={handleNext}
              activeOpacity={0.8}
              disabled={!isFormValid()}>
              <Text className={buttons.outline.text}>Next</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}>
          <View
            className="flex-1 justify-end bg-black/50"
            {...(Platform.OS === 'web' && {
              style: { pointerEvents: 'auto' },
            })}>
            <View className="overflow-hidden rounded-t-3xl bg-white">
              <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text className="text-xl text-blue-500">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-xl font-semibold">Date of Birth</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowDatePicker(false);
                    handleBlur('dateOfBirth');
                  }}>
                  <Text className="text-xl font-semibold text-blue-500">Done</Text>
                </TouchableOpacity>
              </View>
              <View className="items-center" style={styles.datePickerContainer}>
                {Platform.OS === 'ios' ? (
                  <DateTimePicker
                    value={formData.dateOfBirth}
                    mode="date"
                    display="spinner"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                    textColor="#000000"
                    style={{ width: '100%', height: 280, transform: [{ scale: 1.05 }] }}
                  />
                ) : Platform.OS === 'web' ? (
                  <View style={styles.webDatePicker}>
                    <WheelDatePicker
                      value={formData.dateOfBirth}
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      style={{ width: '100%', height: 280 }}
                    />
                  </View>
                ) : (
                  <View style={{ width: '100%', padding: 20 }}>
                    <DateTimePicker
                      value={formData.dateOfBirth}
                      mode="date"
                      display="default"
                      onChange={handleDateChange}
                      maximumDate={new Date()}
                      style={{ width: '100%' }}
                    />
                  </View>
                )}
              </View>
            </View>
          </View>
        </Modal>

        {/* Height Picker Modal */}
        <Modal
          visible={showHeightPicker}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowHeightPicker(false)}>
          <View
            className="flex-1 justify-end bg-black/50"
            style={[styles.modalOverlay, Platform.OS === 'web' && { pointerEvents: 'auto' }]}>
            <View className="rounded-t-3xl bg-white" style={styles.pickerModal}>
              <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-3">
                <TouchableOpacity onPress={() => setShowHeightPicker(false)}>
                  <Text className="text-xl text-blue-500">Cancel</Text>
                </TouchableOpacity>
                <Text className="text-xl font-semibold">Height</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowHeightPicker(false);
                    handleBlur('heightFeet');
                  }}>
                  <Text className="text-xl font-semibold text-blue-500">Done</Text>
                </TouchableOpacity>
              </View>
              <View className="flex-row" style={styles.pickerContainer}>
                <View className="flex-1" style={styles.pickerColumn}>
                  <Text className="py-2 text-center text-gray-600">Feet</Text>
                  {Platform.OS === 'web' ? (
                    <WheelPicker
                      items={feetPickerItems}
                      selectedValue={formData.heightFeet || '1'}
                      onValueChange={(value) => updateField('heightFeet', value.toString())}
                      style={styles.wheelPicker}
                    />
                  ) : (
                    <Picker
                      selectedValue={formData.heightFeet || '1'}
                      onValueChange={(value: string | number) =>
                        updateField('heightFeet', value.toString())
                      }
                      style={styles.picker}>
                      {feetOptions.map((feet, index) => (
                        <Picker.Item
                          key={`feet-${index}`}
                          label={feet.toString()}
                          value={feet.toString()}
                        />
                      ))}
                    </Picker>
                  )}
                </View>
                <View className="flex-1" style={styles.pickerColumn}>
                  <Text className="py-2 text-center text-gray-600">Inches</Text>
                  {Platform.OS === 'web' ? (
                    <WheelPicker
                      items={inchesPickerItems}
                      selectedValue={formData.heightInches || '0'}
                      onValueChange={(value) => updateField('heightInches', value.toString())}
                      style={styles.wheelPicker}
                    />
                  ) : (
                    <Picker
                      selectedValue={formData.heightInches || '0'}
                      onValueChange={(value: string | number) =>
                        updateField('heightInches', value.toString())
                      }
                      style={styles.picker}>
                      {inchesOptions.map((inches, index) => (
                        <Picker.Item
                          key={`inches-${index}`}
                          label={inches.toString()}
                          value={inches.toString()}
                        />
                      ))}
                    </Picker>
                  )}
                </View>
              </View>
            </View>
          </View>
        </Modal>

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
  modalOverlay: {
    ...(Platform.OS === 'web' && {
      alignItems: 'center',
      justifyContent: 'flex-end',
    }),
  },
  pickerModal: {
    ...(Platform.OS === 'web' && {
      width: '100%',
      maxWidth: 428, // Match the constrained width
      alignSelf: 'center',
      maxHeight: Platform.OS === 'web' ? 600 : undefined,
      minHeight: 400,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      overflow: 'hidden',
      marginBottom: 0,
    }),
  },
  pickerContainer: {
    ...(Platform.OS === 'web' && {
      minHeight: 320,
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'row',
    }),
  },
  pickerColumn: {
    ...(Platform.OS === 'web' && {
      width: '50%',
      maxWidth: '50%',
      overflow: 'hidden',
      alignItems: 'center',
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
    }),
  },
  picker: {
    height: 200,
    ...(Platform.OS === 'web' && {
      height: 320,
      minHeight: 320,
      width: '100%',
      maxWidth: '100%',
      boxSizing: 'border-box',
    }),
  },
  wheelPicker: {
    width: '100%',
    ...(Platform.OS === 'web' && {
      height: 250,
    }),
  },
  datePickerContainer: {
    width: '100%',
    ...(Platform.OS === 'web' && {
      minHeight: 280,
    }),
  },
  webDatePicker: {
    width: '100%',
    height: 280,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
