import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  Platform,
  Switch,
  KeyboardAvoidingView,
  Keyboard,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DateTimePicker from '@react-native-community/datetimepicker';
import { cards, typography, buttons, combineClasses, layout, inputs } from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { apiService, ChecklistItem } from '../../services/api';

type ChecklistItemEditScreenProps = {
  itemId: string;
  initialItem: ChecklistItem;
  onSave: () => void;
  onNavigateBack?: () => void;
  onRequestDocuments?: () => void;
};

export const ChecklistItemEditScreen = ({
  itemId,
  initialItem,
  onSave,
  onNavigateBack,
  onRequestDocuments,
}: ChecklistItemEditScreenProps) => {
  const [isComplete, setIsComplete] = useState(initialItem.is_complete);
  const [completedAt, setCompletedAt] = useState<Date>(
    initialItem.completed_at ? new Date(initialItem.completed_at) : new Date()
  );
  const [notes, setNotes] = useState(initialItem.notes || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const notesInputRef = useRef<TextInput>(null);
  const insets = useSafeAreaInsets();
  const notesModifiedRef = useRef(false);

  // Refresh item data when component mounts or when returning to this screen
  useEffect(() => {
    const refreshItemData = async () => {
      try {
        const checklist = await apiService.getChecklist();
        const updatedItem = checklist.items.find((item) => item.id === itemId);
        if (updatedItem) {
          // Update state with latest data from backend, but preserve local notes if user is typing
          setIsComplete(updatedItem.is_complete);
          if (updatedItem.completed_at) {
            setCompletedAt(new Date(updatedItem.completed_at));
          }
          // Only update notes from backend if notes haven't been locally modified
          // This preserves what the user is currently typing
          if (!notesModifiedRef.current) {
            setNotes(updatedItem.notes || '');
          }
        }
      } catch (error) {
        console.error('Error refreshing item data:', error);
      }
    };

    refreshItemData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itemId]);

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => setIsKeyboardVisible(true)
    );
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setIsKeyboardVisible(false)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const handleCompleteToggle = (value: boolean) => {
    setIsComplete(value);
    // If marking as incomplete, reset completed_at to current time
    // (it will be cleared on backend)
    if (!value) {
      setCompletedAt(new Date());
    }
  };

  const handleDismissKeyboard = () => {
    notesInputRef.current?.blur();
    Keyboard.dismiss();
  };

  // Track when notes are modified to preserve user input
  const handleNotesChange = (text: string) => {
    notesModifiedRef.current = true;
    setNotes(text);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setCompletedAt(selectedDate);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiService.updateChecklistItem(itemId, {
        is_complete: isComplete,
        completed_at: isComplete ? completedAt.toISOString() : undefined,
        notes: notes.trim() || '', // Send empty string instead of undefined to ensure it saves
      });
      // Reset the modified flag after successful save
      notesModifiedRef.current = false;
      onSave();
    } catch (error: any) {
      console.error('Error saving checklist item:', error);
      // TODO: Show error message to user
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = async () => {
    // Save changes before navigating back
    await handleSave();
    if (onNavigateBack) {
      onNavigateBack();
    }
  };

  return (
    <SafeAreaView className={layout.container.default}>
      <NavigationBar onBack={handleBack} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}>
        <ScrollView
          className={layout.scrollView}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <View className="px-6 pb-2">
            {/* Header */}
            <View className="mb-8">
              <Text className={combineClasses(typography.h3, 'mb-2')}>{initialItem.title}</Text>
              {initialItem.description && (
                <Text className={combineClasses(typography.body.small, 'text-gray-600')}>
                  {initialItem.description}
                </Text>
              )}
            </View>

            {/* Completion Toggle */}
            <View className={combineClasses(cards.default.container, 'mb-6')}>
              <View className="flex-row items-center justify-between">
                <View className="flex-1">
                  <Text className={combineClasses(typography.h5, 'mb-1')}>Mark as Complete</Text>
                  <Text className={combineClasses(typography.body.small, 'text-gray-600')}>
                    Toggle this switch when you have completed this evaluation
                  </Text>
                </View>
                <Switch
                  value={isComplete}
                  onValueChange={handleCompleteToggle}
                  trackColor={{ false: '#d1d5db', true: '#22c55e' }}
                  thumbColor={isComplete ? '#ffffff' : '#f3f4f6'}
                />
              </View>
            </View>

            {/* Completion Date/Time */}
            <View
              className={combineClasses(
                cards.default.container,
                'mb-6',
                !isComplete ? 'opacity-50' : ''
              )}>
              <Text className={combineClasses(typography.h5, 'mb-2')}>Completion Date & Time</Text>
              <Text className={combineClasses(typography.body.small, 'mb-4 text-gray-600')}>
                When was this evaluation completed?
              </Text>

              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                disabled={!isComplete}
                className={combineClasses(
                  inputs.default.container,
                  inputs.default.input,
                  !isComplete ? 'bg-gray-100' : 'bg-white'
                )}>
                <Text
                  className={combineClasses(
                    typography.body.medium,
                    !isComplete ? 'text-gray-400' : 'text-gray-900'
                  )}>
                  {completedAt.toLocaleString()}
                </Text>
              </TouchableOpacity>

              {Platform.OS === 'android' && showDatePicker && (
                <DateTimePicker
                  value={completedAt}
                  mode="datetime"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            {/* Documents Card - Always visible */}
            {onRequestDocuments && (
              <View
                className={combineClasses(
                  cards.default.container,
                  'mb-6 border-l-4 border-blue-500',
                  !isComplete ? 'opacity-50' : ''
                )}>
                <Text className={combineClasses(typography.h5, 'mb-2')}>Request Documents</Text>
                <Text className={combineClasses(typography.body.small, 'mb-4 text-gray-600')}>
                  Learn what documents you should request from your provider for this evaluation
                </Text>
                <TouchableOpacity
                  className={combineClasses(buttons.outline.base, buttons.outline.enabled)}
                  onPress={onRequestDocuments}
                  disabled={!isComplete}
                  activeOpacity={0.8}>
                  <Text className={buttons.outline.text}>Request Documents</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Notes */}
            <View
              className={combineClasses(
                cards.default.container,
                'mb-6',
                !isComplete ? 'opacity-50' : ''
              )}>
              <Text className={combineClasses(typography.h5, 'mb-2')}>Notes</Text>
              <Text className={combineClasses(typography.body.small, 'mb-4 text-gray-600')}>
                Add notes about where records are stored or other details
              </Text>
              <TextInput
                ref={notesInputRef}
                value={notes}
                onChangeText={handleNotesChange}
                placeholder="Enter your notes here..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={6}
                editable={isComplete}
                className={combineClasses(
                  inputs.default.container,
                  inputs.default.input,
                  'min-h-[120px] text-left',
                  !isComplete ? 'bg-gray-100 text-gray-400' : 'bg-white text-gray-900'
                )}
                textAlignVertical="top"
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Keyboard Toolbar with Done Button */}
      {isKeyboardVisible && (
        <View
          className="absolute left-0 right-0 border-t border-gray-200 bg-white"
          style={{ bottom: insets.bottom }}>
          <View className="flex-row justify-end px-4 py-2">
            <TouchableOpacity onPress={handleDismissKeyboard}>
              <Text className="text-lg font-semibold text-blue-500">Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Date/Time Picker Modal for iOS */}
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
                <Text className="text-xl font-semibold">Completion Date & Time</Text>
                <TouchableOpacity
                  onPress={() => {
                    setShowDatePicker(false);
                  }}>
                  <Text className="text-xl font-semibold text-blue-500">Done</Text>
                </TouchableOpacity>
              </View>
              <View className="items-center">
                <DateTimePicker
                  value={completedAt}
                  mode="datetime"
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
    </SafeAreaView>
  );
};
