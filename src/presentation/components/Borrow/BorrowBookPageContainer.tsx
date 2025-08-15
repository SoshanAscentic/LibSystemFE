import React, { memo } from 'react';
import { BorrowBookPage } from '../../../pages/borrowing/BorrowBookPage';
import { useBorrowingController } from '../../hooks/Borrowing/useBorrowingController';

export const BorrowBookPageContainer: React.FC = memo(() => {
  const controller = useBorrowingController();
  
  return <BorrowBookPage controller={controller} />;
});