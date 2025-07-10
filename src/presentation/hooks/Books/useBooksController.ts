import { useMemo } from 'react';
import { useContainer } from '../../../shared/hooks/useContainer';
import { SERVICE_KEYS } from '../../../shared/container/ServiceKeys';
import { BooksController } from '../../../application/controllers/BooksController';

export const useBooksController = (): BooksController => {
  const container = useContainer();
  
  // Memoize the controller to prevent re-creation
  const controller = useMemo(() => {
    try {
      console.log('useBooksController: Resolving BooksController');
      return container.resolve<BooksController>(SERVICE_KEYS.BOOKS_CONTROLLER);
    } catch (error) {
      console.error('Failed to resolve BooksController:', error);
      throw new Error(`Failed to resolve BooksController: ${error}`);
    }
  }, [container]);

  return controller;
};