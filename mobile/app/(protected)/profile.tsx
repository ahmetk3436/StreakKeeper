import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import Skeleton from '../../components/ui/Skeleton';
import type { SnapStreak } from '../../types/snap';

interface Achievement {
  days: number;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
}

const ACHIEVEMENTS: Achievement[] = [
  { days: 3, label: 'Starter', icon: 'star-outline', color: '#cd7f32', bgColor: 'rgba(205,127,50,0.1)' },
  { days: 7, label: 'Weekly Warrior', icon: 'trophy-outline', color: '#c0c0c0', bgColor: 'rgba(192,192,192,0.1)' },
  { days: 14, label: 'Dedicated', icon: 'medal-outline', color: '#ffd700', bgColor: 'rgba(255,215,0,0.1)' },
  { days: 30, label: 'Unstoppable', icon: 'diamond-outline', color: '#b9f2ff', bgColor: 'rgba(185,242,255,0.1)' },
];

export default function ProfileScreen() {
  const { user, isGuest } = useAuth();
  const router = useRouter();
  const [streak, setStreak] = useState<SnapStreak | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (isGuest) {
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await api.get<SnapStreak>('/snaps/streak');
        setStreak(data);
      } catch (error) {
        console.error('Failed to fetch streak:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isGuest]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
        <View className="items-center pt-8 pb-6">
          <Skeleton height={80} width={80} borderRadius={40} />
          <View className="mt-3">
            <Skeleton height={20} width={200} />
          </View>
        </View>
        <View className="flex-row mx-6 gap-2">
          <View className="flex-1">
            <Skeleton height={100} borderRadius={16} />
          </View>
          <View className="flex-1">
            <Skeleton height={100} borderRadius={16} />
          </View>
          <View className="flex-1">
            <Skeleton height={100} borderRadius={16} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const firstLetter = (user?.email || 'G').charAt(0).toUpperCase();

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Avatar Section */}
        <View className="items-center pt-8 pb-6">
          <View className="h-20 w-20 rounded-full bg-orange-500/20 items-center justify-center">
            <Text className="text-3xl font-bold text-orange-500">
              {firstLetter}
            </Text>
          </View>
          <Text className="text-base text-gray-400 mt-2">
            {isGuest ? 'Guest User' : user?.email}
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            Member since Feb 2026
          </Text>
        </View>

        {/* Streak Stats */}
        <View className="flex-row mx-6 gap-2">
          <View
            className="flex-1 items-center p-4 rounded-2xl bg-gray-900"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <Text className="text-3xl font-bold text-white">
              {streak?.current_streak || 0}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">Current Streak</Text>
          </View>
          <View
            className="flex-1 items-center p-4 rounded-2xl bg-gray-900"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <Text className="text-3xl font-bold text-white">
              {streak?.longest_streak || 0}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">Best Streak</Text>
          </View>
          <View
            className="flex-1 items-center p-4 rounded-2xl bg-gray-900"
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 12,
              elevation: 3,
            }}
          >
            <Text className="text-3xl font-bold text-white">
              {streak?.total_snaps || 0}
            </Text>
            <Text className="text-xs text-gray-500 mt-1">Total Snaps</Text>
          </View>
        </View>

        {/* Achievements */}
        <View className="mx-6 mt-8">
          <Text className="text-lg font-bold text-white mb-4">
            Achievements
          </Text>
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked =
              (streak?.longest_streak || 0) >= achievement.days;
            return (
              <View
                key={achievement.days}
                className="flex-row items-center p-3 rounded-xl mb-2"
                style={{
                  backgroundColor: unlocked
                    ? achievement.bgColor
                    : '#111827',
                }}
              >
                <Ionicons
                  name={achievement.icon}
                  size={24}
                  color={unlocked ? achievement.color : '#4b5563'}
                />
                <View className="ml-3 flex-1">
                  <Text
                    className={`text-base font-medium ${
                      unlocked ? 'text-white' : 'text-gray-600'
                    }`}
                  >
                    {achievement.label}
                  </Text>
                  <Text className="text-xs text-gray-500">
                    {achievement.days} day streak
                  </Text>
                </View>
                {unlocked && (
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color="#22c55e"
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* Quick Links */}
        <View className="mx-6 mt-8 mb-8">
          <Pressable
            onPress={() => router.push('/(protected)/settings')}
            className="flex-row items-center justify-between p-4 border-b border-gray-800"
          >
            <View className="flex-row items-center">
              <Ionicons name="settings-outline" size={20} color="#9ca3af" />
              <Text className="text-base text-white ml-3">Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </Pressable>
          <Pressable
            onPress={() => router.push('/(protected)/paywall')}
            className="flex-row items-center justify-between p-4 border-b border-gray-800"
          >
            <View className="flex-row items-center">
              <Ionicons name="diamond-outline" size={20} color="#f97316" />
              <Text className="text-base text-orange-500 ml-3">
                Upgrade to Premium
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
