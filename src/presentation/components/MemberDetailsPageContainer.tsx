import React from 'react';
import { useParams } from 'react-router-dom';
import { MemberDetailsPage } from '../../pages/members/MemberDetailsPage';
import { useMembersController } from '../hooks/Members/useMembersController';

export const MemberDetailsPageContainer: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const controller = useMembersController();
  const memberId = parseInt(id || '0', 10);
  
  return <MemberDetailsPage memberId={memberId} controller={controller} />;
};
