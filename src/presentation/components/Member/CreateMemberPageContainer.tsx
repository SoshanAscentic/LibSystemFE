import React from 'react';
import { CreateMemberPage } from '../../../pages/members/CreateMemberPage';

// Simple container - no controller needed since we're using auth service directly
export const CreateMemberPageContainer: React.FC = () => {
  return <CreateMemberPage />;
};