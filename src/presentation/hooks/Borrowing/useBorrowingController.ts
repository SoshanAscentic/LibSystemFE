import { useContainer } from '../../../shared/hooks/useContainer';
import { SERVICE_KEYS } from '../../../shared/container/ServiceKeys';
import { BorrowingController } from '../../../application/controllers/BorrowingController';

export const useBorrowingController = (): BorrowingController => {
  const container = useContainer();
  
  try {
    return container.resolve<BorrowingController>(SERVICE_KEYS.BORROWING_CONTROLLER);
  } catch (error) {
    console.error('Failed to resolve BorrowingController:', error);
    throw new Error(`Failed to resolve BorrowingController: ${error}`);
  }
};