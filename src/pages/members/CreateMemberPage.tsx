import React, { useState } from 'react';
import { MembersController } from '../../application/controllers/MemberController';
import { CreateMemberDto } from '../../domain/dtos/MemberDto';
import { MemberForm } from '../../components/organisms/MemberForm';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CreateMemberPageProps {
  controller: MembersController;
}

export const CreateMemberPage: React.FC<CreateMemberPageProps> = ({ controller }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    window.history.back();
  };

  const handleSubmit = async (data: CreateMemberDto) => {
    setIsSubmitting(true);
    await controller.handleCreateMember(data);
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <MemberForm
          onSubmit={handleSubmit}
          onCancel={handleBack}
          isLoading={isSubmitting}
          title="Add New Member"
          submitText="Add Member"
          showPassword={true}
        />
      </div>
    </div>
  );
};