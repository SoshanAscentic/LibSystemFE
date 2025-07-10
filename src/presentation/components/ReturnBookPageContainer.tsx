import React, { memo } from 'react';
import { ReturnBookPage } from '../../pages/borrowing/ReturnBookPage';
import { useBorrowingController } from '../hooks/Borrowing/useBorrowingController';

export const ReturnBookPageContainer: React.FC = memo(() => {
  const controller = useBorrowingController();
  
  return <ReturnBookPage controller={controller} />;
});