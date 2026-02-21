import axios, {
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
} from './storage';

// Helper to transform errors into user-friendly messages
function transformErrorMessage(error: AxiosError<{ message?: string; error?: string }>): void {
  // Log error for debugging (in development)
  if (__DEV__) {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
  }

  // Network error (no response received - device offline or server unreachable)
  if (!error.response) {
    error.message = 'No internet connection. Please check your network and try again.';
  }
  // Server errors (5xx) - server-side issues
  else if (error.response.status >= 500) {
    error.message = 'Server error. Please try again later.';
  }
  // Authentication errors (401) - token expired or invalid
  else if (error.response.status === 401) {
    error.message = 'Your session has expired. Please sign in again.';
  }
  // Forbidden (403) - user lacks permission
  else if (error.response.status === 403) {
    error.message = 'You do not have permission to perform this action.';
  }
  // Not found (404) - resource doesn't exist
  else if (error.response.status === 404) {
    error.message = 'The requested resource was not found.';
  }
  // Validation errors (400) - bad request
  else if (error.response.status === 400) {
    const serverMessage = error.response.data?.message || error.response.data?.error;
    error.message = serverMessage || 'Invalid request. Please check your input.';
  }
  // Rate limiting (429) - too many requests
  else if (error.response.status === 429) {
    error.message = 'Too many requests. Please wait a moment and try again.';
  }
  // All other errors
  else {
    const serverMessage = error.response.data?.message || error.response.data?.error;
    error.message = serverMessage || 'An unexpected error occurred. Please try again.';
  }
}

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased for file uploads
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor: attach access token
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Don't override Content-Type for multipart/form-data — let FormData set the boundary
    if (config.headers?.['Content-Type'] === 'multipart/form-data') {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: auto-refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, {
          refresh_token: refreshToken,
        });

        await setTokens(data.access_token, data.refresh_token);
        processQueue(null, data.access_token);

        originalRequest.headers.Authorization = `Bearer ${data.access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        await clearTokens();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Transform error message to user-friendly text before rejecting
    transformErrorMessage(error as AxiosError<{ message?: string; error?: string }>);
    return Promise.reject(error);
  }
);

export default api;
