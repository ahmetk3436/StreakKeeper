import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Pressable,
  Alert,
  Switch,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { isBiometricAvailable, getBiometricType } from '../../lib/biometrics';
import { hapticWarning, hapticMedium, hapticSuccess, hapticSelection, hapticError } from '../../lib/haptics';
import {
  requestNotificationPermission,
  scheduleDailyReminder,
  cancelDailyReminder,
} from '../../lib/notifications';
import api from '../../lib/api';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import type { SnapStreak } from '../../types/snap';

export default function SettingsScreen() {
  const { user, logout, deleteAccount, isGuest } = useAuth();
  const { handleRestore } = useSubscription();
  const router = useRouter();
  const [biometricType, setBiometricType] = useState<string | null>(null);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [streak, setStreak] = useState<SnapStreak | null>(null);
  const [dailyReminder, setDailyReminder] = useState(false);

  useEffect(() => {
    const init = async () => {
      const available = await isBiometricAvailable();
      if (available) {
        const type = await getBiometricType();
        setBiometricType(type);
      }

      // Load daily reminder setting
      const reminder = await AsyncStorage.getItem('daily_reminder_enabled');
      setDailyReminder(reminder === 'true');

      // Fetch streak data
      if (!isGuest) {
        try {
          const { data } = await api.get<SnapStreak>('/snaps/streak');
          setStreak(data);
        } catch (error) {
          console.error('Failed to fetch streak:', error);
        }
      }
    };
    init();
  }, [isGuest]);

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteAccount(deletePassword);
      setShowDeleteModal(false);
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message || 'Failed to delete account'
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmDelete = () => {
    hapticWarning();
    Alert.alert(
      'Delete Account',
      'This action is permanent. All your data will be erased and cannot be recovered. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => setShowDeleteModal(true),
        },
      ]
    );
  };

  const handleRestorePurchases = async () => {
    hapticMedium();
    const success = await handleRestore();
    if (success) {
      hapticSuccess();
      Alert.alert('Success', 'Purchases restored!');
    } else {
      Alert.alert('Not Found', 'No previous purchases found.');
    }
  };

  const toggleDailyReminder = async () => {
    hapticSelection();

    if (!dailyReminder) {
      // Turning ON - request permission first
      const granted = await requestNotificationPermission();

      if (granted) {
        await scheduleDailyReminder();
        setDailyReminder(true);
        await AsyncStorage.setItem('daily_reminder_enabled', 'true');
        hapticSuccess();
      } else {
        hapticError();
        Alert.alert(
          'Permission Required',
          'Please enable notifications in your device settings to receive daily reminders.',
          [{ text: 'OK', style: 'default' }]
        );
      }
    } else {
      // Turning OFF - cancel notifications
      await cancelDailyReminder();
      setDailyReminder(false);
      await AsyncStorage.setItem('daily_reminder_enabled', 'false');
      hapticSuccess();
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
      <ScrollView className="flex-1 px-6 pt-8" showsVerticalScrollIndicator={false}>
        <Text className="mb-8 text-3xl font-bold text-white">Settings</Text>

        {/* Guest CTA */}
        {isGuest && (
          <Pressable
            onPress={() => router.push('/(auth)/register')}
            className="mb-6 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4"
          >
            <Text className="text-base font-semibold text-orange-500">
              Create an Account
            </Text>
            <Text className="mt-1 text-sm text-gray-400">
              Sign up to unlock unlimited streaks and save your progress.
            </Text>
          </Pressable>
        )}

        {/* Streak Section */}
        {!isGuest && streak && (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Streak
            </Text>
            <View className="mb-6 rounded-xl bg-gray-900 p-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-400">Current Streak</Text>
                <Text className="text-base font-semibold text-white">
                  {streak.current_streak} days
                </Text>
              </View>
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-sm text-gray-400">Longest Streak</Text>
                <Text className="text-base font-semibold text-white">
                  {streak.longest_streak} days
                </Text>
              </View>
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-400">Total Snaps</Text>
                <Text className="text-base font-semibold text-white">
                  {streak.total_snaps}
                </Text>
              </View>
            </View>
          </>
        )}

        {/* Account Section */}
        {!isGuest && (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Account
            </Text>
            <View className="mb-6 rounded-xl bg-gray-900 p-4">
              <Text className="text-sm text-gray-500">Email</Text>
              <Text className="mt-0.5 text-base font-medium text-white">
                {user?.email}
              </Text>
            </View>
          </>
        )}

        {/* Security Section */}
        {!isGuest && (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Security
            </Text>
            <View className="mb-6 rounded-xl bg-gray-900">
              {biometricType && (
                <View className="flex-row items-center justify-between border-b border-gray-800 p-4">
                  <View>
                    <Text className="text-base font-medium text-white">
                      {biometricType}
                    </Text>
                    <Text className="text-sm text-gray-500">
                      Use {biometricType} to unlock the app
                    </Text>
                  </View>
                  <Switch
                    value={biometricEnabled}
                    onValueChange={setBiometricEnabled}
                    trackColor={{ true: '#f97316' }}
                  />
                </View>
              )}
              <Pressable className="p-4" onPress={logout}>
                <Text className="text-base font-medium text-white">
                  Sign Out
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Notifications Section */}
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Notifications
        </Text>
        <View className="mb-6 rounded-xl bg-gray-900">
          <View className="flex-row items-center justify-between p-4">
            <View>
              <Text className="text-base font-medium text-white">
                Daily Reminder
              </Text>
              <Text className="text-sm text-gray-500">
                Get reminded to snap every day
              </Text>
            </View>
            <Switch
              value={dailyReminder}
              onValueChange={() => toggleDailyReminder()}
              trackColor={{ true: '#f97316' }}
            />
          </View>
        </View>

        {/* Guest Sign Out */}
        {isGuest && (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Session
            </Text>
            <View className="mb-6 rounded-xl bg-gray-900">
              <Pressable className="p-4" onPress={logout}>
                <Text className="text-base font-medium text-white">
                  Exit Guest Mode
                </Text>
              </Pressable>
            </View>
          </>
        )}

        {/* Purchases Section (Guideline 3.1) */}
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          Purchases
        </Text>
        <View className="mb-6 rounded-xl bg-gray-900">
          <Pressable className="p-4" onPress={handleRestorePurchases}>
            <Text className="text-base font-medium text-orange-500">
              Restore Purchases
            </Text>
          </Pressable>
        </View>

        {/* About Section */}
        <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
          About
        </Text>
        <View className="mb-6 rounded-xl bg-gray-900">
          <View className="flex-row items-center justify-between p-4 border-b border-gray-800">
            <Text className="text-base text-white">Version</Text>
            <Text className="text-base text-gray-500">1.0.0</Text>
          </View>
          <Pressable
            className="p-4 border-b border-gray-800"
            onPress={() =>
              Linking.openURL('https://snapstreak.app/privacy')
            }
          >
            <Text className="text-base text-white">Privacy Policy</Text>
          </Pressable>
          <Pressable
            className="p-4"
            onPress={() =>
              Linking.openURL('https://snapstreak.app/terms')
            }
          >
            <Text className="text-base text-white">Terms of Service</Text>
          </Pressable>
        </View>

        {/* Danger Zone -- Account Deletion (Guideline 5.1.1) */}
        {!isGuest && (
          <>
            <Text className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Danger Zone
            </Text>
            <View className="rounded-xl bg-red-950/50 mb-8">
              <Pressable className="p-4" onPress={confirmDelete}>
                <Text className="text-base font-medium text-red-500">
                  Delete Account
                </Text>
                <Text className="mt-0.5 text-sm text-red-400/70">
                  Permanently remove all your data
                </Text>
              </Pressable>
            </View>
          </>
        )}

        <View className="h-4" />
      </ScrollView>

      {/* Delete Account Confirmation Modal */}
      <Modal
        visible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Deletion"
      >
        <Text className="mb-4 text-sm text-gray-400">
          Enter your password to confirm account deletion. This cannot be undone.
        </Text>
        <View className="mb-4">
          <Input
            placeholder="Your password"
            value={deletePassword}
            onChangeText={setDeletePassword}
            secureTextEntry
          />
        </View>
        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setShowDeleteModal(false)}
            />
          </View>
          <View className="flex-1">
            <Button
              title="Delete"
              variant="destructive"
              onPress={handleDeleteAccount}
              isLoading={isDeleting}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
