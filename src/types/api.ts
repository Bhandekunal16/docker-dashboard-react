export interface ApiErrorResponse {
  error?: string;
  details?: string;
  message?: string;
}

export type ConnectionStatusType = 'connected' | 'error' | 'loading' | 'idle';

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
  timestamp: number;
}
