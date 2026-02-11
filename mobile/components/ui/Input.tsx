import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, type TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { cn } from '../../lib/cn';
import { hapticLight } from '../../lib/haptics';

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  charCount?: boolean;
  maxLength?: number;
  showPasswordToggle?: boolean;
}

/**
 * Enhanced Input Component - 2025-2026 Trends:
 * - Micro-Interactions: Password toggle with haptic feedback
 * - Dark Mode: OLED-friendly colors
 * - Character counter for better UX
 */
export default function Input({
  label,
  error,
  value = '',
  maxLength,
  charCount = false,
  showPasswordToggle = false,
  secureTextEntry,
  className,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const togglePassword = () => {
    hapticLight();
    setShowPassword(!showPassword);
  };

  return (
    <View className="w-full">
      {label && (
        <Text className="mb-1.5 text-sm font-medium text-gray-300">
          {label}
        </Text>
      )}
      <View className="relative">
        <TextInput
          className={cn(
            'w-full rounded-xl border bg-gray-800 px-4 py-3 text-base text-white',
            isFocused
              ? 'border-orange-500 ring-2 ring-orange-500/30'
              : 'border-gray-700',
            error && 'border-red-500',
            showPasswordToggle && 'pr-12',
            className
          )}
          placeholderTextColor="#6b7280"
          value={value}
          maxLength={maxLength}
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          secureTextEntry={showPasswordToggle && !showPassword ? true : secureTextEntry}
          {...props}
        />
        {/* Password Toggle - Micro-Interaction */}
        {showPasswordToggle && (
          <Pressable
            onPress={togglePassword}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1"
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#6b7280"
            />
          </Pressable>
        )}
      </View>
      {/* Character Counter - 2025-2026 Trend: Better input feedback */}
      {(error || (charCount && maxLength)) && (
        <View className="mt-1 flex-row items-center justify-between">
          {error ? (
            <Text className="text-sm text-red-500">{error}</Text>
          ) : (
            <View />
          )}
          {charCount && maxLength && (
            <Text
              className={cn(
                'text-sm',
                (value?.length || 0) > maxLength * 0.9
                  ? 'text-orange-500'
                  : 'text-gray-500'
              )}
            >
              {value?.length || 0}/{maxLength}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
