import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Animated, Dimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PAGES = [
  {
    id: 1,
    gradientColors: ['#1a0a00', '#030712'] as const,
    icon: 'flame' as const,
    iconColor: '#f97316',
    iconBgColor: 'bg-orange-500/20',
    title: 'Your Daily Streak',
    subtitle: 'One photo a day keeps the streak alive',
  },
  {
    id: 2,
    gradientColors: ['#0a0a1a', '#030712'] as const,
    icon: 'trending-up' as const,
    iconColor: '#3b82f6',
    iconBgColor: 'bg-blue-500/20',
    title: 'Build Habits That Stick',
    features: [
      { icon: 'checkmark-circle' as const, text: 'Track your daily photo streak' },
      { icon: 'trophy' as const, text: 'Celebrate milestones & achievements' },
      { icon: 'share-social' as const, text: 'Share your progress with friends' },
    ],
  },
  {
    id: 3,
    gradientColors: ['#1a0800', '#030712'] as const,
    icon: 'rocket' as const,
    iconColor: '#f59e0b',
    iconBgColor: 'bg-amber-500/20',
    title: 'Start Your Journey',
    subtitle: 'Join thousands building daily habits',
  },
];

export default function OnboardingScreen() {
  const [currentPage, setCurrentPage] = useState<number>(0);
  const scrollViewRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { continueAsGuest } = useAuth();

  // Animated values for each page's icon scale
  const iconScaleAnims = useRef<Animated.Value[]>([
    new Animated.Value(0.5),
    new Animated.Value(0.5),
    new Animated.Value(0.5),
  ]).current;

  // Animate icon scale when page changes
  const animateIconScale = (pageIndex: number) => {
    iconScaleAnims.forEach((anim, index) => {
      Animated.spring(anim, {
        toValue: index === pageIndex ? 1 : 0.5,
        friction: 5,
        tension: 100,
        useNativeDriver: true,
      }).start();
    });
  };

  // Handle scroll to detect page changes
  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const page = Math.round(offsetX / SCREEN_WIDTH);

    if (page !== currentPage && page >= 0 && page < PAGES.length) {
      setCurrentPage(page);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      animateIconScale(page);
    }
  };

  // Handle "Try Free" button press
  const handleTryFree = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await AsyncStorage.setItem('onboarding_complete', 'true');
    await continueAsGuest();
    router.replace('/(protected)/home');
  };

  // Handle "I Have an Account" button press
  const handleSignIn = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem('onboarding_complete', 'true');
    router.replace('/(auth)/login');
  };

  // Handle skip button
  const handleSkip = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await AsyncStorage.setItem('onboarding_complete', 'true');
    await continueAsGuest();
    router.replace('/(protected)/home');
  };

  // Animate first icon on mount
  useEffect(() => {
    Animated.spring(iconScaleAnims[0], {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, []);

  // Render feature row for page 2
  const renderFeatureRow = (icon: keyof typeof Ionicons.glyphMap, text: string) => (
    <View key={text} className="flex-row items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
      <Ionicons name={icon} size={20} color="#22c55e" />
      <Text className="text-base text-gray-300">{text}</Text>
    </View>
  );

  // Render dot indicator
  const renderDot = (index: number) => {
    const isActive = currentPage === index;
    return (
      <Animated.View
        key={index}
        className={`rounded-full ${isActive ? 'bg-orange-500 h-2.5 w-6' : 'bg-gray-600 h-2 w-2'}`}
      />
    );
  };

  // Render page 1 (Welcome)
  const renderPage1 = (page: typeof PAGES[0]) => (
    <View key={page.id} style={{ width: SCREEN_WIDTH }} className="flex-1">
      <LinearGradient colors={page.gradientColors} className="flex-1">
        <View className="flex-1 justify-center items-center px-8">
          <Animated.View style={{ transform: [{ scale: iconScaleAnims[0] }] }}>
            <View className={`${page.iconBgColor} rounded-full p-6`}>
              <Ionicons name={page.icon} size={96} color={page.iconColor} />
            </View>
          </Animated.View>
          <Text className="text-4xl font-bold text-white text-center mt-8">
            {page.title}
          </Text>
          <Text className="text-lg text-gray-400 text-center mt-4 px-4">
            {page.subtitle}
          </Text>
        </View>
        <View style={{ height: 100 + insets.bottom }} />
      </LinearGradient>
    </View>
  );

  // Render page 2 (Features)
  const renderPage2 = (page: typeof PAGES[1]) => (
    <View key={page.id} style={{ width: SCREEN_WIDTH }} className="flex-1">
      <LinearGradient colors={page.gradientColors} className="flex-1">
        <View className="flex-1 justify-center items-center px-8">
          <Animated.View style={{ transform: [{ scale: iconScaleAnims[1] }] }}>
            <View className={`${page.iconBgColor} rounded-full p-6`}>
              <Ionicons name={page.icon} size={96} color={page.iconColor} />
            </View>
          </Animated.View>
          <Text className="text-4xl font-bold text-white text-center mt-8">
            {page.title}
          </Text>
          <View className="mt-6 gap-3 w-full max-w-xs">
            {page.features?.map((feature) => renderFeatureRow(feature.icon, feature.text))}
          </View>
        </View>
        <View style={{ height: 100 + insets.bottom }} />
      </LinearGradient>
    </View>
  );

  // Render page 3 (CTA)
  const renderPage3 = (page: typeof PAGES[2]) => (
    <View key={page.id} style={{ width: SCREEN_WIDTH }} className="flex-1">
      <LinearGradient colors={page.gradientColors} className="flex-1">
        <View className="flex-1 justify-center items-center px-8">
          <Animated.View style={{ transform: [{ scale: iconScaleAnims[2] }] }}>
            <View className={`${page.iconBgColor} rounded-full p-6`}>
              <Ionicons name={page.icon} size={96} color={page.iconColor} />
            </View>
          </Animated.View>
          <Text className="text-4xl font-bold text-white text-center mt-8">
            {page.title}
          </Text>
          <Text className="text-lg text-gray-400 text-center mt-4 px-4">
            {page.subtitle}
          </Text>
        </View>

        {/* CTA Buttons */}
        <View className="px-8 pb-12 gap-4" style={{ paddingBottom: 48 + insets.bottom }}>
          <Pressable onPress={handleTryFree} className="w-full overflow-hidden rounded-2xl">
            <LinearGradient
              colors={['#f97316', '#ea580c']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="py-4 px-6 items-center justify-center"
            >
              <Text className="text-white font-semibold text-lg">Try Free — 3 Snaps</Text>
            </LinearGradient>
          </Pressable>

          <Pressable onPress={handleSignIn} className="w-full border-2 border-gray-600 rounded-2xl py-4 px-6 items-center justify-center">
            <Text className="text-gray-400 font-medium text-lg">I Have an Account</Text>
          </Pressable>
        </View>
      </LinearGradient>
    </View>
  );

  return (
    <View className="flex-1 bg-gray-950">
      {/* Skip Button */}
      {currentPage < 2 && (
        <Pressable
          onPress={handleSkip}
          className="absolute top-12 right-6 z-10"
          style={{ paddingTop: insets.top }}
        >
          <Text className="text-gray-500 text-sm font-medium">Skip</Text>
        </Pressable>
      )}

      {/* Horizontal Scrollable Pages */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        bounces={false}
      >
        {renderPage1(PAGES[0])}
        {renderPage2(PAGES[1])}
        {renderPage3(PAGES[2])}
      </ScrollView>

      {/* Bottom Indicators */}
      <View
        className="absolute left-0 right-0 items-center"
        style={{ bottom: insets.bottom + 24 }}
      >
        <View className="flex-row justify-center items-center gap-2">
          {renderDot(0)}
          {renderDot(1)}
          {renderDot(2)}
        </View>

        {/* Swipe Hint - only on pages 0 and 1 */}
        {currentPage < 2 && (
          <Text className="text-xs text-gray-600 mt-3">Swipe to explore</Text>
        )}
      </View>
    </View>
  );
}
