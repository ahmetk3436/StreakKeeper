import React from 'react';
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

interface ShareableResultProps {
  title: string;
  subtitle?: string;
  resultText: string;
  appName?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  colors?: readonly [string, string, ...string[]];
}

/**
 * ShareableResult - 2025-2026 Trend: Viral Sharing
 * Beautiful gradient cards designed for social sharing
 * Boosts app virality through shareable streak achievements
 */
export default function ShareableResult({
  title,
  subtitle,
  resultText,
  appName = 'Snapstreak',
  icon = 'flame',
  colors = ['#f97316', '#ef4444', '#ec4899'],
}: ShareableResultProps) {
  return (
    <View
      style={{
        width: '100%',
        borderRadius: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 24,
        elevation: 12,
      }}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 24,
          padding: 32,
          alignItems: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circles */}
        <View
          style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'rgba(255,255,255,0.1)',
          }}
        />
        <View
          style={{
            position: 'absolute',
            bottom: -30,
            left: -30,
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: 'rgba(255,255,255,0.08)',
          }}
        />

        {/* Result Icon */}
        <View className="mb-4 h-16 w-16 items-center justify-center rounded-full bg-white/20">
          <Ionicons name={icon} size={32} color="#ffffff" />
        </View>

        {/* Title */}
        <Text className="mb-1 text-center text-2xl font-bold text-white">
          {title}
        </Text>

        {subtitle ? (
          <Text className="mb-6 text-center text-sm text-white/70">
            {subtitle}
          </Text>
        ) : null}

        {/* Result Text */}
        <View className="mb-6 w-full rounded-2xl bg-white/15 px-6 py-5">
          <Text className="text-center text-lg font-semibold leading-7 text-white">
            {resultText}
          </Text>
        </View>

        {/* App Branding */}
        <View className="flex-row items-center">
          <Ionicons name="sparkles" size={16} color="rgba(255,255,255,0.6)" />
          <Text className="ml-2 text-sm text-white/60">
            {appName}
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
}
