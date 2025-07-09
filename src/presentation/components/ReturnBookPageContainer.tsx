import React from 'react';
import { ReturnBookPage } from '../../pages/borrowing/ReturnBookPage';
import { useBorrowingController } from '../hooks/Borrowing/useBorrowingController';

export const ReturnBookPageContainer: React.FC = () => {
  const controller = useBorrowingController();
  
  return <ReturnBookPage controller={controller} />;
};