import React, { useState } from 'react';
import { Pressable, Text, View, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/api';
import { hapticSuccess, hapticError, hapticWarning } from '../../lib/haptics';
import Modal from './Modal';
import Button from './Button';

interface BlockButtonProps {
  userId: string;
  userName?: string;
  onBlocked?: () => void;
  iconOnly?: boolean;
  showUndoOption?: boolean;
}

/**
 * Enhanced Block Button - 2025-2026 Trends:
 * - Custom modal instead of system alert
 * - Undo action with timeout for better UX
 * - Immediate content hiding (Apple Guideline 1.2)
 */
export default function BlockButton({
  userId,
  userName = 'this user',
  onBlocked,
  iconOnly = false,
  showUndoOption = true,
}: BlockButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [isBlocking, setIsBlocking] = useState(false);
  const [showUndo, setShowUndo] = useState(false);

  const handleBlock = async () => {
    setIsBlocking(true);
    try {
      await api.post('/blocks', { blocked_id: userId });
      hapticSuccess();
      setShowModal(false);
      onBlocked?.();

      // Show undo option - 2025-2026 Trend: Forgivable actions
      if (showUndoOption) {
        setShowUndo(true);
        setTimeout(() => setShowUndo(false), 5000); // 5 seconds to undo
      }

      Alert.alert(
        'User Blocked',
        `${userName} has been blocked. Their content is now hidden.`
      );
    } catch {
      hapticError();
      Alert.alert('Error', 'Failed to block user. Please try again.');
    } finally {
      setIsBlocking(false);
    }
  };

  const handleUnblock = async () => {
    try {
      // Assuming there's an unblock endpoint
      await api.delete(`/blocks/${userId}`);
      hapticSuccess();
      setShowUndo(false);
      Alert.alert('Unblocked', `${userName} has been unblocked.`);
    } catch {
      hapticError();
    }
  };

  return (
    <>
      <Pressable
        className="flex-row items-center gap-1 p-2"
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="ban-outline" size={16} color="#ef4444" />
        {!iconOnly && <Text className="text-sm text-red-500">Block</Text>}
      </Pressable>

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Block User"
      >
        <View className="mb-4 items-center">
          <View className="mb-3 h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
            <Ionicons name="ban" size={32} color="#ef4444" />
          </View>
          <Text className="mb-2 text-lg font-semibold text-white">
            Block {userName}?
          </Text>
          <Text className="text-center text-sm text-gray-400">
            Their content will be immediately hidden from your view. You can unblock them
            anytime from your settings.
          </Text>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1">
            <Button
              title="Cancel"
              variant="outline"
              onPress={() => setShowModal(false)}
            />
          </View>
          <View className="flex-1">
            <Button
              title="Block"
              variant="destructive"
              onPress={handleBlock}
              isLoading={isBlocking}
            />
          </View>
        </View>
      </Modal>

      {/* Undo Toast - 2025-2026 Trend: Forgivable actions */}
      {showUndo && (
        <View className="absolute bottom-8 left-4 right-4 flex-row items-center justify-between rounded-xl bg-gray-800 px-4 py-3 shadow-lg">
          <View className="flex-row items-center">
            <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
            <Text className="ml-2 text-sm text-white">User blocked</Text>
          </View>
          <Pressable onPress={handleUnblock} className="px-3 py-1">
            <Text className="text-sm font-semibold text-orange-500">Undo</Text>
          </Pressable>
        </View>
      )}
    </>
  );
}
