import { useControllerFactory } from '../../../hooks/useControllerFactory';
import { BooksController } from '../../../application/controllers/BooksController';

export const useBooksController = (): BooksController => {
  const factory = useControllerFactory();
  
  try {
    return factory.createBooksController();
  } catch (error) {
    console.error('Failed to create BooksController:', error);
    throw new Error(`Failed to create BooksController: ${error}`);
  }
};