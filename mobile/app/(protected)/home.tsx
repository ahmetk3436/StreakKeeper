import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  RefreshControl,
  Image,
  Alert,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import api from '../../lib/api';
import { hapticSuccess, hapticError, hapticSelection } from '../../lib/haptics';
import { shareSnap } from '../../lib/share';
import Skeleton from '../../components/ui/Skeleton';
import StreakCelebration, { isMilestone } from '../../components/StreakCelebration';
import type { SnapStreak, Snap } from '../../types/snap';

const getMotivationalText = (streakCount: number): string => {
  if (streakCount === 0) {
    return 'Start your journey today!';
  } else if (streakCount >= 1 && streakCount <= 6) {
    return 'Great start! Keep it going!';
  } else if (streakCount >= 7 && streakCount <= 13) {
    return 'One week strong! 💪';
  } else if (streakCount >= 14 && streakCount <= 29) {
    return "You're on fire! 🔥";
  } else {
    return "Unstoppable! You're a legend! 🏆";
  }
};

export default function HomeScreen() {
  const { user, isGuest, guestUsageCount, canUseFeature, incrementGuestUsage } = useAuth();
  const { isSubscribed } = useSubscription();
  const router = useRouter();
  const [streak, setStreak] = useState<SnapStreak | null>(null);
  const [todaySnap, setTodaySnap] = useState<Snap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationStreak, setCelebrationStreak] = useState(0);
  const [displayCount, setDisplayCount] = useState(0);

  // Animated values
  const countAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // Animate streak counter when streak data changes
  useEffect(() => {
    if (streak?.current_streak !== undefined && streak?.current_streak !== null) {
      countAnim.setValue(0);
      setDisplayCount(0);

      Animated.timing(countAnim, {
        toValue: streak.current_streak,
        duration: 1000,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();

      const listenerId = countAnim.addListener(({ value }) => {
        setDisplayCount(Math.round(value));
      });

      return () => {
        countAnim.removeListener(listenerId);
      };
    }
  }, [streak?.current_streak]);

  // Pulsing flame animation
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1.0,
          duration: 800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    return () => {
      pulseAnim.setValue(1);
      pulseAnim.stopAnimation();
    };
  }, []);

  const fetchStreakData = useCallback(async () => {
    if (isGuest) {
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await api.get<SnapStreak>('/snaps/streak');
      setStreak(data);
      if (data.has_snapped_today) {
        const snapsRes = await api.get('/snaps?page=1&limit=1');
        if (snapsRes.data.snaps && snapsRes.data.snaps.length > 0) {
          setTodaySnap(snapsRes.data.snaps[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch streak:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isGuest]);

  useEffect(() => {
    fetchStreakData();
  }, [fetchStreakData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStreakData();
    setRefreshing(false);
  }, [fetchStreakData]);

  const handleCameraPress = async () => {
    if (isGuest && !canUseFeature()) {
      Alert.alert(
        'Free Uses Exhausted',
        'Create an account to continue using Snapstreak!',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign Up',
            onPress: () => router.push('/(auth)/register'),
          },
        ]
      );
      return;
    }

    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission Required',
        'Camera access is needed to take snaps.'
      );
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
  };

  const handleAddFreeze = async () => {
    if (!isSubscribed) {
      router.push('/(protected)/paywall');
      hapticSelection();
      return;
    }

    try {
      await api.post('/snaps/streak/freeze');
      hapticSuccess();
      fetchStreakData();
    } catch (err: any) {
      hapticError();
      Alert.alert('Error', err.response?.data?.error || 'Failed to add freeze');
    }
  };

  const handleSnapPosted = useCallback(async () => {
    if (isGuest) {
      await incrementGuestUsage();
    }
    await fetchStreakData();
    if (streak) {
      const newStreak = streak.current_streak + 1;
      if (isMilestone(newStreak)) {
        setCelebrationStreak(newStreak);
        setShowCelebration(true);
      }
    }
    hapticSuccess();
  }, [fetchStreakData, isGuest, incrementGuestUsage, streak]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
        <View className="px-6 pt-6">
          <Skeleton height={30} width={160} />
          <View className="mt-6">
            <Skeleton height={160} borderRadius={16} />
          </View>
          <View className="mt-6">
            <Skeleton height={260} borderRadius={16} />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
          />
        }
      >
        {/* Header with Pulsing Flame */}
        <View className="flex-row items-center justify-between px-6 pt-4">
          <View>
            <Text className="text-3xl font-bold text-white">StreakKeeper</Text>
            <Text className="text-base text-gray-500 mt-1">
              Build habits that stick
            </Text>
          </View>

          <Animated.View
            style={{
              transform: [{ scale: pulseAnim }],
              backgroundColor: '#fff7ed',
              borderRadius: 20,
              padding: 10,
            }}
          >
            <Ionicons name="flame" size={28} color="#f97316" />
          </Animated.View>
        </View>

        {/* Guest Badge */}
        {isGuest && (
          <View className="mx-6 mt-3 rounded-xl bg-orange-500/10 p-3">
            <Text className="text-sm font-semibold text-orange-500 text-center">
              Guest Mode ({3 - guestUsageCount} free snaps remaining)
            </Text>
          </View>
        )}

        {/* Gradient Streak Card */}
        <LinearGradient
          colors={['#f97316', '#ea580c', '#dc2626']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="mx-6 mt-4 rounded-2xl p-6"
          style={{
            shadowColor: '#f97316',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 8,
          }}
        >
          {/* Animated Streak Number */}
          <View className="items-center">
            <Text className="text-7xl font-bold text-white">
              {displayCount}
            </Text>
            <Text className="text-lg text-orange-100 mt-2">Day Streak</Text>
          </View>

          {/* Motivational Text */}
          <View className="mt-4 items-center">
            <Text className="text-base text-white font-medium">
              {getMotivationalText(streak?.current_streak ?? 0)}
            </Text>
          </View>

          {/* Stats Row */}
          <View className="flex-row mt-4 pt-4 border-t border-orange-400/30">
            <View className="flex-1 items-center">
              <View className="flex-row items-center">
                <Ionicons name="trophy" size={16} color="#fcd34d" />
                <Text className="text-sm text-orange-100 ml-2">
                  Longest: {streak?.longest_streak ?? 0} days
                </Text>
              </View>
            </View>
            <View className="flex-1 items-center">
              <View className="flex-row items-center">
                <Ionicons name="camera" size={16} color="#fcd34d" />
                <Text className="text-sm text-orange-100 ml-2">
                  Total: {streak?.total_snaps ?? 0} snaps
                </Text>
              </View>
            </View>
          </View>

          {/* Freeze Protection Pill */}
          {streak && streak.freezes_available > 0 && (
            <View className="bg-white/20 rounded-full px-3 py-1.5 self-center mt-3 flex-row items-center">
              <Text className="text-sm">{'\u{1F6E1}\uFE0F'}</Text>
              <Text className="text-sm text-white font-medium ml-1">
                {streak.freezes_available} freeze{streak.freezes_available !== 1 ? 's' : ''} available
              </Text>
            </View>
          )}

          {streak && streak.freezes_available === 0 && isSubscribed && (
            <Pressable
              onPress={handleAddFreeze}
              className="bg-white/10 rounded-full px-3 py-1.5 self-center mt-3 flex-row items-center"
            >
              <Text className="text-sm">{'\u{1F6E1}\uFE0F'}</Text>
              <Text className="text-sm text-white/70 font-medium ml-1">
                Tap to add freeze
              </Text>
            </Pressable>
          )}
        </LinearGradient>

        {/* Streak Status Text */}
        <View className="mx-6 mt-3">
          {streak?.has_snapped_today ? (
            <Text className="text-sm text-green-500">
              Streak safe! Come back tomorrow.
            </Text>
          ) : (
            <Text className="text-sm text-orange-400">
              Post today to keep your streak!
            </Text>
          )}
        </View>

        {/* Today's Snap or Camera Button */}
        {streak?.has_snapped_today && todaySnap ? (
          <View className="mx-6 mt-6">
            <Text className="text-lg font-bold text-white mb-3">
              Today's Snap
            </Text>
            <View
              className="rounded-2xl overflow-hidden bg-gray-900"
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 12,
                elevation: 3,
              }}
            >
              {todaySnap.image_url ? (
                <Image
                  source={{ uri: todaySnap.image_url }}
                  className="w-full"
                  style={{ height: 300 }}
                  resizeMode="cover"
                />
              ) : (
                <View className="w-full bg-gray-800 items-center justify-center" style={{ height: 300 }}>
                  <Ionicons name="image-outline" size={48} color="#6b7280" />
                </View>
              )}
              {todaySnap.caption ? (
                <View className="p-4">
                  <Text className="text-base text-white">
                    {todaySnap.caption}
                  </Text>
                  <View className="flex-row items-center mt-2 gap-4">
                    <View className="flex-row items-center">
                      <Ionicons name="heart" size={16} color="#f97316" />
                      <Text className="text-sm text-gray-400 ml-1">
                        {todaySnap.like_count}
                      </Text>
                    </View>
                    <Pressable
                      className="flex-row items-center"
                      onPress={() => shareSnap(todaySnap.caption)}
                    >
                      <Ionicons name="share-outline" size={16} color="#6b7280" />
                      <Text className="text-sm text-gray-400 ml-1">Share</Text>
                    </Pressable>
                  </View>
                </View>
              ) : null}
            </View>
          </View>
        ) : (
          <Pressable
            onPress={handleCameraPress}
            className="mx-6 mt-6 rounded-2xl bg-gray-900 border-2 border-dashed border-gray-700 items-center justify-center"
            style={{ height: 260 }}
          >
            <Ionicons name="camera" size={48} color="#6b7280" />
            <Text className="text-gray-500 mt-2 text-base">Tap to snap</Text>
            <Text className="text-gray-600 text-sm mt-1">
              Take your daily photo
            </Text>
          </Pressable>
        )}

        {/* Premium Upsell */}
        {!isSubscribed && (
          <Pressable
            onPress={() => {
              hapticSelection();
              router.push('/(protected)/paywall');
            }}
            className="mx-6 mt-6 rounded-xl overflow-hidden"
          >
            <LinearGradient
              colors={['#fbbf24', '#f97316']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="p-4 flex-row items-center"
            >
              <Ionicons name="star" size={24} color="white" />
              <View className="ml-3 flex-1">
                <Text className="text-white font-bold">Go Premium</Text>
                <Text className="text-orange-100 text-sm">
                  Unlock unlimited streaks & insights
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="white" />
            </LinearGradient>
          </Pressable>
        )}

        <View className="h-8" />
      </ScrollView>

      {/* Streak Celebration Modal */}
      <StreakCelebration
        visible={showCelebration}
        streakCount={celebrationStreak}
        onClose={() => setShowCelebration(false)}
      />
    </SafeAreaView>
  );
}
