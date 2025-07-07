import { useContainer } from '../shared/hooks/useContainer';
import { SERVICE_KEYS } from '../shared/container/ServiceKeys';
import { AuthenticationService } from '../domain/services/AuthenticationService';

export const useAuthService = (): AuthenticationService => {
  const container = useContainer();
  return container.resolve<AuthenticationService>(SERVICE_KEYS.AUTHENTICATION_SERVICE);
};