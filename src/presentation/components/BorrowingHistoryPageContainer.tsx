import React from 'react';
import { BorrowingHistoryPage } from '../../pages/borrowing/BorrowingHistoryPage';
import { useBorrowingController } from '../hooks/Borrowing/useBorrowingController';

export const BorrowingHistoryPageContainer: React.FC = () => {
  const controller = useBorrowingController();
  
  return <BorrowingHistoryPage controller={controller} />;
};