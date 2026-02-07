import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Modal from './ui/Modal';
import Button from './ui/Button';
import { shareStreak } from '../lib/share';

interface StreakCelebrationProps {
  visible: boolean;
  streakCount: number;
  onClose: () => void;
}

const MILESTONES = [3, 7, 14, 21, 30, 50, 100];

const getMilestoneMessage = (count: number): string => {
  if (count >= 100) return 'Legendary status achieved!';
  if (count >= 50) return 'Half a century of snaps!';
  if (count >= 30) return 'A whole month of dedication!';
  if (count >= 21) return 'Three weeks strong!';
  if (count >= 14) return 'Two weeks unstoppable!';
  if (count >= 7) return 'One week strong!';
  if (count >= 3) return 'Getting started!';
  return 'Keep it going!';
};

export const isMilestone = (count: number): boolean => {
  return MILESTONES.includes(count);
};

export default function StreakCelebration({
  visible,
  streakCount,
  onClose,
}: StreakCelebrationProps) {
  const scale = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        tension: 80,
        useNativeDriver: true,
      }).start();
    } else {
      scale.setValue(0.5);
    }
  }, [visible, scale]);

  const handleShare = async () => {
    await shareStreak(streakCount);
    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title="">
      <View className="items-center py-4">
        <Animated.View style={{ transform: [{ scale }] }}>
          <Ionicons name="flame" size={80} color="#f97316" />
        </Animated.View>

        <Text className="mt-4 text-3xl font-bold text-center text-gray-900">
          {streakCount} Day Streak!
        </Text>

        <Text className="mt-2 text-base text-gray-500 text-center">
          {getMilestoneMessage(streakCount)}
        </Text>

        <View className="w-full mt-6 gap-3">
          <Button
            title="Share My Streak"
            onPress={handleShare}
            size="lg"
          />
          <Button
            title="Keep Going"
            variant="outline"
            onPress={onClose}
            size="lg"
          />
        </View>
      </View>
    </Modal>
  );
}
