import React, { useState } from 'react';
import { MembersController } from '../../application/controllers/MemberController';
import { CreateMemberDto } from '../../domain/dtos/MemberDto';
import { MemberForm } from '../../components/organisms/MemberForm';
import { LoadingState } from '../../components/molecules/LoadingState';
import { EmptyState } from '../../components/molecules/EmptyState';
import { Button } from '../../components/ui/button';
import { ArrowLeft, User } from 'lucide-react';
import { useMember } from '../../presentation/hooks/Members/useMember';
import { memberToCreateMemberDto } from '../../utils/memberUtils';

interface EditMemberPageProps {
  memberId: number;
  controller: MembersController;
}

export const EditMemberPage: React.FC<EditMemberPageProps> = ({ memberId, controller }) => {
  const { member, isLoading, error } = useMember(memberId);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    controller.handleViewMember(member!);
  };

  const handleSubmit = async (data: CreateMemberDto) => {
    setIsSubmitting(true);
    const result = await controller.handleUpdateMember(memberId, {
      ...data,
      memberId,
      isActive: member?.isActive || true
    });
    setIsSubmitting(false);
    
    if (result.success) {
      handleBack();
    }
  };

  if (isLoading) {
    return <LoadingState message="Loading member..." />;
  }

  if (error || !member) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => controller.handleNavigateToMembers()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Members
        </Button>
        
        <EmptyState
          icon={<User />}
          title="Member not found"
          description="The member you're trying to edit doesn't exist."
          action={{
            label: "Return to Members",
            onClick: () => controller.handleNavigateToMembers()
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
          Back to Member Details
        </Button>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <MemberForm
          initialData={memberToCreateMemberDto(member)}
          onSubmit={handleSubmit}
          onCancel={handleBack}
          isLoading={isSubmitting}
          title={`Edit "${member.fullName}"`}
          submitText="Update Member"
          showPassword={false} // Don't show password field for edits
        />
      </div>
    </div>
  );
};
