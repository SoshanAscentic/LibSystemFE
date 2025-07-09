import React from 'react';
import { BorrowBookPage } from '../../pages/borrowing/BorrowBookPage';
import { useBorrowingController } from '../hooks/Borrowing/useBorrowingController';

export const BorrowBookPageContainer: React.FC = () => {
  const controller = useBorrowingController();
  
  return <BorrowBookPage controller={controller} />;
};