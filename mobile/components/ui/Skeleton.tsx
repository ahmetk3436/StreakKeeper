import React, { useEffect, useRef } from 'react';
import { Animated, View, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '../../lib/cn';

interface SkeletonProps extends ViewProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  variant?: 'pulse' | 'shimmer';
  shimmerColors?: readonly [string, string, ...string[]];
}

/**
 * Enhanced Skeleton - 2025-2026 Trend: Progressive Skeleton Loading
 * Two variants: pulse (subtle) and shimmer (modern gradient sweep)
 */
export default function Skeleton({
  width,
  height = 20,
  borderRadius = 12,
  variant = 'shimmer',
  shimmerColors = ['#1f2937', '#374151', '#1f2937'],
  className,
  style,
  ...props
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;
  const shimmerPosition = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    if (variant === 'pulse') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.5,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }
  }, [opacity, variant]);

  useEffect(() => {
    if (variant === 'shimmer') {
      const animation = Animated.loop(
        Animated.timing(shimmerPosition, {
          toValue: 2,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      animation.start();
      return () => animation.stop();
    }
  }, [shimmerPosition, variant]);

  if (variant === 'shimmer') {
    return (
      <View
        className={cn('overflow-hidden bg-gray-800', className)}
        style={[
          {
            width: width as number | undefined,
            height,
            borderRadius,
          },
          style,
        ]}
        {...props}
      >
        <Animated.View
          style={{
            flex: 1,
            transform: [{ translateX: shimmerPosition.interpolate({
              inputRange: [-1, 2],
              outputRange: [-300, 300],
            }) }],
          }}
        >
          <LinearGradient
            colors={shimmerColors}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: '200%',
              height: '100%',
            }}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <Animated.View
      className={cn('bg-gray-800', className)}
      style={[
        {
          width: width as number | undefined,
          height,
          borderRadius,
          opacity,
        },
        style,
      ]}
      {...props}
    />
  );
}
