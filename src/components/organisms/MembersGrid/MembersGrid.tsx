import React from 'react';
import { Member } from '../../../domain/entities/Member';
import { LoadingState } from '../../molecules/LoadingState';
import { EmptyState } from '../../molecules/EmptyState';
import { MemberCard } from '../../molecules/MemberCard';
import { Button } from '../../ui/button';
import { User, Plus } from 'lucide-react';

interface MembersGridProps {
  members: Member[];
  isLoading: boolean;
  onMemberView?: (member: Member) => void;
  onAddMember?: () => void;
  canAdd?: boolean;
  className?: string;
}

export const MembersGrid: React.FC<MembersGridProps> = ({
  members,
  isLoading,
  onMemberView,
  onAddMember,
  canAdd = false,
  className
}) => {
  if (isLoading) {
    return <LoadingState message="Loading members..." />;
  }

  return (
    <div className={className}>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Library Members</h2>
          <p className="text-gray-600 mt-1">{members.length} member{members.length !== 1 ? 's' : ''} registered</p>
        </div>
      </div>

      {/* Grid */}
      {members.length === 0 ? (
        <EmptyState
          icon={<User className="w-12 h-12" />}
          title="No members found"
          description="No members are currently registered in the system."
          action={canAdd ? {
            label: "Register First Member",
            onClick: onAddMember || (() => {})
          } : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {members.map((member) => (
            <MemberCard
              key={member.memberId}
              member={member}
              onView={onMemberView}
            />
          ))}
        </div>
      )}
    </div>
  );
};