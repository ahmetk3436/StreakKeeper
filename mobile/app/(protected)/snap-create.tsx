import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import api from '../../lib/api';
import { hapticSuccess, hapticLight } from '../../lib/haptics';

const FILTERS = [
  { name: 'none', color: '#374151' },
  { name: 'vintage', color: '#d97706' },
  { name: 'warm', color: '#ea580c' },
  { name: 'cool', color: '#3b82f6' },
  { name: 'dramatic', color: '#1f2937' },
  { name: 'minimal', color: '#e5e7eb' },
  { name: 'vibrant', color: '#9333ea' },
  { name: 'noir', color: '#111827' },
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
      return;
    }

    setIsPosting(true);
    try {
      await api.post('/snaps', {
        image_url: imageUri,
        caption,
        filter: selectedFilter,
      });
      hapticSuccess();
      router.back();
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to post snap'
      );
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      {/* Top Bar */}
      <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
        <Pressable onPress={() => router.back()} className="p-2">
          <Ionicons name="close" size={24} color="#ffffff" />
        </Pressable>
        <Text className="font-bold text-lg text-white">New Snap</Text>
        <Pressable
          onPress={handlePost}
          disabled={isPosting}
          className="p-2"
          style={{ opacity: isPosting ? 0.5 : 1 }}
        >
          <Text className="text-orange-500 font-bold text-base">
            {isPosting ? 'Posting...' : 'Post'}
          </Text>
        </Pressable>
      </View>

      <ScrollView className="flex-1">
        {/* Image Preview */}
        <View className="mx-6 mt-4 rounded-2xl overflow-hidden">
          {imageUri ? (
            <Image
              source={{ uri: imageUri }}
              className="w-full"
              style={{ height: 350 }}
              resizeMode="cover"
            />
          ) : (
            <View
              className="w-full bg-gray-800 items-center justify-center"
              style={{ height: 350 }}
            >
              <Ionicons name="image-outline" size={48} color="#6b7280" />
            </View>
          )}
        </View>

        {/* Caption Input */}
        <View className="mx-6 mt-4">
          <TextInput
            placeholder="Add a caption..."
            placeholderTextColor="#6b7280"
            value={caption}
            onChangeText={setCaption}
            maxLength={280}
            multiline
            className="rounded-xl bg-gray-900 px-4 py-3 text-base text-white border border-gray-800"
            style={{ minHeight: 60 }}
          />
          <Text className="text-xs text-gray-600 text-right mt-1">
            {caption.length}/280
          </Text>
        </View>

        {/* Filter Selector */}
        <View className="mt-4">
          <Text className="text-sm font-semibold text-gray-400 mx-6 mb-3">
            Filter
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="px-6"
          >
            {FILTERS.map((filter) => (
              <Pressable
                key={filter.name}
                onPress={() => {
                  hapticLight();
                  setSelectedFilter(filter.name);
                }}
                className="mr-3 items-center"
              >
                <View
                  className="h-12 w-12 rounded-full items-center justify-center"
                  style={{
                    backgroundColor: filter.color,
                    borderWidth: selectedFilter === filter.name ? 3 : 0,
                    borderColor: '#f97316',
                  }}
                />
                <Text
                  className={`text-xs mt-1 capitalize ${
                    selectedFilter === filter.name
                      ? 'text-orange-500 font-semibold'
                      : 'text-gray-500'
                  }`}
                >
                  {filter.name}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}
