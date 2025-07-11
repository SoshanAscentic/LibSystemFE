import React from 'react';
import { useParams } from 'react-router-dom';
import { BookDetailsPage } from '../../../pages/books/BookDetailsPage';
import { useBooksController } from '../../hooks/Books/useBooksController';

export const BookDetailsPageContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const controller = useBooksController();
  const bookId = parseInt(id || '0', 10);
  
  return <BookDetailsPage bookId={bookId} controller={controller} />;
};