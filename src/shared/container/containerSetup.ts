import { Container } from './Container';
import { SERVICE_KEYS } from './ServiceKeys';
import { NotificationService } from '../../infrastructure/services/NotificationService';

let containerInstance: Container | null = null;

export const createContainer = (): Container => {
  const container = new Container();
  
  // Register core services that don't depend on navigation
  container.registerSingleton(
    SERVICE_KEYS.NOTIFICATION_SERVICE,
    () => new NotificationService()
  );
  
  return container;
};

export const getContainer = (): Container => {
  if (!containerInstance) {
    containerInstance = createContainer();
  }
  return containerInstance;
};