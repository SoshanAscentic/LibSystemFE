import React from 'react';
import { BooksPage } from '../../pages/books/BooksPage';
import { useBooksController } from '../hooks/Books/useBooksController';

export const BooksPageContainer: React.FC = () => {
  const controller = useBooksController();
  
  return <BooksPage controller={controller} />;
};