import React, { useState } from 'react';
import { Alert, Pressable, Text, View, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/api';
import { hapticSuccess, hapticError, hapticLight } from '../../lib/haptics';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';

interface ReportButtonProps {
  contentType: 'user' | 'post' | 'comment';
  contentId: string;
  iconOnly?: boolean;
}

// Report Categories - Quick chips for faster reporting
const REPORT_CATEGORIES = [
  { id: 'spam', label: 'Spam', icon: 'mail-outline' },
  { id: 'harassment', label: 'Harassment', icon: 'person-outline' },
  { id: 'inappropriate', label: 'Inappropriate', icon: 'eye-off-outline' },
  { id: 'hate', label: 'Hate Speech', icon: 'alert-circle-outline' },
  { id: 'violence', label: 'Violence', icon: 'warning-outline' },
  { id: 'misinformation', label: 'False Info', icon: 'information-circle-outline' },
  { id: 'other', label: 'Other', icon: 'ellipsis-horizontal-outline' },
] as const;

// Report button (Apple Guideline 1.2 — every piece of UGC must have one)
export default function ReportButton({
  contentType,
  contentId,
  iconOnly = false
}: ReportButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [category, setCategory] = useState<string>('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReport = async () => {
    if (!category) {
      Alert.alert('Select a Category', 'Please select a reason for your report.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post('/reports', {
        content_type: contentType,
        content_id: contentId,
        category,
        reason,
      });
      hapticSuccess();
      setShowModal(false);
      setCategory('');
      setReason('');
      Alert.alert(
        'Report Submitted',
        'Thank you for helping keep our community safe. We will review this within 24 hours.'
      );
    } catch {
      hapticError();
      Alert.alert('Error', 'Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCategorySelect = (catId: string) => {
    hapticLight();
    setCategory(catId);
  };

  return (
    <>
      <Pressable
        className="flex-row items-center gap-1 p-2"
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="flag-outline" size={16} color="#ef4444" />
        {!iconOnly && <Text className="text-sm text-red-500">Report</Text>}
      </Pressable>

      <Modal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title="Report Content"
        size="lg"
      >
        <Text className="mb-4 text-sm text-gray-400">
          Tell us why you are reporting this {contentType}. Our team reviews all
          reports within 24 hours.
        </Text>

        {/* Quick Category Selection - 2025-2026 Trend: Quick Chips */}
        <Text className="mb-2 text-sm font-medium text-gray-300">Select a reason</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{ gap: 8 }}
        >
          {REPORT_CATEGORIES.map((cat) => (
            <Pressable
              key={cat.id}
              onPress={() => handleCategorySelect(cat.id)}
              className={cn(
                'flex-row items-center gap-2 rounded-full border px-4 py-2',
                category === cat.id
                  ? 'border-red-500 bg-red-500/20'
                  : 'border-gray-700 bg-gray-800'
              )}
            >
              <Ionicons
                name={cat.icon as keyof typeof Ionicons.glyphMap}
                size={16}
                color={category === cat.id ? '#ef4444' : '#9ca3af'}
              />
              <Text
                className={cn(
                  'text-sm font-medium',
                  category === cat.id ? 'text-red-400' : 'text-gray-400'
                )}
              >
                {cat.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Additional Details */}
        {category && (
          <View className="mb-4">
            <Input
              label="Additional details (optional)"
              placeholder="Provide more context..."
              value={reason}
              onChangeText={setReason}
              multiline
              numberOfLines={3}
              maxLength={500}
              charCount
            />
          </View>
        )}

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
              title="Submit Report"
              variant="destructive"
              onPress={handleReport}
              isLoading={isSubmitting}
              disabled={!category}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

// Helper for conditional classes
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}
