import { useCallback } from 'react';
import { showNotification } from '../services/NotificationService';

export const useNotification = () => {
  return {
    showInfo: useCallback((message: string) => showNotification.info(message), []),
    showSuccess: useCallback((message: string) => showNotification.success(message), []),
    showWarning: useCallback((message: string) => showNotification.warning(message), []),
    showError: useCallback((message: string) => showNotification.error(message), []),
  };
};