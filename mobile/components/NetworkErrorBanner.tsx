import React, { useEffect, useRef } from 'react';
import { View, Text, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface NetworkErrorBannerProps {
  visible: boolean;
  message?: string;
  onRetry?: () => void;
}

export default function NetworkErrorBanner({
  visible,
  message = 'No internet connection',
  onRetry,
}: NetworkErrorBannerProps) {
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(heightAnim, {
      toValue: visible ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [visible, heightAnim]);

  if (!visible) {
    return null;
  }

  const handleRetry = async (): Promise<void> => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onRetry?.();
  };

  return (
    <Animated.View
      style={{
        maxHeight: heightAnim.interpolate({
          inputRange: [0, 1],
          outputRange: [0, 60],
        }),
        opacity: heightAnim,
      }}
    >
      <View className="bg-red-500/90 px-4 py-3 flex-row items-center">
        {/* Offline Icon */}
        <Ionicons name="cloud-offline-outline" size={20} color="white" />

        {/* Error Message */}
        <Text className="flex-1 text-white text-sm ml-2" numberOfLines={1}>
          {message}
        </Text>

        {/* Retry Button */}
        {onRetry && (
          <Pressable
            onPress={handleRetry}
            className="bg-white/20 px-3 py-1 rounded-lg ml-2 active:bg-white/30"
          >
            <Text className="text-white text-sm font-medium">Retry</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}
