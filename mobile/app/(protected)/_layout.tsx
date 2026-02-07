import React, { useState } from 'react';
import { View, Pressable, Text } from 'react-native';
import { Slot, useRouter, usePathname, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import { hapticSelection } from '../../lib/haptics';

const TABS = [
  { name: 'home', label: 'Home', icon: 'flame-outline' as const, iconActive: 'flame' as const },
  { name: 'settings', label: 'Settings', icon: 'settings-outline' as const, iconActive: 'settings' as const },
];

export default function ProtectedLayout() {
  const { isAuthenticated, isLoading, isGuest } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-950">
        <Text className="text-orange-500 text-lg">Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated && !isGuest) {
    return <Redirect href="/(auth)/login" />;
  }

  const activeTab = TABS.find((t) => pathname.includes(t.name))?.name || 'home';

  return (
    <View className="flex-1 bg-gray-950">
      <View className="flex-1">
        <Slot />
      </View>

      {/* Custom Tab Bar */}
      <View
        style={{ paddingBottom: insets.bottom }}
        className="flex-row border-t border-gray-800 bg-gray-950 px-4 pt-2"
      >
        {TABS.map((tab) => {
          const isActive = activeTab === tab.name;
          return (
            <Pressable
              key={tab.name}
              onPress={() => {
                hapticSelection();
                router.push(`/(protected)/${tab.name}` as any);
              }}
              className="flex-1 items-center justify-center py-2"
            >
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={24}
                color={isActive ? '#f97316' : '#6b7280'}
              />
              <Text
                className={`mt-1 text-xs font-medium ${
                  isActive ? 'text-orange-500' : 'text-gray-500'
                }`}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
