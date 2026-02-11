import React from 'react';
import {
  Pressable,
  Text,
  ActivityIndicator,
  View,
  type PressableProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { cn } from '../../lib/cn';
import { hapticLight } from '../../lib/haptics';

interface ButtonProps extends PressableProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'destructive' | 'gradient';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isLoading?: boolean;
  shimmer?: boolean;
}

const variantStyles = {
  primary: 'bg-primary-600 active:bg-primary-700',
  secondary: 'bg-gray-600 active:bg-gray-700',
  outline: 'border-2 border-primary-600 bg-transparent active:bg-primary-50',
  destructive: 'bg-red-600 active:bg-red-700',
  gradient: '', // Handled separately
};

const variantTextStyles = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-primary-600',
  destructive: 'text-white',
  gradient: 'text-white',
};

const sizeStyles = {
  sm: 'px-3 py-2',
  md: 'px-5 py-3',
  lg: 'px-7 py-4',
  xl: 'px-9 py-5',
};

const sizeTextStyles = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
  xl: 'text-xl',
};

// 2025-2026 Trend: Loading Shimmer - Progressive skeleton loading
const ShimmerEffect = () => (
  <View className="absolute inset-0 overflow-hidden rounded-xl">
    <View
      className="h-full w-1/2 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent"
    />
  </View>
);

export default function Button({
  title,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  shimmer = false,
  disabled,
  onPress,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  const handlePress = (e: any) => {
    if (!isDisabled) {
      hapticLight();
      onPress?.(e);
    }
  };

  // Gradient variant with 2025-2026 AI Gradient Haze trend
  if (variant === 'gradient') {
    return (
      <Pressable
        onPress={handlePress}
        disabled={isDisabled}
        className={cn(
          'rounded-xl overflow-hidden',
          sizeStyles[size],
          isDisabled && 'opacity-50'
        )}
        style={{
          shadowColor: '#f97316',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 6,
        }}
        {...props}
      >
        <LinearGradient
          colors={['#f97316', '#ef4444']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className={cn(
            'items-center justify-center px-6 py-4'
          )}
          style={{ minHeight: size === 'xl' ? 60 : size === 'lg' ? 52 : 44 }}
        >
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text
              className={cn(
                'font-bold',
                sizeTextStyles[size],
                variantTextStyles.gradient
              )}
            >
              {title}
            </Text>
          )}
        </LinearGradient>
        {shimmer && <ShimmerEffect />}
      </Pressable>
    );
  }

  return (
    <Pressable
      className={cn(
        'items-center justify-center rounded-xl relative overflow-hidden',
        variantStyles[variant],
        sizeStyles[size],
        isDisabled && 'opacity-50'
      )}
      disabled={isDisabled}
      onPress={handlePress}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator
          color={variant === 'outline' ? '#2563eb' : '#ffffff'}
        />
      ) : (
        <Text
          className={cn(
            'font-semibold',
            variantTextStyles[variant],
            sizeTextStyles[size]
          )}
        >
          {title}
        </Text>
      )}
      {shimmer && <ShimmerEffect />}
    </Pressable>
  );
}
