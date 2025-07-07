import React from 'react';
import { MembersController } from '../../application/controllers/MemberController';
import { MemberDetails } from '../../components/organisms/MemberDetails';
import { LoadingState } from '../../components/molecules/LoadingState';
import { EmptyState } from '../../components/molecules/EmptyState';
import { Button } from '../../components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { useMember } from '../../presentation/hooks/Members/useMember';
import { useMemberPermissions } from '../../hooks/useMemberPermissions';

interface MemberDetailsPageProps {
  memberId: number;
  controller: MembersController;
}

export const MemberDetailsPage: React.FC<MemberDetailsPageProps> = ({ memberId, controller }) => {
  const { member, isLoading, error } = useMember(memberId);
  const permissions = useMemberPermissions();

  const handleBack = () => {
    controller.handleNavigateBack();
  };

  const handleEdit = () => {
    if (member) {
      // Navigate to edit page - this could be enhanced
      controller.handleNavigateToMembers();
    }
  };

  const handleDelete = async () => {
    if (member) {
      await controller.handleDeleteMember(member);
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading member details..." />;
  }

  if (error || !member) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Members
        </Button>
        
        <EmptyState
          icon={<User />}
          title="Member not found"
          description="The member you're looking for doesn't exist or has been removed."
          action={{
            label: "Return to Members",
            onClick: handleBack
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Members
        </Button>
      </div>

      {/* Member Details */}
      <MemberDetails
        member={member}
        onEdit={permissions.canEdit ? handleEdit : undefined}
        onDelete={permissions.canDelete ? handleDelete : undefined}
        canEdit={permissions.canEdit}
        canDelete={permissions.canDelete}
      />
    </div>
  );
};
