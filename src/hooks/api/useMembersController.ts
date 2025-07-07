import { useContainer } from '../shared/hooks/useContainer';
import { SERVICE_KEYS } from '../shared/container/ServiceKeys';
import { MembersController } from '../application/controllers/MembersController';

export const useMembersController = (): MembersController => {
  const container = useContainer();
  
  try {
    return container.resolve<MembersController>(SERVICE_KEYS.MEMBERS_CONTROLLER);
  } catch (error) {
    console.error('Failed to resolve MembersController:', error);
    throw new Error(`Failed to resolve MembersController: ${error}`);
  }
};