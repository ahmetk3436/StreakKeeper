import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '../contexts/AuthContext';

export default function Index() {
  const { isAuthenticated, isLoading, isGuest } = useAuth();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950">
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(protected)/home" />;
  }

  if (isGuest) {
    return <Redirect href="/(protected)/home" />;
  }

  return <Redirect href="/(auth)/login" />;
}
