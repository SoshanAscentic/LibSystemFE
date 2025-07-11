import { useControllerFactory } from '../../../hooks/useControllerFactory';
import { AuthController } from '../../../application/controllers/AuthController';

export const useAuthController = (): AuthController => {
  const factory = useControllerFactory();
  
  try {
    return factory.createAuthController();
  } catch (error) {
    console.error('Failed to create AuthController:', error);
    throw new Error(`Failed to create AuthController: ${error}`);
  }
};