import React from 'react';
import { BorrowingPage } from '../../pages/borrowing/BorrowingPage';
import { useBorrowingController } from '../hooks/Borrowing/useBorrowingController';

export const BorrowingPageContainer: React.FC = () => {
  const controller = useBorrowingController();
  
  return <BorrowingPage controller={controller} />;
};