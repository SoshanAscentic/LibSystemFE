import React from 'react';
import { useParams } from 'react-router-dom';
import { EditMemberPage } from '../../pages/members/EditMemberPage';
import { useMembersController } from '../hooks/Members/useMembersController';

export const EditMemberPageContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const controller = useMembersController();
  const memberId = parseInt(id || '0', 10);
  
  return <EditMemberPage memberId={memberId} controller={controller} />;
};