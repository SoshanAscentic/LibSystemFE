import React from 'react';
import { Member } from '../../../domain/entities/Member';
import { MemberFilters as MemberFiltersType } from '../../../domain/valueObjects/MemberFilters';
import { LoadingState } from '../../molecules/LoadingState';
import { EmptyState } from '../../molecules/EmptyState';
import { MemberFilters } from '../../molecules/MemberFilters';
import { MemberCard } from '../../molecules/MemberCard';
import { Button } from '../../ui/button';
import { User, Plus } from 'lucide-react';

interface MembersGridProps {
  members: Member[];
  isLoading: boolean;
  filters: MemberFiltersType;
  onFiltersChange: (filters: Partial<MemberFiltersType>) => void;
  onClearFilters: () => void;
  onMemberView?: (member: Member) => void;
  onMemberEdit?: (member: Member) => void;
  onMemberDelete?: (member: Member) => void;
  onAddMember?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canAdd?: boolean;
  className?: string;
}

export const MembersGrid: React.FC<MembersGridProps> = ({
  members,
  isLoading,
  filters,
  onFiltersChange,
  onClearFilters,
  onMemberView,
  onMemberEdit,
  onMemberDelete,
  onAddMember,
  canEdit = false,
  canDelete = false,
  canAdd = false,
  className
}) => {
  if (isLoading) {
    return <LoadingState message="Loading members..." />;
  }

  return (
    <div className={className}>
      {/* Filters and Actions */}
      <div className="space-y-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <MemberFilters
            filters={filters}
            onFiltersChange={onFiltersChange}
            onClearFilters={onClearFilters}
          />
          
          {canAdd && onAddMember && (
            <Button onClick={onAddMember} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Member
            </Button>
          )}
        </div>
      </div>

      {/* Grid */}
      {members.length === 0 ? (
        <EmptyState
          icon={<User className="w-12 h-12" />}
          title="No members found"
          description="No members match your current filters."
          action={canAdd ? {
            label: "Add First Member",
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
              onEdit={onMemberEdit}
              onDelete={onMemberDelete}
              canEdit={canEdit}
              canDelete={canDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};
