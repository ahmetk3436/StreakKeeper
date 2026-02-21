import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render shows the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log the error to console for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    // In production, you could log this to a service like Sentry or Crashlytics
  }

  handleRetry = async (): Promise<void> => {
    // Provide haptic feedback
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    // Reset error state to re-render children
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 bg-gray-950 items-center justify-center px-8">
          {/* Warning Icon */}
          <Ionicons name="warning-outline" size={64} color="#f97316" />

          {/* Error Title */}
          <Text className="text-xl font-bold text-white mt-4">
            Something went wrong
          </Text>

          {/* Error Description */}
          <Text className="text-sm text-gray-400 mt-2 text-center">
            We're sorry for the inconvenience. Please try again.
          </Text>

          {/* Retry Button */}
          <Pressable
            onPress={this.handleRetry}
            className="mt-6 rounded-xl bg-orange-500 px-6 py-3 active:opacity-80"
          >
            <Text className="text-base font-semibold text-white">
              Try Again
            </Text>
          </Pressable>

          {/* Optional: Show error details in development */}
          {__DEV__ && this.state.error && (
            <Text className="text-xs text-gray-600 mt-4 text-center">
              {this.state.error.message}
            </Text>
          )}
        </View>
      );
    }

    return this.props.children;
  }
}
