import React, { useEffect, useRef } from 'react';
import {
  Modal as RNModal,
  View,
  Text,
  Pressable,
  Animated,
  PanResponder,
  Dimensions,
  type ModalProps as RNModalProps,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { cn } from '../../lib/cn';
import { hapticMedium } from '../../lib/haptics';

interface ModalProps extends Omit<RNModalProps, 'visible'> {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  swipeToDismiss?: boolean;
}

const SCREEN_HEIGHT = Dimensions.get('window').height;
const SWIPE_THRESHOLD = 100;

/**
 * Enhanced Modal - 2025-2026 Trends:
 * - Gesture-First Navigation: Swipe-to-dismiss
 * - Backdrop Blur: Native iOS blur effect
 * - Size Variants: sm, md, lg, full for flexible layouts
 */
export default function Modal({
  visible,
  onClose,
  title,
  children,
  size = 'md',
  swipeToDismiss = true,
  ...props
}: ModalProps) {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  const sizeStyles = {
    sm: 'max-w-xs',
    md: 'max-w-sm',
    lg: 'max-w-md',
    full: 'w-[90%]',
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return swipeToDismiss && gestureState.dy > 0 && gestureState.dy < 50;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > SWIPE_THRESHOLD) {
          hapticMedium();
          handleClose();
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      translateY.setValue(SCREEN_HEIGHT);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  if (!visible) return null;

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
      {...props}
    >
      {/* Blurred Backdrop */}
      <Animated.View style={{ opacity }} className="flex-1">
        <Pressable
          className="flex-1 bg-black/60"
          onPress={handleClose}
        >
          <BlurView intensity={20} tint="dark" className="flex-1" />
        </Pressable>
      </Animated.View>

      {/* Modal Content */}
      <Animated.View
        className="absolute inset-x-0 bottom-0 flex items-center justify-end"
        style={{ opacity }}
      >
        <Pressable
          className="flex-1 w-full"
          onPress={handleClose}
        />
        <Animated.View
          className={cn(
            'w-full rounded-t-3xl bg-gray-900 p-6 shadow-2xl',
            sizeStyles[size]
          )}
          style={[
            {
              transform: [{ translateY }],
              maxHeight: SCREEN_HEIGHT * 0.85,
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Drag Handle - Visual indicator for swipe */}
          {swipeToDismiss && (
            <View className="flex-row justify-center mb-4">
              <View className="h-1 w-12 rounded-full bg-gray-700" />
            </View>
          )}

          {title && (
            <Text className="mb-4 text-xl font-bold text-white">
              {title}
            </Text>
          )}
          {children}
        </Animated.View>
      </Animated.View>
    </RNModal>
  );
}
