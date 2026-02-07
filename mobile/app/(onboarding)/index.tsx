import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Button from '../../components/ui/Button';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PAGES = [
  {
    icon: 'camera-outline' as const,
    iconColor: '#f97316',
    title: 'Snapstreak',
    subtitle: 'Keep your streak alive with daily photos',
  },
  {
    icon: 'flame-outline' as const,
    iconColor: '#f97316',
    title: 'Daily Photo Challenges',
    subtitle: 'Build streaks and share moments',
    features: [
      'Post one photo every day',
      'Build your longest streak',
      'Share moments with friends',
    ],
  },
  {
    icon: 'rocket-outline' as const,
    iconColor: '#f97316',
    title: 'Ready to Start?',
    subtitle: 'Your streak begins now',
  },
];

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const router = useRouter();

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const completeOnboarding = async () => {
    await AsyncStorage.setItem('onboarding_complete', 'true');
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-950">
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {PAGES.map((page, index) => (
          <View
            key={index}
            style={{ width: SCREEN_WIDTH }}
            className="flex-1 items-center justify-center px-8"
          >
            <Ionicons name={page.icon} size={80} color={page.iconColor} />
            <Text className="text-4xl font-bold text-white mt-6 text-center">
              {page.title}
            </Text>
            <Text className="text-lg text-gray-400 mt-2 text-center">
              {page.subtitle}
            </Text>

            {page.features && (
              <View className="mt-8 w-full">
                {page.features.map((feature, fIndex) => (
                  <View key={fIndex} className="flex-row items-center mb-4">
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color="#f97316"
                    />
                    <Text className="text-base text-gray-300 ml-3">
                      {feature}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {index === PAGES.length - 1 && (
              <View className="w-full mt-8 gap-3">
                <Button
                  title="Get Started"
                  onPress={completeOnboarding}
                  size="lg"
                />
                <Button
                  title="Skip for now"
                  variant="outline"
                  onPress={completeOnboarding}
                  size="lg"
                />
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Page Dots */}
      <View className="flex-row justify-center pb-8 gap-2">
        {PAGES.map((_, index) => (
          <View
            key={index}
            className={`h-2 w-2 rounded-full ${
              currentPage === index ? 'bg-orange-500' : 'bg-gray-700'
            }`}
          />
        ))}
      </View>
    </SafeAreaView>
  );
}
