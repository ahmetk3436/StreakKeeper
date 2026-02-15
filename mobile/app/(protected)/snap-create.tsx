import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import api from '../../lib/api';
import { hapticSuccess, hapticLight, hapticError, hapticSelection } from '../../lib/haptics';

// Filter overlay definitions with semi-transparent colors
const FILTER_OVERLAYS: Record<string, { color: string; opacity: number }> = {
  none: { color: 'transparent', opacity: 0 },
  vintage: { color: '#d97706', opacity: 0.2 },
  warm: { color: '#ea580c', opacity: 0.15 },
  cool: { color: '#3b82f6', opacity: 0.2 },
  dramatic: { color: '#000000', opacity: 0.35 },
  minimal: { color: '#ffffff', opacity: 0.1 },
  vibrant: { color: '#9333ea', opacity: 0.15 },
  noir: { color: '#000000', opacity: 0.5 },
};

// Filter options for selector
const FILTER_OPTIONS = [
  { id: 'none', label: 'None' },
  { id: 'vintage', label: 'Vintage' },
  { id: 'warm', label: 'Warm' },
  { id: 'cool', label: 'Cool' },
  { id: 'dramatic', label: 'Dramatic' },
  { id: 'minimal', label: 'Minimal' },
  { id: 'vibrant', label: 'Vibrant' },
  { id: 'noir', label: 'Noir' },
];

export default function SnapCreateScreen() {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams<{ imageUri: string }>();
  const [caption, setCaption] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('none');
  const [isPosting, setIsPosting] = useState(false);

  const handlePost = async () => {
    if (!imageUri) {
      Alert.alert('Error', 'No image selected');
      hapticError();
      return;
    }

    setIsPosting(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

      // Create FormData for multipart upload
      const formData = new FormData();

      // Determine file extension and mime type
      const fileExtension = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const mimeType = fileExtension === 'png' ? 'image/png' :
                       fileExtension === 'heic' ? 'image/heic' : 'image/jpeg';
      const fileName = `snap_${Date.now()}.${fileExtension}`;

      // Append image file
      formData.append('image', {
        uri: imageUri,
        name: fileName,
        type: mimeType,
      } as any);

      // Append caption and filter
      formData.append('caption', caption);
      formData.append('filter', selectedFilter);

      // Post with multipart/form-data
      await api.post('/snaps', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      hapticSuccess();
      router.replace({
        pathname: '/(protected)/home',
        params: { snapPosted: 'true' },
      });
    } catch (error: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      const errorMessage = error.response?.data?.message || 'Failed to post snap. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsPosting(false);
    }
  };

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
    hapticSelection();
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Top Bar */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
          <Pressable
            onPress={() => {
              hapticSelection();
              router.back();
            }}
            className="w-10 h-10 rounded-full bg-gray-800 items-center justify-center"
          >
            <Ionicons name="close" size={24} color="#ffffff" />
          </Pressable>
          <Text className="text-xl font-bold text-white">New Snap</Text>
          <Pressable
            onPress={handlePost}
            disabled={isPosting}
            className="p-2"
            style={{ opacity: isPosting ? 0.5 : 1 }}
          >
            {isPosting ? (
              <ActivityIndicator size="small" color="#f97316" />
            ) : (
              <Text className="text-orange-500 font-bold text-base">Post</Text>
            )}
          </Pressable>
        </View>

        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Image Preview with Filter Overlay */}
          {imageUri ? (
            <View className="mx-6 mt-4 rounded-2xl overflow-hidden" style={{ height: 350 }}>
              <Image
                source={{ uri: imageUri }}
                className="w-full h-full"
                resizeMode="cover"
              />
              {selectedFilter !== 'none' && (
                <View
                  className="absolute inset-0"
                  style={{
                    backgroundColor: FILTER_OVERLAYS[selectedFilter].color,
                    opacity: FILTER_OVERLAYS[selectedFilter].opacity,
                  }}
                />
              )}
            </View>
          ) : (
            <View
              className="mx-6 mt-4 rounded-2xl bg-gray-800 items-center justify-center border-2 border-dashed border-gray-600 overflow-hidden"
              style={{ height: 350 }}
            >
              <Ionicons name="image-outline" size={48} color="#6b7280" />
              <Text className="text-gray-400 text-lg mt-4">No image selected</Text>
            </View>
          )}

          {/* Filter Name Label */}
          {imageUri && selectedFilter !== 'none' && (
            <Text className="text-center text-sm text-orange-400 mt-3 capitalize font-medium">
              {selectedFilter} filter applied
            </Text>
          )}

          {/* Caption Input */}
          <View className="mt-6 px-6">
            <Text className="text-white text-lg font-semibold mb-3">Caption</Text>
            <TextInput
              placeholder="What's happening today?"
              placeholderTextColor="#6b7280"
              value={caption}
              onChangeText={setCaption}
              maxLength={280}
              multiline
              className="bg-gray-800 rounded-xl px-4 py-4 text-white text-base min-h-[100px]"
            />
            <Text className="text-gray-500 text-sm mt-2 text-right">
              {caption.length}/280
            </Text>
          </View>

          {/* Filter Selection with Mini Previews */}
          {imageUri && (
            <View className="mt-6 px-6">
              <Text className="text-white text-lg font-semibold mb-3">Filter</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="flex-row"
              >
                {FILTER_OPTIONS.map((filter) => (
                  <Pressable
                    key={filter.id}
                    onPress={() => handleFilterSelect(filter.id)}
                    className="mr-4 items-center"
                  >
                    {/* Mini Preview Thumbnail */}
                    <View
                      className={`rounded-xl overflow-hidden border-2 ${
                        selectedFilter === filter.id
                          ? 'border-orange-500'
                          : 'border-transparent'
                      }`}
                      style={{ width: 56, height: 56 }}
                    >
                      <Image
                        source={{ uri: imageUri }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                      {filter.id !== 'none' && (
                        <View
                          className="absolute inset-0"
                          style={{
                            backgroundColor: FILTER_OVERLAYS[filter.id].color,
                            opacity: FILTER_OVERLAYS[filter.id].opacity,
                          }}
                        />
                      )}
                    </View>
                    <Text
                      className={`text-xs mt-2 ${
                        selectedFilter === filter.id
                          ? 'text-orange-400 font-semibold'
                          : 'text-gray-400'
                      }`}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          )}

          {/* Submit Button */}
          <View className="mt-8 px-6 pb-8">
            <Pressable
              onPress={handlePost}
              disabled={!imageUri || isPosting}
              className={`rounded-2xl py-4 items-center ${
                imageUri && !isPosting
                  ? 'bg-orange-500'
                  : 'bg-gray-700'
              }`}
            >
              {isPosting ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text className="text-white font-bold text-lg">Post Snap</Text>
              )}
            </Pressable>

            {!imageUri && (
              <Text className="text-gray-500 text-sm text-center mt-3">
                Add a photo to enable posting
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
