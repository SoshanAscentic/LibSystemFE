import React from 'react';
import { MembersPage } from '../../pages/members/MembersPage';
import { useMembersController } from '../hooks/Members/useMembersController';

export const MembersPageContainer: React.FC = () => {
  const controller = useMembersController();
  
  return <MembersPage controller={controller} />;
};