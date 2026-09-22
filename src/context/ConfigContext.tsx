import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  getStoredApiBaseUrl,
  setStoredApiBaseUrl,
  resetStoredApiBaseUrl,
  DEFAULT_API_BASE_URL,
  apiClient,
} from '../api/client';
import { ConnectionStatusType, ToastNotification } from '../types/api';
import { useQueryClient } from '@tanstack/react-query';

interface LogsModalState {
  isOpen: boolean;
  containerId: string;
  containerName?: string;
}

interface ConfigContextValue {
  apiBaseUrl: string;
  setApiBaseUrl: (url: string) => void;
  resetApiBaseUrl: () => void;
  connectionStatus: ConnectionStatusType;
  setConnectionStatus: (status: ConnectionStatusType) => void;
  checkConnection: () => Promise<boolean>;
  toasts: ToastNotification[];
  addToast: (type: ToastNotification['type'], title: string, message?: string) => void;
  removeToast: (id: string) => void;
  logsModal: LogsModalState;
  openLogs: (containerId: string, containerName?: string) => void;
  closeLogs: () => void;
  isApiConfigModalOpen: boolean;
  setIsApiConfigModalOpen: (open: boolean) => void;
  isShortcutsModalOpen: boolean;
  setIsShortcutsModalOpen: (open: boolean) => void;
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiBaseUrl, setApiBaseUrlState] = useState<string>(getStoredApiBaseUrl);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatusType>('idle');
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [isApiConfigModalOpen, setIsApiConfigModalOpen] = useState<boolean>(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState<boolean>(false);
  const [logsModal, setLogsModal] = useState<LogsModalState>({
    isOpen: false,
    containerId: '',
    containerName: '',
  });

  const queryClient = useQueryClient();

  const addToast = useCallback((type: ToastNotification['type'], title: string, message?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: ToastNotification = { id, type, title, message, timestamp: Date.now() };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const setApiBaseUrl = useCallback(
    (url: string) => {
      setStoredApiBaseUrl(url);
      setApiBaseUrlState(url);
      queryClient.invalidateQueries();
      addToast('info', 'API Endpoint Updated', `Base URL set to: ${url}`);
    },
    [addToast, queryClient]
  );

  const resetApiBaseUrl = useCallback(() => {
    resetStoredApiBaseUrl();
    setApiBaseUrlState(DEFAULT_API_BASE_URL);
    queryClient.invalidateQueries();
    addToast('info', 'API Endpoint Reset', `Base URL restored to default: ${DEFAULT_API_BASE_URL}`);
  }, [addToast, queryClient]);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    setConnectionStatus('loading');
    try {
      await apiClient.get('/get/all/containers');
      setConnectionStatus('connected');
      return true;
    } catch {
      setConnectionStatus('error');
      return false;
    }
  }, []);

  const openLogs = useCallback((containerId: string, containerName?: string) => {
    setLogsModal({
      isOpen: true,
      containerId,
      containerName,
    });
  }, []);

  const closeLogs = useCallback(() => {
    setLogsModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  useEffect(() => {
    checkConnection();
  }, [apiBaseUrl, checkConnection]);

  useEffect(() => {
    window.dockerDashboardDesktop?.onOpenSettings?.(() => {
      setIsApiConfigModalOpen(true);
    });
  }, []);

  return (
    <ConfigContext.Provider
      value={{
        apiBaseUrl,
        setApiBaseUrl,
        resetApiBaseUrl,
        connectionStatus,
        setConnectionStatus,
        checkConnection,
        toasts,
        addToast,
        removeToast,
        logsModal,
        openLogs,
        closeLogs,
        isApiConfigModalOpen,
        setIsApiConfigModalOpen,
        isShortcutsModalOpen,
        setIsShortcutsModalOpen,
      }}
    >
      {children}
    </ConfigContext.Provider>
  );
};

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
