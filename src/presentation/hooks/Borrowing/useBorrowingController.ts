import { useMemo } from 'react';
import { useContainer } from '../../../shared/hooks/useContainer';
import { SERVICE_KEYS } from '../../../shared/container/ServiceKeys';
import { BorrowingController } from '../../../application/controllers/BorrowingController';

export const useBorrowingController = (): BorrowingController => {
  const container = useContainer();
  
  // Memoize the controller to prevent re-creation
  const controller = useMemo(() => {
    try {
      console.log('useBorrowingController: Resolving BorrowingController');
      return container.resolve<BorrowingController>(SERVICE_KEYS.BORROWING_CONTROLLER);
    } catch (error) {
      console.error('Failed to resolve BorrowingController:', error);
      throw new Error(`Failed to resolve BorrowingController: ${error}`);
    }
  }, [container]);

  return controller;
};