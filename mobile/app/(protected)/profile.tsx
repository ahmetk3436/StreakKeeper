import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, Pressable, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import * as Haptics from 'expo-haptics';
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

interface ProfileData {
  id: string;
  email: string;
  created_at: string;
}

const generateDateGrid = (numDays: number): string[] => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = numDays - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

export default function ProfileScreen() {
  const { user, isGuest, logout } = useAuth();
  const router = useRouter();
  const [streak, setStreak] = useState<SnapStreak | null>(null);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [snapDates, setSnapDates] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(true);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const hasSnapOnDate = (dateStr: string): boolean => {
    return snapDates.includes(dateStr);
  };

  const fetchCalendarData = async () => {
    try {
      setCalendarError(null);
      const response = await api.get('/snaps/calendar?days=35');
      setSnapDates(response.data.dates || []);
    } catch (err: any) {
      console.error('Failed to fetch calendar data:', err);
      setCalendarError('Unable to load activity data');
    } finally {
      setCalendarLoading(false);
    }
  };

  const fetchProfileData = useCallback(async () => {
    if (isGuest) {
      setIsLoading(false);
      setCalendarLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const [profileResponse, streakResponse] = await Promise.all([
        api.get('/auth/profile'),
        api.get<SnapStreak>('/snaps/streak'),
      ]);
      setProfile(profileResponse.data.data);
      setStreak(streakResponse.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setIsLoading(false);
    }
    fetchCalendarData();
  }, [isGuest]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setCalendarLoading(true);
    Promise.all([
      fetchProfileData(),
    ]).finally(() => {
      setRefreshing(false);
    });
  }, [fetchProfileData]);

  const formatMemberSince = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDeleteAccount = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete('/auth/account');
              await logout();
              router.replace('/');
            } catch (err) {
              Alert.alert('Error', 'Failed to delete account');
            }
          },
        },
      ]
    );
  };

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

  const firstLetter = (profile?.email || user?.email || 'G').charAt(0).toUpperCase();
  const allDates = generateDateGrid(35);

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
            colors={['#f97316']}
          />
        }
      >
        {/* Avatar Section */}
        <View className="items-center pt-8 pb-6">
          <View className="h-20 w-20 rounded-full bg-orange-500/20 items-center justify-center">
            <Text className="text-3xl font-bold text-orange-500">
              {firstLetter}
            </Text>
          </View>
          <Text className="text-base text-gray-400 mt-2">
            {isGuest ? 'Guest User' : (profile?.email || user?.email)}
          </Text>
          <Text className="text-sm text-gray-600 mt-1">
            {profile ? `Member since ${formatMemberSince(profile.created_at)}` : (isGuest ? 'Guest Mode' : 'Loading...')}
          </Text>
        </View>

        {/* Error State */}
        {error && (
          <View className="mx-6 mb-4 bg-red-900/20 rounded-2xl p-4">
            <Text className="text-red-400 text-center">{error}</Text>
            <Pressable
              onPress={fetchProfileData}
              className="mt-2 bg-red-900/30 rounded-xl py-2 items-center"
            >
              <Text className="text-red-400 font-semibold">Retry</Text>
            </Pressable>
          </View>
        )}

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

        {/* Activity Heatmap */}
        <View className="mx-6 mt-8">
          <View className="flex-row items-center mb-3">
            <Ionicons name="calendar" size={20} color="#f97316" />
            <Text className="text-lg font-bold text-white ml-2">Activity</Text>
            <Text className="text-sm text-gray-500 ml-2">Last 5 weeks</Text>
          </View>

          <View className="bg-gray-900 rounded-2xl p-4">
            {calendarLoading ? (
              <View className="items-center py-8">
                <ActivityIndicator size="large" color="#f97316" />
                <Text className="text-gray-400 mt-3">Loading activity...</Text>
              </View>
            ) : calendarError ? (
              <View className="items-center py-8">
                <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
                <Text className="text-red-400 mt-2">{calendarError}</Text>
                <Pressable
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setCalendarLoading(true);
                    fetchCalendarData();
                  }}
                  className="mt-3 px-4 py-2 bg-gray-800 rounded-lg"
                >
                  <Text className="text-orange-400">Retry</Text>
                </Pressable>
              </View>
            ) : (
              <>
                {/* Day Labels Row */}
                <View className="flex-row justify-between mb-2 px-1">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                    <Text
                      key={index}
                      className="text-xs text-gray-500 text-center"
                      style={{ width: 36 }}
                    >
                      {day}
                    </Text>
                  ))}
                </View>

                {/* Heatmap Grid - 5 rows x 7 columns */}
                <View style={{ gap: 4 }}>
                  {Array.from({ length: 5 }).map((_, rowIndex) => (
                    <View key={rowIndex} className="flex-row justify-between">
                      {Array.from({ length: 7 }).map((_, colIndex) => {
                        const dayIndex = rowIndex * 7 + colIndex;
                        const dateStr = allDates[dayIndex];
                        const hasSnap = hasSnapOnDate(dateStr);
                        const isTodayCell = dateStr === todayStr;

                        return (
                          <View
                            key={colIndex}
                            className={`items-center justify-center rounded-sm ${hasSnap ? 'bg-orange-500' : 'bg-gray-800'}`}
                            style={[
                              { width: 36, height: 36 },
                              isTodayCell ? { borderWidth: 2, borderColor: '#fb923c' } : {},
                            ]}
                          >
                            <Text
                              className={`text-xs ${hasSnap ? 'text-white font-semibold' : 'text-gray-500'}`}
                            >
                              {new Date(dateStr + 'T00:00:00').getDate()}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>

                {/* Legend */}
                <View className="flex-row items-center justify-end mt-4" style={{ gap: 8 }}>
                  <Text className="text-xs text-gray-500">Less</Text>
                  <View className="rounded-sm bg-gray-800" style={{ width: 16, height: 16 }} />
                  <View className="rounded-sm bg-orange-500/50" style={{ width: 16, height: 16 }} />
                  <View className="rounded-sm bg-orange-500" style={{ width: 16, height: 16 }} />
                  <View className="rounded-sm bg-orange-400" style={{ width: 16, height: 16 }} />
                  <Text className="text-xs text-gray-500">More</Text>
                </View>
              </>
            )}
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
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(protected)/settings');
            }}
            className="flex-row items-center justify-between p-4 border-b border-gray-800"
          >
            <View className="flex-row items-center">
              <Ionicons name="settings-outline" size={20} color="#9ca3af" />
              <Text className="text-base text-white ml-3">Settings</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#6b7280" />
          </Pressable>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/(protected)/paywall');
            }}
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
          {!isGuest && (
            <>
              <Pressable
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  logout();
                  router.replace('/');
                }}
                className="flex-row items-center justify-between p-4 border-b border-gray-800"
              >
                <View className="flex-row items-center">
                  <Ionicons name="log-out-outline" size={20} color="#9ca3af" />
                  <Text className="text-base text-white ml-3">Sign Out</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </Pressable>
              <Pressable
                onPress={handleDeleteAccount}
                className="flex-row items-center justify-between p-4"
              >
                <View className="flex-row items-center">
                  <Ionicons name="trash-outline" size={20} color="#ef4444" />
                  <Text className="text-base text-red-500 ml-3">Delete Account</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#6b7280" />
              </Pressable>
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
