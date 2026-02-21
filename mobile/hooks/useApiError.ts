import { useState, useCallback } from 'react';
import { AxiosError } from 'axios';
import * as Haptics from 'expo-haptics';

interface UseApiErrorReturn {
  error: string | null;
  isLoading: boolean;
  execute: <T>(asyncFn: () => Promise<T>) => Promise<T | null>;
  clearError: () => void;
}

/**
 * Custom hook for standardized API error handling
 *
 * @example
 * const { error, isLoading, execute } = useApiError();
 *
 * const handleSubmit = async () => {
 *   const result = await execute(() => api.post('/endpoint', data));
 *   if (result) {
 *     // Handle success
 *   }
 * };
 */
export default function useApiError(): UseApiErrorReturn {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const execute = useCallback(async <T>(
    asyncFn: () => Promise<T>
  ): Promise<T | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await asyncFn();
      return result;
    } catch (err) {
      const axiosError = err as AxiosError;
      // The error message is already transformed by our api.ts interceptor
      const errorMessage = axiosError.message || 'An unexpected error occurred';
      setError(errorMessage);

      // Provide haptic feedback for error
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);

      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    error,
    isLoading,
    execute,
    clearError,
  };
}
