import React from 'react';
import { Member } from '../../../domain/entities/Member';
import { MemberCard } from '../MemberCard';
import { LoadingState } from '../LoadingState';
import { EmptyState } from '../EmptyState';
import { Card } from '../../ui/card';
import { Search, User } from 'lucide-react';

interface MemberSearchResultsProps {
  results: Member[];
  isLoading: boolean;
  hasSearchQuery: boolean;
  searchQuery: string;
  onMemberView?: (member: Member) => void;
  onMemberEdit?: (member: Member) => void;
  onMemberDelete?: (member: Member) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  className?: string;
}

export const MemberSearchResults: React.FC<MemberSearchResultsProps> = ({
  results,
  isLoading,
  hasSearchQuery,
  searchQuery,
  onMemberView,
  onMemberEdit,
  onMemberDelete,
  canEdit = false,
  canDelete = false,
  className
}) => {
  if (isLoading) {
    return (
      <Card className={className}>
        <LoadingState message="Searching members..." />
      </Card>
    );
  }

  if (!hasSearchQuery) {
    return (
      <Card className={className}>
        <EmptyState
          icon={<Search />}
          title="Start searching"
          description="Type at least 2 characters to search for members"
        />
      </Card>
    );
  }

  if (results.length === 0) {
    return (
      <Card className={className}>
        <EmptyState
          icon={<User />}
          title="No members found"
          description={`No members match "${searchQuery}". Try different keywords or check your spelling.`}
        />
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Search Results
        </h3>
        <p className="text-sm text-gray-600">
          {results.length} member{results.length !== 1 ? 's' : ''} found for "{searchQuery}"
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {results.map((member) => (
          <MemberCard
            key={member.memberId}
            member={member}
            variant="compact"
            onView={onMemberView}
            onEdit={onMemberEdit}
            onDelete={onMemberDelete}
            canEdit={canEdit}
            canDelete={canDelete}
          />
        ))}
      </div>
    </div>
  );
};
