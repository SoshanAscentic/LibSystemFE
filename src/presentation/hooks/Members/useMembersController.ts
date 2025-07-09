import { useControllerFactory } from '../../../hooks/useControllerFactory';
import { MembersController } from '../../../application/controllers/MemberController';

export const useMembersController = (): MembersController => {
  const factory = useControllerFactory();
  
  try {
    return factory.createMembersController();
  } catch (error) {
    console.error('Failed to create MembersController:', error);
    throw new Error(`Failed to create MembersController: ${error}`);
  }
};