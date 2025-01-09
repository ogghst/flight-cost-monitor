type NotificationType = 'info' | 'warning' | 'error' | 'success';

interface NotificationMessage {
  id: string;
  type: NotificationType;
  message: string;
}

type NotificationListener = (notifications: NotificationMessage[]) => void;

class NotificationService {
  private static instance: NotificationService;
  private notifications: NotificationMessage[] = [];
  private listeners: NotificationListener[] = [];
  private counter = 0;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  subscribe(listener: NotificationListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  private generateId(): string {
    this.counter += 1;
    return `${Date.now()}-${this.counter}`;
  }

  show(type: NotificationType, message: string) {
    const id = this.generateId();
    this.notifications = [...this.notifications, { id, type, message }];
    this.notify();
    // Auto-remove after 6 seconds
    setTimeout(() => this.close(id), 6000);
  }

  close(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }
}

export const notificationService = NotificationService.getInstance();

// Global helper functions
export const showNotification = {
  info: (message: string) => notificationService.show('info', message),
  success: (message: string) => notificationService.show('success', message),
  warning: (message: string) => notificationService.show('warning', message),
  error: (message: string) => notificationService.show('error', message),
};