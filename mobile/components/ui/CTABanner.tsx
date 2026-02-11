import React from 'react';
import { Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { hapticLight } from '../../lib/haptics';

interface CTABannerProps {
  text?: string;
  onPress: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  colors?: readonly [string, string, ...string[]];
}

/**
 * CTABanner - 2025-2026 Trend: Contextual Paywalls
 * Value-gated upgrade CTAs with gradient backgrounds
 * Used throughout app for contextual premium feature promotion
 */
export default function CTABanner({
  text = 'Sign up for unlimited access',
  onPress,
  icon = 'diamond',
  colors = ['#f97316', '#ef4444'],
}: CTABannerProps) {
  const handlePress = () => {
    hapticLight();
    onPress();
  };

  return (
    <Pressable onPress={handlePress}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          borderRadius: 16,
          paddingVertical: 16,
          paddingHorizontal: 20,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#f97316',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        }}
      >
        <Ionicons name={icon} size={18} color="#ffffff" />
        <Text className="ml-2 text-base font-semibold text-white">
          {text}
        </Text>
        <Ionicons
          name="chevron-forward"
          size={18}
          color="rgba(255,255,255,0.7)"
          style={{ marginLeft: 8 }}
        />
      </LinearGradient>
    </Pressable>
  );
}
