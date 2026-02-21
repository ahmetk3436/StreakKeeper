import React from 'react';
import { View, Pressable, Text, Alert } from 'react-native';
import { Slot, useRouter, usePathname, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { hapticSelection } from '../../lib/haptics';

const TABS = [
  {
    name: 'home',
    label: 'Today',
    icon: 'flame-outline' as const,
    iconActive: 'flame' as const,
  },
  {
    name: 'history',
    label: 'History',
    icon: 'time-outline' as const,
    iconActive: 'time' as const,
  },
  // Center snap button is rendered separately
  {
    name: 'profile',
    label: 'Profile',
    icon: 'person-outline' as const,
    iconActive: 'person' as const,
  },
  {
    name: 'settings',
    label: 'Settings',
    icon: 'settings-outline' as const,
    iconActive: 'settings' as const,
  },
];

// Hidden screens that should not appear in the tab bar
const HIDDEN_SCREENS = ['snap-create', 'paywall'];

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

  const activeTab =
    TABS.find((t) => pathname.includes(t.name))?.name || 'home';
  const isHiddenScreen = HIDDEN_SCREENS.some((s) => pathname.includes(s));

  const handleSnapPress = () => {
    hapticSelection();
    Alert.alert(
      'New Snap',
      'Choose how to add your daily snap',
      [
        {
          text: 'Take Photo',
          onPress: async () => {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'Camera access is needed to take photos.');
              return;
            }
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              router.push({
                pathname: '/(protected)/snap-create',
                params: { imageUri: result.assets[0].uri },
              });
            }
          },
        },
        {
          text: 'Choose from Gallery',
          onPress: async () => {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
              Alert.alert('Permission Required', 'Photo library access is needed to select photos.');
              return;
            }
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ['images'],
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });
            if (!result.canceled && result.assets[0]) {
              router.push({
                pathname: '/(protected)/snap-create',
                params: { imageUri: result.assets[0].uri },
              });
            }
          },
        },
        {
          text: 'Cancel',
          style: 'cancel' as const,
        },
      ]
    );
  };

  return (
    <View className="flex-1 bg-gray-950">
      {/* Guest Banner */}
      {isGuest && (
        <View className="bg-orange-500/10 py-1.5">
          <Text className="text-xs text-center text-orange-500">
            Guest Mode - Create an account to save your progress
          </Text>
        </View>
      )}

      {/* Screen Content */}
      <View className="flex-1">
        <Slot />
      </View>

      {/* Custom Tab Bar (hidden on snap-create and paywall) */}
      {!isHiddenScreen && (
        <View
          style={{ paddingBottom: insets.bottom }}
          className="flex-row items-end bg-gray-950 border-t border-gray-800 px-2 pt-2"
        >
          {/* Left Tabs */}
          {TABS.slice(0, 2).map((tab) => {
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

          {/* Center Snap Button */}
          <View className="items-center" style={{ marginTop: -16 }}>
            <Pressable
              onPress={handleSnapPress}
              className="h-14 w-14 rounded-full bg-orange-500 items-center justify-center"
              style={{
                shadowColor: '#f97316',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
            >
              <Ionicons name="add" size={28} color="white" />
            </Pressable>
          </View>

          {/* Right Tabs */}
          {TABS.slice(2).map((tab) => {
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
      )}
    </View>
  );
}
