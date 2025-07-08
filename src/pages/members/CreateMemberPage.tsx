import React, { useState } from 'react';
import { MembersController } from '../../application/controllers/MemberController';
import { RegisterMemberDto } from '../../domain/dtos/MemberDto';
import { MemberForm } from '../../components/organisms/MemberForm';
import { Button } from '../../components/ui/button';
import { ArrowLeft } from 'lucide-react';

interface CreateMemberPageProps {
  controller: MembersController;
}

export const CreateMemberPage: React.FC<CreateMemberPageProps> = ({ controller }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBack = () => {
    controller.handleNavigateToMembers();
  };

  const handleSubmit = async (data: RegisterMemberDto) => {
    setIsSubmitting(true);
    const result = await controller.handleRegisterMember(data);
    setIsSubmitting(false);
    
    // Navigation is handled by the controller
    if (!result.success) {
      // Error handling is done by the controller via notifications
      console.error('Registration failed:', result.error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Members
        </Button>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto">
        <MemberForm
          onSubmit={handleSubmit}
          onCancel={handleBack}
          isLoading={isSubmitting}
          title="Register New Member"
          submitText="Register Member"
        />
      </div>
    </div>
  );
};