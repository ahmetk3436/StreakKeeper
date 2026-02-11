import React, { useState } from 'react';
import { Platform, View, Text, Pressable, ActivityIndicator } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { hapticError, hapticSuccess } from '../../lib/haptics';

interface AppleSignInButtonProps {
  onError?: (error: string) => void;
  showDivider?: boolean;
}

/**
 * Enhanced Apple Sign-In Button - 2025-2026 Trends:
 * - Loading state for better UX
 * - Android fallback with Google option
 * - Modern styling with icon
 */
export default function AppleSignInButton({
  onError,
  showDivider = true
}: AppleSignInButtonProps) {
  const { loginWithApple } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleAppleSignIn = async () => {
    setIsLoading(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('No identity token received from Apple');
      }

      const fullName = credential.fullName
        ? `${credential.fullName.givenName || ''} ${credential.fullName.familyName || ''}`.trim()
        : undefined;

      await loginWithApple(
        credential.identityToken,
        credential.authorizationCode || '',
        fullName,
        credential.email || undefined
      );
      hapticSuccess();
    } catch (err: any) {
      if (err.code === 'ERR_REQUEST_CANCELED') {
        // User cancelled
        setIsLoading(false);
        return;
      }
      hapticError();
      onError?.(err.message || 'Apple Sign In failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Android fallback - show Google Sign-In placeholder
  if (Platform.OS !== 'ios') {
    return (
      <View className="mt-4">
        {showDivider && (
          <View className="mb-4 flex-row items-center">
            <View className="h-px flex-1 bg-gray-700" />
            <Text className="mx-4 text-sm text-gray-500">or</Text>
            <View className="h-px flex-1 bg-gray-700" />
          </View>
        )}
        <Pressable
          className="flex-row items-center justify-center rounded-xl border border-gray-700 bg-gray-800 py-3.5 active:opacity-80"
          onPress={() => onError?.('Google Sign-In coming soon to Android')}
        >
          <Ionicons name="logo-google" size={20} color="#ffffff" />
          <Text className="ml-2 text-base font-semibold text-white">
            Continue with Google
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="mt-4">
      {showDivider && (
        <View className="mb-4 flex-row items-center">
          <View className="h-px flex-1 bg-gray-700" />
          <Text className="mx-4 text-sm text-gray-500">or</Text>
          <View className="h-px flex-1 bg-gray-700" />
        </View>
      )}

      <Pressable
        className="flex-row items-center justify-center rounded-xl bg-black py-3.5 active:opacity-80"
        onPress={handleAppleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <>
            <Ionicons name="logo-apple" size={20} color="#ffffff" />
            <Text className="ml-2 text-base font-semibold text-white">
              Sign in with Apple
            </Text>
          </>
        )}
      </Pressable>
    </View>
  );
}
