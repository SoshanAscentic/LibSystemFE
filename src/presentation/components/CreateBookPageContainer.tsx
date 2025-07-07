import React from 'react';
import { CreateBookPage } from '../../pages/books/CreateBookPage';
import { useBooksController } from '../hooks/Books/useBooksController';

export const CreateBookPageContainer: React.FC = () => {
  const controller = useBooksController();
  
  return <CreateBookPage controller={controller} />;
};