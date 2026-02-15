import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ShareableResult from './ui/ShareableResult';
import { shareStreak } from '../lib/share';
import { hapticSuccess, hapticMedium } from '../lib/haptics';

interface StreakCelebrationProps {
  visible: boolean;
  streakCount: number;
  onClose: () => void;
}

const MILESTONES = [3, 7, 14, 21, 30, 50, 100];

export const isMilestone = (count: number): boolean => {
  return MILESTONES.includes(count);
};

export default function StreakCelebration({
  visible,
  streakCount,
  onClose
}: StreakCelebrationProps) {
  const handleClose = () => {
    hapticMedium();
    onClose();
  };

  const handleShare = async () => {
    hapticSuccess();
    await shareStreak(streakCount);
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
    >
      <View className="flex-1 bg-black/50 items-center justify-center">
        <View className="bg-white rounded-3xl p-6 mx-6 max-w-sm w-full shadow-2xl">
          {/* Close Button */}
          <Pressable
            onPress={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-100"
          >
            <Ionicons name="close" size={20} color="#6b7280" />
          </Pressable>

          {/* Celebration Header */}
          <Text className="text-2xl font-bold text-center text-gray-900">
            🎉 Milestone!
          </Text>
          <Text className="text-base text-center text-gray-500 mt-1">
            Incredible dedication!
          </Text>

          {/* Shareable Result Card */}
          <View className="mt-6">
            <ShareableResult
              title="Streak Milestone!"
              resultText={`${streakCount} Day Streak`}
              icon="flame"
              colors={['#f97316', '#ea580c', '#dc2626']}
            />
          </View>

          {/* Achievement Text */}
          <Text className="text-center text-gray-600 mt-4">
            You've maintained your streak for {streakCount} days! Keep it going!
          </Text>

          {/* Share Button */}
          <Pressable
            onPress={handleShare}
            className="flex-row items-center justify-center p-4 rounded-2xl bg-orange-500 mt-4"
          >
            <Ionicons name="share-social" size={20} color="white" />
            <Text className="text-base font-semibold text-white ml-2">
              Share Achievement
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
