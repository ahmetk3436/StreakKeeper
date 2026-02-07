import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import api from '../../lib/api';
import { useAuth } from '../../contexts/AuthContext';
import Skeleton from '../../components/ui/Skeleton';
import type { Snap, SnapsListResponse } from '../../types/snap';

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

export default function HistoryScreen() {
  const { isGuest } = useAuth();
  const [snaps, setSnaps] = useState<Snap[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchSnaps = useCallback(
    async (pageNum: number, replace: boolean = false) => {
      if (isGuest) {
        setIsLoading(false);
        return;
      }
      try {
        const { data } = await api.get<SnapsListResponse>(
          `/snaps?page=${pageNum}&limit=20`
        );
        if (replace) {
          setSnaps(data.snaps || []);
        } else {
          setSnaps((prev) => [...prev, ...(data.snaps || [])]);
        }
        setTotal(data.total);
        setPage(pageNum);
      } catch (error) {
        console.error('Failed to fetch snaps:', error);
      } finally {
        setIsLoading(false);
        setRefreshing(false);
        setLoadingMore(false);
      }
    },
    [isGuest]
  );

  useEffect(() => {
    fetchSnaps(1, true);
  }, [fetchSnaps]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchSnaps(1, true);
  }, [fetchSnaps]);

  const onEndReached = useCallback(() => {
    if (snaps.length < total && !loadingMore) {
      setLoadingMore(true);
      fetchSnaps(page + 1, false);
    }
  }, [snaps.length, total, loadingMore, page, fetchSnaps]);

  const renderSnap = ({ item }: { item: Snap }) => (
    <View
      className="mx-6 mb-4 rounded-2xl bg-gray-900 overflow-hidden"
      style={{
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 3,
      }}
    >
      {item.image_url ? (
        <Image
          source={{ uri: item.image_url }}
          className="w-full"
          style={{ height: 192 }}
          resizeMode="cover"
        />
      ) : (
        <View
          className="w-full bg-gray-800 items-center justify-center"
          style={{ height: 192 }}
        >
          <Ionicons name="image-outline" size={48} color="#4b5563" />
        </View>
      )}
      <View className="p-4">
        {item.caption ? (
          <Text className="text-base text-white font-medium mb-2">
            {item.caption}
          </Text>
        ) : null}
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View className="flex-row items-center">
              <Ionicons name="heart" size={14} color="#f97316" />
              <Text className="text-sm text-gray-400 ml-1">
                {item.like_count}
              </Text>
            </View>
            <Text className="text-sm text-gray-500">
              {formatDate(item.snap_date)}
            </Text>
          </View>
          {item.filter && item.filter !== 'none' && (
            <View className="rounded-full bg-orange-500/20 px-2 py-0.5">
              <Text className="text-xs text-orange-400 capitalize">
                {item.filter}
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <View className="items-center justify-center py-20">
        <Ionicons name="camera-outline" size={64} color="#4b5563" />
        <Text className="text-lg text-gray-400 mt-4">No snaps yet</Text>
        <Text className="text-sm text-gray-600 mt-1 text-center px-8">
          Take your first snap to start your streak!
        </Text>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator color="#f97316" />
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
        <View className="px-6 pt-8 mb-4">
          <Skeleton height={36} width={120} />
        </View>
        {[1, 2, 3].map((i) => (
          <View key={i} className="mx-6 mb-4">
            <Skeleton height={260} borderRadius={16} />
          </View>
        ))}
      </SafeAreaView>
    );
  }

  if (isGuest) {
    return (
      <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
        <View className="px-6 pt-8">
          <Text className="text-3xl font-bold text-white mb-4">My Snaps</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Ionicons name="lock-closed-outline" size={64} color="#4b5563" />
          <Text className="text-lg text-gray-400 mt-4 text-center">
            Create an account to save your snap history
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-950" edges={['top']}>
      <View className="px-6 pt-8 mb-4">
        <Text className="text-3xl font-bold text-white">My Snaps</Text>
      </View>
      <FlatList
        data={snaps}
        keyExtractor={(item) => item.id}
        renderItem={renderSnap}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        onEndReached={onEndReached}
        onEndReachedThreshold={0.3}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#f97316"
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}
