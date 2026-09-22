import axios, { AxiosError, AxiosInstance } from 'axios';
import { ApiErrorResponse } from '../types/api';

const STORAGE_KEY_BASE_URL = 'docker_dashboard_api_base_url';
export const DEFAULT_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://0.0.0.0:5000';

export function getStoredApiBaseUrl(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_BASE_URL);
    if (saved && saved.trim() !== '') {
      return saved.trim().replace(/\/+$/, '');
    }
  } catch {
    // ignore
  }
  return DEFAULT_API_BASE_URL.replace(/\/+$/, '');
}

export function setStoredApiBaseUrl(url: string): void {
  try {
    const cleanUrl = url.trim().replace(/\/+$/, '');
    localStorage.setItem(STORAGE_KEY_BASE_URL, cleanUrl);
    updateApiClientBaseUrl(cleanUrl);
  } catch {
    // ignore
  }
}

export function resetStoredApiBaseUrl(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_BASE_URL);
    updateApiClientBaseUrl(DEFAULT_API_BASE_URL);
  } catch {
    // ignore
  }
}

export const apiClient: AxiosInstance = axios.create({
  baseURL: getStoredApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function updateApiClientBaseUrl(newBaseUrl: string) {
  apiClient.defaults.baseURL = newBaseUrl;
}

export function parseApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<ApiErrorResponse>;
    const responseData = axiosErr.response?.data;

    if (responseData) {
      if (responseData.error && responseData.details) {
        return `${responseData.error}: ${responseData.details}`;
      }
      if (responseData.error) {
        return responseData.error;
      }
      if (responseData.message) {
        return responseData.message;
      }
    }

    if (axiosErr.response?.status === 400) {
      return 'Invalid request data or missing parameters.';
    }
    if (axiosErr.response?.status === 500) {
      return 'Docker server error executing operation.';
    }
    if (axiosErr.code === 'ERR_NETWORK' || !axiosErr.response) {
      return `Failed to connect to Docker API at ${apiClient.defaults.baseURL}. Please verify the server is running.`;
    }

    return axiosErr.message || 'An unexpected error occurred.';
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred.';
}
