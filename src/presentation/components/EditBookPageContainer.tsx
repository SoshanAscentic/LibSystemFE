import React from 'react';
import { useParams } from 'react-router-dom';
import { EditBookPage } from '../../pages/books/EditBookPage';
import { useBooksController } from '../hooks/useBooksController';

export const EditBookPageContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const controller = useBooksController();
  const bookId = parseInt(id || '0', 10);
  
  return <EditBookPage bookId={bookId} controller={controller} />;
};