import { useMemo } from 'react';
import { useContainer } from '../../../shared/hooks/useContainer';
import { SERVICE_KEYS } from '../../../shared/container/ServiceKeys';
import { MembersController } from '../../../application/controllers/MemberController';

export const useMembersController = (): MembersController => {
  const container = useContainer();
  
  // Memoize the controller to prevent re-creation
  const controller = useMemo(() => {
    try {
      console.log('useMembersController: Resolving MembersController');
      return container.resolve<MembersController>(SERVICE_KEYS.MEMBERS_CONTROLLER);
    } catch (error) {
      console.error('Failed to resolve MembersController:', error);
      throw new Error(`Failed to resolve MembersController: ${error}`);
    }
  }, [container]);

  return controller;
};