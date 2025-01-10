import { ReactNode, useEffect, useState } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';
import { notificationService } from '../services/NotificationService';

type NotificationType = 'info' | 'warning' | 'error' | 'success';

interface NotificationMessage {
  id: string;
  type: NotificationType;
  message: string;
}

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider = ({ children }: NotificationProviderProps) => {
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  useEffect(() => {
    const unsubscribe = notificationService.subscribe(setNotifications);
    return unsubscribe;
  }, []);

  return (
    <>
      {children}
      {notifications.map(({ id, type, message }, index) => (
        <Snackbar
          key={id}
          open={true}
          onClose={() => notificationService.close(id)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{ mb: `${index * 6}px` }}
        >
          <Alert 
            onClose={() => notificationService.close(id)} 
            severity={type as AlertColor} 
            variant="filled"
          >
            {message}
          </Alert>
        </Snackbar>
      ))}
    </>
  );
};