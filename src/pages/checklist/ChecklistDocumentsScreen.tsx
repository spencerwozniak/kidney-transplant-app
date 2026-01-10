import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { cards, typography, combineClasses, layout, buttons } from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { ChecklistItem, apiService } from '../../services/api';
import DOCUMENTS_CONTENT_JSON from '../../data/documents-content.json';

type DocumentContent = {
  title: string;
  description: string;
  requests: string[];
  why: string;
  specialNote?: string;
};

type DocumentsContent = Record<string, DocumentContent>;

const DOCUMENTS_CONTENT = DOCUMENTS_CONTENT_JSON as DocumentsContent;

type ChecklistDocumentsScreenProps = {
  checklistItem: ChecklistItem;
  onNavigateBack?: () => void;
};

export const ChecklistDocumentsScreen = ({
  checklistItem,
  onNavigateBack,
}: ChecklistDocumentsScreenProps) => {
  const content = DOCUMENTS_CONTENT[checklistItem.id];
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>(
    checklistItem.documents || []
  );
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Refresh documents list when component mounts or checklistItem changes
  useEffect(() => {
    refreshDocuments();
  }, [checklistItem.id]);

  const refreshDocuments = async () => {
    setIsRefreshing(true);
    try {
      const checklist = await apiService.getChecklist();
      const item = checklist.items.find((item) => item.id === checklistItem.id);
      if (item && item.documents) {
        setUploadedDocuments(item.documents);
      }
    } catch (error) {
      console.error('Error refreshing documents:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const pickPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        await uploadFile(file.uri, file.name || 'document.pdf', 'application/pdf');
      }
    } catch (error: any) {
      console.error('Error picking PDF:', error);
      Alert.alert('Error', 'Failed to pick PDF file. Please try again.');
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your photos to upload images.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        for (const asset of result.assets) {
          const fileName = asset.fileName || `image_${Date.now()}.jpg`;
          const mimeType = asset.type === 'image' ? 'image/jpeg' : 'image/png';
          await uploadFile(asset.uri, fileName, mimeType);
        }
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const uploadFile = async (fileUri: string, fileName: string, fileType: string) => {
    setIsUploading(true);
    try {
      await apiService.uploadChecklistItemDocument(checklistItem.id, fileUri, fileName, fileType);
      // Refresh the documents list
      await refreshDocuments();
      Alert.alert('Success', 'File uploaded successfully!');
    } catch (error: any) {
      console.error('Error uploading file:', error);
      Alert.alert('Upload Failed', error.message || 'Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const getFileName = (path: string): string => {
    const parts = path.split('/');
    return parts[parts.length - 1] || path;
  };

  if (!content) {
    return (
      <SafeAreaView className={layout.container.default}>
        <NavigationBar onBack={onNavigateBack} />
        <View className="flex-1 items-center justify-center px-6">
          <Text className={combineClasses(typography.h5, 'mb-2 text-center')}>
            Document Information Not Available
          </Text>
          <Text className={combineClasses(typography.body.small, 'text-center text-gray-600')}>
            Document request information for this checklist item is not available.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className={layout.container.default}>
      <NavigationBar onBack={onNavigateBack} />
      <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
        <View className="px-6 pb-2">
          {/* Header */}
          <View className="mb-8">
            <Text className={combineClasses(typography.h3, 'mb-2')}>{content.title}</Text>
            <Text className={combineClasses(typography.body.small, 'text-gray-600')}>
              {content.description}
            </Text>
          </View>

          {/* Patient Should Request */}
          <View className={combineClasses(cards.colored.blue, 'mb-6')}>
            <Text className={combineClasses(typography.h5, 'mb-3 text-blue-900')}>
              Ask your provider for:
            </Text>
            <View className="space-y-2">
              {content.requests.map((request: string, index: number) => (
                <View key={index} className="flex-row">
                  <Text className="mr-2 text-blue-800">•</Text>
                  <Text
                    className={combineClasses(
                      typography.body.small,
                      'flex-1 leading-6 text-blue-800'
                    )}>
                    {request}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Special Note (if exists) */}
          {content.specialNote && (
            <View className={combineClasses(cards.colored.amber, 'mb-6')}>
              <Text className={combineClasses(typography.h5, 'mb-2 text-amber-900')}>
                Special Note
              </Text>
              <Text className={combineClasses(typography.body.small, 'leading-6 text-amber-800')}>
                {content.specialNote}
              </Text>
            </View>
          )}

          {/* Why This Matters */}
          <View className={combineClasses(cards.colored.green, 'mb-6')}>
            <Text className={combineClasses(typography.h5, 'mb-2 text-green-900')}>
              Why this matters:
            </Text>
            <Text className={combineClasses(typography.body.small, 'leading-6 text-green-800')}>
              {content.why}
            </Text>
          </View>

          {/* Upload Documents Section */}
          <View className={combineClasses(cards.default.container, 'mb-6')}>
            <Text className={combineClasses(typography.h5, 'mb-2')}>Upload Documents</Text>
            <Text className={combineClasses(typography.body.small, 'mb-4 text-gray-600')}>
              Upload PDF files or images of your documents for this evaluation
            </Text>

            <View className="space-y-3">
              <TouchableOpacity
                className={combineClasses(
                  buttons.outline.base,
                  buttons.outline.enabled,
                  isUploading ? 'opacity-50' : ''
                )}
                onPress={pickPDF}
                disabled={isUploading}
                activeOpacity={0.8}>
                {isUploading ? (
                  <ActivityIndicator size="small" color="#3b82f6" />
                ) : (
                  <Text className={buttons.outline.text}>Upload PDF</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                className={combineClasses(
                  buttons.outline.base,
                  buttons.outline.enabled,
                  isUploading ? 'opacity-50' : ''
                )}
                onPress={pickImage}
                disabled={isUploading}
                activeOpacity={0.8}>
                {isUploading ? (
                  <ActivityIndicator size="small" color="#3b82f6" />
                ) : (
                  <Text className={buttons.outline.text}>Upload Image</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Uploaded Documents List */}
          {uploadedDocuments.length > 0 && (
            <View className={combineClasses(cards.default.container, 'mb-6')}>
              <View className="mb-4 flex-row items-center justify-between">
                <Text className={combineClasses(typography.h5, '')}>Uploaded Documents</Text>
                <TouchableOpacity onPress={refreshDocuments} disabled={isRefreshing}>
                  {isRefreshing ? (
                    <ActivityIndicator size="small" color="#3b82f6" />
                  ) : (
                    <Text className="text-blue-500">Refresh</Text>
                  )}
                </TouchableOpacity>
              </View>
              <View className="space-y-2">
                {uploadedDocuments.map((docPath, index) => (
                  <View
                    key={index}
                    className="flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <Text
                      className={combineClasses(typography.body.small, 'flex-1 text-gray-700')}
                      numberOfLines={1}>
                      {getFileName(docPath)}
                    </Text>
                    <View className="ml-2 rounded bg-green-100 px-2 py-1">
                      <Text className="text-xs font-medium text-green-800">Uploaded</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
