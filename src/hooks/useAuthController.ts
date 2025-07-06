import { useContainer } from '../shared/hooks/useContainer';
import { SERVICE_KEYS } from '../shared/container/ServiceKeys';
import { AuthController } from '../application/controllers/AuthController';

export const useAuthController = (): AuthController => {
  const container = useContainer();
  return container.resolve<AuthController>(SERVICE_KEYS.AUTH_CONTROLLER);
};