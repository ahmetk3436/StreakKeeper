import React from 'react';
import { View, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface GradientCardProps extends ViewProps {
  colors?: readonly [string, string, ...string[]];
  start?: { x: number; y: number };
  end?: { x: number; y: number };
  children: React.ReactNode;
}

/**
 * GradientCard - 2025-2026 Trend: AI Gradient Haze
 * Uses purple→pink gradients for modern, premium feel
 * Perfect for bento box grid layouts
 */
export default function GradientCard({
  colors = ['#8b5cf6', '#ec4899'],
  start = { x: 0, y: 0 },
  end = { x: 1, y: 1 },
  children,
  style,
  ...props
}: GradientCardProps) {
  return (
    <View
      style={[
        {
          borderRadius: 20,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.15,
          shadowRadius: 12,
          elevation: 8,
        },
        style,
      ]}
      {...props}
    >
      <LinearGradient
        colors={colors}
        start={start}
        end={end}
        style={{
          borderRadius: 20,
          padding: 24,
          overflow: 'hidden',
        }}
      >
        {children}
      </LinearGradient>
    </View>
  );
}
