import React from 'react';
import { CreateMemberPage } from '../../../pages/members/CreateMemberPage';
import { useMembersController } from '../../hooks/Members/useMembersController';

export const CreateMemberPageContainer: React.FC = () => {
  const controller = useMembersController();
  
  return <CreateMemberPage controller={controller} />;
};