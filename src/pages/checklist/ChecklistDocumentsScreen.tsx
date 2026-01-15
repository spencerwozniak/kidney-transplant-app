import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
  ActionSheetIOS,
  Linking,
  Animated,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import * as WebBrowser from 'expo-web-browser';
import { cards, typography, combineClasses, layout, buttons } from '../../styles/theme';
import { NavigationBar } from '../../components/NavigationBar';
import { PathwayBackground } from '../../components/PathwayBackground';
import { ChecklistItem, apiService } from '../../services/api';
import DOCUMENTS_CONTENT_JSON from '../../data/documents-content.json';
import { getWebPadding } from '../../utils/webStyles';

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
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  useEffect(() => {
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

  const takePhoto = async () => {
    try {
      // Request camera permissions
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      if (cameraStatus !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant permission to access your camera to take photos.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `photo_${Date.now()}.jpg`;
        const mimeType = asset.type === 'image' ? 'image/jpeg' : 'image/png';
        await uploadFiles([{ uri: asset.uri, fileName, fileType: mimeType }]);
      }
    } catch (error: any) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const choosePhoto = async () => {
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
        const files = result.assets.map((asset) => ({
          uri: asset.uri,
          fileName: asset.fileName || `image_${Date.now()}.jpg`,
          fileType: asset.type === 'image' ? 'image/jpeg' : 'image/png',
        }));
        await uploadFiles(files);
      }
    } catch (error: any) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const chooseDocuments = async () => {
    if (Platform.OS === 'web') {
      // Web: Use HTML file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'application/pdf,image/*';
      input.multiple = true;
      input.style.display = 'none';

      input.onchange = async (e: Event) => {
        const target = e.target as HTMLInputElement;
        if (target.files && target.files.length > 0) {
          const files = Array.from(target.files).map((file) => ({
            file: file, // Store the File object for web
            fileName: file.name,
            fileType: file.type || 'application/pdf',
          }));
          await uploadFilesWeb(files);
        }
        // Clean up the input element
        if (input.parentNode) {
          input.parentNode.removeChild(input);
        }
      };

      document.body.appendChild(input);
      input.click();
      return;
    }

    // Mobile: Use DocumentPicker
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
        multiple: true,
      });

      // `DocumentPicker.getDocumentAsync` returns an object with `type: 'success'|'cancel'` and file info.
      // Some platforms or versions may return a single file or an array; handle both safely.
      if (!result) return;

      // If result is an array (multiple files), map accordingly
      if (Array.isArray(result)) {
        const files = result.map((file: any) => ({
          uri: file.uri,
          fileName: file.name || 'document.pdf',
          fileType: file.mimeType || 'application/pdf',
        }));
        if (files.length > 0) await uploadFiles(files);
        return;
      }

      // Single file response
      // Support both `{ type: 'success', uri, name, mimeType }` and legacy shapes
      if ((result as any).type === 'success' || (result as any).uri) {
        const file = result as any;
        const files = [
          {
            uri: file.uri,
            fileName: file.name || getFileName(file.uri) || 'document.pdf',
            fileType: file.mimeType || file.mimeType || 'application/pdf',
          },
        ];
        await uploadFiles(files);
      }
    } catch (error: any) {
      console.error('Error picking documents:', error);
      Alert.alert('Error', 'Failed to pick documents. Please try again.');
    }
  };

  const showUploadOptions = () => {
    if (Platform.OS === 'web') {
      // Web: Directly open file picker for documents
      chooseDocuments();
    } else if (Platform.OS === 'ios') {
      // Use native iOS ActionSheet
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose Photo', 'Choose Documents'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            takePhoto();
          } else if (buttonIndex === 2) {
            choosePhoto();
          } else if (buttonIndex === 3) {
            chooseDocuments();
          }
        }
      );
    } else {
      // Use Alert for Android
      Alert.alert(
        'Upload Documents',
        'Select how you would like to upload your documents',
        [
          {
            text: 'Take Photo',
            onPress: takePhoto,
          },
          {
            text: 'Choose Photo',
            onPress: choosePhoto,
          },
          {
            text: 'Choose Documents',
            onPress: chooseDocuments,
          },
          {
            text: 'Cancel',
            style: 'cancel',
          },
        ],
        { cancelable: true }
      );
    }
  };

  const uploadFile = async (fileUri: string, fileName: string, fileType: string) => {
    try {
      await apiService.uploadChecklistItemDocument(checklistItem.id, fileUri, fileName, fileType);
    } catch (error: any) {
      console.error('Error uploading file:', error);
      throw error; // Re-throw to let caller handle
    }
  };

  const uploadFiles = async (files: Array<{ uri: string; fileName: string; fileType: string }>) => {
    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const file of files) {
        try {
          await uploadFile(file.uri, file.fileName, file.fileType);
          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Error uploading file:', file.fileName, error);
        }
      }

      // Refresh the documents list after all uploads
      await refreshDocuments();

      // Show appropriate message
      if (successCount > 0 && errorCount === 0) {
        Alert.alert(
          'Success',
          successCount === 1
            ? 'File uploaded successfully!'
            : `${successCount} files uploaded successfully!`
        );
      } else if (successCount > 0 && errorCount > 0) {
        Alert.alert(
          'Partial Success',
          `${successCount} file(s) uploaded successfully, ${errorCount} file(s) failed.`
        );
      } else {
        Alert.alert('Upload Failed', 'Failed to upload files. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Web-specific upload function that handles File objects
  const uploadFilesWeb = async (
    files: Array<{ file: File; fileName: string; fileType: string }>
  ) => {
    setIsUploading(true);
    let successCount = 0;
    let errorCount = 0;

    try {
      for (const fileData of files) {
        try {
          await apiService.uploadChecklistItemDocument(
            checklistItem.id,
            fileData.file,
            fileData.fileName,
            fileData.fileType
          );
          successCount++;
        } catch (error) {
          errorCount++;
          console.error('Error uploading file:', fileData.fileName, error);
        }
      }

      // Refresh the documents list after all uploads
      await refreshDocuments();

      // Show appropriate message
      if (successCount > 0 && errorCount === 0) {
        Alert.alert(
          'Success',
          successCount === 1
            ? 'File uploaded successfully!'
            : `${successCount} files uploaded successfully!`
        );
      } else if (successCount > 0 && errorCount > 0) {
        Alert.alert(
          'Partial Success',
          `${successCount} file(s) uploaded successfully, ${errorCount} file(s) failed.`
        );
      } else {
        Alert.alert('Upload Failed', 'Failed to upload files. Please try again.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const getFileName = (path: string): string => {
    const parts = path.split('/');
    return parts[parts.length - 1] || path;
  };

  const getDocumentUrl = (docPath: string): string => {
    // Document path format: documents/{patient_id}/{item_id}/{filename}
    // URL encode the path for the API
    const encodedPath = encodeURIComponent(docPath);
    return apiService.makeUrl(`/api/v1/documents/${encodedPath}`);
  };

  const viewDocument = async (docPath: string) => {
    try {
      const url = getDocumentUrl(docPath);
      const fileName = getFileName(docPath);
      const fileExtension = fileName.split('.').pop()?.toLowerCase();

      // For images, try to open in browser
      if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(fileExtension || '')) {
        // Images can be opened directly in WebBrowser
        await WebBrowser.openBrowserAsync(url);
      } else if (fileExtension === 'pdf') {
        // PDFs can also be opened in WebBrowser
        await WebBrowser.openBrowserAsync(url);
      } else {
        // Fallback to Linking for other file types
        const canOpen = await Linking.canOpenURL(url);
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to open this file type.');
        }
      }
    } catch (error: any) {
      console.error('Error viewing document:', error);
      Alert.alert('Error', 'Failed to open document. Please try again.');
    }
  };

  if (!content) {
    return (
      <LinearGradient
        colors={['#90dcb5', '#57a67f']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.gradient}>
        <PathwayBackground opacity={0.15} animate={false} />
        <SafeAreaView className="flex-1">
          <NavigationBar onBack={onNavigateBack} />
          <View className="flex-1 items-center justify-center px-6">
            <Text className={combineClasses(typography.h5, 'mb-2 text-center text-white shadow')}>
              Document Information Not Available
            </Text>
            <Text
              className={combineClasses(typography.body.small, 'text-center text-white/90 shadow')}>
              Document request information for this checklist item is not available.
            </Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={['#90dcb5', '#57a67f']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={styles.gradient}>
      <PathwayBackground opacity={0.15} animate={false} />
      <SafeAreaView className="flex-1">
        <NavigationBar onBack={onNavigateBack} />
        <ScrollView className={layout.scrollView} showsVerticalScrollIndicator={false}>
          <Animated.View
            style={[
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
              getWebPadding(24, 32),
            ]}
            className="px-6 py-8">
            {/* Header */}
            <View className="mb-8">
              <Text className={combineClasses(typography.h2, 'mb-6 text-white shadow')}>
                Upload Documents
              </Text>
              <View className="h-1 w-16 rounded-full bg-white shadow" />
              <Text className={combineClasses(typography.body.large, 'mt-4 text-white shadow')}>
                {content.title}
              </Text>
            </View>

            {/* Patient Should Request */}
            <View
              className={combineClasses(
                cards.default.container,
                'mb-6 border-l-4 border-blue-500 bg-white/95'
              )}>
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
              <View
                className={combineClasses(
                  cards.default.container,
                  'mb-6 border-l-4 border-amber-500 bg-white/95'
                )}>
                <Text className={combineClasses(typography.h5, 'mb-2 text-amber-900')}>
                  Special Note
                </Text>
                <Text className={combineClasses(typography.body.small, 'leading-6 text-amber-800')}>
                  {content.specialNote}
                </Text>
              </View>
            )}

            {/* Upload Documents Section */}
            <View className={combineClasses(cards.default.container, 'mb-6 bg-white/95')}>
              <Text className={combineClasses(typography.h5, 'mb-2 text-gray-900')}>
                Upload Documents
              </Text>
              <Text className={combineClasses(typography.body.small, 'mb-4 text-gray-600')}>
                Upload PDF files or images of your documents for this evaluation
              </Text>

              <TouchableOpacity
                className={combineClasses(
                  buttons.primary.base,
                  buttons.primary.enabled,
                  isUploading ? 'opacity-50' : ''
                )}
                onPress={showUploadOptions}
                disabled={isUploading}
                activeOpacity={0.8}>
                {isUploading ? (
                  <View className="flex-row items-center justify-center">
                    <ActivityIndicator size="small" color="#ffffff" className="mr-2" />
                    <Text className={buttons.primary.text}>Uploading...</Text>
                  </View>
                ) : (
                  <Text className={buttons.primary.text}>Upload Documents</Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Uploaded Documents List */}
            {uploadedDocuments.length > 0 && (
              <View className={combineClasses(cards.default.container, 'mb-6 bg-white/95')}>
                <View className="mb-4 flex-row items-center justify-between">
                  <Text className={combineClasses(typography.h5, 'text-gray-900')}>
                    Uploaded Documents
                  </Text>
                  <TouchableOpacity onPress={refreshDocuments} disabled={isRefreshing}>
                    {isRefreshing ? (
                      <ActivityIndicator size="small" color="#3b82f6" />
                    ) : (
                      <Text className="font-semibold text-blue-600">Refresh</Text>
                    )}
                  </TouchableOpacity>
                </View>
                <View className="space-y-2">
                  {uploadedDocuments.map((docPath, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => viewDocument(docPath)}
                      activeOpacity={0.7}
                      className="flex-row items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-3 active:bg-gray-100">
                      <View className="flex-1 flex-row items-center">
                        <Text
                          className={combineClasses(typography.body.small, 'flex-1 text-gray-700')}
                          numberOfLines={1}>
                          {getFileName(docPath)}
                        </Text>
                      </View>
                      <View className="ml-2 flex-row items-center space-x-2">
                        <View className="rounded-full bg-green-100 px-3 py-1">
                          <Text className="text-xs font-semibold text-green-800">Uploaded</Text>
                        </View>
                        <Text className="text-xs font-semibold text-blue-600">View →</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
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
});
