import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { useQueryClient } from '@tanstack/react-query';

export function useKeyboardShortcuts() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const {
    isShortcutsModalOpen,
    setIsShortcutsModalOpen,
    isApiConfigModalOpen,
    setIsApiConfigModalOpen,
    logsModal,
    closeLogs,
    checkConnection,
    addToast,
  } = useConfig();

  // Track key sequence chords (e.g. pressing 'g' then 'd')
  const lastKeyRef = useRef<{ key: string; time: number } | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Allow Escape to close modals regardless of focus
      if (event.key === 'Escape') {
        if (isShortcutsModalOpen) {
          setIsShortcutsModalOpen(false);
          return;
        }
        if (isApiConfigModalOpen) {
          setIsApiConfigModalOpen(false);
          return;
        }
        if (logsModal.isOpen) {
          closeLogs();
          return;
        }
      }

      // If user is typing inside an input, textarea, or contentEditable element, ignore shortcuts
      const activeEl = document.activeElement;
      const isInputActive =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.tagName === 'SELECT' ||
          (activeEl as HTMLElement).isContentEditable);

      if (isInputActive) {
        return;
      }

      const key = event.key.toLowerCase();
      const now = Date.now();
      const lastKey = lastKeyRef.current;

      // Toggle Shortcut Modal with '?' or 'Shift + /' or Cmd/Ctrl + /
      if (event.key === '?' || (event.shiftKey && event.key === '/') || ((event.metaKey || event.ctrlKey) && event.key === '/')) {
        event.preventDefault();
        setIsShortcutsModalOpen(!isShortcutsModalOpen);
        return;
      }

      // If another modal is open, don't trigger background navigation
      if (isApiConfigModalOpen || logsModal.isOpen) {
        return;
      }

      // Check for 'g' sequence chord (e.g., 'g' followed by 'd', 'c', or 'i' within 1200ms)
      if (lastKey && lastKey.key === 'g' && now - lastKey.time < 1200) {
        if (key === 'd') {
          event.preventDefault();
          navigate('/');
          if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
          lastKeyRef.current = null;
          return;
        }
        if (key === 'c') {
          event.preventDefault();
          navigate('/containers');
          if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
          lastKeyRef.current = null;
          return;
        }
        if (key === 'i') {
          event.preventDefault();
          navigate('/images');
          if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
          lastKeyRef.current = null;
          return;
        }
      }

      // Record 'g' keypress for chord
      if (key === 'g' && !event.ctrlKey && !event.metaKey && !event.altKey) {
        lastKeyRef.current = { key: 'g', time: now };
        return;
      }

      // Single-digit navigation shortcuts: '1' -> Dashboard, '2' -> Containers, '3' -> Images
      if (!event.ctrlKey && !event.metaKey && !event.altKey) {
        if (key === '1') {
          event.preventDefault();
          navigate('/');
          if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
          return;
        }
        if (key === '2') {
          event.preventDefault();
          navigate('/containers');
          if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
          return;
        }
        if (key === '3') {
          event.preventDefault();
          navigate('/images');
          if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
          return;
        }
      }

      // 'r' -> Refresh data
      if (key === 'r' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        queryClient.refetchQueries();
        checkConnection();
        addToast('info', 'Refreshed', 'Refreshed container and image data');
        return;
      }

      // 's' -> Open API Settings Modal
      if (key === 's' && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setIsApiConfigModalOpen(true);
        if (isShortcutsModalOpen) setIsShortcutsModalOpen(false);
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    navigate,
    queryClient,
    isShortcutsModalOpen,
    setIsShortcutsModalOpen,
    isApiConfigModalOpen,
    setIsApiConfigModalOpen,
    logsModal.isOpen,
    closeLogs,
    checkConnection,
    addToast,
  ]);
}
