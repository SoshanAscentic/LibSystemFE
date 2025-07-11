import { toast } from 'sonner';
import { INotificationService } from '../../shared/interfaces/services';

export class NotificationService implements INotificationService {
  showSuccess(message: string, description?: string): void {
    toast.success(message, { description });
  }

  showError(message: string, description?: string): void {
    toast.error(message, { description });
  }

  showInfo(message: string, description?: string): void {
    toast.info(message, { description });
  }

  showWarning(message: string, description?: string): void {
    toast.warning(message, { description });
  }
}