import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../../components/ui/Button';

export default function HomeScreen() {
  const { user, logout, isGuest, guestUsageCount, canUseFeature } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
      <View className="flex-1 px-8 pt-12">
        {/* Guest Badge */}
        {isGuest && (
          <View className="mb-4 self-start rounded-full bg-orange-500/20 px-4 py-1.5">
            <Text className="text-sm font-semibold text-orange-500">
              Guest Mode ({3 - guestUsageCount} free uses left)
            </Text>
          </View>
        )}

        <Text className="mb-2 text-3xl font-bold text-white">
          Snapstreak
        </Text>
        <Text className="mb-8 text-base text-gray-400">
          {isGuest ? 'Welcome, Guest' : `Welcome, ${user?.email}`}
        </Text>

        <View className="flex-1 items-center justify-center">
          <View className="rounded-2xl bg-gray-900 p-8 border border-gray-800">
            <Text className="text-center text-lg font-semibold text-orange-500">
              Track your streaks
            </Text>
            <Text className="mt-2 text-center text-sm text-gray-400">
              Keep your daily streaks alive and growing.
            </Text>
          </View>
        </View>

        {!isGuest && (
          <View className="pb-8">
            <Button
              title="Sign Out"
              variant="outline"
              onPress={logout}
              size="lg"
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
